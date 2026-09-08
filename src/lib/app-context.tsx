'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import * as storage from './storage';
import type { Student, Session, UploadedDoc } from './types';
import type { AssessmentRecord, IEP, MasteryEvent, ModuleAssignment } from './iep-types';
import { applyMasteryEvent, applySessionResults, createAssignments } from './iep-progress';

interface AppState {
  user: (Student & { role: string }) | null;
  students: Student[];
  sessions: Session[];
  docs: UploadedDoc[];
  parentPin: string;
  educatorPin: string;
  assessments: AssessmentRecord[];
  plans: IEP[];
  assignments: ModuleAssignment[];
}

interface AppContextValue extends AppState {
  login: (user: Student & { role: string }) => void;
  logout: () => void;
  addStudent: (name: string, grade: string, district: string) => Student;
  recordSession: (session: Omit<Session, 'id'>) => void;
  setParentPin: (pin: string) => void;
  setEducatorPin: (pin: string) => void;
  addDoc: (doc: UploadedDoc) => void;
  getStudentSessions: (studentId: string) => Session[];
  importAssessments: (records: AssessmentRecord[]) => void;
  savePlan: (plan: IEP) => void;
  recordMastery: (planId: string, event: MasteryEvent) => void;
  getPlanForStudent: (studentId: string) => IEP | null;
  getAssignmentsForStudent: (studentId: string) => ModuleAssignment[];
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
    assessments: [],
    plans: [],
    assignments: [],
  });

  // Load from localStorage on mount.
  // localStorage does not exist on the server and must not be read during
  // render, so hydrating the store after mount is the only correct option here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount hydration from localStorage
    setState({
      user: storage.getUser(),
      students: storage.getStudents(),
      sessions: storage.getSessions(),
      docs: storage.getDocs(),
      parentPin: storage.getParentPin(),
      educatorPin: storage.getEducatorPin(),
      assessments: storage.getAssessments(),
      plans: storage.getPlans(),
      assignments: storage.getAssignments(),
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

  const addStudent = useCallback((name: string, grade: string, district: string) => {
    const student = storage.addStudent(name, grade, district);
    setState(s => ({ ...s, students: [...s.students, student] }));
    return student;
  }, []);

  const recordSession = useCallback((session: Omit<Session, 'id'>) => {
    const full = storage.addSession(session);
    setState(s => {
      // Practice results keep the pupil's plan current without a separate step.
      const plans = s.plans.map(plan =>
        plan.studentId === full.studentId
          ? applySessionResults(plan, s.assignments, full)
          : plan,
      );
      if (plans.some((p, i) => p !== s.plans[i])) storage.savePlans(plans);
      return { ...s, sessions: [...s.sessions, full], plans };
    });
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

  const importAssessments = useCallback((records: AssessmentRecord[]) => {
    const merged = storage.addAssessments(records);
    setState(s => ({ ...s, assessments: merged }));
  }, []);

  const savePlan = useCallback((plan: IEP) => {
    const plans = storage.upsertPlan(plan);
    // A saved plan replaces the assignments of any earlier plan for that pupil.
    const kept = storage.getAssignments().filter(a => a.studentId !== plan.studentId);
    const assignments = [...kept, ...createAssignments(plan)];
    storage.saveAssignments(assignments);
    setState(s => ({ ...s, plans, assignments }));
  }, []);

  // Both of the updaters below persist from inside setState so they always act on the
  // latest state rather than a stale closure. applySessionResults and applyMasteryEvent
  // are pure functions of that state, so a repeated invocation writes the same bytes.
  const recordMastery = useCallback((planId: string, event: MasteryEvent) => {
    setState(s => {
      const plan = s.plans.find(p => p.id === planId);
      if (!plan) return s;
      const result = applyMasteryEvent(plan, s.assignments, event);
      const plans = s.plans.map(p => (p.id === planId ? result.plan : p));
      storage.savePlans(plans);
      storage.saveAssignments(result.assignments);
      return { ...s, plans, assignments: result.assignments };
    });
  }, []);

  const getPlanForStudent = useCallback((studentId: string) => {
    const mine = state.plans.filter(p => p.studentId === studentId);
    if (mine.length === 0) return null;
    return [...mine].sort((a, b) => b.created.localeCompare(a.created))[0];
  }, [state.plans]);

  const getAssignmentsForStudent = useCallback((studentId: string) => {
    return state.assignments.filter(a => a.studentId === studentId);
  }, [state.assignments]);

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
      importAssessments,
      savePlan,
      recordMastery,
      getPlanForStudent,
      getAssignmentsForStudent,
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
