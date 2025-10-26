import React, { useState } from 'react';
import CameraFeed from './components/CameraFeed.jsx';
import FaceStats from './components/FaceStats.jsx';
import HandMath from './components/HandMath.jsx';
import ControlsPanel from './components/ControlsPanel.jsx';

function App() {
  const [peopleCount, setPeopleCount] = useState(0);
  const [happiness, setHappiness] = useState(0);
  const [eyeOpen, setEyeOpen] = useState(0);
  const [leftFingers, setLeftFingers] = useState(0);
  const [rightFingers, setRightFingers] = useState(0);
  const [showOverlays, setShowOverlays] = useState(true);

  const onUpdate = ({ peopleCount, happiness, eyeOpen, leftFingers, rightFingers }) => {
    setPeopleCount(peopleCount);
    setHappiness(happiness);
    setEyeOpen(eyeOpen);
    setLeftFingers(leftFingers);
    setRightFingers(rightFingers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-violet-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-800">
            Smile, Eyes, People & Fingers — Live from your Camera
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real-time face mood, eye openness, people count, finger counting and instant math with your hands.
          </p>
        </header>

        <ControlsPanel showOverlays={showOverlays} setShowOverlays={setShowOverlays} />

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CameraFeed onUpdate={onUpdate} showOverlays={showOverlays} />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-gray-200">
                <h3 className="font-semibold mb-3">Face & Mood</h3>
                <FaceStats peopleCount={peopleCount} happiness={happiness} eyeOpen={eyeOpen} />
              </div>
              <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-gray-200">
                <h3 className="font-semibold mb-3">Hand Math</h3>
                <HandMath left={leftFingers} right={rightFingers} />
              </div>
            </div>
          </div>
          <aside className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 h-fit space-y-4">
            <h3 className="font-semibold text-lg">How it works</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>We analyze your webcam in the browser for privacy — no video leaves your device.</li>
              <li>We estimate smiles and eye openness using facial landmarks.</li>
              <li>We count extended fingers on each hand and calculate +, −, ×, ÷ automatically.</li>
              <li>Try with multiple people to see the people counter react!</li>
            </ul>
            <div className="text-xs text-gray-500">
              Tip: Good lighting improves detection accuracy.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
