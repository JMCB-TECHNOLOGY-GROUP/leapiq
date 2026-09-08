import { GRADE_ORDER } from '@/data/curriculum';
import { strandsForGrade } from '@/data/curriculum';
import type {
  AssessmentRecord,
  ColumnMapping,
  IngestIssue,
  IngestResult,
} from './iep-types';

/**
 * Stage 1 of the plan pipeline: turn a school's mark sheet into assessment
 * records the rest of the system can reason about.
 *
 * The parser is deliberately forgiving — schools export from a dozen different
 * systems — but every assumption it makes is reported as an issue so the person
 * importing can see exactly what was inferred.
 */

// ── Delimited parsing ──

/** Split a delimited file into rows, honouring quoted fields and embedded newlines. */
export function parseDelimited(text: string, delimiter?: string): string[][] {
  const source = text.replace(/^﻿/, '');
  const delim = delimiter ?? detectDelimiter(source);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];

    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === delim) {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop blank lines.
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const counts: Record<string, number> = {
    ',': (firstLine.match(/,/g) || []).length,
    '\t': (firstLine.match(/\t/g) || []).length,
    ';': (firstLine.match(/;/g) || []).length,
    '|': (firstLine.match(/\|/g) || []).length,
  };
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

// ── Column detection ──

const COLUMN_ALIASES: Record<keyof ColumnMapping, string[]> = {
  studentRef: ['studentid', 'student id', 'id', 'studentref', 'student ref', 'pupilid', 'pupil id', 'admissionno', 'admission number', 'rollno', 'roll'],
  studentName: ['studentname', 'student name', 'name', 'pupil', 'pupilname', 'pupil name', 'learner', 'fullname', 'full name'],
  grade: ['grade', 'gradelevel', 'grade level', 'year', 'yeargroup', 'year group', 'form', 'class'],
  subject: ['subject', 'course', 'learningarea', 'learning area'],
  strand: ['strand', 'domain', 'category', 'topic', 'skill', 'cluster', 'standardarea', 'standard area'],
  assessment: ['assessment', 'test', 'exam', 'testname', 'test name', 'assessmentname', 'assessment name', 'paper'],
  date: ['date', 'testdate', 'test date', 'assessed', 'assesseddate', 'dateadministered', 'administered'],
  score: ['score', 'marks', 'mark', 'raw', 'rawscore', 'raw score', 'pointsearned', 'points earned', 'result'],
  maxScore: ['maxscore', 'max score', 'outof', 'out of', 'total', 'totalmarks', 'total marks', 'possible', 'pointspossible', 'points possible', 'maximum'],
  percent: ['percent', 'percentage', 'pct', '%', 'percentcorrect', 'percent correct'],
  standards: ['standard', 'standards', 'code', 'standardcode', 'standard code', 'objective'],
};

function normaliseHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

/** Match each source header to a known field. First match wins. */
export function detectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const normalised = headers.map(normaliseHeader);

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [keyof ColumnMapping, string[]][]) {
    for (let i = 0; i < normalised.length; i++) {
      const h = normalised[i];
      const compact = h.replace(/\s+/g, '');
      if (aliases.includes(h) || aliases.includes(compact)) {
        mapping[field] = headers[i];
        break;
      }
    }
  }

  return mapping;
}

// ── Value normalisation ──

const SUBJECT_ALIASES: Record<string, string> = {
  math: 'math', maths: 'math', mathematics: 'math', numeracy: 'math', arithmetic: 'math',
  english: 'english', ela: 'english', 'english language arts': 'english', 'language arts': 'english',
  literacy: 'english', reading: 'english', writing: 'english',
  science: 'science', 'general science': 'science', biology: 'science', physics: 'science', chemistry: 'science',
  history: 'history', 'social studies': 'history', 'social science': 'history', geography: 'history', civics: 'history',
};

export function normaliseSubject(raw: string): string | null {
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  return SUBJECT_ALIASES[key] ?? null;
}

export function normaliseGrade(raw: string): string | null {
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  if (GRADE_ORDER.includes(key)) return key;
  if (/^(pre-?k|pk|nursery|preschool)$/.test(key)) return 'prek';
  if (/^(k|kg|kindergarten|reception)$/.test(key)) return 'k';
  if (/^(college|university|tertiary|undergrad\w*)$/.test(key)) return 'college';

  const num = key.match(/(\d{1,2})/);
  if (num) {
    const n = parseInt(num[1], 10);
    if (n >= 1 && n <= 12) {
      const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
      return `${n}${suffix}`;
    }
  }
  return null;
}

/**
 * Match a free-text strand to one the curriculum teaches at this grade, so
 * imported data lines up with assignable modules. Falls back to the raw label.
 */
export function normaliseStrand(raw: string, subject: string, grade: string): string {
  const cleaned = raw.trim();
  if (!cleaned) return 'General';

  const known = strandsForGrade(grade).filter(s => s.subject === subject).map(s => s.strand);
  const lower = cleaned.toLowerCase();

  const exact = known.find(s => s.toLowerCase() === lower);
  if (exact) return exact;

  // Token overlap — "Number Operations" should reach "Number & Operations".
  const tokens = new Set(lower.split(/[^a-z0-9]+/).filter(t => t.length > 2));
  let best: { strand: string; score: number } | null = null;
  for (const s of known) {
    const sTokens = s.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2);
    const overlap = sTokens.filter(t => tokens.has(t)).length;
    if (overlap > 0 && (!best || overlap > best.score)) best = { strand: s, score: overlap };
  }

  return best ? best.strand : cleaned;
}

function parseNumber(raw: string): number | null {
  const cleaned = raw.trim().replace(/[%\s,]/g, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDate(raw: string): string | null {
  const cleaned = raw.trim();
  if (!cleaned) return null;
  // Prefer ISO; fall back to Date parsing for common regional formats.
  const iso = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = cleaned.match(/^(\d{1,2})[/](\d{1,2})[/](\d{4})$/);
  if (dmy) {
    // Ambiguous. Treat >12 in the first slot as day-first, otherwise month-first.
    const a = parseInt(dmy[1], 10);
    const b = parseInt(dmy[2], 10);
    const [month, day] = a > 12 ? [b, a] : [a, b];
    return `${dmy[3]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

// ── Ingestion ──

export interface IngestOptions {
  /** Applied to rows whose grade column is missing or unreadable. */
  defaultGrade?: string;
  /** Label recorded on every record, e.g. the file name. */
  source?: string;
  mapping?: ColumnMapping;
}

export function ingestAssessments(text: string, options: IngestOptions = {}): IngestResult {
  const source = options.source ?? 'pasted data';
  const rows = parseDelimited(text);

  if (rows.length === 0) {
    return {
      records: [], rows: 0, accepted: 0, headers: [], mapping: {},
      issues: [{ row: 0, message: 'The file is empty.', severity: 'error' }],
    };
  }

  const headers = rows[0].map(h => h.trim());
  const mapping = { ...detectColumns(headers), ...options.mapping };
  const issues: IngestIssue[] = [];
  const records: AssessmentRecord[] = [];

  const index = (field: keyof ColumnMapping): number => {
    const header = mapping[field];
    return header ? headers.indexOf(header) : -1;
  };

  const idx = {
    studentRef: index('studentRef'),
    studentName: index('studentName'),
    grade: index('grade'),
    subject: index('subject'),
    strand: index('strand'),
    assessment: index('assessment'),
    date: index('date'),
    score: index('score'),
    maxScore: index('maxScore'),
    percent: index('percent'),
    standards: index('standards'),
  };

  if (idx.studentName === -1 && idx.studentRef === -1) {
    issues.push({ row: 1, message: 'No student name or student id column found. Nothing can be imported.', severity: 'error' });
    return { records: [], rows: rows.length - 1, accepted: 0, headers, mapping, issues };
  }
  if (idx.subject === -1) {
    issues.push({ row: 1, field: 'subject', message: 'No subject column found. Rows cannot be matched to a subject.', severity: 'error' });
    return { records: [], rows: rows.length - 1, accepted: 0, headers, mapping, issues };
  }
  if (idx.score === -1 && idx.percent === -1) {
    issues.push({ row: 1, field: 'score', message: 'No score or percent column found. Nothing can be imported.', severity: 'error' });
    return { records: [], rows: rows.length - 1, accepted: 0, headers, mapping, issues };
  }
  if (idx.strand === -1) {
    issues.push({ row: 1, field: 'strand', message: 'No strand column found. Every row will be filed under "General", which produces one goal per subject instead of one per skill.', severity: 'warning' });
  }

  const cell = (row: string[], i: number): string => (i === -1 ? '' : (row[i] ?? '').trim());

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const rowNo = r + 1;

    const studentName = cell(row, idx.studentName) || cell(row, idx.studentRef);
    const studentRef = cell(row, idx.studentRef) || studentName;
    if (!studentName) {
      issues.push({ row: rowNo, field: 'studentName', message: 'No student on this row. Skipped.', severity: 'error' });
      continue;
    }

    const rawSubject = cell(row, idx.subject);
    const subject = normaliseSubject(rawSubject);
    if (!subject) {
      issues.push({ row: rowNo, field: 'subject', message: `Subject "${rawSubject || '(blank)'}" is not one LeapIQ teaches. Skipped.`, severity: 'error' });
      continue;
    }

    const rawGrade = cell(row, idx.grade);
    let grade = normaliseGrade(rawGrade);
    if (!grade) {
      if (options.defaultGrade) {
        grade = options.defaultGrade;
        if (rawGrade) {
          issues.push({ row: rowNo, field: 'grade', message: `Grade "${rawGrade}" not recognised. Used ${grade}.`, severity: 'warning' });
        }
      } else {
        issues.push({ row: rowNo, field: 'grade', message: `Grade "${rawGrade || '(blank)'}" not recognised and no default set. Skipped.`, severity: 'error' });
        continue;
      }
    }

    // Percent: use the explicit column when present, otherwise score / max.
    let percent: number | null = null;
    const explicitPercent = idx.percent === -1 ? null : parseNumber(cell(row, idx.percent));
    const score = idx.score === -1 ? null : parseNumber(cell(row, idx.score));
    let maxScore = idx.maxScore === -1 ? null : parseNumber(cell(row, idx.maxScore));

    if (explicitPercent !== null) {
      percent = explicitPercent;
      if (maxScore === null) maxScore = 100;
    } else if (score !== null) {
      if (maxScore === null) {
        maxScore = 100;
        issues.push({ row: rowNo, field: 'maxScore', message: 'No maximum score given. Treated the score as a percentage out of 100.', severity: 'warning' });
      }
      if (maxScore <= 0) {
        issues.push({ row: rowNo, field: 'maxScore', message: `Maximum score of ${maxScore} is not usable. Skipped.`, severity: 'error' });
        continue;
      }
      percent = (score / maxScore) * 100;
    } else {
      issues.push({ row: rowNo, field: 'score', message: 'Score is missing or not a number. Skipped.', severity: 'error' });
      continue;
    }

    if (percent < 0 || percent > 100) {
      issues.push({ row: rowNo, field: 'score', message: `Computed ${Math.round(percent)}%, which is outside 0-100. Clamped.`, severity: 'warning' });
      percent = Math.min(100, Math.max(0, percent));
    }

    const rawDate = cell(row, idx.date);
    let date = parseDate(rawDate);
    if (!date) {
      date = new Date().toISOString().slice(0, 10);
      if (rawDate) {
        issues.push({ row: rowNo, field: 'date', message: `Date "${rawDate}" not recognised. Used today.`, severity: 'warning' });
      }
    }

    const strand = normaliseStrand(cell(row, idx.strand), subject, grade);
    const standards = cell(row, idx.standards)
      .split(/[;,]/)
      .map(s => s.trim())
      .filter(Boolean);

    records.push({
      id: `asm_${studentRef}_${subject}_${strand}_${date}_${r}`.replace(/\s+/g, '-'),
      studentRef,
      studentName,
      grade,
      subject,
      strand,
      assessment: cell(row, idx.assessment) || 'Imported assessment',
      date,
      score: score ?? Math.round((percent / 100) * (maxScore ?? 100)),
      maxScore: maxScore ?? 100,
      percent: Math.round(percent * 10) / 10,
      standards,
      source,
    });
  }

  return { records, issues, rows: rows.length - 1, accepted: records.length, mapping, headers };
}

/** Group accepted records by student, ready for baseline computation. */
export function groupByStudent(records: AssessmentRecord[]): Map<string, AssessmentRecord[]> {
  const map = new Map<string, AssessmentRecord[]>();
  for (const record of records) {
    const list = map.get(record.studentRef);
    if (list) list.push(record);
    else map.set(record.studentRef, [record]);
  }
  return map;
}
