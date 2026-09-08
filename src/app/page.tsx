'use client';

import { useApp } from '@/lib/app-context';
import Landing from '@/components/Landing';
import StudentLogin from '@/components/StudentLogin';
import StudentDashboard from '@/components/StudentDashboard';
import ParentLogin from '@/components/ParentLogin';
import ParentDashboard from '@/components/ParentDashboard';
import EducatorLogin from '@/components/EducatorLogin';
import EducatorDashboard from '@/components/EducatorDashboard';
import Quiz from '@/components/Quiz';
import Tutor from '@/components/Tutor';
import ReviewMode from '@/components/ReviewMode';
import DocUpload from '@/components/DocUpload';
import PlanIntake from '@/components/PlanIntake';
import PlanView from '@/components/PlanView';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user, login, logout } = useApp();
  const [screen, setScreen] = useState('landing');
  const [restored, setRestored] = useState(false);

  // Auto-restore session on mount. The persisted user arrives after the
  // provider hydrates, so the screen cannot be derived on the first render.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- screen restore depends on the post-mount user */
    if (!restored && user) {
      if (user.role === 'student') setScreen('dashboard');
      else if (user.role === 'parent') setScreen('par-dash');
      else if (user.role === 'educator') setScreen('edu-dash');
      setRestored(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [user, restored]);

  // Landing
  if (screen === 'landing') {
    return (
      <Landing
        onStudent={() => setScreen('stu-login')}
        onParent={() => setScreen('par-login')}
        onEducator={() => setScreen('edu-login')}
      />
    );
  }

  // Auth screens
  if (screen === 'stu-login') {
    return (
      <StudentLogin
        onSelect={(student) => {
          login({ ...student, role: 'student' });
          setScreen('dashboard');
        }}
        onBack={() => setScreen('landing')}
      />
    );
  }

  if (screen === 'par-login') {
    return (
      <ParentLogin
        onSuccess={() => {
          login({ id: 'parent', name: 'Parent', grade: '', district: '', created: '', role: 'parent' });
          setScreen('par-dash');
        }}
        onBack={() => setScreen('landing')}
      />
    );
  }

  if (screen === 'edu-login') {
    return (
      <EducatorLogin
        onSuccess={() => {
          login({ id: 'educator', name: 'Educator', grade: '', district: '', created: '', role: 'educator' });
          setScreen('edu-dash');
        }}
        onBack={() => setScreen('landing')}
      />
    );
  }

  // Student screens
  if (screen === 'dashboard' && user?.role === 'student') {
    return (
      <StudentDashboard
        onQuiz={(subject) => setScreen('quiz-' + subject)}
        onTutor={(subject) => setScreen('tutor-' + subject)}
        onReview={() => setScreen('review')}
        onUpload={() => setScreen('upload')}
        onPlan={() => setScreen('plan-' + user.id)}
        onLogout={() => { logout(); setScreen('landing'); }}
      />
    );
  }

  const quizMatch = screen.match(/^quiz-(.+)$/);
  if (quizMatch && user?.role === 'student') {
    return (
      <Quiz
        subject={quizMatch[1]}
        onDone={() => setScreen('dashboard')}
        onBack={() => setScreen('dashboard')}
      />
    );
  }

  const tutorMatch = screen.match(/^tutor-(.+)$/);
  if (tutorMatch && user?.role === 'student') {
    return (
      <Tutor
        subject={tutorMatch[1]}
        onBack={() => setScreen('dashboard')}
      />
    );
  }

  if (screen === 'review' && user?.role === 'student') {
    return <ReviewMode onBack={() => setScreen('dashboard')} />;
  }

  if (screen === 'upload' && user?.role === 'student') {
    return <DocUpload onBack={() => setScreen('dashboard')} />;
  }

  // Parent dashboard
  if (screen === 'par-dash') {
    return <ParentDashboard onLogout={() => { logout(); setScreen('landing'); }} />;
  }

  // Educator dashboard
  if (screen === 'edu-dash') {
    return (
      <EducatorDashboard
        onLogout={() => { logout(); setScreen('landing'); }}
        onIntake={() => setScreen('intake')}
        onOpenPlan={(studentId) => setScreen('plan-' + studentId)}
      />
    );
  }

  // Assessment intake — educators only
  if (screen === 'intake' && user?.role === 'educator') {
    return (
      <PlanIntake
        onBack={() => setScreen('edu-dash')}
        onOpenPlan={(studentId) => setScreen('plan-' + studentId)}
      />
    );
  }

  // Learning plan. Pupils see their own, read-only; educators can mark checkpoints.
  const planMatch = screen.match(/^plan-(.+)$/);
  if (planMatch) {
    const isOwnPlan = user?.role === 'student' && user.id === planMatch[1];
    if (isOwnPlan || user?.role === 'educator') {
      return (
        <PlanView
          studentId={planMatch[1]}
          readOnly={isOwnPlan}
          onBack={() => setScreen(user?.role === 'educator' ? 'edu-dash' : 'dashboard')}
        />
      );
    }
  }

  return null;
}
