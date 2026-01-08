import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  MessageCircle, 
  TrendingUp, 
  Clock,
  Users,
  BarChart3,
  Zap,
  Sparkles,
  Activity,
  Target,
  Flame
} from "lucide-react";

interface CommentData {
  id: string;
  timestamp: number; // Thời gian trong giây
  content: string;
  user: string;
  likes: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface HeatmapData {
  timestamp: number;
  commentCount: number;
  intensity: number; // 0-1
}

const HeatmapFeedbackPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 phút
  const [volume, setVolume] = useState(0.7);
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isHovering, setIsHovering] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Dữ liệu mẫu cho bản đồ nhiệt với độ tương phản cao
  const heatmapData: HeatmapData[] = [
    { timestamp: 15, commentCount: 12, intensity: 0.8 },
    { timestamp: 25, commentCount: 3, intensity: 0.2 },
    { timestamp: 45, commentCount: 8, intensity: 0.6 },
    { timestamp: 55, commentCount: 1, intensity: 0.1 },
    { timestamp: 78, commentCount: 25, intensity: 1.0 },
    { timestamp: 85, commentCount: 2, intensity: 0.15 },
    { timestamp: 95, commentCount: 18, intensity: 0.9 },
    { timestamp: 105, commentCount: 4, intensity: 0.3 },
    { timestamp: 120, commentCount: 15, intensity: 0.7 },
    { timestamp: 130, commentCount: 1, intensity: 0.1 },
    { timestamp: 145, commentCount: 22, intensity: 0.95 },
    { timestamp: 155, commentCount: 2, intensity: 0.2 },
    { timestamp: 160, commentCount: 10, intensity: 0.5 },
    { timestamp: 170, commentCount: 1, intensity: 0.1 },
  ];

  // Dữ liệu bình luận mẫu
  const comments: CommentData[] = [
    {
      id: "1",
      timestamp: 15,
      content: "Đoạn này hay quá! Beat drop mạnh mẽ",
      user: "MusicLover123",
      likes: 24,
      sentiment: "positive"
    },
    {
      id: "2", 
      timestamp: 15,
      content: "Cảm giác như đang ở club vậy",
      user: "DJ_Fan",
      likes: 18,
      sentiment: "positive"
    },
    {
      id: "3",
      timestamp: 78,
      content: "Đoạn này hơi lạc điệu, có thể cải thiện",
      user: "Producer_Pro",
      likes: 5,
      sentiment: "negative"
    },
    {
      id: "4",
      timestamp: 78,
      content: "Tôi thích phần bass này",
      user: "BassHead",
      likes: 12,
      sentiment: "positive"
    },
    {
      id: "5",
      timestamp: 145,
      content: "Outro tuyệt vời! Kết thúc hoàn hảo",
      user: "MusicCritic",
      likes: 31,
      sentiment: "positive"
    },
    {
      id: "6",
      timestamp: 25,
      content: "Đoạn này ổn",
      user: "Listener123",
      likes: 2,
      sentiment: "neutral"
    },
    {
      id: "7",
      timestamp: 55,
      content: "Hmm...",
      user: "Anonymous",
      likes: 1,
      sentiment: "neutral"
    },
    {
      id: "8",
      timestamp: 85,
      content: "Không có gì đặc biệt",
      user: "Critic_Pro",
      likes: 0,
      sentiment: "negative"
    },
    {
      id: "9",
      timestamp: 130,
      content: "OK",
      user: "User_456",
      likes: 1,
      sentiment: "neutral"
    }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return "from-red-300 via-red-500 to-red-700";
    if (intensity >= 0.6) return "from-orange-300 via-orange-500 to-orange-700";
    if (intensity >= 0.4) return "from-yellow-300 via-yellow-500 to-yellow-700";
    return "from-green-300 via-green-500 to-green-700";
  };

  const getIntensityGlow = (intensity: number) => {
    if (intensity >= 0.8) return "shadow-red-500/80 shadow-2xl";
    if (intensity >= 0.6) return "shadow-orange-500/70 shadow-xl";
    if (intensity >= 0.4) return "shadow-yellow-500/60 shadow-lg";
    return "shadow-green-500/50 shadow-md";
  };

  const getIntensityWidth = (intensity: number) => {
    if (intensity >= 0.8) return "6px";
    if (intensity >= 0.6) return "5px";
    if (intensity >= 0.4) return "4px";
    return "3px";
  };

  const getIntensityOpacity = (intensity: number) => {
    if (intensity >= 0.8) return "opacity-100";
    if (intensity >= 0.6) return "opacity-90";
    if (intensity >= 0.4) return "opacity-80";
    return "opacity-70";
  };

  // Tạo dữ liệu waveform giả
  const generateWaveformData = useCallback(() => {
    const data = [];
    for (let i = 0; i < 200; i++) {
      data.push(Math.random() * 0.8 + 0.1);
    }
    setWaveformData(data);
  }, []);

  // Vẽ waveform trên canvas
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
    gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.1)');
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Vẽ waveform
    const barWidth = width / waveformData.length;
    const centerY = height / 2;

    waveformData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = amplitude * height * 0.6;
      
      const barGradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
      barGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
      barGradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.9)');
      barGradient.addColorStop(1, 'rgba(236, 72, 153, 0.8)');
      
      ctx.fillStyle = barGradient;
      ctx.fillRect(x, centerY - barHeight, barWidth - 1, barHeight * 2);
    });
  }, [waveformData]);

  const getCommentsAtTime = (timestamp: number) => {
    return comments.filter(comment => 
      Math.abs(comment.timestamp - timestamp) <= 5
    );
  };

  const handleWaveformClick = (timestamp: number) => {
    setSelectedTimestamp(timestamp);
    if (audioRef.current) {
      audioRef.current.currentTime = timestamp;
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    generateWaveformData();
  }, [generateWaveformData]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      audio.addEventListener('timeupdate', updateTime);
      return () => audio.removeEventListener('timeupdate', updateTime);
    }
  }, []);

  useEffect(() => {
    const animate = () => {
      if (isPlaying) {
        drawWaveform();
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, drawWaveform]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#0f172a] dark:text-white transition-colors duration-300 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '2.5s' }}></div>
      </div>

      {/* Header với Glassmorphism */}
      <div className="bg-white/10 dark:bg-[#1F2937]/20 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 sticky top-[70px] z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Bản đồ nhiệt phản hồi
                </h1>
                <p className="text-gray-300 mt-1 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Phân tích phản hồi của người nghe trên sóng âm
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">{comments.length}</span>
                <span className="text-gray-300 text-sm">bình luận</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-white font-medium">{heatmapData.length}</span>
                <span className="text-gray-300 text-sm">điểm nóng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10 pt-[100px]">
        {/* Audio Player với Glassmorphism */}
        <div className="bg-white/10 dark:bg-[#1F2937]/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl mb-8 relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-pink-500/5 rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <button
                onClick={togglePlayPause}
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-medium text-white bg-white/10 backdrop-blur-md rounded-lg px-3 py-1">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 h-3 bg-white/20 rounded-full relative overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100 shadow-lg"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                  <span className="text-sm font-medium text-white bg-white/10 backdrop-blur-md rounded-lg px-3 py-1">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                <Volume2 className="w-5 h-5 text-purple-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-purple-500"
                />
              </div>
            </div>

            {/* Waveform với Canvas */}
            <div className="relative">
              <div className="h-32 bg-black/20 backdrop-blur-md rounded-2xl relative overflow-hidden border border-white/10">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={128}
                  className="w-full h-full rounded-2xl"
                />
                
                {/* Heatmap Overlay với hiệu ứng nổi bật */}
                {heatmapData.map((point, index) => {
                  const position = (point.timestamp / duration) * 100;
                  const width = getIntensityWidth(point.intensity);
                  return (
                    <div
                      key={index}
                      className="absolute top-0 bottom-0 cursor-pointer group"
                      style={{ left: `${position}%`, width }}
                      onClick={() => handleWaveformClick(point.timestamp)}
                      onMouseEnter={() => setIsHovering(index)}
                      onMouseLeave={() => setIsHovering(null)}
                    >
                      {/* Main heatmap bar */}
                      <div className={`w-full h-full bg-gradient-to-b ${getIntensityColor(point.intensity)} ${getIntensityOpacity(point.intensity)} hover:opacity-100 transition-all duration-300 ${getIntensityGlow(point.intensity)} ${isHovering === index ? 'scale-110' : ''} rounded-sm`} />
                      
                      {/* Glow effect overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-b ${getIntensityColor(point.intensity)} opacity-30 blur-sm ${isHovering === index ? 'opacity-50' : ''} transition-all duration-300`} />
                      
                      {/* Pulse animation for high intensity points */}
                      {point.intensity >= 0.8 && (
                        <div className="absolute inset-0 bg-gradient-to-b from-red-400 to-red-600 opacity-20 animate-pulse rounded-sm" />
                      )}
                      
                      {/* Enhanced Tooltip */}
                      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 transition-all duration-300 ${isHovering === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} pointer-events-none z-30`}>
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm px-4 py-3 rounded-xl whitespace-nowrap shadow-2xl border border-white/20 backdrop-blur-md">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3 h-3 rounded-full ${point.intensity >= 0.8 ? 'bg-red-500' : point.intensity >= 0.6 ? 'bg-orange-500' : point.intensity >= 0.4 ? 'bg-yellow-500' : 'bg-green-500'} shadow-lg`} />
                            <Target className="w-4 h-4 text-orange-400" />
                            <span className="font-bold">{point.commentCount} bình luận</span>
                          </div>
                          <div className="text-xs text-gray-300">
                            {formatTime(point.timestamp)} • Cường độ: {Math.round(point.intensity * 100)}%
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  );
                })}

                {/* Current Time Indicator với Animation */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-white to-purple-300 z-20 shadow-lg"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute -top-2 -left-2 w-5 h-5 bg-white rounded-full shadow-lg animate-pulse"></div>
                  <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-white rounded-full shadow-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Legend với Glassmorphism */}
        <div className="bg-white/10 dark:bg-[#1F2937]/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-red-500/5 rounded-3xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              Chú giải bản đồ nhiệt
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-b from-red-300 via-red-500 to-red-700 rounded-lg shadow-2xl shadow-red-500/80"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-red-400 to-red-600 opacity-20 animate-pulse rounded-lg"></div>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Rất nhiều</div>
                  <div className="text-gray-300 text-xs">80%+ • Pulse</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-b from-orange-300 via-orange-500 to-orange-700 rounded-lg shadow-xl shadow-orange-500/70"></div>
                <div>
                  <div className="text-white font-bold text-sm">Nhiều</div>
                  <div className="text-gray-300 text-xs">60-80% • Glow</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 rounded-lg shadow-lg shadow-yellow-500/60"></div>
                <div>
                  <div className="text-white font-bold text-sm">Trung bình</div>
                  <div className="text-gray-300 text-xs">40-60% • Medium</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-b from-green-300 via-green-500 to-green-700 rounded-lg shadow-md shadow-green-500/50"></div>
                <div>
                  <div className="text-white font-bold text-sm">Ít</div>
                  <div className="text-gray-300 text-xs">&lt;40% • Light</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section với Glassmorphism */}
        {selectedTimestamp && (
          <div className="bg-white/10 dark:bg-[#1F2937]/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  Bình luận tại {formatTime(selectedTimestamp)}
                </h3>
                <button
                  onClick={() => setSelectedTimestamp(null)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {getCommentsAtTime(selectedTimestamp).map((comment) => (
                  <div key={comment.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {comment.user.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium text-white">{comment.user}</span>
                          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${
                            comment.sentiment === 'positive' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            comment.sentiment === 'negative' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}>
                            {comment.sentiment === 'positive' ? 'Tích cực' : 
                             comment.sentiment === 'negative' ? 'Tiêu cực' : 'Trung tính'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/10 backdrop-blur-md rounded-lg px-3 py-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(comment.timestamp)}
                      </div>
                    </div>
                    <p className="text-gray-200 mb-3 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-lg px-3 py-1">
                        👍 {comment.likes}
                      </span>
                    </div>
                  </div>
                ))}
                
                {getCommentsAtTime(selectedTimestamp).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Không có bình luận nào tại thời điểm này</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statistics với Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 dark:bg-[#1F2937]/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl relative overflow-hidden hover:bg-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-white text-lg">Tổng bình luận</h4>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{comments.length}</p>
            </div>
          </div>
          
          <div className="bg-white/10 dark:bg-[#1F2937]/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl relative overflow-hidden hover:bg-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-white text-lg">Điểm nóng nhất</h4>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {formatTime(Math.max(...heatmapData.map(h => h.timestamp)))}
              </p>
            </div>
          </div>
          
          <div className="bg-white/10 dark:bg-[#1F2937]/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl relative overflow-hidden hover:bg-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-white text-lg">Tương tác cao nhất</h4>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {Math.max(...comments.map(c => c.likes))} likes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src="/src/assets/music/New-Beginnings-chosic.com_.mp3"
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 180)}
      />
    </div>
  );
};

export default HeatmapFeedbackPage;
