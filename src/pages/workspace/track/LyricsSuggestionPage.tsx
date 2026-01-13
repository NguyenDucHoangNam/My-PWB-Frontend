// LyricsSuggestionPage.tsx
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BeatToLyricsRequest,
  deleteTrack,
  generateLyricsFromBeat,
  getTrackSuggestion,
  TrackSuggestionResponse,
  uploadTrackMultipart,
} from "@/services/boardService";
import { useCosmicToast } from "@/component/toast/CosmicToastProvider";
import AnimatedBackground from "@/component/background/AnimatedBackground";
import ProjectTrackList from "@/component/project/trackGenerate/TrackList";
import BackToProjectButton from "@/component/buttons/BackToProjectButton";

export default function LyricsSuggestionPage() {
  const { showToast } = useCosmicToast();
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get("projectId");
  const projectId = projectIdParam ? Number(projectIdParam) : null;

  // File / track states
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [trackId, setTrackId] = useState<number | null>(null);

  // UI states
  const [isUploading, setUploading] = useState(false);
  const [isGenerating, setGenerating] = useState(false);
  const [resuggesting, setResuggesting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // form for lyrics generation
  const [topic, setTopic] = useState<string>("");
  const [keywordsText, setKeywordsText] = useState<string>(""); // comma-separated input
  const [mood, setMood] = useState<string>("");
  const [structureText, setStructureText] = useState<string>(""); // comma-separated input
  // Temperature setting - currently unused but kept for future use
  // const [temperature, setTemperature] = useState<number>(0.7);

  // result
  const [lyricsSuggestion, setLyricsSuggestion] =
    useState<TrackSuggestionResponse | null>(null);

  // audio + waveform
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const animRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [positionSec, setPositionSec] = useState(0);

  // ================= API helpers =================
  const pollSuggestionUntilReady = async (trackId: string | number) => {
    const trackIdNum = typeof trackId === "string" ? Number(trackId) : trackId;
    let suggestion = await getTrackSuggestion(trackIdNum);
    while (
      suggestion.status === "TRANSCRIBING" ||
      suggestion.status === "SUGGESTING"
    ) {
      await new Promise((r) => setTimeout(r, 2500));
      suggestion = await getTrackSuggestion(trackIdNum);
    }
    return suggestion;
  };

  // ================= Upload on file select =================
  const handleFileChange = async (file: File | null) => {
    setMusicFile(file);
    setLyricsSuggestion(null);
    setTrackId(null);

    // Reset form inputs
    setTopic("");
    setKeywordsText("");
    setMood("");
    setStructureText("");
    // Temperature setting removed - was unused

    if (!file) return;

    if (!projectId) {
      showToast(
        "Không xác định được project. Vui lòng mở trang với projectId.",
        "error"
      );
      return;
    }

    // start upload immediately
    try {
      setUploading(true);
      showToast("🚀 Đang tải file lên...", "info");

      const uploadRes = await uploadTrackMultipart(projectId, file, file.type);

      setTrackId(uploadRes.trackId);
      showToast(
        "🎧 Upload thành công! Nhập thông tin để tạo lyrics.",
        "success"
      );
    } catch (err) {
      console.error("Upload error", err);
      showToast("🚨 Upload thất bại!", "error");
    } finally {
      setUploading(false);
    }
  };

  // ================= Generate lyrics =================
  const handleGenerateLyrics = async () => {
    if (!trackId) return showToast("Chưa upload track!", "error");
    if (!projectId) return showToast("Không xác định project!", "error");

    const keywords = keywordsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const structure = structureText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const req: BeatToLyricsRequest = {
      projectId: Number(projectId),
      topic,
      keywords,
      mood,
      structure,
      temperature: 0.8,
    };

    try {
      setGenerating(true);
      showToast("🌌 AI đang tạo lyrics...", "info");

      const suggestion = await generateLyricsFromBeat(trackId, req);

      // If AI suggestion may be async (SUGGESTING), poll to completion
      if (
        suggestion.status === "SUGGESTING" ||
        suggestion.status === "TRANSCRIBING"
      ) {
        const final = await pollSuggestionUntilReady(trackId);
        setLyricsSuggestion(final);
      } else {
        setLyricsSuggestion(suggestion);
      }

      showToast("✨ AI đã tạo lyrics!", "success");
    } catch (err) {
      console.error("Generate error", err);
      showToast("🚨 Tạo lyrics thất bại!", "error");
    } finally {
      setGenerating(false);
    }
  };

  // ================= Resuggest / Delete =================
  const handleResuggest = async () => {
    if (!trackId || !projectId) return;

    try {
      setResuggesting(true);
      showToast("AI đang suy nghĩ lại...", "info");

      const keywords = keywordsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const structure = structureText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const req: BeatToLyricsRequest = {
        projectId,
        topic,
        keywords,
        mood,
        structure,
        temperature: 0.8,
      };

      const suggestion = await generateLyricsFromBeat(trackId, req);

      const finalSuggestion =
        suggestion.status === "SUGGESTING" ||
        suggestion.status === "TRANSCRIBING"
          ? await pollSuggestionUntilReady(trackId)
          : suggestion;

      setLyricsSuggestion(finalSuggestion);
      showToast("✨ AI đã cập nhật lời mới!", "success");
    } catch (err) {
      console.error(err);
      showToast("Gợi ý lại thất bại.", "error");
    } finally {
      setResuggesting(false);
    }
  };

  const handleDelete = async () => {
    const idToDelete = lyricsSuggestion?.trackId ?? trackId;
    if (!idToDelete) return showToast("Không có track để xóa", "error");
    try {
      setDeleting(true);
      showToast("Đang xóa...", "info");
      await deleteTrack(idToDelete);
      setLyricsSuggestion(null);
      setMusicFile(null);
      setTrackId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("🗑️ Đã xóa track!", "success");
    } catch (err) {
      console.error(err);
      showToast("Xóa thất bại.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ================= Parse AI text helper =================
  const parseAiText = () => {
    if (!lyricsSuggestion?.aiSuggestions) return "Không có dữ liệu";
    try {
      const aiObj = JSON.parse(lyricsSuggestion.aiSuggestions);
      // Lấy tất cả các line trong sections
      const fullLines = aiObj.sections?.flatMap((s: any) => s.lines) || [];
      return fullLines.join("\n") || "Không có dữ liệu";
    } catch {
      return "Không có dữ liệu";
    }
  };

  // ================= Audio & Waveform handling =================
  useEffect(() => {
    if (!musicFile) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const arrayBuffer = ev.target?.result as ArrayBuffer;
        const audioCtx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
        audioBufferRef.current = decoded;
        setDurationSec(decoded.duration);

        const blob = new Blob([arrayBuffer], { type: musicFile.type });
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.load();
        }
        drawWave(decoded);
      } catch (err) {
        console.error("Wave decode error", err);
      }
    };
    reader.readAsArrayBuffer(musicFile);

    return () => {
      if (audioRef.current?.src?.startsWith?.("blob:")) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, [musicFile]);

  const drawWave = (buffer: AudioBuffer, currentTime = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const raw = buffer.getChannelData(0);
    const width = (canvas.width =
      canvas.offsetWidth * (window.devicePixelRatio || 1));
    const height = (canvas.height = 80 * (window.devicePixelRatio || 1));
    const steps = 1200;
    const step = Math.max(1, Math.floor(raw.length / steps));
    const middleY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "rgba(100, 100, 200, 0.08)";
    ctx.lineWidth = 0.5 * (window.devicePixelRatio || 1);
    ctx.beginPath();
    ctx.moveTo(0, middleY);
    ctx.lineTo(width, middleY);
    ctx.stroke();

    // Wave base
    ctx.strokeStyle = "rgba(170,120,255,0.18)";
    ctx.lineWidth = 1.2 * (window.devicePixelRatio || 1);
    ctx.beginPath();
    for (let i = 0; i < steps; i++) {
      let min = 1.0,
        max = -1.0;
      const sliceStart = i * step;
      for (let j = 0; j < step; j++) {
        const idx = sliceStart + j;
        if (idx >= raw.length) break;
        const v = raw[idx];
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const x = (i / steps) * width;
      const y = (1 + (min + max) / 2) * 0.5 * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Highlight played part
    const playIdx = Math.floor((currentTime / buffer.duration) * steps);
    const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
    waveGrad.addColorStop(0, "rgba(150, 50, 255, 0.95)");
    waveGrad.addColorStop(1, "rgba(50, 255, 200, 0.95)");

    ctx.strokeStyle = waveGrad;
    ctx.beginPath();
    for (let i = 0; i <= playIdx; i++) {
      let min = 1.0,
        max = -1.0;
      const sliceStart = i * step;
      for (let j = 0; j < step; j++) {
        const idx = sliceStart + j;
        if (idx >= raw.length) break;
        const v = raw[idx];
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const x = (i / steps) * width;
      const y = (1 + (min + max) / 2) * 0.5 * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Playhead
    const playheadX = (currentTime / buffer.duration) * width;
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5 * (window.devicePixelRatio || 1);
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  };

  const animateWave = () => {
    if (!audioRef.current || !audioBufferRef.current) return;
    drawWave(audioBufferRef.current, audioRef.current.currentTime);
    animRef.current = requestAnimationFrame(animateWave);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    try {
      if (!isPlaying) {
        await audioRef.current.play();
        setIsPlaying(true);
        if (animRef.current) cancelAnimationFrame(animRef.current);
        animRef.current = requestAnimationFrame(animateWave);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
        if (animRef.current) {
          cancelAnimationFrame(animRef.current);
          animRef.current = null;
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setIsPlaying(false);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  useEffect(() => {
    let rafId: number | null = null;

    const updatePosition = () => {
      if (audioRef.current) {
        setPositionSec(audioRef.current.currentTime);
        rafId = requestAnimationFrame(updatePosition);
      }
    };

    if (isPlaying) rafId = requestAnimationFrame(updatePosition);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isPlaying]);

  const handleWaveClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioRef.current || !audioBufferRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / rect.width;
    const newTime =
      Math.max(0, Math.min(1, ratio)) * audioBufferRef.current.duration;

    audioRef.current.currentTime = newTime;
    drawWave(audioBufferRef.current, newTime);
    setPositionSec(newTime);
  };

  // ================= Render =================
  return (
    <div className="min-h-screen w-full relative text-white overflow-x-hidden bg-gradient-to-b from-[#0B0C1A] via-[#120D2E] to-[#050514]">
      <AnimatedBackground />

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-28">
        <h1 className="text-5xl font-extrabold tracking-tight text-center mb-6 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 animate-text-shimmer">
          <span className="text-white/90">🪐</span> Trạm Ý Tưởng{" "}
          <span className="text-white/90">Âm Nhạc</span>
        </h1>
        <div className="absolute top-[80px] left-7">
          <BackToProjectButton />
        </div>
        {/* --- Project Track List --- */}
        {projectId && (
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-tr from-white/5 to-white/2 border border-white/10">
            <h2 className="text-lg font-bold mb-4 text-white/80">
              🎶 Danh sách track trong Project
            </h2>
            <ProjectTrackList projectId={projectId} />
          </div>
        )}
        <motion.div
          layout
          className={`mt-12 flex flex-col lg:flex-row gap-8 items-start ${
            lyricsSuggestion ? "justify-start" : "justify-center"
          }`}
          transition={{ type: "spring", stiffness: 50, damping: 25 }}
        >
          {/* Left panel: uploader + waveform + controls */}
          <motion.div layout className="w-[500px] max-w-full space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-[#5C00FF]/70 via-[#FF0080]/60 to-[#00FFE0]/50 border border-cyan-400/40 shadow-[0_0_80px_rgba(0,255,255,0.5),0_0_30px_rgba(255,50,200,0.3)] backdrop-blur-xl transition-all hover:scale-[1.03]">
              <h2 className="text-lg font-bold text-white mb-4 tracking-wider text-glow-purple">
                🚀 Trạm Điều Khiển Tàu Nhạc
              </h2>

              {/* Hidden input + label */}
              <input
                ref={fileInputRef}
                id="music-upload"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                disabled={isUploading}
              />
              <label
                htmlFor="music-upload"
                className={`w-full inline-block mb-2 py-3 px-6 rounded-full cursor-pointer text-white text-center font-semibold shadow-lg transition-all duration-300 ${
                  isUploading
                    ? "opacity-60 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:scale-105 hover:brightness-110"
                }`}
              >
                {isUploading ? "⏳ Đang upload..." : "🎵 Chọn âm thanh"}
              </label>

              {musicFile && (
                <p className="text-xs text-gray-200 mt-2">
                  📎{" "}
                  <span className="text-cyan-300 font-medium">
                    {musicFile.name}
                  </span>
                </p>
              )}

              {/* waveform */}
              <div className="relative rounded-xl overflow-hidden border border-white/20 bg-gradient-to-b from-[#0C0015]/30 via-[#1A002F]/50 to-[#000000]/40 p-3 mb-4 shadow-[0_0_40px_rgba(200,100,255,0.5)]">
                <canvas
                  ref={canvasRef}
                  className="w-full h-28 block cursor-pointer"
                  onClick={handleWaveClick}
                />
                <div className="flex justify-between items-center mt-2 text-xs text-gray-300">
                  <button
                    onClick={togglePlay}
                    className="px-3 py-1 bg-purple-700/70 rounded-full text-white font-medium shadow transition-all duration-200"
                  >
                    {isPlaying ? "⏸️ Tạm dừng tàu" : "▶️ Phóng tàu"}
                  </button>
                  {durationSec && (
                    <span className="font-mono text-gray-200">
                      {Math.floor(positionSec)}s / {Math.floor(durationSec)}s
                    </span>
                  )}
                  <div className="flex justify-center gap-3 mt-2">
                    <button
                      onClick={() => {
                        if (audioRef.current)
                          audioRef.current.currentTime = Math.max(
                            audioRef.current.currentTime - 10,
                            0
                          );
                      }}
                      className="px-3 py-1 bg-purple-700/60 rounded-full text-white font-medium"
                    >
                      ⏪ 10s
                    </button>
                    <button
                      onClick={() => {
                        if (audioRef.current && audioBufferRef.current)
                          audioRef.current.currentTime = Math.min(
                            audioRef.current.currentTime + 10,
                            audioBufferRef.current.duration
                          );
                      }}
                      className="px-3 py-1 bg-purple-700/60 rounded-full text-white font-medium"
                    >
                      10s ⏩
                    </button>
                  </div>
                </div>
              </div>

              {/* If track not uploaded yet, show small hint + upload state */}
              {!trackId && (
                <div className="text-sm text-gray-300 mb-2">
                  <p>
                    Chọn 1 file âm thanh để tự động upload và sau đó nhập thông
                    tin để tạo lyrics.
                  </p>
                </div>
              )}

              {/* If uploaded, allow delete of track or re-upload */}
              {trackId && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    className="flex-1 py-2 rounded-md bg-white/8 text-white"
                  >
                    🔁 Tải lại file
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right panel: form / preview */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-6 max-w-[600px]">
            {/* Form shown after upload */}
            {trackId && !lyricsSuggestion && (
              <div className="p-6 rounded-2xl bg-gradient-to-tr from-white/3 to-white/2 border border-white/10">
                <h3 className="text-lg font-bold mb-3">
                  Nhập thông tin để tạo lyrics
                </h3>

                <div className="space-y-3">
                  <input
                    className="w-full p-3 rounded-md bg-white/5 text-white"
                    placeholder="Topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <input
                    className="w-full p-3 rounded-md bg-white/5 text-white"
                    placeholder="Keywords (ngăn cách bởi ,)"
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                  />
                  <input
                    className="w-full p-3 rounded-md bg-white/5 text-white"
                    placeholder="Mood"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                  />
                  <textarea
                    className="w-full p-3 rounded-md bg-white/5 text-white"
                    placeholder="Structure (ví dụ: intro,verse,chorus)"
                    value={structureText}
                    onChange={(e) => setStructureText(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleGenerateLyrics}
                      disabled={isGenerating}
                      className="flex-1 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-500"
                    >
                      {isGenerating
                        ? "🛸 Đang tạo..."
                        : "✨ Khám phá lời từ AI"}
                    </button>
                    <button
                      onClick={() => {
                        setTrackId(null);
                        setMusicFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="py-3 px-4 rounded-2xl bg-white/6 text-white"
                    >
                      🔙 Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Show suggestion preview when available */}
            {lyricsSuggestion && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-gradient-to-tr from-purple-900/40 via-purple-800/30 to-purple-700/20 border border-purple-500/30">
                  <h3 className="text-purple-300 font-bold mb-2">
                    🎵 Lời nhạc gốc
                  </h3>
                  <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono max-h-[270px] overflow-y-auto p-2">
                    {lyricsSuggestion.lyricsText || "Không có"}
                  </pre>
                </div>

                <div className="p-5 rounded-3xl bg-gradient-to-tr from-cyan-900/40 via-cyan-800/30 to-cyan-700/20 border border-cyan-500/30">
                  <h3 className="text-cyan-300 font-bold mb-2">
                    🤖 Lời nhạc AI
                  </h3>
                  <pre className="whitespace-pre-wrap text-sm text-gray-100 font-mono max-h-[270px] overflow-y-auto p-2">
                    {parseAiText()}
                  </pre>
                </div>

                <div className="md:col-span-2 flex gap-3 mt-2">
                  <button
                    onClick={handleResuggest}
                    disabled={resuggesting}
                    className="flex-1 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400"
                  >
                    {resuggesting ? "🛰️ Đang gợi ý..." : "🔄 Gợi ý lại"}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-red-600 via-pink-500 to-purple-500"
                  >
                    {deleting ? "💥 Đang xóa..." : "🗑️ Xóa"}
                  </button>
                </div>
              </div>
            )}

            {/* If not uploaded and not choosing file (fallback small controls) */}
            {!trackId && (
              <div className="p-4 text-center text-sm text-gray-400">
                <p>
                  Chọn file âm thanh để bắt đầu. Sau khi upload xong bạn sẽ thấy
                  form nhập để tạo lyrics.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <audio ref={audioRef} />
    </div>
  );
}
