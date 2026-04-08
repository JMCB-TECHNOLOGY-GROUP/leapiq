'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { SUBJECTS } from '@/lib/constants';
import { getDueQuestions, getSRQueue, updateSR } from '@/lib/storage';
import { questionBank } from '@/data/questions';
import type { Question } from '@/lib/types';

export default function ReviewMode({ onBack }: { onBack: () => void }) {
  const { user } = useApp();
  const studentId = user?.id || '';

  const dueIds = getDueQuestions(studentId);
  const allQs: Question[] = Object.values(questionBank).flat();
  const questions = allQs.filter(q => dueIds.includes(q.id));

  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [fb, setFb] = useState(false);
  const [score, setScore] = useState(0);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/95" />
        <div className="relative z-10 text-5xl mb-4">&#9989;</div>
        <h1 className="relative z-10 text-xl font-black text-gray-900 mb-2">All caught up!</h1>
        <p className="relative z-10 text-gray-500 text-sm mb-6">No questions due for review. Keep practicing to add more!</p>
        <button onClick={onBack} className="relative z-10 bg-blue-500 text-white font-bold py-3 px-8 rounded-xl active:scale-95 transition-transform">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (cur >= questions.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-orange-500 to-red-500 text-white">
        <div className="text-5xl mb-4">&#127942;</div>
        <div className="text-4xl font-black mb-2">{Math.round((score / questions.length) * 100)}%</div>
        <p className="text-white/70 mb-6">{score} of {questions.length} reviewed</p>
        <button onClick={onBack} className="bg-white/20 text-white font-bold py-3 px-8 rounded-xl active:scale-95">Done</button>
      </div>
    );
  }

  const q = questions[cur];
  const subj = SUBJECTS.find(s => questionBank[s.id]?.find(x => x.id === q.id));
  const sr = getSRQueue(studentId)[q.id] || { box: 1, attempts: 0, correct: 0 };

  const check = () => {
    if (sel === null) return;
    setFb(true);
    const ok = sel === q.ans;
    updateSR(studentId, q.id, ok);
    if (ok) setScore(s => s + 1);
  };

  const next = () => {
    setCur(c => c + 1);
    setSel(null);
    setFb(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white/80">&times;</button>
          <div className="flex-1 text-white font-bold text-sm">&#128260; Review Mode</div>
          <span className="text-white/70 text-xs">{cur + 1}/{questions.length}</span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-white/60">
          <span>Box {sr.box || 1}</span>
          <span>&middot;</span>
          <span>{sr.attempts || 0} attempts</span>
          <span>&middot;</span>
          <span>{sr.correct || 0} correct</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-lg mx-auto">
          <span className="inline-block px-2.5 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold mb-2">{q.cat}</span>
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
                    : 'border border-gray-100 opacity-30'
                    : sel === i ? 'border-2 border-orange-400 bg-orange-50' : 'border border-gray-200'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  fb && i === q.ans ? 'bg-green-500 text-white'
                  : fb && i === sel ? 'bg-red-500 text-white'
                  : sel === i ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="flex-1">{o}</span>
              </button>
            ))}
          </div>
          {fb && (
            <div className={`mt-4 p-3.5 rounded-xl text-sm ${sel === q.ans ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="font-bold text-xs mb-1">{sel === q.ans ? 'Moving up!' : 'Back to review soon'}</p>
              <p className="text-gray-700 text-xs leading-relaxed">{q.exp}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t">
        {!fb ? (
          <button onClick={check} disabled={sel === null} className={`w-full py-3.5 rounded-xl font-bold active:scale-98 ${
            sel !== null ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-300'
          }`}>Check</button>
        ) : (
          <button onClick={next} className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg active:scale-98">
            {cur >= questions.length - 1 ? 'Done' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}
