import React, { useEffect, useRef, useState, useMemo } from "react";

// =============================
// FallingMusicNotes.tsx
// A sleek, GPU-friendly falling musical notes effect using Canvas.
// - TypeScript + React (default export component)
// - Works as a full-screen overlay or inside any sized container
// - Props to control density, speed, colors, zIndex, etc.
// =============================

// SVG paths for a few musical notes (Path2D can consume SVG path strings)
const NOTE_PATHS = [
  // Eighth note
  "M22.4 2 C19.7 2 17.5 4.2 17.5 6.9 17.5 9.6 19.7 11.8 22.4 11.8 23.2 11.8 24 11.6 24.7 11.2 L24.7 24.8 C23.6 23.9 22.1 23.3 20.4 23.3 16.8 23.3 13.9 25.6 13.9 28.4 13.9 31.2 16.8 33.5 20.4 33.5 24 33.5 26.9 31.2 26.9 28.4 L26.9 9.1 C26.9 8.2 27.6 7.5 28.5 7.5 29.4 7.5 30.1 8.2 30.1 9.1 L30.1 24.5 C29 23.6 27.5 23 25.8 23 22.2 23 19.3 25.3 19.3 28.1 19.3 30.9 22.2 33.2 25.8 33.2 29.4 33.2 32.3 30.9 32.3 28.1 L32.3 6.4 C32.3 4.2 30.5 2.4 28.3 2.4 26.5 2.4 24.8 3.3 23.8 4.8 23.5 3.2 23 2 22.4 2 Z",
  // Beamed eighth notes
  "M7 30 C7 27.2 9.9 25 13.5 25 14.8 25 16 25.3 17 25.8 L17 6.5 29 4.5 29 21.7 C27.7 20.7 26 20 24 20 20.4 20 17.5 22.2 17.5 25 17.5 27.8 20.4 30 24 30 27.6 30 30.5 27.8 30.5 25 L30.5 3.5 17 5.7 17 19.8 C15.9 18.7 14.3 18 12.5 18 8.9 18 6 20.2 6 23 6 25.8 8.9 28 12.5 28 15.2 28 17.5 26.8 18.7 24.9 L18.7 24.9 C17.2 29.1 13.9 31.5 10.2 31.5 8 31.5 7 30.4 7 30 Z",
  // Quaver with stem
  "M10 28 C10 25.2 12.9 23 16.5 23 18.8 23 20.8 23.9 22 25.3 L22 4 26 4 26 22 C24.7 21.1 23 20.5 21 20.5 17.4 20.5 14.5 22.8 14.5 25.6 14.5 28.4 17.4 30.6 21 30.6 24.6 30.6 27.5 28.4 27.5 25.6 L27.5 4 22 4 22 18 C20.7 17.1 19 16.5 17 16.5 13.4 16.5 10.5 18.8 10.5 21.6 10.5 24.4 13.4 26.6 17 26.6 18.3 26.6 19.5 26.3 20.5 25.8 19 30 15.7 32.4 12 32.4 10 32.4 10 30.4 10 28 Z",
];

// Utility: random range
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// Particle type
interface NoteParticle {
  x: number;
  y: number;
  vy: number; // vertical speed
  swayAmp: number; // horizontal sway amplitude
  swayFreq: number; // sway frequency
  swayPhase: number; // initial phase
  size: number; // uniform scale
  rot: number; // rotation (radians)
  rotSpeed: number;
  pathIndex: number; // which note path
  alpha: number; // current alpha
  alphaPulse: number; // speed of alpha pulsing
}

export type FallingMusicNotesProps = {
  /** Number of notes per 10,000 px². Example: 0.8 = ~0.8 notes per 10k px² */
  density?: number;
  /** Global speed multiplier */
  speed?: number;
  /** Allowed colors for notes */
  colors?: string[];
  /** Min/Max size in pixels for the base 32px path (scale applied on top) */
  sizeRange?: [number, number];
  /** Whether to render as full-screen overlay */
  fullscreen?: boolean;
  /** z-index when fullscreen */
  zIndex?: number;
  /** Pause animation */
  paused?: boolean;
  /** High-DPI support (devicePixelRatio). Set to 0 to disable */
  pixelRatio?: number;
  /** Optional: confine to rounded container and hide overflow? */
  rounded?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const DEFAULT_COLORS = ["#ffffff", "#ffd166", "#06d6a0", "#ef476f", "#118ab2"]; // light fun palette

const buildPaths = () => NOTE_PATHS.map((d) => new Path2D(d));

const useDevicePR = (forced: number | undefined) => {
  const [pr, setPr] = useState<number>(() => (forced ?? window.devicePixelRatio ?? 1));
  useEffect(() => {
    if (forced === 0) return setPr(1);
    if (typeof forced === "number") return setPr(forced);
    const handle = () => setPr(window.devicePixelRatio || 1);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [forced]);
  return pr;
};

const createParticle = (w: number, h: number, pr: number, options: Required<Pick<FallingMusicNotesProps, "speed" | "sizeRange">>) : NoteParticle => {
  const [minS, maxS] = options.sizeRange;
  return {
    x: rand(0, w),
    y: rand(-h, 0),
    vy: rand(30, 90) * options.speed * (pr > 1 ? 1.1 : 1),
    swayAmp: rand(10, 40),
    swayFreq: rand(0.4, 1.2),
    swayPhase: rand(0, Math.PI * 2),
    size: rand(minS, maxS) / 32, // paths are ~32px units
    rot: rand(0, Math.PI * 2),
    rotSpeed: rand(-0.6, 0.6),
    pathIndex: Math.floor(rand(0, NOTE_PATHS.length)),
    alpha: rand(0.7, 1),
    alphaPulse: rand(-0.3, 0.3),
  };
};

const computeCountFromDensity = (w: number, h: number, density: number) => {
  const area = (w * h) / 10000; // area units of 10k px²
  return Math.max(4, Math.round(area * density));
};

const FallingMusicNotes: React.FC<FallingMusicNotesProps> = ({
  density = 0.9,
  speed = 1,
  colors = DEFAULT_COLORS,
  sizeRange = [16, 34],
  fullscreen = true,
  zIndex = 40,
  paused = false,
  pixelRatio,
  rounded = false,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pr = useDevicePR(pixelRatio);

  const notePaths = useMemo(buildPaths, []);
  const colorPick = useMemo(() => (i: number) => colors[i % colors.length], [colors]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const container = containerRef.current!;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let particles: NoteParticle[] = [];
    let running = true;
    let last = performance.now();

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * pr);
      canvas.height = Math.floor(height * pr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pr, 0, 0, pr, 0, 0); // scale drawing by device pixel ratio

      // rebuild particles based on new density
      const target = computeCountFromDensity(width, height, density);
      particles = new Array(target).fill(0).map(() => createParticle(width, height, pr, { speed, sizeRange }));
    };

    resize();

    let raf = 0;
    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000); // clamp delta time for stability
      last = now;

      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // physics
        p.y += p.vy * dt;
        p.rot += p.rotSpeed * dt;
        p.swayPhase += p.swayFreq * dt;
        p.alpha += p.alphaPulse * dt * 0.5;
        if (p.alpha < 0.55 || p.alpha > 1) p.alphaPulse *= -1;

        const x = p.x + Math.sin(p.swayPhase) * p.swayAmp;
        const y = p.y;

        // recycle when out of view
        if (y - 40 > h) {
          const np = createParticle(w, h, pr, { speed, sizeRange });
          np.y = -rand(20, 100);
          particles[i] = np;
          continue;
        }

        // draw
        ctx.save();
        ctx.globalAlpha = Math.max(0.5, Math.min(1, p.alpha));
        ctx.translate(x, y);
        ctx.rotate(p.rot);
        ctx.scale(p.size, p.size);
        ctx.fillStyle = colorPick(i);
        ctx.fill(notePaths[p.pathIndex]);
        ctx.restore();
      }
    };

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    if (!paused) start();

    return () => {
      window.removeEventListener("resize", onResize);
      stop();
    };
  }, [density, speed, colors, sizeRange, paused, pr, notePaths, colorPick]);

  const containerStyles: React.CSSProperties = fullscreen
    ? {
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex,
      }
    : {
        position: "relative",
        overflow: "hidden",
      };

  return (
    <div
      ref={containerRef}
      className={
        "" + (rounded ? " rounded-2xl overflow-hidden " : "") + (className ? ` ${className}` : "")
      }
      style={{ ...containerStyles, ...style }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default FallingMusicNotes;

// =============================
// USAGE EXAMPLES
// =============================
// 1) Full-screen overlay (drop in your App.tsx):
// <FallingMusicNotes fullscreen density={1.2} speed={1} />
//
// 2) Inside a card/container (non-fullscreen):
// <div className="relative w-full h-[400px] bg-black/60 rounded-2xl">
//   <FallingMusicNotes fullscreen={false} rounded density={1.5} colors={["#fff"]} />
//   <div className="absolute inset-0 grid place-items-center text-white">Nội dung</div>
// </div>
//
// 3) Custom palette + slower fall + higher DPI:
// <FallingMusicNotes
//    colors={["#fff", "#f472b6", "#60a5fa"]}
//    speed={0.8}
//    pixelRatio={2}
// />
