import type {
  AssessmentRecord,
  Baseline,
  BaselineProfile,
  PerformanceBand,
} from './iep-types';

/**
 * Stage 2 of the plan pipeline: reduce a pile of assessment records to one
 * defensible number per strand — the baseline the plan's goals are written
 * against, and the line every later result is measured from.
 */

/** Bands share the 70% threshold the gap analyser already uses. */
export const BAND_THRESHOLDS: { band: PerformanceBand; min: number }[] = [
  { band: 'exceeding', min: 85 },
  { band: 'meeting', min: 70 },
  { band: 'approaching', min: 55 },
  { band: 'below', min: 40 },
  { band: 'well below', min: 0 },
];

export function bandFor(percent: number): PerformanceBand {
  return BAND_THRESHOLDS.find(b => percent >= b.min)?.band ?? 'well below';
}

/** A strand at or above this is on grade level and does not get a goal. */
export const MEETING_THRESHOLD = 70;

/** Days after which an assessment carries half the weight of a fresh one. */
export const RECENCY_HALF_LIFE_DAYS = 90;

function weightFor(date: string, asOf: string): number {
  const ageDays = (Date.parse(asOf) - Date.parse(date)) / 86400000;
  if (!Number.isFinite(ageDays) || ageDays <= 0) return 1;
  return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
}

function weightedMean(values: { percent: number; weight: number }[]): number {
  const totalWeight = values.reduce((a, v) => a + v.weight, 0);
  if (totalWeight === 0) return 0;
  return values.reduce((a, v) => a + v.percent * v.weight, 0) / totalWeight;
}

export function strandKey(subject: string, strand: string): string {
  return `${subject}::${strand}`;
}

export interface BaselineOptions {
  /** Anchor date for recency weighting. Defaults to the newest record. */
  asOf?: string;
}

/** One baseline per `subject::strand` present in the records. */
export function computeBaselines(
  records: AssessmentRecord[],
  options: BaselineOptions = {},
): Baseline[] {
  if (records.length === 0) return [];

  const asOf =
    options.asOf ??
    records.reduce((latest, r) => (r.date > latest ? r.date : latest), records[0].date);

  const groups = new Map<string, AssessmentRecord[]>();
  for (const record of records) {
    const key = strandKey(record.subject, record.strand);
    const list = groups.get(key);
    if (list) list.push(record);
    else groups.set(key, [record]);
  }

  const baselines: Baseline[] = [];
  for (const [key, group] of groups) {
    const [subject, strand] = key.split('::');
    const percent =
      Math.round(
        weightedMean(group.map(r => ({ percent: r.percent, weight: weightFor(r.date, asOf) }))) * 10,
      ) / 10;

    baselines.push({
      subject,
      strand,
      percent,
      band: bandFor(percent),
      sampleSize: group.length,
      assessments: [...new Set(group.map(r => r.assessment))],
      standards: [...new Set(group.flatMap(r => r.standards))],
      asOf: group.reduce((latest, r) => (r.date > latest ? r.date : latest), group[0].date),
    });
  }

  return baselines.sort((a, b) => a.percent - b.percent);
}

export interface ProfileIdentity {
  studentId: string;
  studentName: string;
  grade: string;
}

export function buildBaselineProfile(
  records: AssessmentRecord[],
  identity: ProfileIdentity,
  options: BaselineOptions = {},
): BaselineProfile {
  const baselines = computeBaselines(records, options);

  // Overall weights each strand by how much evidence backs it.
  const totalSample = baselines.reduce((a, b) => a + b.sampleSize, 0);
  const overall =
    totalSample === 0
      ? 0
      : Math.round(
          (baselines.reduce((a, b) => a + b.percent * b.sampleSize, 0) / totalSample) * 10,
        ) / 10;

  return {
    studentId: identity.studentId,
    studentName: identity.studentName,
    grade: identity.grade,
    generated: new Date().toISOString(),
    baselines,
    overall,
    priorityStrands: baselines
      .filter(b => b.percent < MEETING_THRESHOLD)
      .map(b => strandKey(b.subject, b.strand)),
  };
}

/** Strands at or above the meeting threshold — the strengths half of present levels. */
export function strengths(profile: BaselineProfile): Baseline[] {
  return profile.baselines.filter(b => b.percent >= MEETING_THRESHOLD);
}

/** Strands below the meeting threshold, weakest first. */
export function needs(profile: BaselineProfile): Baseline[] {
  return profile.baselines.filter(b => b.percent < MEETING_THRESHOLD);
}
