import { getModule } from '@/data/curriculum';
import { GRADE_ORDER } from '@/data/guyana';
import type {
  GoalProgressPoint,
  GoalStatus,
  IEP,
  IEPGoal,
  MasteryEvent,
  ModuleAssignment,
} from './iep-types';
import type { Session } from './types';

/**
 * Stage 4 of the plan pipeline: the plan stops being a document and starts being
 * a live record. Every checkpoint a pupil completes moves the goal it belongs to,
 * re-derives its status against the baseline, and releases the next module.
 */

/** A checkpoint at or above this counts the module as mastered. */
export const MASTERY_THRESHOLD = 80;

/** Checkpoints averaged into the goal's current level. */
export const ROLLING_WINDOW = 3;

/** Consecutive checkpoints at target needed to meet a goal — matches the criterion text. */
export const CONSECUTIVE_FOR_MET = 2;

/** Tolerance on the expected-progress line before a goal is called off track. */
const ON_TRACK_TOLERANCE = 2;

export function createAssignments(plan: IEP, now: Date = new Date()): ModuleAssignment[] {
  const assigned = now.toISOString();
  return plan.goals.flatMap(goal =>
    goal.moduleIds.map(moduleId => ({
      id: `asg_${plan.studentId}_${moduleId}`,
      studentId: plan.studentId,
      planId: plan.id,
      goalId: goal.id,
      moduleId,
      assigned,
      status: 'assigned' as const,
      attempts: 0,
      bestPercent: 0,
    })),
  );
}

/**
 * Assignments for a goal in teaching order. A goal's modules can span several
 * years — a pupil below expectation works up through earlier grades first — so
 * the order is grade first, then position within that grade's strand.
 */
export function assignmentsForGoal(assignments: ModuleAssignment[], goalId: string): ModuleAssignment[] {
  const rank = (id: string) => {
    const mod = getModule(id);
    if (!mod) return Number.MAX_SAFE_INTEGER;
    return GRADE_ORDER.indexOf(mod.grade) * 1000 + mod.sequence;
  };
  return assignments.filter(a => a.goalId === goalId).sort((a, b) => rank(a.moduleId) - rank(b.moduleId));
}

/** The module a pupil should work on next for a goal: earliest not yet mastered. */
export function nextModule(assignments: ModuleAssignment[], goalId: string): ModuleAssignment | null {
  return assignmentsForGoal(assignments, goalId).find(a => a.status !== 'mastered') ?? null;
}

/** Every module across the plan the pupil is cleared to work on now. */
export function activeQueue(plan: IEP, assignments: ModuleAssignment[]): ModuleAssignment[] {
  return plan.goals
    .map(goal => nextModule(assignments, goal.id))
    .filter((a): a is ModuleAssignment => a !== null);
}

function rollingCurrent(goal: IEPGoal): number {
  const checkpoints = goal.progress.filter(p => p.source !== 'baseline');
  if (checkpoints.length === 0) return goal.baselinePercent;
  const recent = checkpoints.slice(-ROLLING_WINDOW);
  return Math.round((recent.reduce((a, p) => a + p.percent, 0) / recent.length) * 10) / 10;
}

function deriveStatus(goal: IEPGoal, assignments: ModuleAssignment[]): GoalStatus {
  const checkpoints = goal.progress.filter(p => p.source !== 'baseline');
  if (checkpoints.length === 0) return 'not started';

  // Criterion met: the last N checkpoints all sit at or above target.
  const tail = checkpoints.slice(-CONSECUTIVE_FOR_MET);
  if (tail.length === CONSECUTIVE_FOR_MET && tail.every(p => p.percent >= goal.targetPercent)) {
    return 'met';
  }

  if (checkpoints.length < 2) return 'in progress';

  // Expected progress is proportional to how much of the module set is done.
  const goalAssignments = assignmentsForGoal(assignments, goal.id);
  const mastered = goalAssignments.filter(a => a.status === 'mastered').length;
  const share = goalAssignments.length === 0 ? 0 : mastered / goalAssignments.length;
  const expected = goal.baselinePercent + (goal.targetPercent - goal.baselinePercent) * share;

  return goal.currentPercent >= expected - ON_TRACK_TOLERANCE ? 'on track' : 'off track';
}

function derivePlanStatus(plan: IEP, now: Date): IEP['status'] {
  if (plan.goals.length === 0) return 'complete';
  if (plan.goals.every(g => g.status === 'met')) return 'complete';
  if (now.toISOString().slice(0, 10) >= plan.reviewDate) return 'review due';
  const started = plan.goals.some(g => g.status !== 'not started');
  return started ? 'active' : 'draft';
}

export interface ApplyResult {
  plan: IEP;
  assignments: ModuleAssignment[];
  /** Set when this event mastered the module and released the next one. */
  unlocked: ModuleAssignment | null;
}

/**
 * Record one module checkpoint. Updates the assignment, the goal it belongs to,
 * and the plan, and reports whichever module that unlocked.
 */
export function applyMasteryEvent(
  plan: IEP,
  assignments: ModuleAssignment[],
  event: MasteryEvent,
  now: Date = new Date(),
): ApplyResult {
  const target = assignments.find(
    a => a.moduleId === event.moduleId && a.studentId === plan.studentId,
  );
  if (!target) return { plan, assignments, unlocked: null };

  const percent = Math.min(100, Math.max(0, Math.round(event.percent * 10) / 10));
  const mastered = percent >= MASTERY_THRESHOLD;

  const nextAssignments = assignments.map(a =>
    a.id === target.id
      ? {
          ...a,
          attempts: a.attempts + 1,
          bestPercent: Math.max(a.bestPercent, percent),
          lastAttempt: event.date,
          status: mastered ? ('mastered' as const) : ('in progress' as const),
          masteredOn: mastered ? (a.masteredOn ?? event.date) : a.masteredOn,
        }
      : a,
  );

  const moduleTitle = getModule(event.moduleId)?.title ?? event.moduleId;

  const nextGoals = plan.goals.map(goal => {
    if (goal.id !== target.goalId) return goal;

    const point: GoalProgressPoint = {
      date: event.date,
      percent,
      source: event.source,
      note: `${moduleTitle} checkpoint${mastered ? ' — mastered' : ''}`,
    };
    const withPoint: IEPGoal = { ...goal, progress: [...goal.progress, point] };
    withPoint.currentPercent = rollingCurrent(withPoint);
    withPoint.status = deriveStatus(withPoint, nextAssignments);
    return withPoint;
  });

  const nextPlan: IEP = {
    ...plan,
    goals: nextGoals,
    updated: now.toISOString(),
    status: 'active',
  };
  nextPlan.status = derivePlanStatus(nextPlan, now);

  return {
    plan: nextPlan,
    assignments: nextAssignments,
    unlocked: mastered ? nextModule(nextAssignments, target.goalId) : null,
  };
}

/**
 * Fold a completed quiz into the plan. Questions are matched to goals by
 * category, so ordinary practice keeps the plan current without a separate
 * checkpoint. Quiz evidence moves goals but never masters a module.
 */
export function applySessionResults(
  plan: IEP,
  assignments: ModuleAssignment[],
  session: Session,
  now: Date = new Date(),
): IEP {
  if (!session.questions || session.questions.length === 0) return plan;

  const byCategory = new Map<string, { correct: number; total: number }>();
  for (const q of session.questions) {
    const bucket = byCategory.get(q.category) ?? { correct: 0, total: 0 };
    bucket.total++;
    if (q.correct) bucket.correct++;
    byCategory.set(q.category, bucket);
  }

  let touched = false;
  const nextGoals = plan.goals.map(goal => {
    if (goal.subject !== session.subject) return goal;
    const bucket = byCategory.get(goal.strand);
    if (!bucket || bucket.total === 0) return goal;

    touched = true;
    const percent = Math.round((bucket.correct / bucket.total) * 1000) / 10;
    const withPoint: IEPGoal = {
      ...goal,
      progress: [
        ...goal.progress,
        {
          date: session.date.slice(0, 10),
          percent,
          source: 'quiz',
          note: `Practice quiz — ${bucket.correct}/${bucket.total} in ${goal.strand}`,
        },
      ],
    };
    withPoint.currentPercent = rollingCurrent(withPoint);
    withPoint.status = deriveStatus(withPoint, assignments);
    return withPoint;
  });

  if (!touched) return plan;

  const nextPlan: IEP = { ...plan, goals: nextGoals, updated: now.toISOString() };
  nextPlan.status = derivePlanStatus(nextPlan, now);
  return nextPlan;
}

export interface PlanSummary {
  goals: number;
  met: number;
  onTrack: number;
  offTrack: number;
  notStarted: number;
  modulesAssigned: number;
  modulesMastered: number;
  /** Mean percent of the way from baseline to target across all goals. */
  averageGrowth: number;
}

export function summarisePlan(plan: IEP, assignments: ModuleAssignment[]): PlanSummary {
  const mine = assignments.filter(a => a.planId === plan.id);
  const growth = plan.goals.map(g => {
    const span = g.targetPercent - g.baselinePercent;
    if (span <= 0) return 100;
    return Math.max(0, Math.min(100, ((g.currentPercent - g.baselinePercent) / span) * 100));
  });

  return {
    goals: plan.goals.length,
    met: plan.goals.filter(g => g.status === 'met').length,
    onTrack: plan.goals.filter(g => g.status === 'on track' || g.status === 'in progress').length,
    offTrack: plan.goals.filter(g => g.status === 'off track').length,
    notStarted: plan.goals.filter(g => g.status === 'not started').length,
    modulesAssigned: mine.length,
    modulesMastered: mine.filter(a => a.status === 'mastered').length,
    averageGrowth:
      growth.length === 0 ? 0 : Math.round(growth.reduce((a, b) => a + b, 0) / growth.length),
  };
}
