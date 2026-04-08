'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import * as storage from './storage';
import type { Student, Session, UploadedDoc } from './types';

interface AppState {
  user: (Student & { role: string }) | null;
  students: Student[];
  sessions: Session[];
  docs: UploadedDoc[];
  parentPin: string;
  educatorPin: string;
}

interface AppContextValue extends AppState {
  login: (user: Student & { role: string }) => void;
  logout: () => void;
  addStudent: (name: string, grade: string, state: string) => Student;
  recordSession: (session: Omit<Session, 'id'>) => void;
  setParentPin: (pin: string) => void;
  setEducatorPin: (pin: string) => void;
  addDoc: (doc: UploadedDoc) => void;
  getStudentSessions: (studentId: string) => Session[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    students: [],
    sessions: [],
    docs: [],
    parentPin: '',
    educatorPin: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    setState({
      user: storage.getUser(),
      students: storage.getStudents(),
      sessions: storage.getSessions(),
      docs: storage.getDocs(),
      parentPin: storage.getParentPin(),
      educatorPin: storage.getEducatorPin(),
    });
  }, []);

  const login = useCallback((user: Student & { role: string }) => {
    storage.setUser(user);
    setState(s => ({ ...s, user }));
  }, []);

  const logout = useCallback(() => {
    storage.setUser(null);
    setState(s => ({ ...s, user: null }));
  }, []);

  const addStudent = useCallback((name: string, grade: string, stateCode: string) => {
    const student = storage.addStudent(name, grade, stateCode);
    setState(s => ({ ...s, students: [...s.students, student] }));
    return student;
  }, []);

  const recordSession = useCallback((session: Omit<Session, 'id'>) => {
    const full = storage.addSession(session);
    setState(s => ({ ...s, sessions: [...s.sessions, full] }));
  }, []);

  const setParentPin = useCallback((pin: string) => {
    storage.setParentPin(pin);
    setState(s => ({ ...s, parentPin: pin }));
  }, []);

  const setEducatorPin = useCallback((pin: string) => {
    storage.setEducatorPin(pin);
    setState(s => ({ ...s, educatorPin: pin }));
  }, []);

  const addDoc = useCallback((doc: UploadedDoc) => {
    const docs = [...state.docs, doc];
    storage.saveDocs(docs);
    setState(s => ({ ...s, docs }));
  }, [state.docs]);

  const getStudentSessions = useCallback((studentId: string) => {
    return state.sessions.filter(s => s.studentId === studentId);
  }, [state.sessions]);

  return (
    <AppContext.Provider value={{
      ...state,
      login,
      logout,
      addStudent,
      recordSession,
      setParentPin,
      setEducatorPin,
      addDoc,
      getStudentSessions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
