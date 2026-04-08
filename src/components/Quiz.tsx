'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/app-context';
import { SUBJECTS, GRADE_CONFIG, STATES, STANDARDS_MAP } from '@/lib/constants';
import { getAdaptiveQuestions } from '@/lib/adaptive-engine';
import { updateSR } from '@/lib/storage';
import type { Question } from '@/lib/types';

export default function Quiz({ subject, onDone, onBack }: {
  subject: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const { user, recordSession } = useApp();
  const grade = user?.grade || '5th';
  const state = user?.state || 'DC';
  const gc = GRADE_CONFIG[grade] || GRADE_CONFIG['5th'];
  const subj = SUBJECTS.find(s => s.id === subject);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [fb, setFb] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);
  const [questionResults, setQuestionResults] = useState<{ id: string; correct: boolean; bloom: string; category: string }[]>([]);

  useEffect(() => {
    async function loadQuestions() {
      // Try hardcoded bank first
      const adaptive = getAdaptiveQuestions(subject, user?.id || '', gc.qCount);
      if (adaptive.length >= 3) {
        setQuestions(adaptive);
        setLoading(false);
        return;
      }

      // Fall back to AI-generated questions
      try {
        const res = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, grade, state, count: gc.qCount }),
        });
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          setQuestions(adaptive);
        }
      } catch {
        setQuestions(adaptive);
      }
      setLoading(false);
    }
    loadQuestions();
  }, [subject, grade, state, gc.qCount, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
        </div>
        <p className="text-gray-500 font-semibold text-sm">Preparing {subj?.name} questions...</p>
        <p className="text-gray-400 text-xs mt-1">Aligned to {STATES.find(s => s.code === state)?.std || 'state'} standards</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 mb-4">No questions available yet.</p>
        <button onClick={onBack} className="bg-blue-500 text-white font-bold py-3 px-8 rounded-xl">Back</button>
      </div>
    );
  }

  // Results screen
  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80&auto=format" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-700/85 to-indigo-800/90" />
        </div>
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-4">{pct >= 80 ? '&#127942;' : pct >= 60 ? '&#11088;' : '&#128170;'}</div>
          <div className="text-5xl font-black mb-2">{pct}%</div>
          <p className="text-white/70 mb-1">{correct} of {questions.length} correct</p>
          <p className="text-amber-300 font-bold mb-6">+{xp} XP earned</p>

          {/* Standards covered */}
          {questions.some(q => q.standards && q.standards.length > 0) && (
            <div className="bg-white/10 rounded-xl p-3 mb-4 max-w-sm mx-auto">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">Standards Covered</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {[...new Set(questions.flatMap(q => q.standards || []))].map(std => (
                  <span key={std} className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">{std}</span>
                ))}
              </div>
            </div>
          )}

          <button onClick={onDone} className="bg-white/20 text-white font-bold py-3 px-8 rounded-xl active:scale-95 transition-transform">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const q = questions[cur];

  const check = () => {
    if (sel === null) return;
    setFb(true);
    const isCorrect = sel === q.ans;
    if (user) updateSR(user.id, q.id, isCorrect);
    setQuestionResults(prev => [...prev, { id: q.id, correct: isCorrect, bloom: q.bl, category: q.cat }]);
    if (isCorrect) {
      setCorrect(c => c + 1);
      setXp(x => x + 10 + (streak >= 2 ? 5 : 0));
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (cur >= questions.length - 1) {
      // Record session
      if (user) {
        const finalCorrect = correct + (sel === q.ans && fb ? 0 : 0);
        recordSession({
          studentId: user.id,
          subject,
          date: new Date().toISOString(),
          correct: correct,
          total: questions.length,
          xp,
          questions: questionResults,
        });
      }
      setDone(true);
      return;
    }
    setCur(c => c + 1);
    setSel(null);
    setFb(false);
  };

  // Get standards for this question
  const qStandards = q.standards?.map(code => {
    const catStandards = STANDARDS_MAP[subject]?.[q.cat] || [];
    return catStandards.find(s => s.code === code) || { code, description: '' };
  }) || [];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="p-4 bg-white border-b border-gray-50">
        <div className="flex items-center gap-3 mb-1.5">
          <button onClick={onBack} className="text-gray-400 text-lg">&times;</button>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${subj?.gradient} rounded-full transition-all duration-500`} style={{ width: `${((cur + 1) / questions.length) * 100}%` }} />
          </div>
          <span className="text-[10px] text-gray-400 font-bold">{cur + 1}/{questions.length}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-amber-500 font-bold">&#9889; {xp} XP</span>
          {streak >= 2 && <span className="text-orange-500 font-bold">&#128293; {streak} streak!</span>}
          <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
            q.bl === 'remember' ? 'bg-green-100 text-green-700'
            : q.bl === 'understand' ? 'bg-blue-100 text-blue-700'
            : q.bl === 'apply' ? 'bg-purple-100 text-purple-700'
            : 'bg-red-100 text-red-700'
          }`}>
            {q.bl.charAt(0).toUpperCase() + q.bl.slice(1)}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-lg mx-auto">
          <span className={`inline-block px-2.5 py-0.5 ${subj?.bg} ${subj?.tx} rounded-full text-[10px] font-bold mb-2`}>{q.cat}</span>
          <h2 className="text-base font-bold text-gray-900 mb-5 leading-relaxed">{q.q}</h2>
          <div className="space-y-2.5">
            {q.opts.map((o, i) => (
              <button
                key={i}
                onClick={() => !fb && setSel(i)}
                className={`w-full p-3.5 rounded-xl text-left font-medium transition-all flex items-center gap-3 active:scale-98 text-sm ${
                  fb
                    ? i === q.ans ? 'border-2 border-green-500 bg-green-50'
                    : i === sel ? 'border-2 border-red-500 bg-red-50'
                    : 'border border-gray-100 bg-gray-50 opacity-30'
                    : sel === i ? `border-2 ${subj?.bd} ${subj?.bg}` : 'border border-gray-200 bg-white'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  fb && i === q.ans ? 'bg-green-500 text-white'
                  : fb && i === sel ? 'bg-red-500 text-white'
                  : sel === i ? `bg-gradient-to-r ${subj?.gradient} text-white`
                  : 'bg-gray-100 text-gray-500'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="flex-1">{o}</span>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {fb && (
            <div className={`mt-4 p-3.5 rounded-xl text-sm ${sel === q.ans ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="font-bold text-xs mb-1">{sel === q.ans ? 'Correct! +10 XP' : 'Not quite!'}</p>
              <p className="text-gray-700 text-xs leading-relaxed">{q.exp}</p>
              {/* Standards */}
              {qStandards.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200/50">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Standard</p>
                  {qStandards.map(s => (
                    <p key={s.code} className="text-[10px] text-gray-500">
                      <span className="font-bold">{s.code}</span> {s.description && `— ${s.description}`}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="p-4 border-t">
        <div className="max-w-lg mx-auto">
          {!fb ? (
            <button
              onClick={check}
              disabled={sel === null}
              className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-98 ${
                sel !== null ? `bg-gradient-to-r ${subj?.gradient} text-white shadow-lg` : 'bg-gray-100 text-gray-300'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={next}
              className={`w-full py-3.5 rounded-xl font-bold bg-gradient-to-r ${subj?.gradient} text-white shadow-lg active:scale-98 transition-transform`}
            >
              {cur >= questions.length - 1 ? 'See Results' : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
