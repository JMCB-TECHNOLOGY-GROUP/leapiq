'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-context';

export default function ParentLogin({ onSuccess, onBack }: {
  onSuccess: () => void;
  onBack: () => void;
}) {
  const { parentPin, setParentPin } = useApp();
  const [input, setInput] = useState('');
  const [err, setErr] = useState('');
  const isCreate = !parentPin;

  const submit = () => {
    if (isCreate) {
      if (input.length < 4) { setErr('PIN must be 4+ digits'); return; }
      setParentPin(input);
      onSuccess();
    } else {
      if (input === parentPin) onSuccess();
      else { setErr('Wrong PIN'); setInput(''); }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-6">
      <button onClick={onBack} className="absolute top-6 left-6 text-gray-400 text-sm">&larr; Back</button>
      <div className="max-w-xs w-full text-center">
        <div className="text-5xl mb-4">&#128274;</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">{isCreate ? 'Create PIN' : 'Parent Login'}</h1>
        <p className="text-gray-400 mb-6 text-sm">{isCreate ? 'Set a PIN to protect the parent dashboard' : 'Enter your PIN'}</p>
        <input
          type="password"
          inputMode="numeric"
          value={input}
          onChange={e => { setInput(e.target.value.replace(/\D/g, '')); setErr(''); }}
          placeholder="PIN"
          className="w-full p-4 text-center text-2xl tracking-[0.5em] border-2 border-gray-200 rounded-2xl mb-3 focus:outline-none focus:border-blue-400 font-bold"
          maxLength={8}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        {err && <p className="text-red-500 text-xs mb-3">{err}</p>}
        <button onClick={submit} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform">
          {isCreate ? 'Set PIN' : 'Open Dashboard'}
        </button>
      </div>
    </div>
  );
}
