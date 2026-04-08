'use client';

import { useState } from 'react';
import type { Question } from '@/lib/types';

export default function GenQuizPractice({ questions, onBack }: {
  questions: Question[];
  onBack: () => void;
}) {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [fb, setFb] = useState(false);
  const [score, setScore] = useState(0);

  if (cur >= questions.length) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600 to-purple-700" />
        <div className="relative z-10 text-5xl mb-3">{pct >= 80 ? '&#127942;' : pct >= 60 ? '&#11088;' : '&#128170;'}</div>
        <div className="relative z-10 text-4xl font-black mb-1">{pct}%</div>
        <p className="relative z-10 text-white/70 mb-6">{score} of {questions.length} correct</p>
        <button onClick={onBack} className="relative z-10 bg-white/20 text-white font-bold py-3 px-8 rounded-xl active:scale-95">Done</button>
      </div>
    );
  }

  const q = questions[cur];
  const check = () => { if (sel === null) return; setFb(true); if (sel === q.ans) setScore(s => s + 1); };
  const next = () => { setCur(c => c + 1); setSel(null); setFb(false); };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center gap-3">
        <button onClick={onBack} className="text-white/80">&times;</button>
        <span className="text-white font-bold text-sm flex-1">&#128196; From Your Materials</span>
        <span className="text-white/60 text-xs">{cur + 1}/{questions.length}</span>
      </div>
      <div className="flex-1 p-5 overflow-y-auto">
        <span className="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold mb-2">{q.cat || 'Study Guide'}</span>
        <h2 className="text-base font-bold text-gray-900 mb-5">{q.q}</h2>
        <div className="space-y-2.5">
          {q.opts.map((o, i) => (
            <button key={i} onClick={() => !fb && setSel(i)} className={`w-full p-3.5 rounded-xl text-left flex items-center gap-3 active:scale-98 text-sm ${
              fb ? i === q.ans ? 'border-2 border-green-500 bg-green-50' : i === sel ? 'border-2 border-red-500 bg-red-50' : 'border border-gray-100 opacity-30'
              : sel === i ? 'border-2 border-purple-400 bg-purple-50' : 'border border-gray-200'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                fb && i === q.ans ? 'bg-green-500 text-white' : fb && i === sel ? 'bg-red-500 text-white' : sel === i ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{String.fromCharCode(65 + i)}</div>
              <span className="flex-1">{o}</span>
            </button>
          ))}
        </div>
        {fb && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs ${sel === q.ans ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="font-bold mb-1">{sel === q.ans ? 'Nice!' : 'Keep going!'}</p>
            <p className="text-gray-700 leading-relaxed">{q.exp}</p>
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        {!fb ? (
          <button onClick={check} disabled={sel === null} className={`w-full py-3.5 rounded-xl font-bold active:scale-98 ${
            sel !== null ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'bg-gray-100 text-gray-300'
          }`}>Check</button>
        ) : (
          <button onClick={next} className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white active:scale-98">
            {cur >= questions.length - 1 ? 'See Results' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  );
}
