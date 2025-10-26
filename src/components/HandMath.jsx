import React, { useMemo } from 'react';

const Stat = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-white/60 backdrop-blur border border-gray-200">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
);

const HandMath = ({ left = 0, right = 0 }) => {
  const ops = useMemo(() => {
    const a = left ?? 0;
    const b = right ?? 0;
    return {
      sum: a + b,
      diff: Math.abs(a - b),
      prod: a * b,
      div: b !== 0 ? (a / b).toFixed(2) : '∞',
    };
  }, [left, right]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Left fingers" value={left} />
        <Stat label="Right fingers" value={right} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Sum (L + R)" value={ops.sum} />
        <Stat label="Difference |L - R|" value={ops.diff} />
        <Stat label="Multiply (L × R)" value={ops.prod} />
        <Stat label="Division (L ÷ R)" value={ops.div} />
      </div>
      <p className="text-xs text-gray-500">
        Tip: Show your hands to the camera. We'll count extended fingers on each hand and do the math for you.
      </p>
    </div>
  );
};

export default HandMath;
