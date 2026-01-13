import { useRef, useState } from "react";

type HoverCardProps = {
  avatarUrl: string;
  fullName: string;
  headline: string;
  followers: number;
};

export default function HoverCard({ avatarUrl, fullName, headline, followers }: HoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState("rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // vị trí chuột so với thẻ
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 10; // góc X
    const rotateY = ((x - centerX) / centerX) * 10; // góc Y
    setTransformStyle(`rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle("rotateX(0deg) rotateY(0deg)");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-80 h-48 bg-gray-800/30 backdrop-blur-md border border-purple-500/20 rounded-2xl shadow-xl shadow-purple-900/50 relative cursor-pointer transition-transform duration-300 hover:shadow-[0_0_30px_rgba(167,139,250,0.7),0_0_60px_rgba(0,240,255,0.5)]"
      style={{ transform: transformStyle, perspective: "1000px" }}
    >
      {/* Avatar */}
      <img
        src={avatarUrl}
        alt={fullName}
        className="w-20 h-20 rounded-xl border-4 border-purple-400 shadow-lg absolute -top-10 left-4"
      />

      {/* Info */}
      <div className="absolute top-4 left-28 flex flex-col justify-center h-full">
        <h2 className="text-white text-xl font-bold">{fullName}</h2>
        <p className="text-cyan-400 text-sm">{headline}</p>
        <p className="text-gray-300 text-xs mt-1">{followers} followers</p>
      </div>

      {/* Glow hiệu ứng neon background */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
           style={{
             background: "radial-gradient(circle at 30% 30%, rgba(167,139,250,0.3), transparent 60%), radial-gradient(circle at 70% 70%, rgba(0,240,255,0.2), transparent 60%)"
           }}
      ></div>
    </div>
  );
}
