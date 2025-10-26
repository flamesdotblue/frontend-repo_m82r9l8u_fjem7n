import React from 'react';

export default function ControlsPanel({ showOverlays, setShowOverlays }) {
  return (
    <div className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur border border-zinc-200/50 dark:border-zinc-800/50">
      <h3 className="text-lg font-semibold mb-3">Controls</h3>
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          className="h-4 w-4 accent-emerald-500"
          checked={showOverlays}
          onChange={(e) => setShowOverlays(e.target.checked)}
        />
        <span className="text-sm">Show overlays</span>
      </label>
      <p className="text-xs text-zinc-500 mt-3">
        Tip: Ensure good lighting and keep hands fully in view for best results.
      </p>
    </div>
  );
}
