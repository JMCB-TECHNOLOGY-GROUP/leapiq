import { questionBank } from '@/data/questions';
import { getSRQueue, getDueQuestions } from './storage';
import type { Question, Session, KnowledgeGap } from './types';

// ── Adaptive Question Selection ──
// Combines spaced repetition, difficulty calibration, and gap targeting
export function getAdaptiveQuestions(subject: string, studentId: string, count: number = 8): Question[] {
  const all = questionBank[subject] || [];
  const sr = getSRQueue(studentId);
  const due = getDueQuestions(studentId);

  // Priority 1: Due for spaced repetition review
  const dueQs = all.filter(q => due.includes(q.id)).slice(0, 3);

  // Priority 2: Unseen questions
  const unseen = all.filter(q => !sr[q.id] && !dueQs.find(d => d.id === q.id));

  // Priority 3: Questions student is struggling with (box 1-2)
  const struggling = all.filter(q => {
    const e = sr[q.id];
    return e && e.box <= 2 && !dueQs.find(d => d.id === q.id);
  });

  // Combine and shuffle
  const pool = [...dueQs, ...unseen, ...struggling]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  // Sort by difficulty for progressive challenge
  pool.sort((a, b) => a.diff - b.diff);

  return pool;
}

// ── Knowledge Gap Identification ──
export function identifyGaps(sessions: Session[], subject?: string): KnowledgeGap[] {
  const categoryStats: Record<string, { correct: number; total: number; subject: string; blooms: string[] }> = {};

  const filtered = subject ? sessions.filter(s => s.subject === subject) : sessions;

  for (const session of filtered) {
    if (session.questions) {
      for (const q of session.questions) {
        const key = `${session.subject}::${q.category}`;
        if (!categoryStats[key]) {
          categoryStats[key] = { correct: 0, total: 0, subject: session.subject, blooms: [] };
        }
        categoryStats[key].total++;
        if (q.correct) categoryStats[key].correct++;
        categoryStats[key].blooms.push(q.bloom);
      }
    }
  }

  const gaps: KnowledgeGap[] = [];
  for (const [key, stats] of Object.entries(categoryStats)) {
    const accuracy = Math.round((stats.correct / stats.total) * 100);
    if (accuracy < 70 && stats.total >= 2) {
      const category = key.split('::')[1];
      const lowestBloom = stats.blooms.includes('remember') ? 'remember'
        : stats.blooms.includes('understand') ? 'understand'
        : stats.blooms.includes('apply') ? 'apply' : 'analyze';

      gaps.push({
        category,
        subject: stats.subject,
        accuracy,
        totalAttempts: stats.total,
        bloom: lowestBloom,
        recommendation: accuracy < 40
          ? `Start with basic ${category} concepts. Focus on remember-level practice.`
          : accuracy < 60
          ? `Review ${category} fundamentals, then practice application problems.`
          : `Almost there with ${category}! Practice a few more application-level questions.`,
      });
    }
  }

  return gaps.sort((a, b) => a.accuracy - b.accuracy);
}

// ── Learning Velocity ──
export function calculateVelocity(sessions: Session[]): { daily: number; trend: 'improving' | 'steady' | 'declining' } {
  if (sessions.length < 2) return { daily: sessions.length, trend: 'steady' };

  const last7 = sessions.filter(s => {
    const d = new Date(s.date);
    return d.getTime() > Date.now() - 7 * 86400000;
  });
  const prev7 = sessions.filter(s => {
    const d = new Date(s.date);
    return d.getTime() > Date.now() - 14 * 86400000 && d.getTime() <= Date.now() - 7 * 86400000;
  });

  const recentAcc = last7.reduce((a, s) => a + (s.correct || 0), 0) / Math.max(last7.reduce((a, s) => a + (s.total || 0), 0), 1);
  const prevAcc = prev7.reduce((a, s) => a + (s.correct || 0), 0) / Math.max(prev7.reduce((a, s) => a + (s.total || 0), 0), 1);

  const trend = recentAcc > prevAcc + 0.05 ? 'improving' : recentAcc < prevAcc - 0.05 ? 'declining' : 'steady';

  return { daily: Math.round(last7.length / 7 * 10) / 10, trend };
}

// ── Subject Performance Summary ──
export function getSubjectPerformance(sessions: Session[], subjectId: string) {
  const subSessions = sessions.filter(s => s.subject === subjectId);
  const totalQ = subSessions.reduce((a, s) => a + (s.total || 0), 0);
  const totalC = subSessions.reduce((a, s) => a + (s.correct || 0), 0);

  return {
    sessions: subSessions.length,
    totalQuestions: totalQ,
    totalCorrect: totalC,
    accuracy: totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0,
    xp: subSessions.reduce((a, s) => a + (s.xp || 0), 0),
  };
}
