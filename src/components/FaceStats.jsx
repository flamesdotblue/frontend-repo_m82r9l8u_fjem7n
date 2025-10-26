import React from 'react';

const meterColor = (v) => {
  if (v > 0.66) return 'bg-green-500';
  if (v > 0.33) return 'bg-yellow-500';
  return 'bg-red-500';
};

const ProgressBar = ({ value }) => (
  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div className={`h-full ${meterColor(value)} transition-all`} style={{ width: `${Math.round(value * 100)}%` }} />
  </div>
);

const FaceStats = ({ peopleCount = 0, happiness = 0, eyeOpen = 0 }) => {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-gray-500">People detected</div>
        <div className="text-2xl font-semibold">{peopleCount}</div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">Happiness</span>
          <span className="text-sm font-medium">{Math.round(happiness * 100)}%</span>
        </div>
        <ProgressBar value={happiness} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">Eye openness</span>
          <span className="text-sm font-medium">{Math.round(eyeOpen * 100)}%</span>
        </div>
        <ProgressBar value={eyeOpen} />
      </div>
    </div>
  );
};

export default FaceStats;
