import React, { useState, useCallback } from 'react';
import CameraFeed from './components/CameraFeed.jsx';
import FaceStats from './components/FaceStats.jsx';
import HandMath from './components/HandMath.jsx';
import ControlsPanel from './components/ControlsPanel.jsx';

export default function App() {
  const [metrics, setMetrics] = useState({
    peopleCount: 0,
    happiness: 0,
    eyeOpen: 0,
    leftFingers: 0,
    rightFingers: 0,
  });
  const [showOverlays, setShowOverlays] = useState(true);

  const handleUpdate = useCallback((m) => setMetrics((prev) => ({ ...prev, ...m })), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Live Face & Hand Math</h1>
          <p className="text-zinc-600 dark:text-zinc-300 mt-1">Real-time people count, emotion signal, eye openness, and hand-based arithmetic.</p>
        </header>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CameraFeed onUpdate={handleUpdate} showOverlays={showOverlays} />
          </div>
          <div className="space-y-6">
            <FaceStats
              peopleCount={metrics.peopleCount}
              happiness={metrics.happiness}
              eyeOpen={metrics.eyeOpen}
            />
            <HandMath left={metrics.leftFingers} right={metrics.rightFingers} />
            <ControlsPanel showOverlays={showOverlays} setShowOverlays={setShowOverlays} />
          </div>
        </section>

        <footer className="mt-10 text-xs text-zinc-500">
          Camera data is processed locally in your browser. No data leaves your device.
        </footer>
      </div>
    </div>
  );
}
