'use client';

import { useMemo, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { GRADE_OPTIONS, EDUCATION_DISTRICTS, SUBJECTS } from '@/lib/constants';
import { ingestAssessments, groupByStudent } from '@/lib/ingest';
import { buildBaselineProfile } from '@/lib/baseline';
import { buildIEP, uncoveredStrands } from '@/lib/iep-builder';
import { SAMPLE_MARKSHEET } from '@/data/sample-marksheet';
import type { AssessmentRecord, IngestResult } from '@/lib/iep-types';

type Step = 'input' | 'review' | 'plans';

const BAND_STYLE: Record<string, string> = {
  'well below': 'bg-red-100 text-red-700',
  below: 'bg-orange-100 text-orange-700',
  approaching: 'bg-amber-100 text-amber-700',
  meeting: 'bg-green-100 text-green-700',
  exceeding: 'bg-emerald-100 text-emerald-700',
};

function subjectName(id: string) {
  return SUBJECTS.find(s => s.id === id)?.name ?? id;
}

export default function PlanIntake({ onBack, onOpenPlan }: {
  onBack: () => void;
  onOpenPlan: (studentId: string) => void;
}) {
  const { students, addStudent, importAssessments, savePlan, plans } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('input');
  const [text, setText] = useState('');
  const [sourceName, setSourceName] = useState('pasted data');
  const [defaultGrade, setDefaultGrade] = useState('grade6');
  const [stateCode, setStateCode] = useState('4');
  const [result, setResult] = useState<IngestResult | null>(null);
  const [imported, setImported] = useState<AssessmentRecord[]>([]);
  const [created, setCreated] = useState<Record<string, string>>({});

  const errors = result?.issues.filter(i => i.severity === 'error') ?? [];
  const warnings = result?.issues.filter(i => i.severity === 'warning') ?? [];

  function analyse(raw: string, source: string) {
    setText(raw);
    setSourceName(source);
    setResult(ingestAssessments(raw, { defaultGrade, source }));
    setStep('review');
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => analyse(String(reader.result ?? ''), file.name);
    reader.readAsText(file);
  }

  function confirmImport() {
    if (!result) return;
    importAssessments(result.records);
    setImported(result.records);
    setStep('plans');
  }

  // One entry per student in the import, with baselines already computed.
  const studentProfiles = useMemo(() => {
    if (imported.length === 0) return [];
    return [...groupByStudent(imported).entries()].map(([ref, records]) => {
      const name = records[0].studentName;
      const grade = records[0].grade;
      const existing = students.find(s => s.name.toLowerCase() === name.toLowerCase());
      const studentId = existing?.id ?? created[ref] ?? '';
      return {
        ref,
        name,
        grade,
        records,
        studentId,
        profile: buildBaselineProfile(records, {
          studentId: studentId || `pending_${ref}`,
          studentName: name,
          grade,
        }),
      };
    });
  }, [imported, students, created]);

  function generatePlan(entry: (typeof studentProfiles)[number]) {
    let studentId = entry.studentId;
    if (!studentId) {
      const student = addStudent(entry.name, entry.grade, stateCode);
      studentId = student.id;
      setCreated(c => ({ ...c, [entry.ref]: studentId }));
    }
    const profile = buildBaselineProfile(entry.records, {
      studentId,
      studentName: entry.name,
      grade: entry.grade,
    });
    savePlan(buildIEP(profile));
  }

  // ── Step 1: bring the data in ──
  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="bg-indigo-700 px-5 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-white/80" aria-label="Back">&larr;</button>
          <h1 className="text-white font-black flex-1">Assessment Intake</h1>
        </div>

        <div className="px-5 pt-4 max-w-2xl mx-auto">
          <p className="text-sm text-gray-600 mb-4">
            Paste or upload a mark sheet. Scores become baselines, baselines become plan goals,
            and goals pull modules from the class materials already loaded for that grade.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="block">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Grade if missing</span>
              <select
                value={defaultGrade}
                onChange={e => setDefaultGrade(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
              >
                {GRADE_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Standards set</span>
              <select
                value={stateCode}
                onChange={e => setStateCode(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
              >
                {EDUCATION_DISTRICTS.map(d => <option key={d.code} value={d.code}>{d.region} — {d.name}</option>)}
              </select>
            </label>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder={'Student ID,Student Name,Year,Subject,Domain,Assessment,Date,Marks,Out Of\nG6-001,Anaya Persaud,6,Mathematics,Number & Operations,Term 1 Diagnostic,2026-01-14,11,40'}
            className="w-full border border-gray-200 rounded-xl p-3 font-mono text-[11px] bg-white"
          />

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => analyse(text, sourceName)}
              disabled={text.trim() === ''}
              className={`flex-1 min-w-[8rem] py-3 rounded-xl font-bold text-sm ${
                text.trim() ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-300'
              }`}
            >
              Analyse Data
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="py-3 px-4 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700"
            >
              Upload CSV
            </button>
            <button
              onClick={() => { setText(SAMPLE_MARKSHEET); setSourceName('sample-marksheet.csv'); }}
              className="py-3 px-4 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700"
            >
              Load Sample
            </button>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={onFile} className="hidden" />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 mt-5 text-[11px] text-gray-500 leading-relaxed">
            <p className="font-bold text-gray-700 text-xs mb-1">Columns the importer recognises</p>
            student id · student name · grade or year · subject · strand, domain, topic or category ·
            assessment or test name · date · score or marks · out of or max · percent · standard codes.
            Anything it cannot read is reported row by row rather than dropped silently.
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: show what was read, before anything is stored ──
  if (step === 'review' && result) {
    const mapped = Object.entries(result.mapping) as [string, string][];
    const byStudent = [...groupByStudent(result.records).entries()];

    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="bg-indigo-700 px-5 py-4 flex items-center gap-3">
          <button onClick={() => setStep('input')} className="text-white/80" aria-label="Back">&larr;</button>
          <h1 className="text-white font-black flex-1">Review Import</h1>
          <span className="text-white/60 text-[11px]">{sourceName}</span>
        </div>

        <div className="px-5 pt-4 max-w-2xl mx-auto">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { v: result.rows, l: 'Rows read', c: 'text-gray-900' },
              { v: result.accepted, l: 'Accepted', c: 'text-green-600' },
              { v: errors.length, l: 'Errors', c: errors.length ? 'text-red-500' : 'text-gray-300' },
              { v: warnings.length, l: 'Warnings', c: warnings.length ? 'text-amber-600' : 'text-gray-300' },
            ].map(s => (
              <div key={s.l} className="bg-white rounded-xl border border-gray-100 p-2.5 text-center">
                <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
                <div className="text-gray-400 text-[10px]">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
            <h2 className="font-bold text-sm text-gray-900 mb-2">Columns matched</h2>
            {mapped.length === 0 ? (
              <p className="text-xs text-gray-400">No columns could be matched.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {mapped.map(([field, header]) => (
                  <span key={field} className="text-[10px] bg-indigo-50 text-indigo-700 rounded-full px-2 py-1">
                    <span className="font-bold">{header}</span> &rarr; {field}
                  </span>
                ))}
              </div>
            )}
          </div>

          {result.issues.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
              <h2 className="font-bold text-sm text-gray-900 mb-2">What the importer could not take at face value</h2>
              <div className="max-h-56 overflow-y-auto space-y-1.5">
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className={`rounded px-1.5 py-0.5 font-bold flex-shrink-0 ${
                      issue.severity === 'error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      row {issue.row}
                    </span>
                    <span className="text-gray-600">{issue.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {byStudent.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <h2 className="font-bold text-sm text-gray-900 mb-2">Students found</h2>
              <div className="space-y-1.5">
                {byStudent.map(([ref, records]) => (
                  <div key={ref} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800">{records[0].studentName}</span>
                    <span className="text-gray-400">
                      {records.length} results ·{' '}
                      {[...new Set(records.map(r => subjectName(r.subject)))].join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={confirmImport}
            disabled={result.accepted === 0}
            className={`w-full py-3.5 rounded-xl font-bold text-sm ${
              result.accepted > 0
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-300'
            }`}
          >
            {result.accepted > 0 ? `Import ${result.accepted} results` : 'Nothing to import'}
          </button>
        </div>
      </div>
    );
  }

  // ── Step 3: baselines, then a plan per student ──
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-indigo-700 px-5 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-white/80" aria-label="Back">&larr;</button>
        <h1 className="text-white font-black flex-1">Baselines &amp; Plans</h1>
      </div>

      <div className="px-5 pt-4 max-w-2xl mx-auto">
        <p className="text-sm text-gray-600 mb-4">
          Each strand below is a recency-weighted average of that pupil&rsquo;s imported results.
          Strands under 70% become goals; the plan pulls its modules from the Grade materials already loaded.
        </p>

        {studentProfiles.map(entry => {
          const plan = plans.find(p => p.studentId === entry.studentId);
          const uncovered = uncoveredStrands(entry.profile);

          return (
            <div key={entry.ref} className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {entry.name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900">{entry.name}</div>
                  <div className="text-[10px] text-gray-400">
                    {entry.profile.baselines.length} strands · overall {entry.profile.overall}%
                  </div>
                </div>
                {plan ? (
                  <button
                    onClick={() => onOpenPlan(entry.studentId)}
                    className="text-xs font-bold px-3 py-2 rounded-xl bg-green-50 text-green-700 border border-green-200"
                  >
                    View plan &rarr;
                  </button>
                ) : (
                  <button
                    onClick={() => generatePlan(entry)}
                    className="text-xs font-bold px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
                  >
                    Build plan
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {entry.profile.baselines.map(b => (
                  <div key={`${b.subject}::${b.strand}`} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-700 w-40 flex-shrink-0 truncate" title={`${subjectName(b.subject)} · ${b.strand}`}>
                      {b.strand}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${b.percent >= 70 ? 'bg-green-500' : b.percent >= 55 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${b.percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 w-10 text-right">{b.percent}%</span>
                    <span className={`text-[9px] font-bold rounded px-1.5 py-0.5 w-20 text-center ${BAND_STYLE[b.band]}`}>
                      {b.band}
                    </span>
                  </div>
                ))}
              </div>

              {uncovered.length > 0 && (
                <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 mt-3">
                  No modules exist yet on the teaching pathway for {uncovered.map(u => u.strand).join(', ')}.
                  These are reported in present levels but cannot carry a goal until materials are added.
                </p>
              )}
            </div>
          );
        })}

        <button onClick={() => { setStep('input'); setResult(null); setImported([]); }} className="w-full py-3 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700 mt-2">
          Import another file
        </button>
      </div>
    </div>
  );
}
