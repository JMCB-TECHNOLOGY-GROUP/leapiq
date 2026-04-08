export interface Student {
  id: string;
  name: string;
  grade: string;
  state: string;
  created: string;
  avatar?: string;
}

export interface Question {
  id: string;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
  cat: string;
  bl: 'remember' | 'understand' | 'apply' | 'analyze';
  diff: number;
  standards?: string[];
}

export interface SREntry {
  box: number;
  next: number;
  attempts: number;
  correct: number;
  lastReview: number;
}

export interface Session {
  id: string;
  studentId: string;
  subject: string;
  date: string;
  correct: number;
  total: number;
  xp: number;
  questions?: { id: string; correct: boolean; bloom: string; category: string }[];
  gaps?: string[];
}

export interface UploadedDoc {
  id: string;
  name: string;
  type: 'image' | 'text';
  content: string;
  date: string;
  studentId: string;
}

export interface KnowledgeGap {
  category: string;
  subject: string;
  accuracy: number;
  totalAttempts: number;
  bloom: string;
  recommendation: string;
}

export interface LearningPath {
  studentId: string;
  subject: string;
  steps: LearningStep[];
  generated: string;
}

export interface LearningStep {
  order: number;
  category: string;
  bloom: string;
  description: string;
  questionCount: number;
  completed: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Classroom {
  id: string;
  name: string;
  educatorId: string;
  studentIds: string[];
  subject: string;
  created: string;
}
