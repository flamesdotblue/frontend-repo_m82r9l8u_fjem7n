import React from 'react';

export default function ControlsPanel({ showOverlays, setShowOverlays, running, onStart, onStop }) {
  return (
    <div className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur border border-zinc-200/50 dark:border-zinc-800/50">
      <h3 className="text-lg font-semibold mb-3">Controls</h3>

      <div className="flex items-center gap-3 mb-4">
        <button
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${running ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
          onClick={onStart}
          disabled={running}
        >
          Start Camera
        </button>
        <button
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${!running ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}
          onClick={onStop}
          disabled={!running}
        >
          Stop Camera
        </button>
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          className="h-4 w-4 accent-emerald-500"
          checked={showOverlays}
          onChange={(e) => setShowOverlays(e.target.checked)}
          disabled={!running}
        />
        <span className={`text-sm ${!running ? 'text-zinc-400' : ''}`}>Show overlays</span>
      </label>

      <p className="text-xs text-zinc-500 mt-3">
        Tip: Start the camera, allow permission, and ensure good lighting for best results.
      </p>
    </div>
  );
}
