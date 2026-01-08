import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import musicUrl from "../assets/music/New-Beginnings-chosic.com_.mp3";

const MusicDisc: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(musicUrl);

    audioRef.current.loop = true;
  }, []);

  const startMusic = () => {
    audioRef.current
      ?.play()
      .then(() => {
        setIsPlaying(true);
        setShowPrompt(false);
      })
      .catch((err) => console.error("Lỗi phát nhạc:", err));
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const declineMusic = () => setShowPrompt(false);

  return (
    <>
      {/* Prompt hỏi ban đầu */}
      {showPrompt && (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-slide-up">
          <p className="text-gray-800 dark:text-gray-200 mb-3">
            🎵 Bạn có muốn nghe một bản nhạc không?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={declineMusic}
              className="px-3 py-1 text-sm rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Không
            </button>
            <button
              onClick={startMusic}
              className="px-3 py-1 text-sm rounded bg-purple-500 text-white hover:bg-purple-600"
            >
              Có
            </button>
          </div>
        </div>
      )}

      {/* Đĩa nhạc tròn (vinyl) */}
      {!showPrompt && (
        <div
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-50 cursor-pointer select-none"
          title={isPlaying ? "Click để tạm dừng" : "Click để phát"}
        >
          <div
            className={`relative w-24 h-24 rounded-full shadow-2xl ring-2 ring-purple-500/30 hover:ring-purple-400/60 transition-all duration-300 hover:scale-105 ${
              isPlaying ? "animate-spin-slow" : ""
            }`}
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, #0f1016, #0b0c12 60%), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)",
              backgroundBlendMode: "overlay",
            }}
          >
            {/* Glow */}
            <div className="absolute -inset-2 rounded-full bg-purple-500/20 blur-xl -z-10" />

            {/* Label (center circle) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 shadow-inner border border-white/20 flex items-center justify-center">
                {/* Icon centered */}
                <div className="w-5 h-5 text-white flex items-center justify-center leading-none">
                  {isPlaying ? (
                    <Pause className="w-full h-full" />
                  ) : (
                    <Play className="w-full h-full" />
                  )}
                </div>
              </div>
            </div>

            {/* Subtle outer edge */}
            <div className="absolute inset-0 rounded-full ring-1 ring-white/5" />
          </div>
        </div>
      )}
    </>
  );
};

export default MusicDisc;
