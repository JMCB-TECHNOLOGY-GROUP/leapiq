import { describe, it, expect } from 'vitest';
import { buildBaselineProfile } from '@/lib/baseline';
import { buildIEP } from '@/lib/iep-builder';
import {
  MASTERY_THRESHOLD,
  activeQueue,
  applyMasteryEvent,
  applySessionResults,
  assignmentsForGoal,
  createAssignments,
  nextModule,
  summarisePlan,
} from '@/lib/iep-progress';
import type { AssessmentRecord, IEP, ModuleAssignment } from '@/lib/iep-types';
import type { Session } from '@/lib/types';

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
    score: 12,
    maxScore: 40,
    percent: 30,
    standards: [],
    source: 'test',
    ...over,
  };
}

function setUp(percent = 30): { plan: IEP; assignments: ModuleAssignment[] } {
  const profile = buildBaselineProfile([record({ percent })], {
    studentId: 'stu_1',
    studentName: 'Anaya Persaud',
    grade: 'grade6',
  });
  const plan = buildIEP(profile);
  return { plan, assignments: createAssignments(plan) };
}

function checkpoint(moduleId: string, percent: number, date = '2026-03-01') {
  return { moduleId, percent, date, source: 'module' as const };
}

describe('createAssignments', () => {
  it('creates one assignment per module on the plan', () => {
    const { plan, assignments } = setUp();
    expect(assignments).toHaveLength(plan.goals.reduce((a, g) => a + g.moduleIds.length, 0));
    expect(assignments.every(a => a.status === 'assigned')).toBe(true);
    expect(assignments.every(a => a.attempts === 0)).toBe(true);
  });

  it('orders a goal’s modules by teaching sequence', () => {
    const { plan, assignments } = setUp();
    const ordered = assignmentsForGoal(assignments, plan.goals[0].id);
    expect(ordered.map(a => a.moduleId)).toEqual(plan.goals[0].moduleIds);
  });
});

describe('applyMasteryEvent', () => {
  it('records the attempt and the best score', () => {
    const { plan, assignments } = setUp();
    const first = assignments[0];
    const after = applyMasteryEvent(plan, assignments, checkpoint(first.moduleId, 62));
    const updated = after.assignments.find(a => a.id === first.id)!;
    expect(updated.attempts).toBe(1);
    expect(updated.bestPercent).toBe(62);
    expect(updated.status).toBe('in progress');
  });

  it('keeps the best score across a weaker retry', () => {
    const { plan, assignments } = setUp();
    const first = assignments[0];
    const a = applyMasteryEvent(plan, assignments, checkpoint(first.moduleId, 62));
    const b = applyMasteryEvent(a.plan, a.assignments, checkpoint(first.moduleId, 41, '2026-03-08'));
    const updated = b.assignments.find(x => x.id === first.id)!;
    expect(updated.bestPercent).toBe(62);
    expect(updated.attempts).toBe(2);
  });

  it(`masters the module at ${MASTERY_THRESHOLD}% and releases the next one`, () => {
    const { plan, assignments } = setUp();
    const first = assignments[0];
    const after = applyMasteryEvent(plan, assignments, checkpoint(first.moduleId, MASTERY_THRESHOLD));
    expect(after.assignments.find(a => a.id === first.id)!.status).toBe('mastered');
    expect(after.unlocked?.moduleId).toBe(assignments[1].moduleId);
  });

  it('does not master the module just below the threshold', () => {
    const { plan, assignments } = setUp();
    const after = applyMasteryEvent(plan, assignments, checkpoint(assignments[0].moduleId, MASTERY_THRESHOLD - 1));
    expect(after.assignments[0].status).toBe('in progress');
    expect(after.unlocked).toBeNull();
  });

  it('moves the goal off its baseline and logs what happened', () => {
    const { plan, assignments } = setUp();
    const after = applyMasteryEvent(plan, assignments, checkpoint(assignments[0].moduleId, 70));
    const goal = after.plan.goals[0];
    expect(goal.currentPercent).toBe(70);
    expect(goal.baselinePercent).toBe(30);
    expect(goal.progress).toHaveLength(2);
    expect(goal.progress[1].note).toMatch(/checkpoint/);
  });

  it('averages the recent checkpoints rather than trusting the last one', () => {
    const { plan, assignments } = setUp();
    const a = applyMasteryEvent(plan, assignments, checkpoint(assignments[0].moduleId, 90));
    const b = applyMasteryEvent(a.plan, a.assignments, checkpoint(assignments[1].moduleId, 50, '2026-03-08'));
    expect(b.plan.goals[0].currentPercent).toBe(70);
  });

  it('meets the goal after two consecutive checkpoints at target', () => {
    const { plan, assignments } = setUp();
    const target = plan.goals[0].targetPercent;
    const a = applyMasteryEvent(plan, assignments, checkpoint(assignments[0].moduleId, target + 5));
    const b = applyMasteryEvent(a.plan, a.assignments, checkpoint(assignments[1].moduleId, target + 5, '2026-03-08'));
    expect(b.plan.goals[0].status).toBe('met');
  });

  it('does not meet the goal on a single checkpoint at target', () => {
    const { plan, assignments } = setUp();
    const target = plan.goals[0].targetPercent;
    const a = applyMasteryEvent(plan, assignments, checkpoint(assignments[0].moduleId, target + 5));
    expect(a.plan.goals[0].status).toBe('in progress');
  });

  it('calls a goal off track when checkpoints sit below the expected line', () => {
    const { plan, assignments } = setUp();
    const a = applyMasteryEvent(plan, assignments, checkpoint(assignments[0].moduleId, 20));
    const b = applyMasteryEvent(a.plan, a.assignments, checkpoint(assignments[1].moduleId, 22, '2026-03-08'));
    expect(b.plan.goals[0].status).toBe('off track');
  });

  it('turns a draft plan active once work starts', () => {
    const { plan, assignments } = setUp();
    expect(plan.status).toBe('draft');
    expect(applyMasteryEvent(plan, assignments, checkpoint(assignments[0].moduleId, 60)).plan.status).toBe('active');
  });

  it('ignores an event for a module the pupil was never assigned', () => {
    const { plan, assignments } = setUp();
    const after = applyMasteryEvent(plan, assignments, checkpoint('math-6th-not-a-real-module', 90));
    expect(after.plan).toBe(plan);
    expect(after.assignments).toBe(assignments);
  });

  it('clamps a score outside 0-100', () => {
    const { plan, assignments } = setUp();
    const after = applyMasteryEvent(plan, assignments, checkpoint(assignments[0].moduleId, 140));
    expect(after.assignments[0].bestPercent).toBe(100);
  });

  it('leaves the original plan untouched', () => {
    const { plan, assignments } = setUp();
    const before = JSON.stringify(plan);
    applyMasteryEvent(plan, assignments, checkpoint(assignments[0].moduleId, 90));
    expect(JSON.stringify(plan)).toBe(before);
  });
});

describe('the queue of work', () => {
  it('offers the earliest unmastered module per goal', () => {
    const { plan, assignments } = setUp();
    expect(activeQueue(plan, assignments)).toHaveLength(plan.goals.length);
    expect(nextModule(assignments, plan.goals[0].id)?.moduleId).toBe(plan.goals[0].moduleIds[0]);
  });

  it('advances as modules are mastered and empties when the goal is done', () => {
    const { plan, assignments } = setUp();
    const goal = plan.goals[0];
    let state = { plan, assignments };
    for (const moduleId of goal.moduleIds) {
      state = applyMasteryEvent(state.plan, state.assignments, checkpoint(moduleId, 95));
    }
    expect(nextModule(state.assignments, goal.id)).toBeNull();
    expect(assignmentsForGoal(state.assignments, goal.id).every(a => a.status === 'mastered')).toBe(true);
  });
});

describe('applySessionResults', () => {
  function session(over: Partial<Session> = {}): Session {
    return {
      id: 'ses_1',
      studentId: 'stu_1',
      subject: 'math',
      date: '2026-03-05T10:00:00.000Z',
      correct: 3,
      total: 4,
      xp: 30,
      questions: [
        { id: 'q1', correct: true, bloom: 'apply', category: 'Number Concepts' },
        { id: 'q2', correct: true, bloom: 'apply', category: 'Number Concepts' },
        { id: 'q3', correct: true, bloom: 'apply', category: 'Number Concepts' },
        { id: 'q4', correct: false, bloom: 'apply', category: 'Number Concepts' },
      ],
      ...over,
    };
  }

  it('folds quiz accuracy for a matching strand into the goal', () => {
    const { plan, assignments } = setUp();
    const after = applySessionResults(plan, assignments, session());
    const goal = after.goals[0];
    expect(goal.progress.at(-1)?.source).toBe('quiz');
    expect(goal.progress.at(-1)?.percent).toBe(75);
    expect(goal.currentPercent).toBe(75);
  });

  it('ignores a quiz in a subject the plan does not cover', () => {
    const { plan, assignments } = setUp();
    expect(applySessionResults(plan, assignments, session({ subject: 'social' }))).toBe(plan);
  });

  it('ignores a quiz whose categories match no goal', () => {
    const { plan, assignments } = setUp();
    const off = session({
      questions: [{ id: 'q1', correct: true, bloom: 'apply', category: 'Trigonometry' }],
    });
    expect(applySessionResults(plan, assignments, off)).toBe(plan);
  });

  it('ignores a session with no recorded questions', () => {
    const { plan, assignments } = setUp();
    expect(applySessionResults(plan, assignments, session({ questions: [] }))).toBe(plan);
  });

  it('never masters a module from quiz evidence alone', () => {
    const { plan, assignments } = setUp();
    applySessionResults(plan, assignments, session());
    expect(assignments.every(a => a.status === 'assigned')).toBe(true);
  });
});

describe('summarisePlan', () => {
  it('counts goals, modules and progress toward target', () => {
    const { plan, assignments } = setUp();
    const before = summarisePlan(plan, assignments);
    expect(before.goals).toBe(plan.goals.length);
    expect(before.notStarted).toBe(plan.goals.length);
    expect(before.modulesMastered).toBe(0);
    expect(before.averageGrowth).toBe(0);

    const after = applyMasteryEvent(plan, assignments, checkpoint(assignments[0].moduleId, 95));
    const summary = summarisePlan(after.plan, after.assignments);
    expect(summary.modulesMastered).toBe(1);
    expect(summary.averageGrowth).toBeGreaterThan(0);
  });
});

describe('end to end', () => {
  it('carries a pupil from imported scores to a met goal', () => {
    const { plan, assignments } = setUp(30);
    const goal = plan.goals[0];
    expect(goal.baselinePercent).toBe(30);
    expect(goal.status).toBe('not started');

    let state = { plan, assignments };
    for (const moduleId of goal.moduleIds) {
      state = applyMasteryEvent(state.plan, state.assignments, checkpoint(moduleId, 92));
    }

    const finished = state.plan.goals[0];
    expect(finished.status).toBe('met');
    expect(finished.currentPercent).toBeGreaterThan(finished.targetPercent);
    // The baseline is the fixed line growth is measured from, so it must not move.
    expect(finished.baselinePercent).toBe(30);
    expect(summarisePlan(state.plan, state.assignments).averageGrowth).toBe(100);
    expect(state.plan.status).toBe('complete');
  });
});
