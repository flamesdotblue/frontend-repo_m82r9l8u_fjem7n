import React, { useEffect, useRef, useState } from 'react';
import * as Human from '@vladmandic/human';

const humanConfig = {
  cacheSensitivity: 0.75,
  filter: { enabled: true },
  modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
  face: { enabled: true, mesh: true, iris: true, attention: false, emotion: true, detector: { rotation: true } },
  hand: { enabled: true, detector: { rotation: true } },
  body: { enabled: false },
  gesture: { enabled: false },
};

function distance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.hypot(dx, dy);
}

function eyeAspectRatio(landmarks) {
  // Using MediaPipe indices mapping for 468 mesh
  const L = {
    p1: 33, p2: 160, p3: 158, p4: 133, p5: 153, p6: 144,
  };
  const R = {
    p1: 263, p2: 387, p3: 385, p4: 362, p5: 380, p6: 373,
  };
  const l = [L.p1, L.p2, L.p3, L.p4, L.p5, L.p6].map((i) => [landmarks[i].x, landmarks[i].y]);
  const r = [R.p1, R.p2, R.p3, R.p4, R.p5, R.p6].map((i) => [landmarks[i].x, landmarks[i].y]);
  const earL = (distance(l[1], l[5]) + distance(l[2], l[4])) / (2 * distance(l[0], l[3]));
  const earR = (distance(r[1], r[5]) + distance(r[2], r[4])) / (2 * distance(r[0], r[3]));
  const ear = (earL + earR) / 2;
  // Normalize approximate EAR to 0..1 range (empirical bounds 0.15..0.35)
  const norm = Math.min(1, Math.max(0, (ear - 0.15) / (0.35 - 0.15)));
  return norm;
}

function countFingers(hand) {
  // hand.keypoints: 21 points with x,y
  const kp = hand.keypoints;
  if (!kp || kp.length < 21) return 0;
  // Indexes per MediaPipe Hands
  const tips = { index: 8, middle: 12, ring: 16, pinky: 20 };
  const pips = { index: 6, middle: 10, ring: 14, pinky: 18 };

  let count = 0;
  // Fingers other than thumb: tip.y < pip.y means extended (coordinate origin top-left)
  for (const f of ['index', 'middle', 'ring', 'pinky']) {
    if (kp[tips[f]].y < kp[pips[f]].y) count += 1;
  }
  // Thumb: compare x depending on hand label (left/right)
  const thumbTip = kp[4];
  const thumbIP = kp[3];
  let isRight = false;
  if (hand.label) {
    isRight = hand.label.toLowerCase().includes('right');
  } else {
    // Heuristic: if index MCP x < pinky MCP x, it's a right hand (camera mirrored)
    isRight = kp[5].x < kp[17].x;
  }
  if (isRight) {
    if (thumbTip.x > thumbIP.x) count += 1;
  } else {
    if (thumbTip.x < thumbIP.x) count += 1;
  }
  return count;
}

const CameraFeed = ({ onUpdate, showOverlays = true }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const humanRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let running = true;
    const human = new Human.Human(humanConfig);
    humanRef.current = human;

    async function init() {
      try {
        await human.load();
        await human.warmup();
        setReady(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        loop();
      } catch (e) {
        console.error('Camera init error', e);
      }
    }

    async function loop() {
      if (!running || !videoRef.current) return;
      const t0 = performance.now();
      const result = await human.detect(videoRef.current);

      // Compute stats
      const faces = result.face || [];
      const peopleCount = faces.length;
      let happiness = 0;
      let eyeOpen = 0;
      if (faces.length > 0) {
        // Happiness from emotion classifier
        const emotions = faces[0].emotion || [];
        const happy = emotions.find((e) => e.expression === 'happy');
        if (happy) happiness = happy.score;
        // Eye openness from landmarks
        if (faces[0].mesh && faces[0].mesh.length > 0) {
          eyeOpen = eyeAspectRatio(faces[0].mesh);
        }
      }

      // Hands and finger counting
      const hands = result.hand || [];
      // Determine left/right
      let left = 0, right = 0;
      for (const h of hands) {
        const fingers = countFingers(h);
        const cx = h.box ? (h.box[0] + h.box[2]) / 2 : (h.keypoints[0]?.x || 0.5);
        const isRight = h.label ? h.label.toLowerCase().includes('right') : cx < 0.5; // assuming mirrored selfie
        if (isRight) right = Math.max(right, fingers); else left = Math.max(left, fingers);
      }

      const payload = {
        peopleCount,
        happiness,
        eyeOpen,
        leftFingers: left,
        rightFingers: right,
      };
      onUpdate && onUpdate(payload);

      // Draw overlays
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && videoRef.current) {
        const { videoWidth: w, videoHeight: h } = videoRef.current;
        if (w === 0 || h === 0) {
          requestAnimationFrame(loop);
          return;
        }
        canvasRef.current.width = w;
        canvasRef.current.height = h;
        ctx.clearRect(0, 0, w, h);
        if (showOverlays) {
          // Faces
          for (const f of faces) {
            if (f.box) {
              const [x, y, x2, y2] = f.box.map((v, i) => (i % 2 === 0 ? v * w : v * h));
              ctx.strokeStyle = 'rgba(59,130,246,0.9)';
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, x2 - x, y2 - y);
            }
            if (f.mesh) {
              ctx.fillStyle = 'rgba(59,130,246,0.6)';
              for (const p of f.mesh) {
                ctx.beginPath();
                ctx.arc(p.x * w, p.y * h, 1.2, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
          // Hands
          for (const hnd of hands) {
            const pts = hnd.keypoints;
            if (pts) {
              ctx.fillStyle = 'rgba(16,185,129,0.9)';
              for (const p of pts) {
                ctx.beginPath();
                ctx.arc(p.x * w, p.y * h, 2, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            if (hnd.box) {
              const [x, y, x2, y2] = hnd.box.map((v, i) => (i % 2 === 0 ? v * w : v * h));
              ctx.strokeStyle = 'rgba(16,185,129,0.9)';
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, x2 - x, y2 - y);
            }
          }
        }
      }

      const t1 = performance.now();
      const curFps = 1000 / (t1 - t0);
      setFps(curFps);

      requestAnimationFrame(loop);
    }

    init();

    return () => {
      running = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, [onUpdate, showOverlays]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded-md">{ready ? `${fps.toFixed(1)} fps` : 'Loading...'}</div>
    </div>
  );
};

export default CameraFeed;
