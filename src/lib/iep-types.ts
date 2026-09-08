import type { BloomLevel } from './constants';

// ── Stage 1: ingested assessment data ──
// One row of an imported mark sheet, after parsing and validation.
export interface AssessmentRecord {
  id: string;
  /** Identifier as it appeared in the source file (student number, roll, or name). */
  studentRef: string;
  studentName: string;
  /** Resolved LeapIQ student id, set once the row is matched to a profile. */
  studentId?: string;
  grade: string;
  subject: string;
  strand: string;
  assessment: string;
  date: string;
  score: number;
  maxScore: number;
  percent: number;
  standards: string[];
  source: string;
}

export type IssueSeverity = 'error' | 'warning';

export interface IngestIssue {
  /** 1-based row number in the source file, counting the header as row 1. */
  row: number;
  field?: string;
  message: string;
  severity: IssueSeverity;
}

export interface ColumnMapping {
  studentRef?: string;
  studentName?: string;
  grade?: string;
  subject?: string;
  strand?: string;
  assessment?: string;
  date?: string;
  score?: string;
  maxScore?: string;
  percent?: string;
  standards?: string;
}

export interface IngestResult {
  records: AssessmentRecord[];
  issues: IngestIssue[];
  /** Data rows seen, excluding the header. */
  rows: number;
  accepted: number;
  mapping: ColumnMapping;
  headers: string[];
}

// ── Stage 2: baselines ──
export type PerformanceBand =
  | 'well below'
  | 'below'
  | 'approaching'
  | 'meeting'
  | 'exceeding';

export interface Baseline {
  subject: string;
  strand: string;
  /** Recency-weighted percent across every record for this strand. */
  percent: number;
  band: PerformanceBand;
  sampleSize: number;
  assessments: string[];
  standards: string[];
  asOf: string;
}

export interface BaselineProfile {
  studentId: string;
  studentName: string;
  grade: string;
  generated: string;
  baselines: Baseline[];
  /** Recency-weighted percent across every strand. */
  overall: number;
  /** Strand keys (`subject::strand`) below the meeting band, weakest first. */
  priorityStrands: string[];
}

// ── Stage 3: the plan ──
export type GoalStatus = 'not started' | 'in progress' | 'on track' | 'off track' | 'met';

export interface GoalProgressPoint {
  date: string;
  percent: number;
  source: 'baseline' | 'module' | 'quiz';
  note: string;
}

export interface IEPGoal {
  id: string;
  subject: string;
  strand: string;
  /** Percent at the time the plan was written. Never changes. */
  baselinePercent: number;
  targetPercent: number;
  currentPercent: number;
  statement: string;
  criterion: string;
  moduleIds: string[];
  status: GoalStatus;
  progress: GoalProgressPoint[];
}

export type IEPStatus = 'draft' | 'active' | 'review due' | 'complete';

export interface IEP {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  created: string;
  updated: string;
  reviewDate: string;
  /** Present levels of academic achievement and functional performance. */
  presentLevels: string;
  baselines: Baseline[];
  goals: IEPGoal[];
  accommodations: string[];
  status: IEPStatus;
}

// ── Stage 4: assigned modules and mastery ──
export type AssignmentStatus = 'assigned' | 'in progress' | 'mastered';

export interface ModuleAssignment {
  id: string;
  studentId: string;
  planId: string;
  goalId: string;
  moduleId: string;
  assigned: string;
  status: AssignmentStatus;
  attempts: number;
  bestPercent: number;
  lastAttempt?: string;
  masteredOn?: string;
}

export interface MasteryEvent {
  moduleId: string;
  percent: number;
  date: string;
  source: 'module' | 'quiz';
}

// ── Curriculum ──
export interface CurriculumModule {
  id: string;
  subject: string;
  strand: string;
  grade: string;
  /** Position within the strand for this grade, 1-based. */
  sequence: number;
  title: string;
  objective: string;
  bloom: BloomLevel;
  /** 1 (foundational) to 5 (extension). */
  difficulty: number;
  minutes: number;
  standards: string[];
  prerequisiteIds: string[];
  materials: { lessons: number; practice: number; checkpoints: number };
}
