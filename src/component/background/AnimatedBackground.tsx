export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div id="stars1" className="star-field"></div>
      <div id="stars2" className="star-field"></div>
      <div id="stars3" className="star-field"></div>

      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <style>{`
        /* Starfield Background */
        @keyframes move-stars {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
        .star-field {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 200%;
          background-repeat: repeat;
          background-position: 0 0;
          animation: move-stars 150s linear infinite;
        }
        #stars1 { background-image: url('https://www.transparenttextures.com/patterns/stardust.png'); opacity: 0.3; }
        #stars2 { background-image: url('https://www.transparenttextures.com/patterns/stardust.png'); opacity: 0.5; animation-duration: 100s; }
        #stars3 { background-image: url('https://www.transparenttextures.com/patterns/stardust.png'); opacity: 0.7; animation-duration: 75s; }

        /* Blob animation */
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 10s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        .animation-delay-2000 { animation-delay: -5s; }
      `}</style>
    </div>
  );
}
