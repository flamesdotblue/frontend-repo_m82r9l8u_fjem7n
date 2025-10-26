import React from 'react';

const ControlsPanel = ({ showOverlays, setShowOverlays }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/70 backdrop-blur border border-gray-200">
      <div>
        <div className="text-sm font-medium">Live Camera Analysis</div>
        <div className="text-xs text-gray-500">Enable or disable landmarks and boxes</div>
      </div>
      <label className="inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={showOverlays}
          onChange={(e) => setShowOverlays(e.target.checked)}
        />
        <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 relative transition-colors">
          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
        </div>
        <span className="ml-2 text-sm text-gray-700">Overlays</span>
      </label>
    </div>
  );
};

export default ControlsPanel;
