// import React, { useEffect, useRef } from "react";
import { useEffect, useRef } from "react";
import videoBackground from "../../assets/video/output_720p.webm";

const BackgroundVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Chỉ cần dùng IntersectionObserver để quản lý phát/tạm dừng
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Khi người dùng thấy, cố gắng phát
          video
            .play()
            .catch((err) =>
              console.log("Video must be visible/interacted with to play.", err)
            );
        } else {
          // Khi ra khỏi tầm nhìn, tạm dừng
          video.pause();
        }
      },
      { threshold: 0.1 } // Chỉ cần 10% video hiển thị
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="absolute top-0 left-0 right-1 h-full overflow-hidden z-0">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute top-0 left-0 w-full h-full min-w-full min-h-full transform-gpu object-cover translate-z-0 brightness-90"
      >
        <source src={videoBackground} type="video/webm" />
      </video>
    </div>
  );
};

export default BackgroundVideo;
