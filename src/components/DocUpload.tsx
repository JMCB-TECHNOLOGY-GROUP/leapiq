'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/lib/app-context';
import type { Question, UploadedDoc } from '@/lib/types';
import GenQuizPractice from './GenQuizPractice';

export default function DocUpload({ onBack }: { onBack: () => void }) {
  const { user, docs, addDoc } = useApp();
  const studentId = user?.id || '';
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genQuestions, setGenQuestions] = useState<Question[] | null>(null);
  const [practicing, setPracticing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const isImage = file.type.startsWith('image/');
      const doc: UploadedDoc = {
        id: 'doc_' + Date.now(),
        name: file.name,
        type: isImage ? 'image' : 'text',
        content,
        date: new Date().toISOString(),
        studentId,
      };
      addDoc(doc);
      setUploading(false);
    };
    if (file.type.startsWith('image/')) reader.readAsDataURL(file);
    else reader.readAsText(file);
  };

  const generateFromDoc = async (doc: UploadedDoc) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-from-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: doc.content,
          type: doc.type,
          name: user?.name || 'Student',
          grade: user?.grade || '5th',
        }),
      });
      const data = await res.json();
      setGenQuestions(data.questions || []);
    } catch {
      setGenQuestions([]);
    }
    setGenerating(false);
  };

  if (practicing && genQuestions) {
    return <GenQuizPractice questions={genQuestions} onBack={() => { setPracticing(false); setGenQuestions(null); }} />;
  }

  const studentDocs = docs.filter(d => d.studentId === studentId);

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <button onClick={onBack} className="text-gray-400 text-sm mb-4">&larr; Back</button>
      <h1 className="text-xl font-black text-gray-900 mb-1">&#128196; Study Materials</h1>
      <p className="text-gray-500 text-sm mb-6">Upload tests, worksheets, or study guides. AI will generate practice questions from them.</p>

      <input ref={fileRef} type="file" accept="image/*,.txt,.pdf" className="hidden" onChange={handleFile} />
      <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors active:scale-98">
        <div className="text-3xl mb-2">{uploading ? '&#9203;' : '&#128206;'}</div>
        <div className="font-bold text-gray-700 text-sm">{uploading ? 'Uploading...' : 'Tap to upload'}</div>
        <div className="text-gray-400 text-xs">Photos, text files, or PDFs</div>
      </button>

      {generating && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2 animate-pulse-gentle">&#129302;</div>
          <p className="text-blue-700 font-bold text-sm">Generating questions from your material...</p>
        </div>
      )}

      {genQuestions && genQuestions.length > 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-700 font-bold text-sm mb-3">&#9989; {genQuestions.length} questions generated!</p>
          <button onClick={() => setPracticing(true)} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">
            Practice Now
          </button>
        </div>
      )}

      {studentDocs.length > 0 && (
        <>
          <h2 className="font-bold text-gray-900 mt-6 mb-3 text-sm">Uploaded Materials</h2>
          {studentDocs.reverse().map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-3 mb-2 flex items-center gap-3">
              <span className="text-lg">{doc.type === 'image' ? '&#128444;' : '&#128221;'}</span>
              <div className="flex-1">
                <div className="font-semibold text-xs text-gray-900">{doc.name}</div>
                <div className="text-[10px] text-gray-400">{new Date(doc.date).toLocaleDateString()}</div>
              </div>
              <button onClick={() => generateFromDoc(doc)} disabled={generating} className="text-blue-500 text-xs font-bold active:scale-95">
                Generate Quiz
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
