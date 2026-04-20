import { describe, it, expect, vi, beforeEach } from 'vitest';
import { identifyGaps, calculateVelocity, getSubjectPerformance } from '@/lib/adaptive-engine';
import type { Session, KnowledgeGap } from '@/lib/types';

// ── identifyGaps ──

describe('identifyGaps', () => {
  const makeSessions = (questions: { correct: boolean; bloom: string; category: string }[], subject = 'math'): Session[] => [
    {
      id: 'ses_1',
      studentId: 'stu_1',
      subject,
      date: new Date().toISOString(),
      correct: questions.filter(q => q.correct).length,
      total: questions.length,
      xp: 0,
      questions: questions.map((q, i) => ({ id: `q_${i}`, ...q })),
    },
  ];

  it('returns no gaps when accuracy is above 70%', () => {
    const sessions = makeSessions([
      { correct: true, bloom: 'remember', category: 'Algebra' },
      { correct: true, bloom: 'understand', category: 'Algebra' },
      { correct: true, bloom: 'apply', category: 'Algebra' },
    ]);
    const gaps = identifyGaps(sessions);
    expect(gaps).toHaveLength(0);
  });

  it('identifies a gap when accuracy is below 70% with at least 2 attempts', () => {
    const sessions = makeSessions([
      { correct: false, bloom: 'remember', category: 'Fractions' },
      { correct: false, bloom: 'understand', category: 'Fractions' },
      { correct: true, bloom: 'apply', category: 'Fractions' },
    ]);
    const gaps = identifyGaps(sessions);
    expect(gaps.length).toBe(1);
    expect(gaps[0].category).toBe('Fractions');
    expect(gaps[0].accuracy).toBe(33); // 1/3
    expect(gaps[0].subject).toBe('math');
  });

  it('does not flag a category with only 1 attempt', () => {
    const sessions = makeSessions([
      { correct: false, bloom: 'remember', category: 'Geometry' },
    ]);
    const gaps = identifyGaps(sessions);
    expect(gaps).toHaveLength(0);
  });

  it('filters by subject when provided', () => {
    const mathSession: Session = {
      id: 'ses_1', studentId: 'stu_1', subject: 'math',
      date: new Date().toISOString(), correct: 0, total: 2, xp: 0,
      questions: [
        { id: 'q1', correct: false, bloom: 'remember', category: 'Algebra' },
        { id: 'q2', correct: false, bloom: 'remember', category: 'Algebra' },
      ],
    };
    const scienceSession: Session = {
      id: 'ses_2', studentId: 'stu_1', subject: 'science',
      date: new Date().toISOString(), correct: 0, total: 2, xp: 0,
      questions: [
        { id: 'q3', correct: false, bloom: 'remember', category: 'Cells' },
        { id: 'q4', correct: false, bloom: 'remember', category: 'Cells' },
      ],
    };

    const gaps = identifyGaps([mathSession, scienceSession], 'science');
    expect(gaps.length).toBe(1);
    expect(gaps[0].subject).toBe('science');
  });

  it('sorts gaps by accuracy ascending (worst first)', () => {
    const sessions: Session[] = [
      {
        id: 'ses_1', studentId: 'stu_1', subject: 'math',
        date: new Date().toISOString(), correct: 1, total: 4, xp: 0,
        questions: [
          { id: 'q1', correct: false, bloom: 'remember', category: 'Algebra' },
          { id: 'q2', correct: false, bloom: 'remember', category: 'Algebra' },
          { id: 'q3', correct: true, bloom: 'remember', category: 'Geometry' },
          { id: 'q4', correct: false, bloom: 'understand', category: 'Geometry' },
        ],
      },
    ];
    const gaps = identifyGaps(sessions);
    expect(gaps.length).toBe(2);
    expect(gaps[0].accuracy).toBeLessThanOrEqual(gaps[1].accuracy);
  });

  it('generates correct recommendation tiers', () => {
    // accuracy < 40 => "Start with basic..."
    const sessions = makeSessions([
      { correct: false, bloom: 'remember', category: 'Decimals' },
      { correct: false, bloom: 'remember', category: 'Decimals' },
      { correct: false, bloom: 'remember', category: 'Decimals' },
    ]);
    const gaps = identifyGaps(sessions);
    expect(gaps[0].accuracy).toBe(0);
    expect(gaps[0].recommendation).toContain('Start with basic');
  });

  it('generates mid-tier recommendation for 40-60% accuracy', () => {
    const sessions = makeSessions([
      { correct: true, bloom: 'remember', category: 'Ratios' },
      { correct: false, bloom: 'understand', category: 'Ratios' },
      { correct: false, bloom: 'apply', category: 'Ratios' },
      { correct: false, bloom: 'apply', category: 'Ratios' },
    ]);
    // 25% accuracy -- wait, that's below 40. Let me adjust.
    const sessions2 = makeSessions([
      { correct: true, bloom: 'remember', category: 'Ratios' },
      { correct: true, bloom: 'understand', category: 'Ratios' },
      { correct: false, bloom: 'apply', category: 'Ratios' },
      { correct: false, bloom: 'apply', category: 'Ratios' },
    ]);
    const gaps = identifyGaps(sessions2);
    expect(gaps[0].accuracy).toBe(50);
    expect(gaps[0].recommendation).toContain('Review');
  });

  it('picks lowest bloom level correctly', () => {
    const sessions = makeSessions([
      { correct: false, bloom: 'apply', category: 'Logic' },
      { correct: false, bloom: 'remember', category: 'Logic' },
    ]);
    const gaps = identifyGaps(sessions);
    expect(gaps[0].bloom).toBe('remember');
  });
});

// ── calculateVelocity ──

describe('calculateVelocity', () => {
  it('returns steady with 0-1 sessions', () => {
    expect(calculateVelocity([])).toEqual({ daily: 0, trend: 'steady' });
    const one: Session[] = [{
      id: 's1', studentId: 'stu_1', subject: 'math',
      date: new Date().toISOString(), correct: 5, total: 10, xp: 50,
    }];
    expect(calculateVelocity(one)).toEqual({ daily: 1, trend: 'steady' });
  });

  it('detects improving trend when recent accuracy > previous + 0.05', () => {
    const now = Date.now();
    const sessions: Session[] = [
      // Previous week: low accuracy
      { id: 's1', studentId: 'stu_1', subject: 'math', date: new Date(now - 10 * 86400000).toISOString(), correct: 2, total: 10, xp: 20 },
      // Recent week: high accuracy
      { id: 's2', studentId: 'stu_1', subject: 'math', date: new Date(now - 1 * 86400000).toISOString(), correct: 9, total: 10, xp: 90 },
    ];
    const result = calculateVelocity(sessions);
    expect(result.trend).toBe('improving');
  });

  it('detects declining trend when recent accuracy < previous - 0.05', () => {
    const now = Date.now();
    const sessions: Session[] = [
      { id: 's1', studentId: 'stu_1', subject: 'math', date: new Date(now - 10 * 86400000).toISOString(), correct: 9, total: 10, xp: 90 },
      { id: 's2', studentId: 'stu_1', subject: 'math', date: new Date(now - 1 * 86400000).toISOString(), correct: 2, total: 10, xp: 20 },
    ];
    const result = calculateVelocity(sessions);
    expect(result.trend).toBe('declining');
  });

  it('returns steady when accuracy difference is within 0.05 threshold', () => {
    const now = Date.now();
    const sessions: Session[] = [
      { id: 's1', studentId: 'stu_1', subject: 'math', date: new Date(now - 10 * 86400000).toISOString(), correct: 7, total: 10, xp: 70 },
      { id: 's2', studentId: 'stu_1', subject: 'math', date: new Date(now - 1 * 86400000).toISOString(), correct: 7, total: 10, xp: 70 },
    ];
    const result = calculateVelocity(sessions);
    expect(result.trend).toBe('steady');
  });

  it('computes daily rate correctly', () => {
    const now = Date.now();
    const sessions: Session[] = [
      { id: 's1', studentId: 'stu_1', subject: 'math', date: new Date(now - 10 * 86400000).toISOString(), correct: 7, total: 10, xp: 70 },
      { id: 's2', studentId: 'stu_1', subject: 'math', date: new Date(now - 2 * 86400000).toISOString(), correct: 7, total: 10, xp: 70 },
      { id: 's3', studentId: 'stu_1', subject: 'math', date: new Date(now - 3 * 86400000).toISOString(), correct: 7, total: 10, xp: 70 },
      { id: 's4', studentId: 'stu_1', subject: 'math', date: new Date(now - 4 * 86400000).toISOString(), correct: 7, total: 10, xp: 70 },
    ];
    const result = calculateVelocity(sessions);
    // 3 sessions in last 7 days (s2, s3, s4) => 3/7 = 0.4285... rounded to 0.4
    expect(result.daily).toBe(0.4);
  });
});

// ── getSubjectPerformance ──

describe('getSubjectPerformance', () => {
  const sessions: Session[] = [
    { id: 's1', studentId: 'stu_1', subject: 'math', date: '2025-01-01', correct: 8, total: 10, xp: 80 },
    { id: 's2', studentId: 'stu_1', subject: 'math', date: '2025-01-02', correct: 6, total: 10, xp: 60 },
    { id: 's3', studentId: 'stu_1', subject: 'science', date: '2025-01-02', correct: 9, total: 10, xp: 90 },
  ];

  it('aggregates stats for the given subject', () => {
    const result = getSubjectPerformance(sessions, 'math');
    expect(result.sessions).toBe(2);
    expect(result.totalQuestions).toBe(20);
    expect(result.totalCorrect).toBe(14);
    expect(result.accuracy).toBe(70);
    expect(result.xp).toBe(140);
  });

  it('returns zeros for a subject with no sessions', () => {
    const result = getSubjectPerformance(sessions, 'history');
    expect(result.sessions).toBe(0);
    expect(result.totalQuestions).toBe(0);
    expect(result.accuracy).toBe(0);
    expect(result.xp).toBe(0);
  });

  it('excludes other subjects from the count', () => {
    const result = getSubjectPerformance(sessions, 'science');
    expect(result.sessions).toBe(1);
    expect(result.totalCorrect).toBe(9);
  });
});
