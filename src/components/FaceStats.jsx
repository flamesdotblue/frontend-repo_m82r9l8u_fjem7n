import React from 'react';

export default function FaceStats({ peopleCount = 0, happiness = 0, eyeOpen = 0 }) {
  const pct = (v) => Math.round(Math.max(0, Math.min(1, Number(v) || 0)) * 100);
  return (
    <div className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur border border-zinc-200/50 dark:border-zinc-800/50">
      <h3 className="text-lg font-semibold mb-3">Face Stats</h3>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-zinc-600 dark:text-zinc-300">People</span>
        <span className="font-bold text-xl">{peopleCount}</span>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span>Happiness</span>
          <span>{pct(happiness)}%</span>
        </div>
        <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded">
          <div className="h-2 bg-emerald-500 rounded" style={{ width: `${pct(happiness)}%` }} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span>Eye Openness</span>
          <span>{pct(eyeOpen)}%</span>
        </div>
        <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded">
          <div className="h-2 bg-sky-500 rounded" style={{ width: `${pct(eyeOpen)}%` }} />
        </div>
      </div>
    </div>
  );
}
