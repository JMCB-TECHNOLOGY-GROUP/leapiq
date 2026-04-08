'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { GRADE_OPTIONS, STATES } from '@/lib/constants';
import type { Student } from '@/lib/types';

export default function StudentLogin({ onSelect, onBack }: {
  onSelect: (student: Student) => void;
  onBack: () => void;
}) {
  const { students, addStudent } = useApp();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('5th');
  const [usState, setUsState] = useState('DC');
  const [adding, setAdding] = useState(false);

  return (
    <div className="min-h-screen relative p-6">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80&auto=format" alt="" className="w-full h-full object-cover opacity-[0.06]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/95 to-white/98" />
      <div className="relative z-10">
        <button onClick={onBack} className="text-gray-400 text-sm mb-6">&larr; Back</button>
        <div className="max-w-sm mx-auto">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Welcome!</h1>
          <p className="text-gray-500 mb-6 text-sm">Who&apos;s learning today?</p>

          {students.map(s => (
            <button key={s.id} onClick={() => onSelect(s)} className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all active:scale-95 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {s.name[0].toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900">{s.name}</div>
                <div className="text-xs text-gray-400">{s.grade} grade</div>
              </div>
            </button>
          ))}

          {!adding ? (
            <button onClick={() => setAdding(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-semibold hover:border-blue-400 hover:text-blue-500 transition-colors mt-2">
              + New Student
            </button>
          ) : (
            <div className="bg-white p-4 rounded-2xl border border-blue-200 mt-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full p-3 border border-gray-200 rounded-xl mb-2 focus:outline-none focus:border-blue-400 font-medium"
                autoFocus
              />
              <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl mb-2 focus:outline-none focus:border-blue-400 text-sm">
                {GRADE_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
              <select value={usState} onChange={e => setUsState(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:border-blue-400 text-sm">
                <option value="">Select State</option>
                {STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setAdding(false)} className="flex-1 py-2 text-gray-400 font-semibold">Cancel</button>
                <button
                  onClick={() => {
                    if (name.trim()) {
                      const s = addStudent(name.trim(), grade, usState);
                      setName('');
                      setAdding(false);
                      onSelect(s);
                    }
                  }}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition-transform"
                >
                  Go!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
