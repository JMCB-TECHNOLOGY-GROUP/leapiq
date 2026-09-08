import { modulesForStrand } from '@/data/curriculum';
import { GRADE_CONFIG, SUBJECTS } from './constants';
import { MEETING_THRESHOLD, needs, strengths } from './baseline';
import type { Baseline, BaselineProfile, IEP, IEPGoal } from './iep-types';

/**
 * Stage 3 of the plan pipeline: write the plan.
 *
 * Every goal is anchored to a baseline, carries a target the pupil can actually
 * reach in a review cycle, and names the modules that will get them there. The
 * modules come from the pre-populated catalogue for the pupil's grade, so a plan
 * is assignable the moment it is generated.
 */

/** Goals beyond this stop being a plan and start being a wish list. */
export const MAX_GOALS = 6;
export const MODULES_PER_GOAL = 4;

/** Expected growth over one review cycle, by how far behind the pupil is. */
const GROWTH_BY_BAND: Record<string, number> = {
  'well below': 20,
  below: 18,
  approaching: 15,
  meeting: 10,
  exceeding: 5,
};

export const TARGET_CEILING = 90;

export function targetFor(baseline: Baseline): number {
  const growth = GROWTH_BY_BAND[baseline.band] ?? 15;
  return Math.min(TARGET_CEILING, Math.round(baseline.percent + growth));
}

function subjectName(subject: string): string {
  return SUBJECTS.find(s => s.id === subject)?.name ?? subject;
}

function gradeLabel(grade: string): string {
  return GRADE_CONFIG[grade]?.label ?? grade;
}

/**
 * Where in the strand sequence to start. A pupil at 15% starts at the beginning;
 * one at 65% skips the foundations they have already shown.
 */
export function startIndexFor(percent: number, moduleCount: number): number {
  if (moduleCount <= 1) return 0;
  const ratio = Math.min(percent, MEETING_THRESHOLD) / MEETING_THRESHOLD;
  return Math.min(moduleCount - 1, Math.floor(ratio * moduleCount * 0.5));
}

function goalStatement(baseline: Baseline, target: number, grade: string, studentName: string): string {
  // Named, measurable and time-bound — the three things a goal is reviewed against.
  const who = studentName.trim().split(/\s+/)[0] || 'The pupil';
  return (
    `Given ${gradeLabel(grade)} ${subjectName(baseline.subject).toLowerCase()} material in ` +
    `${baseline.strand}, ${who} will improve from a baseline of ${baseline.percent}% ` +
    `to ${target}% or better on module checkpoints by the next review.`
  );
}

function criterionFor(target: number): string {
  return `${target}% or better on 2 consecutive checkpoints in this strand`;
}

/** The PLAAFP narrative: what the data says, in prose a parent can read. */
export function writePresentLevels(profile: BaselineProfile): string {
  const lines: string[] = [];
  const sampleTotal = profile.baselines.reduce((a, b) => a + b.sampleSize, 0);

  lines.push(
    `${profile.studentName} is working at ${gradeLabel(profile.grade)}. Across ` +
      `${sampleTotal} imported assessment ${sampleTotal === 1 ? 'result' : 'results'} covering ` +
      `${profile.baselines.length} ${profile.baselines.length === 1 ? 'strand' : 'strands'}, ` +
      `the weighted average is ${profile.overall}%.`,
  );

  const strong = strengths(profile);
  if (strong.length > 0) {
    lines.push(
      `Strengths: ${strong
        .map(b => `${b.strand} (${subjectName(b.subject)}, ${b.percent}%)`)
        .join('; ')}. These are at or above the ${MEETING_THRESHOLD}% expectation and are not targeted by a goal.`,
    );
  }

  const weak = needs(profile);
  if (weak.length > 0) {
    lines.push(
      `Areas of need: ${weak
        .map(b => `${b.strand} (${subjectName(b.subject)}, ${b.percent}%, ${b.band})`)
        .join('; ')}.`,
    );
    lines.push(
      `The lowest strand is ${weak[0].strand} at ${weak[0].percent}%, based on ` +
        `${weak[0].sampleSize} ${weak[0].sampleSize === 1 ? 'result' : 'results'} ` +
        `(most recent ${weak[0].asOf}). Goals below are written against these baselines.`,
    );
  } else {
    lines.push(
      `No strand falls below the ${MEETING_THRESHOLD}% expectation. No remedial goals are required; ` +
        `enrichment modules are assigned instead.`,
    );
  }

  return lines.join('\n\n');
}

/** Supports implied by the shape of the data, not by diagnosis. */
export function suggestAccommodations(profile: BaselineProfile): string[] {
  const out: string[] = [];
  const weak = needs(profile);
  const byKey = (subject: string, strandMatch: RegExp) =>
    weak.some(b => b.subject === subject && strandMatch.test(b.strand));

  if (profile.overall < 50) out.push('Extended time (1.5x) on assessments');
  if (weak.length >= 4) out.push('Reduced item count per session to protect stamina');
  if (byKey('english', /read|vocab/i)) out.push('Read-aloud support for text on non-reading assessments');
  if (byKey('english', /writ|grammar/i)) out.push('Word bank and sentence frames for extended writing');
  if (byKey('math', /number|operation/i)) out.push('Number line and multiplication grid available');
  if (byKey('math', /measure|data|geometry/i)) out.push('Formula reference sheet available');
  if (byKey('science', /./) || byKey('history', /./)) out.push('Key vocabulary pre-taught before each unit');
  out.push('Progress checked at every module checkpoint rather than end of term');

  return [...new Set(out)];
}

export interface PlanOptions {
  maxGoals?: number;
  modulesPerGoal?: number;
  /** Days until the next progress review. */
  reviewInDays?: number;
  now?: Date;
}

export function buildIEP(profile: BaselineProfile, options: PlanOptions = {}): IEP {
  const {
    maxGoals = MAX_GOALS,
    modulesPerGoal = MODULES_PER_GOAL,
    reviewInDays = 90,
    now = new Date(),
  } = options;

  const created = now.toISOString();
  const planId = `iep_${profile.studentId}_${now.getTime()}`;

  // Weakest strands first; a strand with no catalogue modules cannot be worked on.
  const candidates = needs(profile).slice(0, maxGoals);

  const goals: IEPGoal[] = [];
  for (const baseline of candidates) {
    const available = modulesForStrand(profile.grade, baseline.subject, baseline.strand);
    if (available.length === 0) continue;

    const start = startIndexFor(baseline.percent, available.length);
    const chosen = available.slice(start, start + modulesPerGoal);
    const target = targetFor(baseline);

    goals.push({
      id: `goal_${baseline.subject}_${baseline.strand}_${now.getTime()}`.replace(/\s+/g, '-'),
      subject: baseline.subject,
      strand: baseline.strand,
      baselinePercent: baseline.percent,
      targetPercent: target,
      currentPercent: baseline.percent,
      statement: goalStatement(baseline, target, profile.grade, profile.studentName),
      criterion: criterionFor(target),
      moduleIds: chosen.map(m => m.id),
      status: 'not started',
      progress: [
        {
          date: baseline.asOf,
          percent: baseline.percent,
          source: 'baseline',
          note: `Baseline from ${baseline.sampleSize} imported ${
            baseline.sampleSize === 1 ? 'result' : 'results'
          }`,
        },
      ],
    });
  }

  const review = new Date(now.getTime() + reviewInDays * 86400000);

  return {
    id: planId,
    studentId: profile.studentId,
    studentName: profile.studentName,
    grade: profile.grade,
    created,
    updated: created,
    reviewDate: review.toISOString().slice(0, 10),
    presentLevels: writePresentLevels(profile),
    baselines: profile.baselines,
    goals,
    accommodations: suggestAccommodations(profile),
    status: goals.length > 0 ? 'draft' : 'complete',
  };
}

/** Strands that need work but have no catalogue modules at this grade. */
export function uncoveredStrands(profile: BaselineProfile): Baseline[] {
  return needs(profile).filter(
    b => modulesForStrand(profile.grade, b.subject, b.strand).length === 0,
  );
}
