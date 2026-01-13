import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  MessageCircle,
  UserPlus,
  UserMinus,
  Play,
  Pause,
  Loader2,
  Edit,
  Plus,
} from "lucide-react";
import SocialIcon from "../../component/SocialIcon";
import { portfolioService } from "../../services/portfolioService";
import type { PortfolioResponse } from "../../services/portfolioService";
import { followService } from "../../services/followService";
import { useGlobalChat } from "@/component/chat/GlobalChatWidget";
import { FollowListModal } from "../../component/FollowListModal";
import { ROUTER } from "../../routes/router";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedBackground from "@/component/background/AnimatedBackground";
import { getPortfolioUrl } from "../../utils/portfolioUtils";

type PortfolioProject = {
  id: number;
  title: string;
  coverArt: string;
  audioDemo: string;
  description: string;
  releaseYear?: number;
};

type SystemProjectReview = {
  clientName: string;
  clientAvatar: string;
  rating: number;
  comment: string;
};

type SystemProject = PortfolioProject & {
  review: SystemProjectReview;
};

// Sub-components
const StarRating = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount?: number;
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={16}
            fill="currentColor"
            className="stroke-1 text-yellow-300"
          />
        ))}
        {hasHalfStar && (
          <Star
            key="half"
            size={16}
            fill="currentColor"
            className="stroke-1 text-yellow-300"
          />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={16}
            className="text-gray-600 stroke-1"
          />
        ))}
      </div>
      {reviewCount && (
        <span className="ml-2 text-sm text-gray-300 font-medium">
          {rating.toFixed(1)}{" "}
          <span className="text-gray-500">({reviewCount})</span>
        </span>
      )}
    </div>
  );
};

// Global ref to track currently playing audio
let currentPlayingAudio: HTMLAudioElement | null = null;

const AudioPlayer = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (currentPlayingAudio === audioRef.current) {
          currentPlayingAudio = null;
        }
      } else {
        // Pause any currently playing audio
        if (currentPlayingAudio && currentPlayingAudio !== audioRef.current) {
          currentPlayingAudio.pause();
          // Reset other audio players' state by triggering a custom event
          currentPlayingAudio.dispatchEvent(new Event('pause'));
        }
        // Play this audio
        audioRef.current.play();
        setIsPlaying(true);
        currentPlayingAudio = audioRef.current;
      }
    }
  };

  // Listen for pause events from other players
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePause = () => {
      if (audio !== currentPlayingAudio) {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('pause', handlePause);
    return () => {
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => {
          setIsPlaying(false);
          if (currentPlayingAudio === audioRef.current) {
            currentPlayingAudio = null;
          }
        }}
      />
      <button
        onClick={togglePlay}
        className="bg-purple-600/40 backdrop-blur-sm text-white rounded-full h-12 w-12 flex items-center justify-center ring-2 ring-purple-400/50 hover:ring-purple-400/80 transition-all shadow-xl shadow-purple-900/50"
      >
        {isPlaying ? (
          <Pause size={24} />
        ) : (
          <Play size={24} className="ml-0.5" />
        )}
      </button>
    </>
  );
};

const ProjectCard = ({
  project,
}: {
  project: PortfolioProject | SystemProject;
}) => (
  <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-500/10 transition-all duration-300 hover:border-purple-400/40 hover:shadow-purple-500/20 shadow-xl neon-glow-hover">
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/3 relative">
        <img
          src={project.coverArt}
          alt={project.title}
          className="w-full h-48 md:h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <AudioPlayer src={project.audioDemo} />
        </div>
      </div>
      <div className="md:w-2/3 p-6 flex flex-col">
        <div>
          <h3 className="text-2xl font-extrabold text-white mt-1 mb-2">
            {project.title}
          </h3>
          <p className="text-gray-300 text-sm mt-1 flex-grow">
            {project.description}
          </p>
        </div>
        {"review" in project && (
          <div className="mt-5 pt-4 border-t border-purple-500/20">
            <div className="flex items-start gap-3">
              <img
                src={project.review.clientAvatar}
                alt={project.review.clientName}
                className="h-10 w-10 rounded-full object-cover border-2 border-cyan-400"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-cyan-400">
                    {project.review.clientName}
                  </span>
                  <StarRating rating={project.review.rating} />
                </div>
                <p className="text-sm text-gray-400 italic mt-1">
                  "{project.review.comment}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Helper function to transform PortfolioResponse to display format
const transformPortfolioData = (data: PortfolioResponse) => {
  const fullName =
    `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown";
  const coverUrl =
    data.coverImageUrl ||
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop";
  const avatarUrl = data.avatarUrl || "https://i.pravatar.cc/200";

  const platformMap: Record<
    string,
    "Spotify" | "SoundCloud" | "YouTube" | "Facebook" | "Instagram"
  > = {
    SPOTIFY: "Spotify",
    SOUNDCLOUD: "SoundCloud",
    YOUTUBE: "YouTube",
    FACEBOOK: "Facebook",
    INSTAGRAM: "Instagram",
  };

  const socialLinks = (data.socialLinks || [])
    .map((link) => {
      const platformKey = link.platform.toUpperCase();
      const mappedPlatform = platformMap[platformKey] || link.platform;
      return {
        platform: mappedPlatform as
          | "Spotify"
          | "SoundCloud"
          | "YouTube"
          | "Facebook"
          | "Instagram",
        url: link.url,
      };
    })
    .filter((link) => link.platform);

  const portfolioProjects = (data.personalProjects || []).map((project) => ({
    id: project.id,
    title: project.title,
    coverArt:
      project.coverImageUrl ||
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop",
    audioDemo: project.audioDemoUrl || "/api/placeholder/audio.mp3",
    description: project.description || "",
    releaseYear: project.releaseYear,
  }));

  const location =
    data.latitude && data.longitude
      ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`
      : "Chưa cập nhật";

  const sortedSections = [...(data.sections || [])].sort((a, b) => {
    const orderA = a.displayOrder ?? a.order ?? 0;
    const orderB = b.displayOrder ?? b.order ?? 0;
    return orderA - orderB;
  });

  const introduction =
    sortedSections.length > 0
      ? sortedSections[0].content || ""
      : "Chưa có thông tin giới thiệu.";

  const stats = {
    systemProjects: 0,
    totalProjects: portfolioProjects.length,
    rating: 0,
    reviewCount: 0,
  };

  return {
    fullName,
    headline: data.headline || "Chưa có tiêu đề",
    avatarUrl,
    coverUrl,
    socialLinks,
    portfolioProjects,
    location,
    introduction,
    genres: data.genres || [],
    tags: data.tags || [],
    sections: sortedSections,
    stats,
    systemProjects: [] as SystemProject[],
  };
};

// Main Component
export default function PortfolioPage() {
  const navigate = useNavigate();
  const { userId, slug } = useParams<{ userId?: string; slug?: string }>();
  const [activeTab, setActiveTab] = useState<"portfolio" | "system">(
    "portfolio"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState<PortfolioResponse | null>(
    null
  );
  const [displayData, setDisplayData] = useState<ReturnType<
    typeof transformPortfolioData
  > | null>(null);
  const [hasPortfolio, setHasPortfolio] = useState<boolean | null>(null);
  const { userRole, isAuthenticated } = useAuth();

  // Follow state (only for visitors)
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followStats, setFollowStats] = useState({
    totalFollowers: 0,
    totalFollowing: 0,
  });
  const [followStatsLoading, setFollowStatsLoading] = useState(false);

  // Modal state
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Use GlobalChatWidget instead of local chat popup
  const { openChatWithUser } = useGlobalChat();

  // Determine if this is personal portfolio page (no userId/slug params)
  const isPersonalPage = !userId && !slug;

  // Determine if current user is the owner
  const isOwner =
    portfolioData && currentUserId
      ? portfolioData.userId === currentUserId
      : false;

  // Is Customer
  const isCustomer = userRole === "CUSTOMER";

  // Fetch current user ID only if authenticated (not needed for viewing others' portfolios)
  useEffect(() => {
    // Only fetch current user ID if authenticated and needed (personal page or to check ownership)
    if (!isAuthenticated) {
      setCurrentUserId(null);
      return;
    }

    const fetchCurrentUserId = async () => {
      try {
        const personalPortfolio = await portfolioService.getPersonalPortfolio();
        setCurrentUserId(personalPortfolio.userId);
      } catch (error) {
        // If user doesn't have a portfolio or not logged in, that's okay
        // This is fine - user might not have portfolio yet or might be viewing someone else's
        setCurrentUserId(null);
      }
    };
    fetchCurrentUserId();
  }, [isAuthenticated]);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      setIsLoading(true);
      try {
        let data: PortfolioResponse;

        if (isPersonalPage) {
          // Personal portfolio page
          try {
            data = await portfolioService.getPersonalPortfolio();
            setHasPortfolio(true);

            // If portfolio has slug, redirect to slug URL
            if (data.customUrlSlug && data.customUrlSlug.trim()) {
              const slugUrl = getPortfolioUrl(data.userId, data.customUrlSlug);
              navigate(slugUrl, { replace: true });
              return;
            }
          } catch (error: any) {
            // Check if error is PORTFOLIO_NOT_FOUND
            if (
              error?.code === "PORTFOLIO_NOT_FOUND" ||
              error?.message === "PORTFOLIO_NOT_FOUND" ||
              error?.response?.status === 404
            ) {
              setHasPortfolio(false);
              setIsLoading(false);
              return;
            } else {
              throw error;
            }
          }
        } else {
          // Viewing someone else's portfolio
          if (slug) {
            data = await portfolioService.getPortfolioBySlug(slug);
          } else if (userId) {
            const userIdNum = parseInt(userId);
            if (isNaN(userIdNum)) {
              throw new Error("Invalid user ID");
            }
            data = await portfolioService.getPortfolioByUserId(userIdNum);

            // If portfolio has slug, redirect to slug URL
            if (data.customUrlSlug && data.customUrlSlug.trim()) {
              const slugUrl = getPortfolioUrl(data.userId, data.customUrlSlug);
              navigate(slugUrl, { replace: true });
              return;
            }
          } else {
            setIsLoading(false);
            return;
          }
          setHasPortfolio(true);
        }

        setPortfolioData(data);
        const transformed = transformPortfolioData(data);
        setDisplayData(transformed);
      } catch (error: any) {
        console.error("Error fetching portfolio:", error);
        toast.error("Không thể tải portfolio");
        setHasPortfolio(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [userId, slug, isPersonalPage]);

  // Fetch follow data (only for visitors and authenticated users)
  useEffect(() => {
    const fetchFollowData = async () => {
      if (!portfolioData || isOwner || !isAuthenticated) return;

      const targetUserId = portfolioData.userId;

      try {
        const following = await followService.isFollowing(targetUserId);
        setIsFollowing(following);
      } catch (error) {
        console.error("Error fetching follow status:", error);
        // If not authenticated, just set to false
        setIsFollowing(false);
      }

      // Fetch follow stats
      setFollowStatsLoading(true);
      try {
        const followersData = await followService.getFollowers(
          targetUserId,
          0,
          1
        );
        setFollowStats({
          totalFollowers: followersData.totalFollowers,
          totalFollowing: followersData.totalFollowing,
        });
      } catch (error) {
        console.error("Error fetching follow stats:", error);
        // If error, just keep default stats (0, 0)
      } finally {
        setFollowStatsLoading(false);
      }
    };

    if (portfolioData && !isOwner && isAuthenticated) {
      fetchFollowData();
    }
  }, [portfolioData, isOwner, isAuthenticated]);

  // Fetch follow stats for owner (only if authenticated)
  useEffect(() => {
    const fetchFollowStats = async () => {
      if (!portfolioData || !isOwner || !isAuthenticated) return;

      setFollowStatsLoading(true);
      try {
        const followersData = await followService.getFollowers(
          portfolioData.userId,
          0,
          1
        );
        setFollowStats({
          totalFollowers: followersData.totalFollowers,
          totalFollowing: followersData.totalFollowing,
        });
      } catch (error) {
        console.error("Error fetching follow stats:", error);
      } finally {
        setFollowStatsLoading(false);
      }
    };

    if (portfolioData && isOwner && isAuthenticated) {
      fetchFollowStats();
    }
  }, [portfolioData, isOwner, isAuthenticated]);

  const handleFollowToggle = async () => {
    if (!portfolioData || followLoading || isOwner) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để theo dõi");
      navigate(ROUTER.USER.LOGIN);
      return;
    }

    setFollowLoading(true);
    try {
      const targetUserId = portfolioData.userId;
      if (isFollowing) {
        await followService.unfollow(targetUserId);
        setIsFollowing(false);
        toast.success("Đã hủy theo dõi");
        setFollowStats((prev) => ({
          ...prev,
          totalFollowers: Math.max(0, prev.totalFollowers - 1),
        }));
      } else {
        await followService.follow(targetUserId);
        setIsFollowing(true);
        toast.success("Đã theo dõi");
        setFollowStats((prev) => ({
          ...prev,
          totalFollowers: prev.totalFollowers + 1,
        }));
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleChat = () => {
    if (!portfolioData || isOwner) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để chat");
      navigate(ROUTER.USER.LOGIN);
      return;
    }

    openChatWithUser(portfolioData.userId);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-dark-neon text-white min-h-screen font-sans pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={48}
            className="animate-spin mx-auto mb-4 text-purple-400"
          />
          <p className="text-gray-400">Đang tải portfolio...</p>
        </div>
        <style>{`
          .bg-dark-neon {
            background-color: #0A0A1A;
          }
        `}</style>
      </div>
    );
  }

  // Show empty state if no portfolio (only for personal page)
  if (isPersonalPage && hasPortfolio === false) {
    return (
      <div className="bg-dark-neon text-white min-h-screen font-sans pt-16">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-full flex items-center justify-center border-4 border-purple-500/30">
                <Star size={64} className="text-purple-400/50" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 neon-text-purple">
              Portfolio của bạn
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Cập nhật thông tin portfolio của bạn để chia sẻ tài năng và kinh nghiệm với thế giới!
            </p>
            <button
              onClick={() => navigate(ROUTER.USER.UPDATE_PORTFOLIO)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-700/50 transition-all transform hover:scale-[1.05] flex items-center gap-2 mx-auto"
            >
              <Plus size={24} />
              Chỉnh sửa Portfolio
            </button>
            <p className="text-gray-500 text-sm mt-6">
              Bạn có thể cập nhật thông tin cá nhân, dự án, và liên kết mạng xã hội
            </p>
          </div>
        </div>
        <style>{`
          .bg-dark-neon {
            background-color: #0A0A1A;
          }
          .neon-text-purple {
            text-shadow: 0 0 5px rgba(167, 139, 250, 0.5), 0 0 10px rgba(167, 139, 250, 0.3);
          }
        `}</style>
      </div>
    );
  }

  // Show error state if portfolio not found (for viewing others)
  if (!isPersonalPage && (!portfolioData || !displayData)) {
    return (
      <div className="bg-dark-neon text-white min-h-screen font-sans pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Không tìm thấy portfolio</p>
        </div>
        <style>{`
          .bg-dark-neon {
            background-color: #0A0A1A;
          }
        `}</style>
      </div>
    );
  }

  if (!portfolioData || !displayData) {
    return null;
  }

  return (
    <div className="bg-dark-neon text-white min-h-screen font-sans pt-16">
      <AnimatedBackground />
      <svg width="0" height="0">
        <defs>
          <linearGradient
            id="social-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "#8B5CF6", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#22D3EE", stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>
      </svg>

      <div
        className="fixed inset-0 top-0 opacity-[0.4] z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, rgba(167, 139, 250, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0, 240, 255, 0.05) 0%, transparent 40%)",
        }}
      ></div>

      {/* Header Section */}
      <header className="relative z-10 mt-3">
        <div className="h-52 md:h-72 bg-gray-900/70">
          <img
            src={displayData.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:-mt-24 relative z-20 gap-6">
            {/* Avatar + Badge */}
            <div className="relative w-40 h-40 flex-shrink-0 group">
              {/* Outer glow ring */}
              <div
                className="
  absolute inset-0 rounded-full 
  bg-gradient-to-br from-purple-500/50 to-cyan-500/50 
  blur-xl opacity-60 group-hover:opacity-90 transition-all
  z-0
"
              ></div>

              <img
                src={displayData.avatarUrl}
                alt={displayData.fullName}
                className="
    w-40 h-40 rounded-full object-cover relative 
    z-10
    border-2 border-white/20 shadow-xl shadow-black/40
  "
              />

              {/* Show PRODUCER badge if portfolio owner is PRODUCER */}
              {portfolioData?.role === "PRODUCER" && (
                <div
                  className="
      absolute bottom-0 left-1/2 -translate-x-1/2
      w-[80%] py-1 z-20
      bg-gradient-to-r from-purple-500/80 via-pink-500/80 to-cyan-400/80
      backdrop-blur-lg
      text-center text-[11px] font-semibold tracking-wider text-white
      rounded-b-full border-t border-white/20
      shadow-[0_0_12px_rgba(255,0,255,0.6)]
    "
                >
                  PRODUCER
                </div>
              )}
            </div>

            {/* Name + headline */}
            <div className="text-center sm:text-left flex-grow">
              <h1
                className="
      text-4xl md:text-5xl font-extrabold
      text-white tracking-tight
      drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]
      animate-floating
      glow-name
    "
              >
                {displayData.fullName}
              </h1>

              <p
                className="
      text-cyan-300 font-semibold text-lg
      mt-1 opacity-90
      drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]
    "
              >
                {displayData.headline}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 mt-3 sm:mt-0 flex-wrap justify-center sm:justify-end">
              {isOwner && !isCustomer ? (
                <button
                  onClick={() => navigate(ROUTER.USER.UPDATE_PORTFOLIO)}
                  className="
          flex items-center gap-2 bg-cyan-600/80 hover:bg-cyan-500 
          text-white font-semibold px-5 py-2.5 rounded-xl 
          border border-cyan-400/40 transition-all 
          hover:scale-[1.05] shadow-lg shadow-cyan-900/40
        "
                >
                  <Edit size={18} /> Chỉnh sửa Portfolio
                </button>
              ) : !isOwner ? (
                <>
                  <button
                    onClick={handleChat}
                    className="
            flex items-center gap-2 
            bg-gradient-to-r from-purple-600 to-indigo-600 
            text-white font-bold px-5 py-2.5 rounded-xl 
            shadow-lg shadow-purple-700/40 
            hover:from-purple-700 hover:to-indigo-700 
            transition-all hover:scale-[1.05]
          "
                  >
                    <MessageCircle size={18} /> Chat ngay
                  </button>

                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`
            flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl 
            transition-all hover:scale-[1.05]
            ${isFollowing
                        ? "bg-gray-700/60 text-gray-300 hover:bg-gray-700 border border-gray-600"
                        : "bg-purple-600/80 hover:bg-purple-600 text-white border border-purple-500/50"
                      }
          `}
                  >
                    {followLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserMinus size={18} /> Đang theo dõi
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} /> Theo dõi
                      </>
                    )}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8 relative z-10">
        <aside className="w-full lg:w-1/3 space-y-8">
          <div className="bg-gray-800/20 backdrop-blur-md p-6 rounded-2xl border border-purple-500/10 shadow-xl shadow-gray-900/50">
            <div className="flex items-center justify-between text-center divide-x divide-purple-500/20">
              <div className="px-2 flex-1">
                <p className="text-4xl font-extrabold text-cyan-400 neon-text-cyan">
                  {displayData.stats.systemProjects}
                </p>
                <p className="text-xs text-gray-400">Dự án hệ thống</p>
              </div>
              <div className="px-2 flex-1">
                <p className="text-4xl font-extrabold text-white neon-text-purple">
                  {displayData.stats.totalProjects}
                </p>
                <p className="text-xs text-gray-400">Tổng dự án</p>
              </div>
              <div className="px-2 flex-1 flex flex-col items-center">
                <StarRating
                  rating={displayData.stats.rating}
                  reviewCount={displayData.stats.reviewCount}
                />
                <p className="text-xs text-gray-400 mt-1">Đánh giá chung</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-purple-500/20 flex items-center justify-center gap-6">
              <button
                onClick={() => setShowFollowersModal(true)}
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                disabled={followStatsLoading}
              >
                <p className="text-2xl font-bold text-cyan-400">
                  {followStatsLoading ? "..." : followStats.totalFollowers}
                </p>
                <p className="text-xs text-gray-400">Người theo dõi</p>
              </button>
              <button
                onClick={() => setShowFollowingModal(true)}
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                disabled={followStatsLoading}
              >
                <p className="text-2xl font-bold text-purple-400">
                  {followStatsLoading ? "..." : followStats.totalFollowing}
                </p>
                <p className="text-xs text-gray-400">Đang theo dõi</p>
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6 border-t border-purple-500/10 pt-4">
              {displayData.socialLinks.length > 0 ? (
                displayData.socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
          group relative flex items-center justify-center 
          w-12 h-12 sm:w-12 sm:h-12 md:w-14 md:h-14
          bg-gray-900/30 backdrop-blur-md
          border border-gray-700/30
          rounded-full overflow-hidden
          transition-all duration-300
          hover:w-36 hover:rounded-xl
          hover:shadow-[0_0_20px_rgba(167,139,250,0.6)]
        "
                  >
                    {/* Gradient Glow Overlay */}
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 opacity-20 group-hover:opacity-50 transition-opacity duration-300 blur-sm"></span>

                    {/* Social Icon */}
                    <SocialIcon
                      platform={link.platform}
                      className="relative z-10 text-gray-400 group-hover:text-white transition-colors duration-300"
                    />

                    {/* Platform Name */}
                    <span className="
          absolute left-12 opacity-0 group-hover:opacity-100
          text-white font-semibold text-sm
          tracking-wide
          transition-all duration-300
          drop-shadow-lg
        ">
                      {link.platform}
                    </span>
                  </a>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">
                  Chưa có liên kết mạng xã hội
                </p>
              )}
            </div>

          </div>

          {/* Portfolio Sections */}
          {displayData.sections.length > 0 && (
            <div className="space-y-6">
              {displayData.sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-gray-800/20 backdrop-blur-md p-6 rounded-2xl border border-purple-500/10 shadow-xl shadow-gray-900/50"
                >
                  <h2 className="text-2xl font-bold text-purple-400 mb-4 border-b border-purple-500/30 pb-2">
                    {section.title || "Chưa có tiêu đề"}
                  </h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {section.content || "Chưa có nội dung."}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Genres & Tags */}
          {(displayData.genres.length > 0 || displayData.tags.length > 0) && (
            <div className="bg-gray-800/20 backdrop-blur-md p-6 rounded-2xl border border-purple-500/10 shadow-xl shadow-gray-900/50">
              <h2 className="text-2xl font-bold text-purple-400 mb-4 border-b border-purple-500/30 pb-2">
                Thể loại
              </h2>
              <div className="flex flex-wrap gap-2">
                {displayData.genres.map((genre, idx) => (
                  <span
                    key={`genre-${idx}`}
                    className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-lg text-sm border border-purple-500/30"
                  >
                    {genre}
                  </span>
                ))}
                {displayData.tags.map((tag, idx) => (
                  <span
                    key={`tag-${idx}`}
                    className="bg-cyan-900/50 text-cyan-300 px-3 py-1 rounded-lg text-sm border border-cyan-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Column: Projects */}
        <section className="w-full lg:w-2/3">
          <div className="flex border-b-2 border-gray-700/50 mb-8">
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`px-5 py-3 font-extrabold text-lg transition-all duration-300 relative group ${activeTab === "portfolio"
                ? "text-cyan-400"
                : "text-gray-400 hover:text-white"
                }`}
            >
              Portfolio ({displayData.portfolioProjects.length})
              <span
                className={`absolute bottom-0 left-0 h-1 bg-cyan-400 transition-all duration-300 ${activeTab === "portfolio" ? "w-full" : "w-0 group-hover:w-1/2"
                  }`}
              ></span>
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`px-5 py-3 font-extrabold text-lg transition-all duration-300 relative group ${activeTab === "system"
                ? "text-cyan-400"
                : "text-gray-400 hover:text-white"
                }`}
            >
              Dự án đã làm ({displayData.systemProjects.length})
              <span
                className={`absolute bottom-0 left-0 h-1 bg-cyan-400 transition-all duration-300 ${activeTab === "system" ? "w-full" : "w-0 group-hover:w-1/2"
                  }`}
              ></span>
            </button>
          </div>

          <div className="space-y-6">
            {activeTab === "portfolio" &&
              (displayData.portfolioProjects.length > 0 ? (
                displayData.portfolioProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Chưa có dự án portfolio nào.</p>
                </div>
              ))}
            {activeTab === "system" &&
              (displayData.systemProjects.length > 0 ? (
                displayData.systemProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Chưa có dự án hệ thống nào.</p>
                </div>
              ))}
          </div>
        </section>
      </main>

      {/* Follow Modals */}
      {portfolioData && (
        <>
          <FollowListModal
            isOpen={showFollowersModal}
            onClose={() => setShowFollowersModal(false)}
            userId={portfolioData.userId}
            type="followers"
            currentUserId={currentUserId || undefined}
          />
          <FollowListModal
            isOpen={showFollowingModal}
            onClose={() => setShowFollowingModal(false)}
            userId={portfolioData.userId}
            type="following"
            currentUserId={currentUserId || undefined}
          />
        </>
      )}

      <style>{`
        .bg-dark-neon {
          background-color: #0A0A1A;
        }
        .neon-text-cyan {
          text-shadow: 0 0 5px rgba(0, 240, 255, 0.5), 0 0 10px rgba(0, 240, 255, 0.3);
        }
        .neon-text-purple {
          text-shadow: 0 0 5px rgba(167, 139, 250, 0.5), 0 0 10px rgba(167, 139, 250, 0.3);
        }
        .neon-glow-hover:hover {
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.6), 0 0 20px rgba(167, 139, 250, 0.4);
        }
      `}</style>
    </div>
  );
}
