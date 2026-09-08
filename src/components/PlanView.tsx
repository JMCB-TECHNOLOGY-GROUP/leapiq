'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useApp } from '@/lib/app-context';
import { GRADE_CONFIG, SUBJECTS } from '@/lib/constants';
import { GRADE_ORDER } from '@/data/guyana';
import { getModule } from '@/data/curriculum';
import {
  MASTERY_THRESHOLD,
  assignmentsForGoal,
  nextModule,
  summarisePlan,
} from '@/lib/iep-progress';
import type { IEPGoal, ModuleAssignment } from '@/lib/iep-types';

const GOAL_STYLE: Record<string, string> = {
  'not started': 'bg-gray-100 text-gray-500',
  'in progress': 'bg-blue-100 text-blue-700',
  'on track': 'bg-green-100 text-green-700',
  'off track': 'bg-red-100 text-red-700',
  met: 'bg-emerald-100 text-emerald-700',
};

const PLAN_STYLE: Record<string, string> = {
  draft: 'bg-white/15 text-white',
  active: 'bg-green-400/20 text-green-100',
  'review due': 'bg-amber-400/25 text-amber-100',
  complete: 'bg-emerald-400/20 text-emerald-100',
};

function subjectName(id: string) {
  return SUBJECTS.find(s => s.id === id)?.name ?? id;
}

/** Baseline, current and target on one track, so growth is readable at a glance. */
function GoalTrack({ goal }: { goal: IEPGoal }) {
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const reached = goal.currentPercent >= goal.targetPercent;

  return (
    <div className="mt-2">
      <div className="relative h-2 bg-gray-100 rounded-full">
        <div
          className="absolute inset-y-0 left-0 bg-gray-300 rounded-full"
          style={{ width: `${clamp(goal.baselinePercent)}%` }}
        />
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${reached ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          style={{ width: `${clamp(goal.currentPercent)}%` }}
        />
        <div
          className="absolute -top-1 w-0.5 h-4 bg-gray-800 rounded"
          style={{ left: `${clamp(goal.targetPercent)}%` }}
          title={`Target ${goal.targetPercent}%`}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>baseline {goal.baselinePercent}%</span>
        <span className={`font-bold ${reached ? 'text-emerald-600' : 'text-indigo-600'}`}>
          now {goal.currentPercent}%
        </span>
        <span>target {goal.targetPercent}%</span>
      </div>
    </div>
  );
}

function ModuleRow({
  assignment,
  isNext,
  readOnly,
  planGrade,
  onRecord,
}: {
  assignment: ModuleAssignment;
  isNext: boolean;
  readOnly: boolean;
  /** The pupil's enrolled year, so earlier-year material can be marked as such. */
  planGrade: string;
  onRecord: (percent: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('80');
  const mod = getModule(assignment.moduleId);

  return (
    <div className={`rounded-xl border p-2.5 ${isNext ? 'border-indigo-200 bg-indigo-50/40' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-center gap-2">
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
            assignment.status === 'mastered'
              ? 'bg-emerald-500 text-white'
              : assignment.status === 'in progress'
              ? 'bg-amber-400 text-white'
              : 'bg-gray-200 text-gray-500'
          }`}
          aria-hidden
        >
          {assignment.status === 'mastered' ? '✓' : mod?.sequence ?? '?'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-900 truncate">{mod?.title ?? assignment.moduleId}</span>
            {mod && GRADE_ORDER.indexOf(mod.grade) < GRADE_ORDER.indexOf(planGrade) && (
              <span
                className="text-[9px] font-bold bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 flex-shrink-0"
                title="Earlier-year material, assigned because the pupil is working below their enrolled year"
              >
                {GRADE_CONFIG[mod.grade]?.short ?? mod.grade}
              </span>
            )}
          </div>
          <div className="text-[10px] text-gray-400 truncate">
            {mod ? `${mod.minutes} min · ${mod.materials.lessons} lessons · ${mod.materials.practice} practice` : 'Module not in catalogue'}
            {assignment.attempts > 0 && ` · best ${assignment.bestPercent}%`}
          </div>
        </div>
        {!readOnly && assignment.status !== 'mastered' && (
          <button
            onClick={() => setOpen(o => !o)}
            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 flex-shrink-0"
          >
            {open ? 'Cancel' : 'Checkpoint'}
          </button>
        )}
      </div>

      {mod && <p className="text-[10px] text-gray-500 mt-1 leading-snug">{mod.objective}</p>}

      {open && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            min={0}
            max={100}
            value={value}
            onChange={e => setValue(e.target.value)}
            aria-label="Checkpoint score percent"
            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
          />
          <span className="text-[10px] text-gray-400">
            % — {MASTERY_THRESHOLD}% or better masters this module
          </span>
          <button
            onClick={() => { onRecord(Number(value)); setOpen(false); }}
            className="ml-auto text-[10px] font-bold px-3 py-1.5 rounded-lg bg-indigo-600 text-white"
          >
            Record
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlanView({ studentId, onBack, readOnly = false }: {
  studentId: string;
  onBack: () => void;
  /** Pupils see their plan but do not mark their own checkpoints. */
  readOnly?: boolean;
}) {
  const { getPlanForStudent, getAssignmentsForStudent, recordMastery } = useApp();
  const plan = getPlanForStudent(studentId);
  const assignments = getAssignmentsForStudent(studentId);

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-indigo-700 px-5 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-white/80" aria-label="Back">&larr;</button>
          <h1 className="text-white font-black flex-1">Learning Plan</h1>
        </div>
        <p className="text-sm text-gray-400 text-center p-10">
          No plan yet. Import assessment data for this pupil to build one.
        </p>
      </div>
    );
  }

  const summary = summarisePlan(plan, assignments);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-gradient-to-br from-indigo-700 to-purple-800 px-5 pt-4 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white/80" aria-label="Back">&larr;</button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg leading-tight">{plan.studentName}</h1>
            <p className="text-indigo-200 text-[11px]">
              Individualised plan · {GRADE_CONFIG[plan.grade]?.label ?? plan.grade} · review {plan.reviewDate}
            </p>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${PLAN_STYLE[plan.status]}`}>
            {plan.status}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { v: summary.goals, l: 'Goals' },
            { v: summary.met, l: 'Met' },
            { v: `${summary.modulesMastered}/${summary.modulesAssigned}`, l: 'Modules' },
            { v: `${summary.averageGrowth}%`, l: 'To target' },
          ].map(s => (
            <div key={s.l} className="bg-white/15 rounded-xl p-2.5 text-center">
              <div className="text-lg font-black text-white">{s.v}</div>
              <div className="text-indigo-200 text-[10px]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 max-w-2xl mx-auto">
        <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <h2 className="font-extrabold text-sm text-gray-900 mb-2">Present Levels</h2>
          {plan.presentLevels.split('\n\n').map((para, i) => (
            <p key={i} className="text-[12px] text-gray-600 leading-relaxed mb-2 last:mb-0">{para}</p>
          ))}
        </section>

        {plan.accommodations.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
            <h2 className="font-extrabold text-sm text-gray-900 mb-2">Supports and Accommodations</h2>
            <ul className="space-y-1">
              {plan.accommodations.map(a => (
                <li key={a} className="text-[12px] text-gray-600 flex gap-2">
                  <span className="text-indigo-400" aria-hidden>&bull;</span>{a}
                </li>
              ))}
            </ul>
          </section>
        )}

        <h2 className="font-extrabold text-base text-gray-900 mt-5 mb-3">
          Annual Goals <span className="text-gray-400 font-bold text-xs">({plan.goals.length})</span>
        </h2>

        {plan.goals.map(goal => {
          const goalAssignments = assignmentsForGoal(assignments, goal.id);
          const next = nextModule(assignments, goal.id);
          const chart = goal.progress.map((p, i) => ({
            i: i + 1,
            date: p.date.slice(5),
            percent: p.percent,
          }));

          return (
            <section key={goal.id} className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                    {subjectName(goal.subject)} · {goal.strand}
                  </div>
                  <p className="text-[12px] text-gray-800 leading-snug mt-1">{goal.statement}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Criterion: {goal.criterion}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${GOAL_STYLE[goal.status]}`}>
                  {goal.status}
                </span>
              </div>

              <GoalTrack goal={goal} />

              {chart.length > 1 && (
                <div className="h-28 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chart} margin={{ top: 6, right: 6, bottom: 0, left: -24 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                        formatter={v => [`${v}%`, 'Score']}
                      />
                      <ReferenceLine y={goal.targetPercent} stroke="#4f46e5" strokeDasharray="3 3" />
                      <ReferenceLine y={goal.baselinePercent} stroke="#d1d5db" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="percent" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mt-3 mb-2">
                Assigned modules
              </h3>
              <div className="space-y-1.5">
                {goalAssignments.map(a => (
                  <ModuleRow
                    key={a.id}
                    assignment={a}
                    isNext={next?.id === a.id}
                    readOnly={readOnly}
                    planGrade={plan.grade}
                    onRecord={percent =>
                      recordMastery(plan.id, {
                        moduleId: a.moduleId,
                        percent,
                        date: new Date().toISOString().slice(0, 10),
                        source: 'module',
                      })
                    }
                  />
                ))}
              </div>

              {goal.progress.length > 1 && (
                <details className="mt-3">
                  <summary className="text-[11px] font-bold text-gray-500 cursor-pointer">
                    Progress log ({goal.progress.length})
                  </summary>
                  <div className="mt-2 space-y-1">
                    {[...goal.progress].reverse().map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span className="text-gray-400 w-16 flex-shrink-0">{p.date}</span>
                        <span className="font-bold text-gray-700 w-10 flex-shrink-0">{p.percent}%</span>
                        <span className="truncate">{p.note}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </section>
          );
        })}

        {plan.goals.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            Every strand is at or above expectation. No remedial goals were written.
          </p>
        )}
      </div>
    </div>
  );
}
