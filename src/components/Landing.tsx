'use client';

export default function Landing({ onStudent, onParent, onEducator }: {
  onStudent: () => void;
  onParent: () => void;
  onEducator: () => void;
}) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&q=80&auto=format" alt="Students learning" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </div>
      <div className="relative z-10 text-center max-w-md w-full">
        <h1 className="text-5xl font-black text-white mb-2 tracking-tight">LeapIQ</h1>
        <p className="text-white/60 mb-1 text-xs font-bold tracking-[0.2em] uppercase">Adaptive AI Learning</p>
        <p className="text-white/40 mb-10 text-sm">Meets students where they are. Takes them where they need to go.</p>

        <button onClick={onStudent} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-4 rounded-2xl mb-3 text-lg shadow-xl active:scale-95 transition-all">
          I&apos;m a Student
        </button>
        <button onClick={onParent} className="w-full bg-white/10 backdrop-blur text-white font-bold py-4 rounded-2xl border border-white/20 text-base active:scale-95 transition-all hover:bg-white/20 mb-3">
          Parent Dashboard
        </button>
        <button onClick={onEducator} className="w-full bg-white/10 backdrop-blur text-white font-bold py-4 rounded-2xl border border-white/20 text-base active:scale-95 transition-all hover:bg-white/20">
          Educator Dashboard
        </button>

        <div className="mt-10 flex flex-col items-center gap-2">
          <p className="text-white/20 text-[10px] font-semibold tracking-wider">BUILT BY JMCB TECHNOLOGY GROUP</p>
          <div className="flex gap-4 mt-2">
            {['Real-time Adaptive Learning', 'Knowledge Gap Detection', 'Standards-Aligned'].map(f => (
              <span key={f} className="text-white/30 text-[9px] font-medium">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
