'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { SUBJECTS, GRADE_CONFIG, GRADE_OPTIONS, STATES } from '@/lib/constants';
import { getDueQuestions, getMasteredCount, getLearningCount } from '@/lib/storage';
import { getSubjectPerformance, identifyGaps, calculateVelocity } from '@/lib/adaptive-engine';
import ProgressCharts from './ProgressCharts';

export default function ParentDashboard({ onLogout }: { onLogout: () => void }) {
  const { students, sessions, addStudent } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('5th');
  const [newState, setNewState] = useState('DC');
  const [showCharts, setShowCharts] = useState<string | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<Record<string, { summary: string; gaps: { category: string; accuracy: number; severity: string; recommendation: string }[]; loading: boolean }>>({});

  const analyzeGaps = async (studentId: string, studentName: string, grade: string) => {
    const studentSessions = sessions.filter(s => s.studentId === studentId);
    setGapAnalysis(prev => ({ ...prev, [studentId]: { summary: '', gaps: [], loading: true } }));

    try {
      const res = await fetch('/api/analyze-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: studentSessions, studentName, grade }),
      });
      const data = await res.json();
      setGapAnalysis(prev => ({ ...prev, [studentId]: { ...data, loading: false } }));
    } catch {
      setGapAnalysis(prev => ({ ...prev, [studentId]: { summary: 'Unable to analyze at this time.', gaps: [], loading: false } }));
    }
  };

  if (showCharts) {
    const student = students.find(s => s.id === showCharts);
    const studentSessions = sessions.filter(s => s.studentId === showCharts);
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-white border-b px-5 py-4 flex items-center gap-3">
          <button onClick={() => setShowCharts(null)} className="text-gray-400">&larr;</button>
          <h1 className="font-black text-gray-900">{student?.name} — Progress Analytics</h1>
        </div>
        <div className="px-5 pt-4">
          <ProgressCharts sessions={studentSessions} studentId={showCharts} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="relative px-5 pt-6 pb-8 rounded-b-3xl overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1484981138541-3d074aa97571?w=800&q=80&auto=format" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-slate-400 text-xs">Parent Dashboard</p>
              <h1 className="text-2xl font-black text-white">LeapIQ</h1>
            </div>
            <button onClick={onLogout} className="text-slate-400 text-[10px] bg-white/10 px-3 py-1 rounded-full">Logout</button>
          </div>
          <p className="text-slate-400 text-xs">Track learning progress across all subjects.</p>
        </div>
      </div>

      <div className="px-5 -mt-3">
        {students.map(s => {
          const ss = sessions.filter(p => p.studentId === s.id);
          const xp = ss.reduce((a, p) => a + (p.xp || 0), 0);
          const open = expanded === s.id;
          const mastered = getMasteredCount(s.id);
          const learning = getLearningCount(s.id);
          const dueCount = getDueQuestions(s.id).length;
          const gaps = identifyGaps(ss);
          const velocity = calculateVelocity(ss);
          const analysis = gapAnalysis[s.id];

          return (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-3">
              <button onClick={() => setExpanded(open ? null : s.id)} className="w-full p-4 flex items-center gap-4 text-left">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {s.name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-sm">{s.name}</div>
                  <div className="text-[10px] text-gray-400">
                    {GRADE_CONFIG[s.grade]?.label || s.grade} &middot; {STATES.find(x => x.code === s.state)?.name || ''} &middot; {ss.length} sessions &middot; {xp} XP
                  </div>
                </div>
                <span className={`text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`}>&rsaquo;</span>
              </button>

              {open && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 animate-fade-up">
                  {ss.length === 0 ? (
                    <p className="text-gray-400 text-xs text-center py-4">No sessions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {/* Velocity indicator */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-bold ${velocity.trend === 'improving' ? 'text-green-600' : velocity.trend === 'declining' ? 'text-red-500' : 'text-gray-500'}`}>
                          {velocity.trend === 'improving' ? '&#8593; Improving' : velocity.trend === 'declining' ? '&#8595; Needs attention' : '&#8594; Steady'}
                        </span>
                        <span className="text-gray-400">&middot; {velocity.daily} sessions/day avg</span>
                      </div>

                      {/* Subject breakdown */}
                      {SUBJECTS.map(subj => {
                        const perf = getSubjectPerformance(ss, subj.id);
                        if (perf.sessions === 0) return null;
                        return (
                          <div key={subj.id} className="flex items-center gap-3">
                            <span className="text-lg w-7">{subj.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-gray-900">{subj.name}</span>
                                <span className="text-[10px] text-gray-400">{perf.sessions} sessions</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${subj.gradient} rounded-full`} style={{ width: `${perf.accuracy}%` }} />
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{perf.totalCorrect}/{perf.totalQuestions} correct ({perf.accuracy}%)</div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Knowledge gaps */}
                      {gaps.length > 0 && (
                        <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                          <p className="text-red-700 font-bold text-xs mb-2">Knowledge Gaps</p>
                          {gaps.slice(0, 3).map((g, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] mb-1">
                              <div className={`w-2 h-2 rounded-full ${g.accuracy < 40 ? 'bg-red-500' : 'bg-orange-500'}`} />
                              <span className="text-gray-700">{g.category} ({g.accuracy}%)</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Spaced rep stats */}
                      <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-green-50 rounded-lg p-2">
                          <div className="text-green-700 font-black text-lg">{mastered}</div>
                          <div className="text-[9px] text-green-600">Mastered</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2">
                          <div className="text-blue-700 font-black text-lg">{learning}</div>
                          <div className="text-[9px] text-blue-600">Learning</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-2">
                          <div className="text-orange-700 font-black text-lg">{dueCount}</div>
                          <div className="text-[9px] text-orange-600">Due</div>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      <div className="pt-3 border-t border-gray-100">
                        {!analysis ? (
                          <button
                            onClick={() => analyzeGaps(s.id, s.name, s.grade)}
                            className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold active:scale-95"
                          >
                            &#129302; AI Gap Analysis
                          </button>
                        ) : analysis.loading ? (
                          <div className="text-center py-2 text-xs text-gray-400">Analyzing...</div>
                        ) : (
                          <div className="bg-indigo-50 rounded-xl p-3">
                            <p className="text-indigo-700 font-bold text-xs mb-1">AI Analysis</p>
                            <p className="text-gray-700 text-xs leading-relaxed">{analysis.summary}</p>
                          </div>
                        )}
                      </div>

                      {/* View charts button */}
                      <button onClick={() => setShowCharts(s.id)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold active:scale-95">
                        &#128200; View Progress Charts
                      </button>

                      {/* Recent sessions */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Sessions</div>
                        {ss.slice(-5).reverse().map((sess, i) => {
                          const subj = SUBJECTS.find(x => x.id === sess.subject);
                          const pct = sess.total > 0 ? Math.round((sess.correct / sess.total) * 100) : 0;
                          return (
                            <div key={i} className="flex items-center gap-2 py-1 text-[11px]">
                              <span>{subj?.icon}</span>
                              <span className="text-gray-600">{new Date(sess.date).toLocaleDateString()}</span>
                              <span className="flex-1" />
                              <span className={`font-bold ${pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{pct}%</span>
                              <span className="text-gray-400">({sess.correct}/{sess.total})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add student */}
        {!adding ? (
          <button onClick={() => setAdding(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-semibold hover:border-blue-400 transition-colors mt-4 text-sm">
            + Add Student
          </button>
        ) : (
          <div className="bg-white p-4 rounded-2xl border border-gray-200 mt-4">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Student name" className="w-full p-3 border border-gray-200 rounded-xl mb-2 text-sm focus:outline-none focus:border-blue-400" autoFocus />
            <select value={newGrade} onChange={e => setNewGrade(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl mb-2 text-sm">
              {GRADE_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            <select value={newState} onChange={e => setNewState(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl mb-3 text-sm">
              {STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 py-2 text-gray-400 font-semibold text-sm">Cancel</button>
              <button onClick={() => { if (newName.trim()) { addStudent(newName.trim(), newGrade, newState); setNewName(''); setAdding(false); } }} className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm">Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
