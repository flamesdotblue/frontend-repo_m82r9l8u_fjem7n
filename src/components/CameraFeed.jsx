import React, { useEffect, useRef, useState } from 'react';

// CameraFeed handles: webcam stream, model load, real-time detection, and optional overlays
export default function CameraFeed({ onUpdate, showOverlays = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const humanRef = useRef(null);
  const rafRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Utility: finger counting using landmark indices similar to MediaPipe
  const countFingersFromLandmarks = (lm, handedness = 'Right') => {
    if (!Array.isArray(lm) || lm.length < 21) return 0;
    // For y-axis, smaller y is higher on screen. Compare fingertip y to PIP y to detect extension
    const tip = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 };
    const pip = { thumb: 3, index: 6, middle: 10, ring: 14, pinky: 18 };

    let count = 0;
    // Thumb: use x-axis relative to hand since it moves sideways
    // For right hand: thumb extended if tip x > IP x; for left hand: tip x < IP x
    const thumbExtended = handedness === 'Right'
      ? lm[tip.thumb].x > lm[pip.thumb].x
      : lm[tip.thumb].x < lm[pip.thumb].x;
    if (thumbExtended) count += 1;

    // Other fingers: tip above PIP (smaller y) => extended
    ['index', 'middle', 'ring', 'pinky'].forEach((k) => {
      if (lm[tip[k]] && lm[pip[k]] && lm[tip[k]].y < lm[pip[k]].y) count += 1;
    });

    return count;
  };

  const drawOverlays = (ctx, res) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Faces: draw boxes and landmarks
    if (res.face) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      res.face.forEach((f) => {
        if (f.box) {
          const { x, y, width, height } = f.box;
          ctx.strokeRect(x, y, width, height);
        }
        if (Array.isArray(f.mesh)) {
          ctx.fillStyle = 'rgba(34,197,94,0.6)';
          f.mesh.forEach((pt) => {
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], 1.2, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      });
    }

    // Hands: draw skeleton using connections if provided
    if (res.hand) {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      res.hand.forEach((h) => {
        if (Array.isArray(h.landmarks)) {
          const lm = h.landmarks;
          // Draw points
          ctx.fillStyle = 'rgba(96,165,250,0.7)';
          lm.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
          });
          // Simple lines along each finger (thumb/index/middle/ring/pinky)
          const chains = [
            [0, 1, 2, 3, 4],
            [0, 5, 6, 7, 8],
            [0, 9, 10, 11, 12],
            [0, 13, 14, 15, 16],
            [0, 17, 18, 19, 20],
          ];
          ctx.strokeStyle = 'rgba(96,165,250,0.9)';
          chains.forEach((c) => {
            ctx.beginPath();
            c.forEach((idx, i) => {
              const p = lm[idx];
              if (!p) return;
              if (i === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
          });
        }
      });
    }
  };

  useEffect(() => {
    let stream;
    let running = true;

    const setup = async () => {
      try {
        // Get webcam stream
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => resolve();
          });
          await videoRef.current.play();
        }

        // Dynamically load Human ESM from CDN to avoid npm resolution issues
        const HumanModule = await import('https://cdn.jsdelivr.net/npm/@vladmandic/human/dist/human.esm.js');
        const Human = HumanModule.default || HumanModule.Human || HumanModule;
        const human = new Human({
          debug: false,
          backend: 'webgl',
          modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
          filter: { enabled: true, equalization: true, flip: true },
          warmup: 'none',
          face: { enabled: true, detector: { rotation: true }, mesh: { enabled: true }, iris: { enabled: true }, emotion: { enabled: true } },
          hand: { enabled: true, detector: { rotation: true }, landmarks: { enabled: true } },
        });
        humanRef.current = human;
        await human.load();
        await human.warmup();
        setReady(true);

        const loop = async () => {
          if (!running || !videoRef.current) return;
          const result = await human.detect(videoRef.current);

          // Prepare canvas size
          const v = videoRef.current;
          const c = canvasRef.current;
          if (c && v) {
            if (c.width !== v.videoWidth) c.width = v.videoWidth;
            if (c.height !== v.videoHeight) c.height = v.videoHeight;
            if (showOverlays) drawOverlays(c.getContext('2d'), result);
            else c.getContext('2d').clearRect(0, 0, c.width, c.height);
          }

          // Face metrics
          const faces = Array.isArray(result.face) ? result.face : [];
          const peopleCount = faces.length;
          let happiness = 0;
          let eyeOpen = 0;
          if (faces[0]) {
            const emotions = Array.isArray(faces[0].emotion) ? faces[0].emotion : [];
            const happy = emotions.find((e) => (e.label || e.emotion || '').toLowerCase() === 'happy');
            happiness = happy ? Number(happy.score || 0) : 0;
            // Approximate eye openness using distance between eyelid landmarks if available
            const mesh = faces[0].mesh;
            if (Array.isArray(mesh) && mesh.length > 470) {
              // Using MediaPipe indices: left eye top/bottom approx
              const leftTop = mesh[386];
              const leftBottom = mesh[374];
              const rightTop = mesh[159];
              const rightBottom = mesh[145];
              const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
              const lOpen = leftTop && leftBottom ? dist(leftTop, leftBottom) : 0;
              const rOpen = rightTop && rightBottom ? dist(rightTop, rightBottom) : 0;
              // Normalize roughly by face box height if available
              const fb = faces[0].box;
              const norm = fb && fb.height ? fb.height : v.videoHeight || 1;
              eyeOpen = Math.max(0, Math.min(1, ((lOpen + rOpen) / 2) / (norm * 0.06)));
            }
          }

          // Hand metrics
          const hands = Array.isArray(result.hand) ? result.hand : [];
          let leftFingers = 0;
          let rightFingers = 0;
          hands.forEach((h) => {
            const handedness = (h.handedness || h.label || 'Right');
            const lm = h.landmarks || h.keypoints || h.keypoints3D;
            const count = countFingersFromLandmarks(lm || [], handedness.includes('Left') ? 'Left' : 'Right');
            if (handedness.includes('Left')) leftFingers = Math.max(leftFingers, count);
            else rightFingers = Math.max(rightFingers, count);
          });

          onUpdate?.({ peopleCount, happiness, eyeOpen, leftFingers, rightFingers });

          rafRef.current = requestAnimationFrame(loop);
        };

        loop();
      } catch (err) {
        console.error('Camera/Detection init failed:', err);
      }
    };

    setup();

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
  }, [showOverlays, onUpdate]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className={`absolute inset-0 ${showOverlays ? '' : 'hidden'}`} />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-white/90 text-sm bg-black/30">
          Initializing camera and models...
        </div>
      )}
    </div>
  );
}
