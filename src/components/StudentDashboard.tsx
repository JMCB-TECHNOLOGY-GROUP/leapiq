'use client';

import { useApp } from '@/lib/app-context';
import { SUBJECTS, GRADE_CONFIG, EDUCATION_DISTRICTS } from '@/lib/constants';
import { getDueQuestions } from '@/lib/storage';
import { getSubjectPerformance, identifyGaps, calculateVelocity } from '@/lib/adaptive-engine';
import { activeQueue, summarisePlan } from '@/lib/iep-progress';
import { getModule } from '@/data/curriculum';

export default function StudentDashboard({ onQuiz, onTutor, onReview, onUpload, onLogout, onPlan }: {
  onQuiz: (subject: string) => void;
  onTutor: (subject: string) => void;
  onReview: () => void;
  onUpload: () => void;
  onLogout: () => void;
  onPlan: () => void;
}) {
  const { user, sessions, getPlanForStudent, getAssignmentsForStudent } = useApp();
  if (!user) return null;

  const studentSessions = sessions.filter(s => s.studentId === user.id);
  const totalXP = studentSessions.reduce((s, p) => s + (p.xp || 0), 0);
  const dueCount = getDueQuestions(user.id).length;
  const today = studentSessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length;
  const gc = GRADE_CONFIG[user.grade] || GRADE_CONFIG['grade6'];
  const districtName = EDUCATION_DISTRICTS.find(d => d.code === user.district)?.name || '';
  const gaps = identifyGaps(studentSessions);
  const velocity = calculateVelocity(studentSessions);
  const plan = getPlanForStudent(user.id);
  const assignments = getAssignmentsForStudent(user.id);
  const upNext = plan ? activeQueue(plan, assignments) : [];
  const planSummary = plan ? summarisePlan(plan, assignments) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="relative px-5 pt-6 pb-8 rounded-b-3xl overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&auto=format" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700/90 to-indigo-700/90" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-200 text-xs">Welcome back</p>
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <p className="text-blue-200/60 text-[10px]">{gc.label} &middot; {districtName}</p>
            </div>
            <button onClick={onLogout} className="text-blue-200 text-[10px] bg-white/10 px-3 py-1 rounded-full">Logout</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { v: totalXP, l: 'Total XP' },
              { v: studentSessions.length, l: 'Sessions' },
              { v: today, l: 'Today' },
              { v: velocity.trend === 'improving' ? '↑' : velocity.trend === 'declining' ? '↓' : '→', l: 'Trend' },
            ].map(s => (
              <div key={s.l} className="bg-white/15 rounded-xl p-2.5 text-center">
                <div className="text-xl font-black text-white">{s.v}</div>
                <div className="text-blue-200 text-[10px]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 -mt-3">
        {/* Learning plan */}
        {plan && planSummary && (
          <div className="bg-white border border-indigo-200 rounded-2xl p-4 mt-4 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <div className="font-bold text-sm text-gray-900">My Learning Plan</div>
                <div className="text-[10px] text-gray-400">
                  {planSummary.met} of {planSummary.goals} goals met &middot;{' '}
                  {planSummary.modulesMastered}/{planSummary.modulesAssigned} modules mastered
                </div>
              </div>
              <button onClick={onPlan} className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                View
              </button>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${planSummary.averageGrowth}%` }} />
            </div>
            {upNext.length > 0 && (
              <>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Up next</div>
                <div className="space-y-1">
                  {upNext.slice(0, 3).map(a => {
                    const mod = getModule(a.moduleId);
                    return (
                      <div key={a.id} className="flex items-center gap-2 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" aria-hidden />
                        <span className="text-gray-700 truncate flex-1">{mod?.title ?? a.moduleId}</span>
                        <span className="text-gray-400 flex-shrink-0">{mod?.minutes ?? 0} min</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Knowledge Gaps Alert */}
        {gaps.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 mt-4 mb-2">
            <div className="font-bold text-sm text-red-700 mb-1">Knowledge Gaps Detected</div>
            <div className="space-y-1">
              {gaps.slice(0, 3).map((g, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${g.accuracy < 40 ? 'bg-red-500' : g.accuracy < 60 ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                  <span className="text-gray-700">{g.category}</span>
                  <span className="text-gray-400">({g.accuracy}% accuracy)</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Take quizzes in these areas to improve!</p>
          </div>
        )}

        {/* Review Due */}
        {dueCount > 0 && (
          <button onClick={onReview} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-4 mt-3 mb-2 flex items-center gap-3 active:scale-95 transition-transform shadow-lg shadow-orange-500/20">
            <span className="text-2xl animate-pulse-gentle">&#128260;</span>
            <div className="text-left">
              <div className="font-bold text-sm">{dueCount} questions due for review</div>
              <div className="text-white/70 text-xs">Spaced repetition keeps it in your brain</div>
            </div>
          </button>
        )}

        {/* Upload Documents */}
        <button onClick={onUpload} className="w-full bg-white border border-gray-200 rounded-2xl p-3 mt-3 mb-1 flex items-center gap-3 active:scale-98 transition-transform hover:border-blue-300">
          <span className="text-xl">&#128196;</span>
          <div className="text-left">
            <div className="font-semibold text-sm text-gray-900">Upload Study Materials</div>
            <div className="text-gray-400 text-[11px]">Tests, worksheets, study guides</div>
          </div>
          <span className="text-gray-300 ml-auto">&rarr;</span>
        </button>

        {/* Subjects */}
        <h2 className="text-base font-extrabold text-gray-900 mt-5 mb-3">Choose a Subject</h2>
        <div className="grid grid-cols-2 gap-3">
          {SUBJECTS.filter(s => gc.subjects.includes(s.id)).map(s => {
            const perf = getSubjectPerformance(studentSessions, s.id);
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className={`relative bg-gradient-to-r ${s.gradient} p-3.5 overflow-hidden`}>
                  <img src={s.img} alt={s.name} className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
                  <div className="relative z-10 text-2xl mb-0.5">{s.icon}</div>
                  <div className="relative z-10 text-white font-extrabold">{s.name}</div>
                  {perf.sessions > 0 && (
                    <div className="relative z-10 text-white/60 text-[10px]">{perf.accuracy}% accuracy</div>
                  )}
                </div>
                <div className="p-2.5 space-y-1.5">
                  <button onClick={() => onQuiz(s.id)} className={`w-full py-2 ${s.bg} ${s.tx} font-bold rounded-xl text-xs active:scale-95 transition-transform`}>
                    &#128221; Quiz
                  </button>
                  <button onClick={() => onTutor(s.id)} className={`w-full py-2 border ${s.bd} ${s.tx} font-bold rounded-xl text-xs active:scale-95 transition-transform`}>
                    &#129302; AI Tutor
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Sessions */}
        {studentSessions.length > 0 && (
          <>
            <h2 className="text-base font-extrabold text-gray-900 mt-6 mb-3">Recent</h2>
            {studentSessions.slice(-5).reverse().map((s, i) => {
              const subj = SUBJECTS.find(x => x.id === s.subject);
              return (
                <div key={i} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 mb-2">
                  <span className="text-lg">{subj?.icon || '&#128218;'}</span>
                  <div className="flex-1">
                    <div className="font-bold text-xs text-gray-900">{subj?.name} Quiz</div>
                    <div className="text-[10px] text-gray-400">{new Date(s.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xs">{s.correct}/{s.total}</div>
                    <div className="text-[10px] text-gray-400">+{s.xp} XP</div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
