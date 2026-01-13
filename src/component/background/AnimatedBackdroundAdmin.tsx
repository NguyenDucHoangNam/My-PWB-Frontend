import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function AnimatedBackgroundAdmin({ isDark }: { isDark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationFrameId: number;
    
    // Cấu hình hạt particle
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    const numParticles = 100; // Giảm số lượng hạt cho thoáng

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Khởi tạo hạt
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5, // Tốc độ di chuyển rất chậm
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2,
      });
    }

    const render = () => {
      if (!ctx) return;
      
      // Xóa canvas thay vì vẽ đè màu đen => Để lộ màu nền CSS bên dưới
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Màu hạt dựa theo theme
      const particleColor = isDark 
        ? "rgba(255, 255, 255, 0.3)" // Trắng mờ trên nền tối
        : "rgba(99, 102, 241, 0.3)"; // Indigo mờ trên nền sáng

      ctx.fillStyle = particleColor;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cập nhật vị trí
        p.x += p.vx;
        p.y += p.vy;

        // Nếu hạt đi ra ngoài màn hình thì đưa nó quay lại phía đối diện
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Vẽ hạt
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]); // Re-render khi đổi theme

  return (
    <div
      className={`fixed inset-0 overflow-hidden -z-10 transition-colors duration-700 ${
        isDark 
          ? "bg-slate-950" // Dùng Slate-950 thay vì Black tuyền (đỡ gắt mắt)
          : "bg-slate-50"  // Dùng Slate-50 thay vì White (dịu mắt hơn)
      }`}
    >
      {/* Lớp Canvas: Hạt trôi nhẹ */}
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* Lớp Overlay Gradient tĩnh: Tạo chiều sâu vignette ở góc */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? "bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.8)_100%)]"
            : "bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(255,255,255,0.8)_100%)]"
        }`}
      />

      {/* Hiệu ứng đèn (Orb) - Làm chậm lại và giảm opacity */}
      <motion.div
        className={`absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-30 pointer-events-none ${
           isDark ? "bg-indigo-500/20" : "bg-blue-300/30"
        }`}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20, // Rất chậm
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className={`absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full blur-[100px] opacity-30 pointer-events-none ${
           isDark ? "bg-purple-500/20" : "bg-indigo-300/30"
        }`}
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25, // Rất chậm
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}