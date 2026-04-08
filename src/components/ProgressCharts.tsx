'use client';

import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell } from 'recharts';
import { SUBJECTS, STANDARDS_MAP } from '@/lib/constants';
import { getSubjectPerformance, identifyGaps } from '@/lib/adaptive-engine';
import { getMasteredCount, getLearningCount, getDueQuestions } from '@/lib/storage';
import type { Session } from '@/lib/types';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

export default function ProgressCharts({ sessions, studentId }: {
  sessions: Session[];
  studentId: string;
}) {
  // Accuracy over time
  const accuracyOverTime = useMemo(() => {
    return sessions.map((s, i) => ({
      session: i + 1,
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      subject: SUBJECTS.find(x => x.id === s.subject)?.name || s.subject,
    }));
  }, [sessions]);

  // Subject breakdown
  const subjectBreakdown = useMemo(() => {
    return SUBJECTS.map(s => {
      const perf = getSubjectPerformance(sessions, s.id);
      return {
        subject: s.name,
        accuracy: perf.accuracy,
        sessions: perf.sessions,
        icon: s.icon,
      };
    }).filter(s => s.sessions > 0);
  }, [sessions]);

  // Bloom's distribution
  const bloomsData = useMemo(() => {
    const counts: Record<string, { total: number; correct: number }> = {
      remember: { total: 0, correct: 0 },
      understand: { total: 0, correct: 0 },
      apply: { total: 0, correct: 0 },
      analyze: { total: 0, correct: 0 },
    };
    sessions.forEach(s => {
      s.questions?.forEach(q => {
        if (counts[q.bloom]) {
          counts[q.bloom].total++;
          if (q.correct) counts[q.bloom].correct++;
        }
      });
    });
    return Object.entries(counts).map(([bloom, data]) => ({
      bloom: bloom.charAt(0).toUpperCase() + bloom.slice(1),
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      total: data.total,
    }));
  }, [sessions]);

  // Category radar
  const categoryRadar = useMemo(() => {
    const cats: Record<string, { correct: number; total: number }> = {};
    sessions.forEach(s => {
      s.questions?.forEach(q => {
        if (!cats[q.category]) cats[q.category] = { correct: 0, total: 0 };
        cats[q.category].total++;
        if (q.correct) cats[q.category].correct++;
      });
    });
    return Object.entries(cats)
      .filter(([, d]) => d.total >= 2)
      .map(([cat, d]) => ({
        category: cat.length > 15 ? cat.substring(0, 12) + '...' : cat,
        fullCategory: cat,
        mastery: Math.round((d.correct / d.total) * 100),
      }))
      .slice(0, 8);
  }, [sessions]);

  // Standards mastery
  const standardsMastery = useMemo(() => {
    const results: { subject: string; category: string; code: string; description: string; mastery: number }[] = [];
    for (const [subjectId, categories] of Object.entries(STANDARDS_MAP)) {
      const subj = SUBJECTS.find(s => s.id === subjectId);
      for (const [category, standards] of Object.entries(categories)) {
        const catSessions = sessions.filter(s => s.subject === subjectId);
        const catQs = catSessions.flatMap(s => s.questions?.filter(q => q.category === category) || []);
        const catCorrect = catQs.filter(q => q.correct).length;
        const mastery = catQs.length > 0 ? Math.round((catCorrect / catQs.length) * 100) : -1;
        for (const std of standards) {
          results.push({
            subject: subj?.name || subjectId,
            category,
            code: std.code,
            description: std.description,
            mastery,
          });
        }
      }
    }
    return results.filter(r => r.mastery >= 0);
  }, [sessions]);

  const gaps = identifyGaps(sessions);
  const mastered = getMasteredCount(studentId);
  const learning = getLearningCount(studentId);
  const due = getDueQuestions(studentId).length;

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">&#128202;</div>
        <p className="text-gray-500 font-semibold">No data yet</p>
        <p className="text-gray-400 text-sm">Complete some quizzes to see analytics!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
          <div className="text-green-700 font-black text-2xl">{mastered}</div>
          <div className="text-[10px] text-green-600 font-bold">Mastered</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
          <div className="text-blue-700 font-black text-2xl">{learning}</div>
          <div className="text-[10px] text-blue-600 font-bold">Learning</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
          <div className="text-orange-700 font-black text-2xl">{due}</div>
          <div className="text-[10px] text-orange-600 font-bold">Due Review</div>
        </div>
      </div>

      {/* Accuracy Over Time */}
      {accuracyOverTime.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Accuracy Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={accuracyOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(value) => [`${value}%`, 'Accuracy']}
              />
              <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject Performance */}
      {subjectBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Subject Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(value) => [`${value}%`, 'Accuracy']}
              />
              <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                {subjectBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bloom's Taxonomy Performance */}
      {bloomsData.some(b => b.total > 0) && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Bloom&apos;s Taxonomy Performance</h3>
          <div className="space-y-2">
            {bloomsData.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-600 w-20">{b.bloom}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${b.accuracy}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 w-10 text-right">{b.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Knowledge Map Radar */}
      {categoryRadar.length >= 3 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Knowledge Map</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={categoryRadar}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 9, fill: '#6b7280' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
              <Radar dataKey="mastery" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Knowledge Gaps */}
      {gaps.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Knowledge Gaps &amp; Remediation</h3>
          <div className="space-y-3">
            {gaps.map((g, i) => (
              <div key={i} className="border border-red-100 rounded-xl p-3 bg-red-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-gray-900">{g.category}</span>
                  <span className={`text-xs font-bold ${g.accuracy < 40 ? 'text-red-500' : g.accuracy < 60 ? 'text-orange-500' : 'text-yellow-600'}`}>
                    {g.accuracy}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-600">{g.recommendation}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{g.bloom}</span>
                  <span className="text-[9px] text-gray-400">{g.totalAttempts} attempts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standards Mastery */}
      {standardsMastery.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Standards Mastery</h3>
          <div className="space-y-2">
            {standardsMastery.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                  s.mastery >= 70 ? 'bg-green-100 text-green-700' : s.mastery >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {s.code}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-600 truncate">{s.description}</div>
                  <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.mastery >= 70 ? 'bg-green-500' : s.mastery >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${s.mastery}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 flex-shrink-0">{s.mastery}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
