import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import astronautAnimation from "../assets/astronaut-floating.json";

const NotFoundPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Hiệu ứng sao bay 3D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animationFrameId: number;
    const stars: { x: number; y: number; z: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
      });
    }

    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 20, 0.25)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.z -= 2;
        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }

        const k = 128.0 / star.z;
        const px = star.x * k + canvas.width / 2 - 128;
        const py = star.y * k + canvas.height / 2 - 128;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - star.z / canvas.width) * 3;
          ctx.fillStyle = `rgba(147, 51, 234, ${1 - star.z / canvas.width})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen text-white overflow-hidden bg-black">
      {/* Nền sao */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>

      {/* Lớp phủ ánh sáng gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-black"></div>

      {/* Hiệu ứng vầng sáng quanh 404 */}
      <div className="absolute w-[700px] h-[700px] bg-purple-600/20 blur-[120px] rounded-full animate-[pulseGlow_6s_ease-in-out_infinite]"></div>

      {/* Phi hành gia trôi lơ lửng */}
      <div
        className="absolute right-[15%] bottom-[35%] w-56 md:w-72 opacity-90 animate-[orbitAstronaut_18s_ease-in-out_infinite]"
        style={{ transformOrigin: "center center" }}
      >
        <Lottie animationData={astronautAnimation} loop />
      </div>

      {/* Nội dung chính */}
      <div className="z-10 flex flex-col items-center text-center px-6">
        <h1
          className="relative font-extrabold tracking-widest select-none 
          text-[6rem] md:text-[10rem] 
          text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500
          drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]
          animate-[glitch_1.5s_infinite]"
        >
          404
        </h1>

        <p className="text-lg md:text-2xl text-gray-300 mt-4 mb-10 max-w-lg leading-relaxed">
          🚀 Kết nối đến vũ trụ đã bị gián đoạn...  
          <br /> Phi hành gia ơi, bạn đang trôi dạt trong không gian mạng 🌌
        </p>

        <Link
          to="/"
          className="relative inline-flex items-center justify-center px-10 py-4 font-semibold text-lg rounded-full overflow-hidden
          bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
          hover:scale-110 hover:shadow-[0_0_30px_10px_rgba(168,85,247,0.4)]
          transition-all duration-500"
        >
          <span className="z-10 relative">🪐 Trở về Trái Đất</span>
          <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-500 blur-2xl transition-opacity duration-700"></div>
        </Link>
      </div>

      {/* Các hành tinh */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-screen opacity-30 animate-[floatPlanet_25s_linear_infinite]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${100 + Math.random() * 150}px`,
              height: `${100 + Math.random() * 150}px`,
              background: `radial-gradient(circle at center, rgba(${
                120 + i * 20
              }, ${60 + i * 30}, 255, 0.8), transparent 70%)`,
              animationDelay: `${i * 4}s`,
            }}
          ></div>
        ))}
      </div>

      {/* CSS Custom Animations */}
      <style>{`
        @keyframes glitch {
          0% { text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; }
          20% { text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff; }
          40% { text-shadow: 2px 2px #ff00ff, -2px -2px #00ffff; }
          60% { text-shadow: -2px -2px #ff00ff, 2px 2px #00ffff; }
          80% { text-shadow: 1px -2px #ff00ff, -1px 2px #00ffff; }
          100% { text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }

        @keyframes floatPlanet {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-40px) rotate(180deg); opacity: 0.8; }
          100% { transform: translateY(0) rotate(360deg); opacity: 0.5; }
        }

        @keyframes orbitAstronaut {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -50px) rotate(10deg); }
          50% { transform: translate(-30px, -80px) rotate(-10deg); }
          75% { transform: translate(-50px, 20px) rotate(5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
