'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { SUBJECTS, GRADE_CONFIG, STATES, STANDARDS_MAP } from '@/lib/constants';
import { getSubjectPerformance, identifyGaps, calculateVelocity } from '@/lib/adaptive-engine';
import { getMasteredCount, getLearningCount } from '@/lib/storage';
import ProgressCharts from './ProgressCharts';

export default function EducatorDashboard({ onLogout }: { onLogout: () => void }) {
  const { students, sessions } = useApp();
  const [view, setView] = useState<'overview' | 'standards' | 'student'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('math');

  // Aggregate class performance
  const allStudentPerf = students.map(s => {
    const ss = sessions.filter(p => p.studentId === s.id);
    const totalQ = ss.reduce((a, p) => a + (p.total || 0), 0);
    const totalC = ss.reduce((a, p) => a + (p.correct || 0), 0);
    return {
      ...s,
      sessions: ss.length,
      accuracy: totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0,
      xp: ss.reduce((a, p) => a + (p.xp || 0), 0),
      gaps: identifyGaps(ss),
      velocity: calculateVelocity(ss),
      mastered: getMasteredCount(s.id),
      learning: getLearningCount(s.id),
    };
  });

  const classAccuracy = allStudentPerf.length > 0
    ? Math.round(allStudentPerf.reduce((a, s) => a + s.accuracy, 0) / allStudentPerf.length)
    : 0;

  // Standards view
  if (view === 'standards') {
    const standards = STANDARDS_MAP[selectedSubject] || {};
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-indigo-700 px-5 py-4 flex items-center gap-3">
          <button onClick={() => setView('overview')} className="text-white/80">&larr;</button>
          <h1 className="text-white font-black flex-1">Standards Alignment</h1>
        </div>
        <div className="px-5 pt-4">
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {SUBJECTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                  selectedSubject === s.id ? `bg-gradient-to-r ${s.gradient} text-white` : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                {s.icon} {s.name}
              </button>
            ))}
          </div>

          {Object.entries(standards).map(([category, stds]) => {
            // Calculate class mastery for this category
            const catSessions = sessions.filter(s => s.subject === selectedSubject && s.questions?.some(q => q.category === category));
            const catTotal = catSessions.reduce((a, s) => a + (s.questions?.filter(q => q.category === category).length || 0), 0);
            const catCorrect = catSessions.reduce((a, s) => a + (s.questions?.filter(q => q.category === category && q.correct).length || 0), 0);
            const catAcc = catTotal > 0 ? Math.round((catCorrect / catTotal) * 100) : 0;

            return (
              <div key={category} className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-gray-900">{category}</h3>
                  {catTotal > 0 && (
                    <span className={`text-xs font-bold ${catAcc >= 70 ? 'text-green-600' : catAcc >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      {catAcc}% mastery
                    </span>
                  )}
                </div>
                {catTotal > 0 && (
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full ${catAcc >= 70 ? 'bg-green-500' : catAcc >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${catAcc}%` }} />
                  </div>
                )}
                <div className="space-y-2">
                  {stds.map(std => (
                    <div key={std.code} className="flex items-start gap-2">
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">{std.code}</span>
                      <span className="text-[11px] text-gray-600">{std.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Individual student view
  if (view === 'student' && selectedStudent) {
    const student = students.find(s => s.id === selectedStudent);
    const studentSessions = sessions.filter(s => s.studentId === selectedStudent);
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-indigo-700 px-5 py-4 flex items-center gap-3">
          <button onClick={() => { setView('overview'); setSelectedStudent(null); }} className="text-white/80">&larr;</button>
          <h1 className="text-white font-black flex-1">{student?.name}</h1>
          <span className="text-white/60 text-xs">{GRADE_CONFIG[student?.grade || '5th']?.label}</span>
        </div>
        <div className="px-5 pt-4">
          <ProgressCharts sessions={studentSessions} studentId={selectedStudent} />
        </div>
      </div>
    );
  }

  // Overview
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="relative px-5 pt-6 pb-8 rounded-b-3xl overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-purple-800" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-indigo-200 text-xs">Educator Dashboard</p>
              <h1 className="text-2xl font-black text-white">LeapIQ Classroom</h1>
            </div>
            <button onClick={onLogout} className="text-indigo-200 text-[10px] bg-white/10 px-3 py-1 rounded-full">Logout</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/15 rounded-xl p-2.5 text-center">
              <div className="text-xl font-black text-white">{students.length}</div>
              <div className="text-indigo-200 text-[10px]">Students</div>
            </div>
            <div className="bg-white/15 rounded-xl p-2.5 text-center">
              <div className="text-xl font-black text-white">{classAccuracy}%</div>
              <div className="text-indigo-200 text-[10px]">Class Avg</div>
            </div>
            <div className="bg-white/15 rounded-xl p-2.5 text-center">
              <div className="text-xl font-black text-white">{sessions.length}</div>
              <div className="text-indigo-200 text-[10px]">Total Sessions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-3">
        {/* Quick actions */}
        <button onClick={() => setView('standards')} className="w-full bg-white border border-gray-200 rounded-2xl p-3 mt-3 flex items-center gap-3 active:scale-98 hover:border-indigo-300">
          <span className="text-xl">&#128203;</span>
          <div className="text-left">
            <div className="font-semibold text-sm text-gray-900">Standards Alignment</div>
            <div className="text-gray-400 text-[11px]">View Common Core mastery by category</div>
          </div>
          <span className="text-gray-300 ml-auto">&rarr;</span>
        </button>

        {/* Student roster */}
        <h2 className="text-base font-extrabold text-gray-900 mt-5 mb-3">Student Roster</h2>

        {allStudentPerf.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
            <p className="text-gray-400 text-sm">No students yet. Students will appear here once they create profiles.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allStudentPerf.map(s => (
              <button
                key={s.id}
                onClick={() => { setSelectedStudent(s.id); setView('student'); }}
                className="w-full bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 active:scale-98 hover:border-indigo-200"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {s.name[0].toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-sm text-gray-900">{s.name}</div>
                  <div className="text-[10px] text-gray-400">
                    {GRADE_CONFIG[s.grade]?.label} &middot; {s.sessions} sessions &middot;
                    <span className={`font-bold ml-1 ${s.velocity.trend === 'improving' ? 'text-green-600' : s.velocity.trend === 'declining' ? 'text-red-500' : 'text-gray-500'}`}>
                      {s.velocity.trend === 'improving' ? '&#8593;' : s.velocity.trend === 'declining' ? '&#8595;' : '&#8594;'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm ${s.accuracy >= 70 ? 'text-green-600' : s.accuracy >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                    {s.accuracy}%
                  </div>
                  {s.gaps.length > 0 && (
                    <div className="text-[10px] text-red-400">{s.gaps.length} gaps</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Class gaps */}
        {(() => {
          const allGaps: Record<string, number[]> = {};
          allStudentPerf.forEach(s => {
            s.gaps.forEach(g => {
              if (!allGaps[g.category]) allGaps[g.category] = [];
              allGaps[g.category].push(g.accuracy);
            });
          });
          const commonGaps = Object.entries(allGaps)
            .filter(([, accs]) => accs.length >= 2)
            .map(([cat, accs]) => ({
              category: cat,
              avgAccuracy: Math.round(accs.reduce((a, b) => a + b, 0) / accs.length),
              studentCount: accs.length,
            }))
            .sort((a, b) => a.avgAccuracy - b.avgAccuracy);

          if (commonGaps.length === 0) return null;

          return (
            <>
              <h2 className="text-base font-extrabold text-gray-900 mt-6 mb-3">Class-Wide Knowledge Gaps</h2>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                {commonGaps.map((g, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="text-gray-700 font-medium">{g.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-bold">{g.avgAccuracy}%</span>
                      <span className="text-gray-400 text-xs">({g.studentCount} students)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
