'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/app-context';
import { SUBJECTS } from '@/lib/constants';
import type { ChatMessage } from '@/lib/types';

export default function Tutor({ subject, onBack }: {
  subject: string;
  onBack: () => void;
}) {
  const { user } = useApp();
  const name = user?.name || 'Student';
  const grade = user?.grade || '5th';
  const state = user?.state || 'DC';
  const subj = SUBJECTS.find(s => s.id === subject);

  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs([{
      role: 'assistant',
      content: `Hey ${name}! I'm your ${subj?.name} tutor.\n\nAsk me anything! For example:\n• "Explain fractions like I'm 10"\n• "Why did the Aztecs fall?"\n• "Help me with photosynthesis"\n• "Quiz me on grammar"\n\nWhat do you want to work on?`
    }]);
  }, [name, subj?.name]);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMsgs(p => [...p, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...msgs, { role: 'user', content: msg }].filter(m => m.role !== 'system'),
          subject,
          name,
          grade,
          state,
        }),
      });
      const data = await res.json();
      setMsgs(p => [...p, { role: 'assistant', content: data.reply || "Hmm, let me think about that differently. Try asking again?" }]);
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: "Oops! Having trouble connecting. Try again in a sec." }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${subj?.gradient} px-4 py-3 flex items-center gap-3`}>
        <button onClick={onBack} className="text-white/80">&larr;</button>
        <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">&#129302;</div>
        <div>
          <div className="text-white font-bold text-sm">{subj?.name} Tutor</div>
          <div className="text-white/50 text-[10px]">Ask me anything</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? `bg-gradient-to-r ${subj?.gradient} text-white rounded-br-sm`
                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm p-3 shadow-sm flex gap-1.5">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={ref} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything..."
            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className={`px-4 rounded-xl font-bold text-sm active:scale-95 transition-all ${
              input.trim() ? `bg-gradient-to-r ${subj?.gradient} text-white` : 'bg-gray-100 text-gray-300'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
