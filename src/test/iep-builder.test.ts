import { describe, it, expect } from 'vitest';
import { buildBaselineProfile } from '@/lib/baseline';
import {
  MAX_GOALS,
  TARGET_CEILING,
  buildIEP,
  startIndexFor,
  suggestAccommodations,
  targetFor,
  uncoveredStrands,
  writePresentLevels,
} from '@/lib/iep-builder';
import { modulesForStrand } from '@/data/curriculum';
import type { AssessmentRecord, Baseline } from '@/lib/iep-types';

function record(over: Partial<AssessmentRecord> = {}): AssessmentRecord {
  return {
    id: over.id ?? `a_${Math.random()}`,
    studentRef: 'G6-001',
    studentName: 'Anaya Persaud',
    grade: '6th',
    subject: 'math',
    strand: 'Number & Operations',
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

const identity = { studentId: 'stu_1', studentName: 'Anaya Persaud', grade: '6th' };

function baseline(over: Partial<Baseline> = {}): Baseline {
  return {
    subject: 'math',
    strand: 'Number & Operations',
    percent: 30,
    band: 'well below',
    sampleSize: 2,
    assessments: ['Diagnostic'],
    standards: [],
    asOf: '2026-01-14',
    ...over,
  };
}

describe('targetFor', () => {
  it('asks for more growth the further behind the pupil is', () => {
    const wellBelow = targetFor(baseline({ percent: 30, band: 'well below' }));
    const approaching = targetFor(baseline({ percent: 60, band: 'approaching' }));
    expect(wellBelow - 30).toBeGreaterThan(approaching - 60);
  });

  it('never sets a target above the ceiling', () => {
    expect(targetFor(baseline({ percent: 88, band: 'exceeding' }))).toBeLessThanOrEqual(TARGET_CEILING);
  });

  it('always sets a target above the baseline', () => {
    for (const percent of [0, 12, 45, 68]) {
      const b = baseline({ percent, band: 'below' });
      expect(targetFor(b)).toBeGreaterThan(percent);
    }
  });
});

describe('startIndexFor', () => {
  it('starts a pupil with no foundation at the first module', () => {
    expect(startIndexFor(0, 4)).toBe(0);
  });

  it('lets a stronger pupil skip the easiest modules', () => {
    expect(startIndexFor(65, 4)).toBeGreaterThan(0);
  });

  it('never runs past the end of the strand', () => {
    for (const count of [1, 2, 5]) {
      for (const percent of [0, 50, 70, 100]) {
        const i = startIndexFor(percent, count);
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThan(count);
      }
    }
  });
});

describe('buildIEP', () => {
  const records = [
    record({ strand: 'Number & Operations', percent: 28 }),
    record({ strand: 'Geometry', percent: 84 }),
    record({ subject: 'english', strand: 'Reading', percent: 42 }),
    record({ subject: 'science', strand: 'Physical Science', percent: 55 }),
  ];
  const profile = buildBaselineProfile(records, identity);
  const plan = buildIEP(profile);

  it('writes a goal for every strand below expectation and none above', () => {
    expect(plan.goals.map(g => g.strand).sort()).toEqual(
      ['Number & Operations', 'Physical Science', 'Reading'].sort(),
    );
  });

  it('anchors each goal to its baseline and starts current level there', () => {
    const goal = plan.goals.find(g => g.strand === 'Number & Operations')!;
    expect(goal.baselinePercent).toBe(28);
    expect(goal.currentPercent).toBe(28);
    expect(goal.targetPercent).toBeGreaterThan(28);
    expect(goal.status).toBe('not started');
  });

  it('seeds the progress log with the baseline point', () => {
    const goal = plan.goals[0];
    expect(goal.progress).toHaveLength(1);
    expect(goal.progress[0].source).toBe('baseline');
    expect(goal.progress[0].percent).toBe(goal.baselinePercent);
  });

  it('assigns modules that exist in the catalogue for the pupil’s grade', () => {
    for (const goal of plan.goals) {
      expect(goal.moduleIds.length).toBeGreaterThan(0);
      const available = modulesForStrand('6th', goal.subject, goal.strand).map(m => m.id);
      for (const id of goal.moduleIds) expect(available).toContain(id);
    }
  });

  it('states the goal and its criterion in measurable terms', () => {
    const goal = plan.goals.find(g => g.strand === 'Number & Operations')!;
    expect(goal.statement).toContain('Anaya');
    expect(goal.statement).toContain('28%');
    expect(goal.statement).toContain(`${goal.targetPercent}%`);
    expect(goal.criterion).toContain(`${goal.targetPercent}%`);
  });

  it('caps the number of goals so a plan stays workable', () => {
    const many = buildBaselineProfile(
      [
        record({ subject: 'math', strand: 'Number & Operations', percent: 20 }),
        record({ subject: 'math', strand: 'Geometry', percent: 21 }),
        record({ subject: 'math', strand: 'Measurement & Data', percent: 22 }),
        record({ subject: 'math', strand: 'Operations & Algebraic Thinking', percent: 23 }),
        record({ subject: 'english', strand: 'Reading', percent: 24 }),
        record({ subject: 'english', strand: 'Writing', percent: 25 }),
        record({ subject: 'english', strand: 'Grammar', percent: 26 }),
        record({ subject: 'science', strand: 'Physical Science', percent: 27 }),
      ],
      identity,
    );
    expect(buildIEP(many).goals.length).toBeLessThanOrEqual(MAX_GOALS);
  });

  it('sets a review date ahead of the creation date', () => {
    expect(plan.reviewDate > plan.created.slice(0, 10)).toBe(true);
  });

  it('is complete rather than draft when nothing needs remediation', () => {
    const strong = buildBaselineProfile([record({ percent: 92 })], identity);
    const strongPlan = buildIEP(strong);
    expect(strongPlan.goals).toHaveLength(0);
    expect(strongPlan.status).toBe('complete');
  });

  it('skips a strand the catalogue cannot teach at that grade', () => {
    const odd = buildBaselineProfile([record({ strand: 'Mental Arithmetic', percent: 30 })], identity);
    expect(buildIEP(odd).goals).toHaveLength(0);
    expect(uncoveredStrands(odd).map(b => b.strand)).toEqual(['Mental Arithmetic']);
  });
});

describe('writePresentLevels', () => {
  it('names strengths, needs and the evidence behind them', () => {
    const profile = buildBaselineProfile(
      [record({ strand: 'Number & Operations', percent: 28 }), record({ strand: 'Geometry', percent: 84 })],
      identity,
    );
    const text = writePresentLevels(profile);
    expect(text).toContain('Anaya Persaud');
    expect(text).toContain('Strengths');
    expect(text).toContain('Geometry');
    expect(text).toContain('Areas of need');
    expect(text).toContain('Number & Operations');
  });

  it('says so plainly when no goal is required', () => {
    const profile = buildBaselineProfile([record({ percent: 90 })], identity);
    expect(writePresentLevels(profile)).toContain('No strand falls below');
  });
});

describe('suggestAccommodations', () => {
  it('offers reading support when reading is the weakness', () => {
    const profile = buildBaselineProfile(
      [record({ subject: 'english', strand: 'Reading', percent: 30 })],
      identity,
    );
    expect(suggestAccommodations(profile).some(a => /read-aloud/i.test(a))).toBe(true);
  });

  it('offers extended time only when overall performance is low', () => {
    const low = buildBaselineProfile([record({ percent: 30 })], identity);
    const high = buildBaselineProfile([record({ percent: 68 })], identity);
    expect(suggestAccommodations(low).some(a => /extended time/i.test(a))).toBe(true);
    expect(suggestAccommodations(high).some(a => /extended time/i.test(a))).toBe(false);
  });

  it('never repeats an accommodation', () => {
    const profile = buildBaselineProfile(
      [
        record({ subject: 'science', strand: 'Physical Science', percent: 30 }),
        record({ subject: 'history', strand: 'Geography', percent: 30 }),
      ],
      identity,
    );
    const list = suggestAccommodations(profile);
    expect(new Set(list).size).toBe(list.length);
  });
});
