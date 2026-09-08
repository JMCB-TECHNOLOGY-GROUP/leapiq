import { describe, it, expect } from 'vitest';
import {
  BAND_THRESHOLDS,
  MEETING_THRESHOLD,
  bandFor,
  buildBaselineProfile,
  computeBaselines,
  needs,
  strengths,
} from '@/lib/baseline';
import type { AssessmentRecord } from '@/lib/iep-types';

function record(over: Partial<AssessmentRecord> = {}): AssessmentRecord {
  return {
    id: over.id ?? `a_${Math.random()}`,
    studentRef: 'G6-001',
    studentName: 'Anaya Persaud',
    grade: 'grade6',
    subject: 'math',
    strand: 'Number Concepts',
    assessment: 'Term 1 Diagnostic',
    date: '2026-01-14',
    score: 20,
    maxScore: 40,
    percent: 50,
    standards: [],
    source: 'test',
    ...over,
  };
}

describe('bandFor', () => {
  it('places each score in the expected band', () => {
    expect(bandFor(95)).toBe('exceeding');
    expect(bandFor(70)).toBe('meeting');
    expect(bandFor(60)).toBe('approaching');
    expect(bandFor(45)).toBe('below');
    expect(bandFor(10)).toBe('well below');
  });

  it('uses the same 70% line the gap analyser uses', () => {
    expect(BAND_THRESHOLDS.find(b => b.band === 'meeting')?.min).toBe(MEETING_THRESHOLD);
  });
});

describe('computeBaselines', () => {
  it('returns nothing for no records', () => {
    expect(computeBaselines([])).toEqual([]);
  });

  it('produces one baseline per subject and strand', () => {
    const baselines = computeBaselines([
      record({ strand: 'Geometry', percent: 80 }),
      record({ strand: 'Number Concepts', percent: 40 }),
      record({ subject: 'english', strand: 'Reading and Comprehension', percent: 60 }),
    ]);
    expect(baselines).toHaveLength(3);
  });

  it('sorts weakest first so the neediest strand leads', () => {
    const baselines = computeBaselines([
      record({ strand: 'Geometry', percent: 80 }),
      record({ strand: 'Number Concepts', percent: 30 }),
    ]);
    expect(baselines[0].strand).toBe('Number Concepts');
  });

  it('weights a recent result above an old one', () => {
    const baselines = computeBaselines([
      record({ date: '2025-07-14', percent: 20 }),
      record({ date: '2026-01-14', percent: 60 }),
    ]);
    // A flat mean would be 40; recency pulls it toward the newer result.
    expect(baselines[0].percent).toBeGreaterThan(40);
    expect(baselines[0].percent).toBeLessThan(60);
  });

  it('treats same-day results as equally weighted', () => {
    const baselines = computeBaselines([
      record({ percent: 40 }),
      record({ percent: 60 }),
    ]);
    expect(baselines[0].percent).toBe(50);
  });

  it('records the evidence behind each baseline', () => {
    const baselines = computeBaselines([
      record({ assessment: 'Diagnostic', standards: ['5.NF.A.1'] }),
      record({ assessment: 'Fractions Check', standards: ['5.NF.A.1', '5.NBT.B.7'], date: '2026-02-11' }),
    ]);
    expect(baselines[0].sampleSize).toBe(2);
    expect(baselines[0].assessments).toEqual(['Diagnostic', 'Fractions Check']);
    expect(baselines[0].standards).toEqual(['5.NF.A.1', '5.NBT.B.7']);
    expect(baselines[0].asOf).toBe('2026-02-11');
  });
});

describe('buildBaselineProfile', () => {
  const identity = { studentId: 'stu_1', studentName: 'Anaya Persaud', grade: 'grade6' };

  it('lists only strands below expectation as priorities, weakest first', () => {
    const profile = buildBaselineProfile(
      [
        record({ strand: 'Geometry', percent: 82 }),
        record({ strand: 'Number Concepts', percent: 28 }),
        record({ subject: 'english', strand: 'Reading and Comprehension', percent: 55 }),
      ],
      identity,
    );
    expect(profile.priorityStrands).toEqual(['math::Number Concepts', 'english::Reading and Comprehension']);
  });

  it('splits strengths from needs at the meeting threshold', () => {
    const profile = buildBaselineProfile(
      [record({ strand: 'Geometry', percent: 70 }), record({ strand: 'Number Concepts', percent: 69 })],
      identity,
    );
    expect(strengths(profile).map(b => b.strand)).toEqual(['Geometry']);
    expect(needs(profile).map(b => b.strand)).toEqual(['Number Concepts']);
  });

  it('weights the overall figure by how much evidence backs each strand', () => {
    const profile = buildBaselineProfile(
      [
        record({ strand: 'Number Concepts', percent: 30 }),
        record({ strand: 'Number Concepts', percent: 30, id: 'b' }),
        record({ strand: 'Number Concepts', percent: 30, id: 'c' }),
        record({ strand: 'Geometry', percent: 90 }),
      ],
      identity,
    );
    // Three results at 30 against one at 90 → 45, not the 60 a strand-mean would give.
    expect(profile.overall).toBe(45);
  });

  it('reports zero and no priorities when there is nothing to go on', () => {
    const profile = buildBaselineProfile([], identity);
    expect(profile.overall).toBe(0);
    expect(profile.priorityStrands).toEqual([]);
  });
});
