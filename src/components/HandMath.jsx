import React from 'react';

export default function HandMath({ left = 0, right = 0 }) {
  const a = Number.isFinite(left) ? left : 0;
  const b = Number.isFinite(right) ? right : 0;
  const sum = a + b;
  const diff = a - b;
  const prod = a * b;
  const div = b === 0 ? '∞' : (a / b).toFixed(2);

  return (
    <div className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur border border-zinc-200/50 dark:border-zinc-800/50">
      <h3 className="text-lg font-semibold mb-3">Hand Math</h3>
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60">
          <div className="text-zinc-500">Left Hand</div>
          <div className="text-2xl font-bold">{a}</div>
        </div>
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60">
          <div className="text-zinc-500">Right Hand</div>
          <div className="text-2xl font-bold">{b}</div>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <Row label="Sum" value={sum} />
        <Row label="Difference" value={diff} />
        <Row label="Product" value={prod} />
        <Row label="Division" value={div} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60">
      <span className="text-zinc-600 dark:text-zinc-300">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
