import React, { useRef, useEffect, useState } from 'react';

// Face-to-rotation mapping (standard dice: opposite faces sum to 7)
// front=1, back=6, right=2, left=5, top=3, bottom=4
const FACE_ROTATIONS = {
  1: 'rotateX(0deg) rotateY(0deg)',      // front face
  6: 'rotateX(0deg) rotateY(180deg)',    // back face
  2: 'rotateX(0deg) rotateY(-90deg)',    // right face
  5: 'rotateX(0deg) rotateY(90deg)',     // left face
  3: 'rotateX(-90deg) rotateY(0deg)',    // top face
  4: 'rotateX(90deg) rotateY(0deg)',     // bottom face
};

function DotPattern({ value, faceColor }) {
  // dot color: rose-700 for 1&4, deep maroon/black for others — standard dice look
  const redDot = value === 1 || value === 4;
  const dot = (key) => (
    <span
      key={key}
      style={{
        display: 'inline-block',
        width: '28%',
        aspectRatio: '1',
        borderRadius: '50%',
        background: redDot
          ? 'radial-gradient(circle at 35% 30%, #ff6b6b, #c0392b)'
          : 'radial-gradient(circle at 35% 30%, #3a2a2a, #1a0f0f)',
        boxShadow: redDot
          ? 'inset 0 1px 2px rgba(255,120,120,0.5), 0 1px 3px rgba(0,0,0,0.5)'
          : 'inset 0 1px 2px rgba(80,30,30,0.4), 0 1px 3px rgba(0,0,0,0.6)',
      }}
    />
  );

  const layouts = {
    1: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        {dot('c')}
      </div>
    ),
    2: (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10%', width: '100%', height: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>{dot('tl')}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{dot('br')}</div>
      </div>
    ),
    3: (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10%', width: '100%', height: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>{dot('tl')}</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>{dot('c')}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{dot('br')}</div>
      </div>
    ),
    4: (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10%', width: '100%', height: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>{dot('tl')}{dot('tr')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>{dot('bl')}{dot('br')}</div>
      </div>
    ),
    5: (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10%', width: '100%', height: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>{dot('tl')}{dot('tr')}</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>{dot('c')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>{dot('bl')}{dot('br')}</div>
      </div>
    ),
    6: (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10%', width: '100%', height: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>{dot('tl')}{dot('tr')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>{dot('ml')}{dot('mr')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>{dot('bl')}{dot('br')}</div>
      </div>
    ),
  };

  return layouts[value] || null;
}

function DiceFace({ value, transform, brightness = 1, label }) {
  // brightness: 1=front, 0.9=sides, 0.75=back/bottom for lighting illusion
  const bg = brightness === 1
    ? 'linear-gradient(145deg, #fffefa 0%, #f8f4ec 40%, #ede7d7 100%)'
    : brightness === 0.9
    ? 'linear-gradient(145deg, #f5f1e8 0%, #ede5d5 50%, #e0d8c5 100%)'
    : 'linear-gradient(145deg, #e8e2d5 0%, #ddd5c0 50%, #cec6b0 100%)';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        background: bg,
        borderRadius: '18%',
        border: '1.5px solid rgba(180,160,120,0.6)',
        boxShadow:
          brightness === 1
            ? 'inset 0 2px 6px rgba(255,255,255,0.95), inset 0 -4px 10px rgba(0,0,0,0.12)'
            : brightness === 0.9
            ? 'inset 0 2px 5px rgba(255,255,255,0.7), inset 0 -4px 10px rgba(0,0,0,0.18)'
            : 'inset 0 1px 4px rgba(255,255,255,0.4), inset 0 -4px 10px rgba(0,0,0,0.28)',
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
      }}
    >
      {/* Inner bevel highlight */}
      <div
        style={{
          position: 'absolute',
          inset: '4%',
          borderRadius: '14%',
          border: '1px solid rgba(255,255,255,0.55)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ flex: 1, padding: '8%', boxSizing: 'border-box' }}>
        <DotPattern value={value} />
      </div>
    </div>
  );
}

export default function Dice({ value = 1, isRolling = false, size = 'md' }) {
  const sizePx = { xs: 44, sm: 56, md: 72, lg: 96 }[size] || 72;
  const half = sizePx / 2;

  // Track cumulative rotation angles for smooth continuous spinning
  const rotRef = useRef({ x: 0, y: 0, z: 0 });
  const [cubeTransform, setCubeTransform] = useState(FACE_ROTATIONS[value] || 'rotateX(0deg) rotateY(0deg)');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const animFrameRef = useRef(null);
  const prevRollingRef = useRef(isRolling);
  const startTimeRef = useRef(null);

  // Rolling → stopped: snap to correct face with transition
  useEffect(() => {
    if (prevRollingRef.current && !isRolling) {
      // Dice stopped — snap to correct face
      setIsTransitioning(true);
      setCubeTransform(FACE_ROTATIONS[value] || 'rotateX(0deg) rotateY(0deg)');
      const t = setTimeout(() => setIsTransitioning(false), 450);
      prevRollingRef.current = false;
      return () => clearTimeout(t);
    }
    if (!prevRollingRef.current && isRolling) {
      prevRollingRef.current = true;
      setIsTransitioning(false);
    }
  }, [isRolling, value]);

  // Smooth JS-driven 3D spin when rolling
  useEffect(() => {
    if (!isRolling) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    startTimeRef.current = null;
    // Random speed multipliers per die instance for variety
    const sx = 1.1 + Math.random() * 0.9;
    const sy = 1.3 + Math.random() * 1.1;
    const sz = 0.6 + Math.random() * 0.5;

    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = (ts - startTimeRef.current) / 1000; // seconds

      // Oscillating + accelerating spin: more chaotic feel
      const x = elapsed * 320 * sx + Math.sin(elapsed * 2.5) * 45;
      const y = elapsed * 410 * sy + Math.cos(elapsed * 1.8) * 60;
      const z = elapsed * 180 * sz + Math.sin(elapsed * 3.1) * 30;

      setCubeTransform(`rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRolling]);

  // Face values in standard dice layout:
  //   front=value, back=7-value
  //   right=2 → unless front/back is 2 or 5, cycle accordingly
  // Simplified: use fixed face assignment, front=1 back=6 right=2 left=5 top=3 bottom=4
  const faces = [
    { v: 1, transform: `translateZ(${half}px)`,                     brightness: 1    }, // front
    { v: 6, transform: `rotateY(180deg) translateZ(${half}px)`,     brightness: 0.7  }, // back
    { v: 2, transform: `rotateY(90deg) translateZ(${half}px)`,      brightness: 0.88 }, // right
    { v: 5, transform: `rotateY(-90deg) translateZ(${half}px)`,     brightness: 0.82 }, // left
    { v: 3, transform: `rotateX(-90deg) translateZ(${half}px)`,     brightness: 0.92 }, // top
    { v: 4, transform: `rotateX(90deg) translateZ(${half}px)`,      brightness: 0.72 }, // bottom
  ];

  return (
    <div
      style={{
        width: sizePx,
        height: sizePx,
        perspective: `${sizePx * 4}px`,
        perspectiveOrigin: '50% 50%',
        flexShrink: 0,
      }}
    >
      {/* Glow aura when rolling */}
      {isRolling && (
        <div
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229,190,83,0.35) 0%, transparent 70%)',
            animation: 'diceGlow 0.5s ease-in-out infinite alternate',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* The 3D cube */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: cubeTransform,
          transition: isTransitioning ? 'transform 0.42s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          willChange: 'transform',
        }}
      >
        {faces.map((f) => (
          <DiceFace
            key={f.v}
            value={f.v}
            transform={f.transform}
            brightness={f.brightness}
          />
        ))}
      </div>
    </div>
  );
}
