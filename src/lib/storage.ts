'use client';

import { LEITNER_INTERVALS } from './constants';
import type { Student, Session, SREntry, UploadedDoc } from './types';

const PREFIX = 'liq_';

function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(PREFIX + key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* storage full */ }
}

function del(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PREFIX + key);
  } catch { /* noop */ }
}

// ── Students ──
export function getStudents(): Student[] {
  return get<Student[]>('students', []);
}

export function saveStudents(students: Student[]): void {
  set('students', students);
}

export function addStudent(name: string, grade: string, state: string): Student {
  const student: Student = {
    id: 'stu_' + Date.now(),
    name,
    grade,
    state,
    created: new Date().toISOString(),
  };
  const students = getStudents();
  students.push(student);
  saveStudents(students);
  return student;
}

// ── Sessions ──
export function getSessions(): Session[] {
  return get<Session[]>('sessions', []);
}

export function saveSessions(sessions: Session[]): void {
  set('sessions', sessions);
}

export function addSession(session: Omit<Session, 'id'>): Session {
  const full: Session = { id: 'ses_' + Date.now(), ...session };
  const sessions = getSessions();
  sessions.push(full);
  saveSessions(sessions);
  return full;
}

// ── Spaced Repetition ──
export function getSRQueue(studentId: string): Record<string, SREntry> {
  return get<Record<string, SREntry>>(`sr_${studentId}`, {});
}

export function updateSR(studentId: string, questionId: string, correct: boolean): void {
  const q = getSRQueue(studentId);
  const entry = q[questionId] || { box: 0, next: Date.now(), attempts: 0, correct: 0, lastReview: 0 };
  entry.attempts++;
  if (correct) {
    entry.correct++;
    entry.box = Math.min(entry.box + 1, 5);
  } else {
    entry.box = Math.max(entry.box - 1, 1);
  }
  const days = LEITNER_INTERVALS[entry.box] || 1;
  entry.next = Date.now() + days * 86400000;
  entry.lastReview = Date.now();
  q[questionId] = entry;
  set(`sr_${studentId}`, q);
}

export function getDueQuestions(studentId: string): string[] {
  const q = getSRQueue(studentId);
  const now = Date.now();
  return Object.entries(q)
    .filter(([, e]) => e.next <= now && e.box < 5)
    .map(([id]) => id);
}

export function getMasteredCount(studentId: string): number {
  const q = getSRQueue(studentId);
  return Object.values(q).filter(e => e.box >= 5).length;
}

export function getLearningCount(studentId: string): number {
  const q = getSRQueue(studentId);
  return Object.values(q).filter(e => e.box >= 1 && e.box < 5).length;
}

// ── Parent PIN ──
export function getParentPin(): string {
  return get<string>('pin', '');
}

export function setParentPin(pin: string): void {
  set('pin', pin);
}

// ── Educator PIN ──
export function getEducatorPin(): string {
  return get<string>('edu_pin', '');
}

export function setEducatorPin(pin: string): void {
  set('edu_pin', pin);
}

// ── Documents ──
export function getDocs(): UploadedDoc[] {
  return get<UploadedDoc[]>('docs', []);
}

export function saveDocs(docs: UploadedDoc[]): void {
  set('docs', docs);
}

// ── User state ──
export function getUser(): (Student & { role: string }) | null {
  return get<(Student & { role: string }) | null>('user', null);
}

export function setUser(user: (Student & { role: string }) | null): void {
  set('user', user);
}

// ── AI Question Cache ──
export function getCachedQuestions(key: string): { questions: unknown[]; timestamp: number } | null {
  const cached = get<unknown[] | null>(key, null);
  const ts = get<number>(key + '_t', 0);
  if (cached && cached.length > 0 && (Date.now() - ts) < 3600000) {
    return { questions: cached, timestamp: ts };
  }
  return null;
}

export function setCachedQuestions(key: string, questions: unknown[]): void {
  set(key, questions);
  set(key + '_t', Date.now());
}
