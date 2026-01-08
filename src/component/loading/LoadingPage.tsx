import { useEffect, useRef, useState } from "react";

const NOTE_FREQ = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
};

const KEYS: { id: keyof typeof NOTE_FREQ; label: string }[] = [
  { id: "C4", label: "C" },
  { id: "D4", label: "D" },
  { id: "E4", label: "E" },
  { id: "F4", label: "F" },
  { id: "G4", label: "G" },
  { id: "A4", label: "A" },
  { id: "B4", label: "B" },
  { id: "C5", label: "C" },
];

const NOTE_SYMBOLS = ["♪", "♫", "♬"];

type Props = {
  duration?: number;
  onFinish?: () => void;
};

const LoadingPage = ({ duration = 6000, onFinish }: Props) => {
  const [visible, setVisible] = useState(true);
  const [activeKey, setActiveKey] = useState<keyof typeof NOTE_FREQ | null>(
    null
  );

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const starCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const notesLayerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      gainRef.current = audioCtxRef.current.createGain();
      gainRef.current.gain.value = 0.12;
      gainRef.current.connect(audioCtxRef.current.destination);
    }

    let running = true;
    const start = performance.now();

    function pickAndPlay() {
      if (!running) return;
      const elapsed = performance.now() - start;
      if (elapsed > duration) return;

      const idx = Math.floor(Math.random() * KEYS.length);
      const key = KEYS[idx];
      playNote(key.id, 0.18);
      flashKey(key.id);
      spawnFallingNote();
      pulseSpeakers();

      const nextDelay = 180 + Math.random() * 380;
      setTimeout(pickAndPlay, nextDelay);
    }

    setTimeout(pickAndPlay, 150);
    const starAnim = startStarfield(starCanvasRef.current);

    const finishTimeout = setTimeout(() => {
      running = false;
      setVisible(false);
      if (typeof onFinish === "function") onFinish();
      cancelAnimationFrame(starAnim);
      setTimeout(() => {
        try {
          if (audioCtxRef.current) audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }, 800);
    }, duration);

    return () => {
      running = false;
      clearTimeout(finishTimeout);
    };
  }, [duration, onFinish]);

  function playNote(noteId: keyof typeof NOTE_FREQ, length = 0.2) {
    const ctx = audioCtxRef.current;
    if (!ctx || !gainRef.current) return;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    const freq = NOTE_FREQ[noteId];
    osc.type = "sine";
    osc.frequency.value = freq;

    osc2.type = "triangle";
    osc2.frequency.value = freq * 2;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + length);

    osc.connect(g);
    osc2.connect(g);
    g.connect(gainRef.current);

    osc.start();
    osc2.start();
    osc.stop(ctx.currentTime + length);
    osc2.stop(ctx.currentTime + length + 0.02);
  }

  function flashKey(keyId: keyof typeof NOTE_FREQ) {
    setActiveKey(keyId);
    setTimeout(() => setActiveKey(null), 250);
  }

  function pulseSpeakers() {
    const left = containerRef.current?.querySelector(
      ".speaker-left"
    ) as HTMLElement;
    const right = containerRef.current?.querySelector(
      ".speaker-right"
    ) as HTMLElement;
    if (!left || !right) return;

    [left, right].forEach((sp) => {
      sp.classList.add("pulse");
      const ripple = document.createElement("div");
      ripple.className = "speaker-ripple";
      sp.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);
    });

    setTimeout(() => {
      left.classList.remove("pulse");
      right.classList.remove("pulse");
    }, 400);
  }

  function spawnFallingNote() {
    const layer = notesLayerRef.current;
    if (!layer) return;
    const noteEl = document.createElement("div");
    noteEl.className = "fall-note";
    noteEl.innerText =
      NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)];
    const size = 18 + Math.floor(Math.random() * 20);
    noteEl.style.fontSize = `${size}px`;
    const startX = window.innerWidth / 2 - 220 + Math.random() * 440;
    noteEl.style.left = `${startX}px`;
    noteEl.style.top = `-30px`;
    noteEl.style.color = randomNeonColor();
    const rot = Math.random() * 80 - 40;
    noteEl.style.transform = `rotate(${rot}deg)`;
    layer.appendChild(noteEl);

    setTimeout(() => noteEl.remove(), 4500);
  }

  function randomNeonColor() {
    const colors = ["#ff4dff", "#00f7ff", "#ffd966", "#7fff00", "#ff66b2"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function startStarfield(canvas: HTMLCanvasElement | null): number {
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    const DPR = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * DPR;
    canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(DPR, DPR);

    // Tạo sao nhỏ
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8,
      alpha: Math.random(),
      vy: 0.05 + Math.random() * 0.2,
    }));

    // Tạo các "nebula" lớn mô phỏng dải ngân hà
    const nebulae = Array.from({ length: 3 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: 400 + Math.random() * 300,
      hue: Math.floor(Math.random() * 360),
      rotation: Math.random() * 360,
      speed: 0.02 + Math.random() * 0.02,
    }));

    let shootingStar: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    } | null = null;
    let rafId = 0;

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Nền tối chuyển màu nhẹ
      const g = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      g.addColorStop(0, "#030012");
      g.addColorStop(1, "#0a0022");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Vẽ các nebula
      nebulae.forEach((n) => {
        n.rotation += n.speed;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        grad.addColorStop(0, `hsla(${n.hue}, 80%, 60%, 0.3)`);
        grad.addColorStop(1, "transparent");

        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate((n.rotation * Math.PI) / 180);
        ctx.translate(-n.x, -n.y);
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Vẽ sao nhỏ
      for (const s of stars) {
        s.alpha += (Math.random() - 0.5) * 0.05;
        s.alpha = Math.max(0, Math.min(1, s.alpha));
        ctx.beginPath();
        ctx.globalAlpha = s.alpha * 0.9;
        ctx.fillStyle = "white";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        s.y += s.vy;
        if (s.y > window.innerHeight + 10) s.y = -10;
      }

      // Sao băng
      if (!shootingStar && Math.random() < 0.005) {
        shootingStar = {
          x: Math.random() * window.innerWidth,
          y: -20,
          vx: -6,
          vy: 3,
          life: 80,
        };
      }
      if (shootingStar) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 2;
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x + 30, shootingStar.y - 10);
        ctx.stroke();
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.life--;
        if (shootingStar.life <= 0) shootingStar = null;
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    }
    draw();
    return rafId;
  }

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <canvas ref={starCanvasRef} className="absolute inset-0 w-full h-full" />
      <div
        ref={notesLayerRef}
        className="pointer-events-none absolute inset-0"
      ></div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex items-end justify-center w-full max-w-4xl px-6">
          <div className="speaker speaker-left mr-6">
            <div className="inner-ring"></div>
            <div className="grille"></div>
          </div>
          <div className="piano relative flex items-end justify-center bg-transparent p-4 rounded">
            <div className="keys flex select-none">
              {KEYS.map((k) => (
                <div
                  key={k.id}
                  className={`key relative flex items-end justify-center mx-1 rounded-md border border-gray-800 ${
                    activeKey === k.id ? "key-active" : ""
                  }`}
                  style={{
                    width: 50,
                    height: 160,
                    background:
                      activeKey === k.id
                        ? "linear-gradient(180deg,#ffea00,#ff7b00,#ff0080)"
                        : "linear-gradient(180deg,#ffffff,#dcdcdc)",
                    boxShadow:
                      activeKey === k.id
                        ? "0 0 25px #ff00ff, 0 0 50px #ff0080"
                        : "0 6px 18px rgba(0,0,0,0.5)",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div className="key-label mb-3 text-xs text-gray-900 font-bold">
                    {k.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="speaker speaker-right ml-6">
            <div className="inner-ring"></div>
            <div className="grille"></div>
          </div>
        </div>

        <div className="mt-2 text-center text-gray-300 opacity-80 text-sm">
          ✨ Đang tải — vui lòng chờ ✨
        </div>
      </div>

      <style>{`
        .speaker {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #222 0%, #111 70%, #000 100%);
  box-shadow: 
    0 0 20px rgba(0,0,0,0.6), 
    inset 0 4px 12px rgba(255,255,255,0.05),
    inset 0 -8px 20px rgba(0,0,0,0.7);
  overflow: hidden;
}
        .speaker::after {
  content: "";
  position: absolute;
  left: 50%; top: 50%;
  width: 50px; height: 50px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #555 0%, #222 70%, #000 100%);
  box-shadow: 
    0 0 10px rgba(0,0,0,0.6),
    inset 0 2px 4px rgba(255,255,255,0.2);
}
          .speaker::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.08);
  box-shadow: 
    0 0 15px rgba(0,255,255,0.15),
    0 0 35px rgba(0,255,255,0.2);
  pointer-events: none;
}
  .speaker .inner-ring {
  position: absolute;
  left: 50%; top: 50%;
  width: 80px; height: 80px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.06);
  box-shadow: inset 0 0 10px rgba(0,0,0,0.6);
  pointer-events: none;
}
  /* Lưới loa */
.speaker .grille {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 6px 6px;
  mix-blend-mode: overlay;
  pointer-events: none;
}
  /* Hiệu ứng rung */
.speaker.pulse {
  animation: speakerPulse 400ms ease;
}
        .speaker-ripple {
          position: absolute;
          top: 50%; left: 50%;
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.5);
          border-radius: 50%;
          transform: translate(-50%,-50%);
          animation: ripple 0.8s ease-out forwards;
        }
        canvas {
          filter: blur(0.3px) brightness(1.1);
        }
        @keyframes ripple {
          from { transform: translate(-50%,-50%) scale(1); opacity: 0.8; }
          to { transform: translate(-50%,-50%) scale(4); opacity: 0; }
        }

        .speaker.pulse { animation: speakerPulse 360ms ease; }
        @keyframes speakerPulse {
  0% { transform: scale(1); box-shadow: 0 0 25px rgba(0,255,255,0.3); }
  40% { transform: scale(1.1); box-shadow: 0 0 35px rgba(0,255,255,0.5); }
  100% { transform: scale(1); box-shadow: 0 0 20px rgba(0,255,255,0.3); }
}

        .fall-note {
          position: absolute;
          font-weight: bold;
          text-shadow: 0 0 8px currentColor, 0 0 20px currentColor;
          animation: fallMove 4s ease-in forwards;
          will-change: transform, opacity;
        }
        @keyframes fallMove {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          70% { transform: translateY(65vh) rotate(30deg); }
          100% { transform: translateY(110vh) rotate(60deg); opacity: 0; }
        }

        .key-active { transform: translateY(-8px) scale(1.05); }

      `}</style>
    </div>
  );
};

export default LoadingPage;
