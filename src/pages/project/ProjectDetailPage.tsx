import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  UserPlus,
  FileText,
  Folder,
  Handshake,
  MicVocal,
  Sparkles,
  Music,
  DollarSign,
} from "lucide-react";
import { ROUTER } from "../../routes/router";
import logoPWB from "../../assets/image/logo2.png?url";
import projectService, { type ProjectPermissionResponse } from "../../services/projectService";
// Avatar component with error handling
const Avatar: React.FC<{
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ src, name, size = "sm", className = "" }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-lg",
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center relative overflow-hidden ${className}`}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={handleImageError}
        />
      ) : (
        <span className="text-white font-bold">
          {name?.charAt(0)?.toUpperCase()}
        </span>
      )}
    </div>
  );
};

const InspirationPortal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id") || "1";
  return (
    <div className="dashboard-card group pink-glow aspect-square h-auto flex items-center justify-center rounded-full p-4 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full animate-spin-slow z-0">
        <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-pink-500/50 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-600/50 rounded-full filter blur-3xl"></div>
      </div>

      <svg
        className="absolute inset-0 w-full h-full z-10"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
          fill="none"
          stroke="rgba(244, 114, 182, 0.3)"
          strokeWidth="1"
          className="animate-pulse-wave"
          filter="url(#glow)"
        />
        <path
          d="M 50,50 m 0,-35 a 35,35 0 1 1 0,70 a 35,35 0 1 1 0,-70"
          fill="none"
          stroke="rgba(244, 114, 182, 0.4)"
          strokeWidth="0.5"
          className="animate-pulse-wave-delayed"
        />
      </svg>

      <div className="relative z-20 text-center flex flex-col items-center justify-center transition-all duration-500 group-hover:scale-90">
        <button
          onClick={() =>
            navigate(`${ROUTER.USER.INSPIRATION}?id=${projectId}`)
          }
        >
          <Sparkles
            size={48}
            className="text-pink-300 drop-shadow-lg transition-transform duration-500 group-hover:scale-125"
          />
          <h3 className="text-3xl font-bold text-white mt-4">
            Tinh Vân Ý Tưởng
          </h3>
          <p className="text-pink-200/80 mt-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            Khám phá
          </p>
        </button>
      </div>
    </div>
  );
};

const LivePod = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id") || "1";
  return (
    <div className="dashboard-card group yellow-glow aspect-square h-auto flex items-center justify-center rounded-full p-4 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full animate-spin-slow z-0 animation-delay-4000">
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-yellow-500/40 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-orange-600/40 rounded-full filter blur-3xl"></div>
      </div>

      <svg
        className="absolute inset-0 w-full h-full z-10"
        viewBox="0 0 200 200"
      >
        <defs>
          <filter id="yellow-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(100,100)">
          {Array.from({ length: 60 }).map((_, i) => (
            <rect
              key={i}
              x="-1.5"
              y="-90"
              width="3"
              height="10"
              rx="1.5"
              fill="rgba(250, 204, 21, 0.7)"
              transform={`rotate(${i * 6})`}
              className="eq-bar"
              style={{ animationDelay: `${i * 0.05}s` }}
              filter="url(#yellow-glow)"
            />
          ))}
        </g>
      </svg>

      <div className="relative z-20 text-center flex flex-col items-center justify-center transition-all duration-500 group-hover:scale-110">
        <div className="absolute -top-12">
          <span className="flex items-center gap-1.5 text-sm font-semibold bg-red-500/80 text-white px-3 py-1 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="h-2 w-2 bg-white rounded-full"></div>
            LIVE
          </span>
        </div>
        <MicVocal size={48} className="text-yellow-300 drop-shadow-lg" />
        <button
          onClick={() =>
            navigate(`${ROUTER.USER.LIVESESSIONS}?id=${projectId}`)
          }>
          <h3 className="text-3xl font-bold text-white mt-4">
            Cầu Truyền Tin
          </h3>
        </button>

        <div className="flex -space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <img
            className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-900"
            src="https://i.pravatar.cc/40?u=user1"
            alt="User 1"
          />
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-500/20 text-yellow-300 ring-2 ring-gray-900 text-xs font-bold">
            +1
          </div>
        </div>
      </div>
    </div>
  );
};

// Interface for project details
interface ProjectDetails {
  title?: string;
  description?: string;
  creatorName?: string;
  creatorAvatarUrl?: string;
  type?: "PERSONAL" | "COLLABORATIVE";
  status?: "PENDING" | "IN_PROGRESS" | "REVISION" | "COMPLETED" | "CANCELLED";
  createdAt?: string;
  [key: string]: unknown; // Allow additional properties
}

// --- Main Component ---
export default function ProjectDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id") || "1"; // Get projectId from URL

  // State for project details
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<ProjectPermissionResponse | null>(null);
  

  // Fetch project details using projectService
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const details = await projectService.getProjectDetails(
          parseInt(projectId)
        );
        setProjectDetails(details as ProjectDetails);

        // Fetch permissions after entering the project detail to validate layered access
        try {
          const perm = await projectService.getProjectPermissionByProjectId(projectId);
          setPermissions(perm);
          if (perm && perm.project?.canViewProject === false) {
            setError("Bạn không có quyền xem dự án này.");
          }
        } catch (permErr: unknown) {
          // If permissions endpoint denies, surface error
          const errorMessage = permErr instanceof Error ? permErr.message : "Không thể kiểm tra quyền truy cập dự án.";
          setError(errorMessage);
        }
      } catch (err: unknown) {
        console.error("Error fetching project details:", err);
        const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching project details.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  return (
    <div className="bg-aurora text-white min-h-screen font-sans relative overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
      <div
        className="absolute inset-0 opacity-[0.03] z-0"
        style={{ backgroundImage: "var(--noise-bg-pattern)" }}
      ></div>

      <div className="max-w-screen-2xl mx-auto relative z-10 mt-10">
        {loading && (
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-3 text-lg text-gray-300">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              Đang tải thông tin dự án...
            </div>
          </div>
        )}

        {error && (
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-3 text-lg text-red-400">
              <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">!</span>
              </div>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && projectDetails && (
          <header className="mb-12">
            {/* Main title and description */}
            <div className="text-center mb-8">
              <h1
                className="text-4xl pt-5 font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight drop-shadow-lg"
                style={{ textShadow: "0 0 30px rgba(192, 132, 252, 0.5)" }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                  {(projectDetails as ProjectDetails).title || "Project Cockpit"}
                </span>
              </h1>
              {(projectDetails as ProjectDetails).description && (
                <p className="mt-4 text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                  {(projectDetails as ProjectDetails).description}
                </p>
              )}
            </div>

            {/* Status and platform info - five equal chips with center focus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 items-center gap-1 mb-6">
              {/* 1: Người tạo */}
              <div className="flex justify-center">
                <div className="info-chip flex items-center gap-3">
                  <div className="chip-icon bg-purple-500/20 text-purple-300">
                    <UserPlus size={14} />
                  </div>
                  <Avatar
                    src={(projectDetails as ProjectDetails).creatorAvatarUrl}
                    name={(projectDetails as ProjectDetails).creatorName || ""}
                    size="sm"
                  />
                  <div className="flex flex-col text-left">
                    <span className="chip-title">{(projectDetails as ProjectDetails).creatorName}</span>
                    <span className="text-[10px] uppercase tracking-wide bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">Người tạo</span>
                  </div>
                </div>
              </div>

              {/* 2: Loại dự án */}
              <div className="flex justify-center">
                <div className="info-chip flex items-center gap-3">
                  <div className="chip-icon bg-cyan-500/20 text-cyan-300">
                    <Handshake size={14} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="chip-title">{(projectDetails as ProjectDetails).type === "COLLABORATIVE" ? "Hợp tác" : "Cá nhân"}</span>
                    <span className="text-[10px] uppercase tracking-wide bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">Loại dự án</span>
                  </div>
                </div>
              </div>

              {/* 3 (center): Producer Workbench */}
              <div className="flex justify-center">
                <div className="info-chip prominent center-emphasis">
                  <span className="chip-title text-base sm:text-lg bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent drop-shadow">Producer Workbench</span>
                </div>
              </div>

              {/* 4: Trạng thái + mô tả */}
              <div className="flex justify-center">
                {(projectDetails as ProjectDetails).status && (
                  <div className="status-chip flex items-center gap-2">
                    <div className="chip-icon bg-green-500/20 text-green-300">
                      <Sparkles size={14} />
                    </div>
                    <div
                      className={`status-dot ${(projectDetails as ProjectDetails).status === "PENDING"
                        ? "bg-yellow-400"
                        : (projectDetails as ProjectDetails).status === "COMPLETED"
                          ? "bg-green-400"
                          : (projectDetails as ProjectDetails).status === "IN_PROGRESS"
                            ? "bg-blue-400"
                            : (projectDetails as ProjectDetails).status === "REVISION"
                              ? "bg-orange-400"
                              : "bg-red-400"}`}
                    ></div>
                    <div className="flex flex-col">
                      <span className="chip-title text-sm">
                        {(projectDetails as ProjectDetails).status === "PENDING"
                          ? "Chờ duyệt"
                          : (projectDetails as ProjectDetails).status === "COMPLETED"
                            ? "Hoàn thành"
                            : (projectDetails as ProjectDetails).status === "IN_PROGRESS"
                              ? "Đang tiến hành"
                              : (projectDetails as ProjectDetails).status === "REVISION"
                                ? "Cần chỉnh sửa"
                                : (projectDetails as ProjectDetails).status === "CANCELLED"
                                  ? "Đã hủy"
                                  : (projectDetails as ProjectDetails).status}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">Trạng thái</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 5: Ngày tạo */}
              <div className="flex justify-center">
                <div className="info-chip flex items-center gap-3">
                  <div className="chip-icon bg-amber-500/20 text-amber-300">
                    <FileText size={14} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="chip-title">{(projectDetails as ProjectDetails).createdAt ? new Date((projectDetails as ProjectDetails).createdAt!).toLocaleDateString("vi-VN") : ""}</span>
                    <span className="text-[10px] uppercase tracking-wide bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">Ngày tạo</span>
                  </div>
                </div>
              </div>
            </div>
            
          </header>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          <aside className="lg:col-span-3 space-y-6">
            <div>
              <LivePod />
            </div>
            <div>
              <InspirationPortal />
            </div>
          </aside>

          <main className="lg:col-span-6">
            <div
              className="dashboard-card h-full group green-glow p-8 relative overflow-hidden cursor-pointer"
              onClick={() => {
                if (!permissions || permissions.project?.canViewProject) {
                  navigate(`${ROUTER.USER.WORKSPACE}?id=${projectId}`);
                }
              }}
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 opacity-15">
                {/* Floating planets */}
                <div className="absolute top-8 right-12 w-16 h-16 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full animate-float-slow"></div>
                <div className="absolute bottom-16 left-8 w-12 h-12 bg-gradient-to-br from-cyan-400/25 to-blue-500/25 rounded-full animate-float-delayed"></div>
                <div className="absolute top-1/2 right-8 w-8 h-8 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full animate-float-slow"></div>

                {/* Music notes floating */}
                <div className="absolute top-20 left-16 text-green-300/40 animate-music-float">
                  <Music size={24} />
                </div>
                <div className="absolute bottom-20 right-20 text-cyan-300/30 animate-music-float-delayed">
                  <Music size={20} />
                </div>
                <div className="absolute top-1/3 left-1/4 text-purple-300/35 animate-music-float-slow">
                  <Music size={18} />
                </div>

                {/* Orbital rings */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-green-400/20 rounded-full animate-orbit-slow"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-400/15 rounded-full animate-orbit-reverse"></div>
              </div>

              <div className="absolute inset-0 bg-blueprint-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300 z-0"></div>

              <div className="relative z-10">
                {/* Header with PWB branding */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <Folder size={56} className="icon text-green-300" />
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                    </div>
                    <div>
                      <h2 className="text-5xl font-extrabold bg-gradient-to-r from-green-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                        Trạm Chỉ Huy
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-300/80 font-medium">
                            Trung tâm Điều hành PWB
                          </span>
                        </div>
                        <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                        <span className="text-xs text-gray-400">
                          Đang hoạt động
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PWB Logo */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg shadow-purple-500/30 animate-pulse-slow border-2 border-purple-400/30">
                        <img
                          src={logoPWB}
                          alt="PWB Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -inset-2 border border-purple-400/30 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-xs text-purple-300/80 font-medium mt-2">
                      Producer Workbench
                    </span>
                  </div>
                </div>

                {/* Enhanced description */}
                <div className="mb-8">
                  <p className="text-gray-300 leading-relaxed text-lg mb-6">
                    Trung tâm chỉ huy PWB, nơi lưu trữ và quản lý toàn bộ dữ
                    liệu, tài nguyên và nhật ký hành trình của dự án âm nhạc.
                    Đây là trái tim của mọi hoạt động sáng tạo và hợp tác trong
                    vũ trụ Producer Workbench.
                  </p>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-1 gap-4 mt-6">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20">
                      <div className="flex items-center gap-3">
                        <Music size={24} className="text-green-300" />
                        <div>
                          <div className="text-lg font-semibold text-green-300">
                            Quản lý Tài nguyên Âm nhạc
                          </div>
                          <div className="text-sm text-gray-400">
                            Lưu trữ và tổ chức các file âm thanh, nhạc cụ, và
                            tài liệu dự án
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20">
                      <div className="flex items-center gap-3">
                        <Handshake size={24} className="text-cyan-300" />
                        <div>
                          <div className="text-lg font-semibold text-cyan-300">
                            Điều phối Hợp tác
                          </div>
                          <div className="text-sm text-gray-400">
                            Kết nối và quản lý đội ngũ sáng tạo, theo dõi tiến
                            độ dự án
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20">
                      <div className="flex items-center gap-3">
                        <Sparkles size={24} className="text-purple-300" />
                        <div>
                          <div className="text-lg font-semibold text-purple-300">
                            Trung tâm Sáng tạo
                          </div>
                          <div className="text-sm text-gray-400">
                            Nơi ý tưởng được phát triển và biến thành những tác
                            phẩm âm nhạc tuyệt vời
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="lg:col-span-3 space-y-6">
            {/* Phi hành đoàn - Enhanced */}
            <div
              className="dashboard-card group blue-glow relative overflow-hidden"
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-4 w-16 h-16 border border-blue-400/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border border-blue-300/40 rounded-full animate-ping"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-blue-500/20 rounded-full animate-spin-slow"></div>
              </div>

              <div className="relative z-10">
                <div className="card-header mb-4">
                  <div className="relative">
                    <Handshake className="icon text-blue-300" size={32} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="card-title text-2xl font-extrabold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                      Phi hành đoàn
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-blue-300/80 font-medium">
                        Đội ngũ tinh nhuệ
                      </span>
                    </div>
                  </div>
                </div>

                <p className="card-description text-gray-300 leading-relaxed mb-6">
                  Tập hợp đội ngũ tinh nhuệ để cùng cất cánh khám phá vũ trụ âm
                  nhạc. Mời các phi hành gia tài năng tham gia hành trình.
                </p>

                {Boolean(permissions?.project?.canViewMembers) && (
                <button
                  className="btn-crew-glow w-full group relative overflow-hidden"
                  onClick={() =>
                    navigate(`${ROUTER.USER.TEAMINVITATION}?id=${projectId}`)
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    <UserPlus
                      size={20}
                      className="group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="font-bold text-lg">
                      Đội ngũ Phi hành đoàn
                    </span>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </button>
                )}
              </div>
            </div>

            {/* Giao Ước Liên Sao - Enhanced */}
            <div
              className="dashboard-card group red-glow relative overflow-hidden"
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-6 left-6 w-12 h-12 border border-red-400/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-6 right-6 w-6 h-6 border border-red-300/40 rounded-full animate-ping"></div>
                <div className="absolute top-1/3 right-1/3 w-20 h-20 border border-red-500/20 rounded-full animate-spin-slow"></div>
              </div>

              <div className="relative z-10">
                <div className="card-header mb-4">
                  <div className="relative">
                    <FileText className="icon text-red-300" size={32} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="card-title text-2xl font-extrabold bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent">
                      Giao Ước Liên Sao
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-300/80 font-medium">
                        Hiệp định vũ trụ
                      </span>
                    </div>
                  </div>
                </div>

                <p className="card-description text-gray-300 leading-relaxed mb-6">
                  Soạn thảo hiệp định, gửi tín hiệu ký kết và theo dõi trạng
                  thái nhiệm vụ. Đảm bảo mọi thỏa thuận được thực hiện đúng quy
                  trình.
                </p>

                {Boolean(permissions?.contract?.canViewContract) && (
                <button
                  className="btn-contract-glow w-full group relative overflow-hidden"
                  onClick={() =>
                    navigate(`${ROUTER.USER.CONTRACTSPACE}?id=${projectId}`)
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    <FileText
                      size={20}
                      className="group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="font-bold text-lg">
                      Mở Khoang Giao Ước
                    </span>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </button>
                )}
              </div>
            </div>
            {/* Kho Bạc Ngân Hà - Enhanced */}
            <div
              className="dashboard-card group teal-glow"
              style={{ animationDelay: "800ms" }}
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-6 left-6 w-12 h-12 border border-teal-400/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-6 right-6 w-6 h-6 border border-teal-300/40 rounded-full animate-ping"></div>
                <div className="absolute top-1/3 right-1/3 w-20 h-20 border border-teal-500/20 rounded-full animate-spin-slow"></div>
              </div>

              <div className="relative z-10">
                <div className="card-header mb-4">
                  <div className="relative">
                    <DollarSign className="icon text-teal-300" size={32} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="card-title text-2xl font-extrabold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                      Kho Bạc Ngân Hà
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-teal-300/80 font-medium">
                        Thống kê tài chính
                      </span>
                    </div>
                  </div>
                </div>

                <p className="card-description text-gray-300 leading-relaxed mb-6">
                  Xem thống kê chi phí, phân bổ ngân sách và theo dõi tình hình tài chính của dự án. 
                  Biểu đồ trực quan giúp bạn nắm bắt tổng quan về dòng tiền.
                </p>

                {permissions?.role.projectRole !== "COLLABORATOR" && (
                <button
                  className="btn-primary-glow w-full group relative overflow-hidden teal-gradient"
                  onClick={() =>
                    navigate(`${ROUTER.USER.PROJECT_EXPENSE_STATISTICS}?id=${projectId}`)
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    <DollarSign
                      size={20}
                      className="group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="font-bold text-lg">
                      Xem Thống Kê Tài Chính
                    </span>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* CSS */}
      <style>{`
                :root { 
                    --noise-bg-pattern: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgNTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZh0PSIxMDAlIiBmaWx0ZXI9InVybCgjbnoaXNlKSIvPjwvc3ZnPg==); 
                }
                .bg-aurora { background-color: #0d0c1d; }

                .dashboard-card {
                    @apply bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/20 relative overflow-hidden cursor-pointer;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
                    will-change: transform;
                    backface-visibility: hidden;
                    transform: translateZ(0);
                }
                .dashboard-card:hover {
                    transform: translate3d(0, -6px, 0);
                    border-color: var(--glow-color);
                    box-shadow: 0 0 40px 0 rgba(var(--glow-rgb), 0.3);
                }
                .dashboard-card::after {
                    content: '';
                    position: absolute;
                    top: -100%; right: -50%;
                    width: 100%; height: 200%;
                    opacity: 0;
                    transform: rotate(25deg);
                    background: linear-gradient(to right, transparent, rgba(var(--glow-rgb), 0.2), transparent);
                    transition: opacity 0.5s;
                }
                .dashboard-card:hover::after { opacity: 1; }

                .dashboard-card.green-glow { --glow-color: #4ade80; --glow-rgb: 74, 222, 128; }
                .dashboard-card.yellow-glow { --glow-color: #facc15; --glow-rgb: 250, 204, 21; }
                .dashboard-card.pink-glow { --glow-color: #f472b6; --glow-rgb: 244, 114, 182; }
                .dashboard-card.blue-glow { --glow-color: #60a5fa; --glow-rgb: 96, 165, 250; }
                .dashboard-card.red-glow { --glow-color: #f87171; --glow-rgb: 248, 113, 113; }
                .dashboard-card.orange-glow { --glow-color: #fb923c; --glow-rgb: 251, 146, 60; }
                .dashboard-card.teal-glow { --glow-color: #2dd4bf; --glow-rgb: 45, 212, 191; }
                
                .card-header { @apply flex items-center gap-4; }
                .card-title { @apply text-2xl font-bold text-white; }
                .card-description { @apply text-gray-400 text-sm mt-2 leading-relaxed; }
                .icon { 
                    @apply transition-transform duration-300 group-hover:scale-110;
                    will-change: transform;
                    backface-visibility: hidden;
                }
                
                /* Optimize group-hover scale transitions */
                .group:hover [class*="group-hover:scale"] {
                    will-change: transform;
                    backface-visibility: hidden;
                }

                .btn-primary-glow { 
                    @apply w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30;
                }
                .btn-primary-glow.green-gradient {
                    @apply bg-gradient-to-r from-green-500 to-teal-500 shadow-green-500/20 hover:shadow-green-500/30;
                }
                .btn-primary-glow.teal-gradient {
                    @apply bg-gradient-to-r from-teal-500 to-cyan-500 shadow-teal-500/20 hover:shadow-teal-500/30;
                }
                .btn-secondary-glow { 
                    @apply inline-flex items-center justify-center gap-2 bg-white/5 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors border border-white/10;
                }
                .btn-primary-glow:disabled { @apply opacity-50 cursor-not-allowed shadow-none bg-gray-600 bg-none; }
                
                /* Enhanced button styles for crew and contract sections */
                .btn-crew-glow { 
                    @apply w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-bold px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-blue-400/30 hover:border-blue-300/50;
                }
                .btn-crew-glow:hover {
                    background: linear-gradient(135deg, #2563eb, #0891b2, #1d4ed8);
                    box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(6, 182, 212, 0.3);
                }
                
                .btn-contract-glow { 
                    @apply w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 via-pink-600 to-red-700 text-white font-bold px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 border border-red-400/30 hover:border-red-300/50;
                }
                .btn-contract-glow:hover {
                    background: linear-gradient(135deg, #dc2626, #db2777, #b91c1c);
                    box-shadow: 0 0 30px rgba(239, 68, 68, 0.5), 0 0 60px rgba(236, 72, 153, 0.3);
                }
                
                /* Consistent info chips */
                .info-chip {
                    @apply relative px-2.5 py-1.5 rounded-xl border border-white/15 backdrop-blur-md bg-white/5 text-white shadow-md flex items-center gap-2 transition-all duration-300;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(0,0,0,0.25);
                }
                .info-chip:hover { @apply border-white/25 scale-[1.015]; }
                .info-chip.prominent {
                    @apply px-4 py-2 bg-gradient-to-r from-purple-600/30 via-indigo-600/25 to-blue-600/30 border-white/25;
                    box-shadow: 0 0 26px rgba(168,85,247,0.28), 0 0 60px rgba(59,130,246,0.15);
                }
                .info-chip.center-emphasis { position: relative; overflow: hidden; }
                .info-chip.center-emphasis::after {
                    content: ''; position: absolute; inset: 0; background: radial-gradient(closest-side, rgba(168,85,247,0.25), transparent 70%);
                    opacity: .35; pointer-events: none; filter: blur(8px);
                }
                .info-chip.center-emphasis::before {
                    content: ''; position: absolute; top: -100%; left: -20%; width: 140%; height: 300%; transform: rotate(15deg);
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent);
                    animation: chip-shine 4s linear infinite;
                }
                .chip-icon { display:flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:8px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12); }
                .chip-title { @apply font-semibold text-white text-sm; }
                .status-chip { @apply flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/15 backdrop-blur-md bg-white/5 transition-all duration-300; }
                .status-chip:hover { @apply border-white/25 scale-[1.01]; }
                .status-dot { @apply w-2 h-2 rounded-full; box-shadow: 0 0 8px rgba(255,255,255,0.25); }

                .bg-blueprint-pattern {
                    background-image: linear-gradient(rgba(45, 212, 191, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 212, 191, 0.05) 1px, transparent 1px);
                    background-size: 1.5rem 1.5rem;
                }

                /* Animations */

                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob { animation: blob 10s infinite cubic-bezier(0.4, 0, 0.2, 1); }
                .animation-delay-2000 { animation-delay: -5s; }

                /* Inspiration Portal SVG animation */
                @keyframes pulse-wave { 0%, 100% { stroke-dasharray: 0, 283; } 50% { stroke-dasharray: 141.5, 141.5; stroke-dashoffset: -70; } }
                .animate-pulse-wave { animation: pulse-wave 4s infinite cubic-bezier(0.4, 0, 0.2, 1); }
                .animate-pulse-wave-delayed { animation: pulse-wave 4s infinite 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
                
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }

                /* Live Pod EQ animation */
                @keyframes eq-dance { 0%, 100% { height: 10px; } 50% { height: 25px; } }
                .eq-bar { animation: eq-dance 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1); transform-origin: center; }
                
                /* Command Station animations */
                @keyframes float-slow { 0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); } 50% { transform: translate3d(0, -20px, 0) rotate(180deg); } }
                .animate-float-slow { 
                    animation: float-slow 8s infinite ease-in-out;
                    will-change: transform;
                    backface-visibility: hidden;
                }
                
                @keyframes float-delayed { 0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); } 50% { transform: translate3d(0, -15px, 0) rotate(-180deg); } }
                .animate-float-delayed { 
                    animation: float-delayed 6s infinite 2s ease-in-out;
                    will-change: transform;
                    backface-visibility: hidden;
                }
                
                @keyframes music-float { 0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.4; } 50% { transform: translate3d(0, -10px, 0) scale(1.1); opacity: 0.7; } }
                .animate-music-float { 
                    animation: music-float 4s infinite ease-in-out;
                    will-change: transform, opacity;
                    backface-visibility: hidden;
                }
                
                @keyframes music-float-delayed { 0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.3; } 50% { transform: translate3d(0, -8px, 0) scale(1.05); opacity: 0.6; } }
                .animate-music-float-delayed { 
                    animation: music-float-delayed 5s infinite 1s ease-in-out;
                    will-change: transform, opacity;
                    backface-visibility: hidden;
                }
                
                @keyframes music-float-slow { 0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.35; } 50% { transform: translate3d(0, -12px, 0) scale(1.08); opacity: 0.65; } }
                .animate-music-float-slow { 
                    animation: music-float-slow 7s infinite 3s ease-in-out;
                    will-change: transform, opacity;
                    backface-visibility: hidden;
                }
                
                @keyframes orbit-slow { from { transform: translate3d(-50%, -50%, 0) rotate(0deg); } to { transform: translate3d(-50%, -50%, 0) rotate(360deg); } }
                .animate-orbit-slow { 
                    animation: orbit-slow 20s linear infinite;
                    will-change: transform;
                    backface-visibility: hidden;
                }
                
                @keyframes orbit-reverse { from { transform: translate3d(-50%, -50%, 0) rotate(360deg); } to { transform: translate3d(-50%, -50%, 0) rotate(0deg); } }
                .animate-orbit-reverse { 
                    animation: orbit-reverse 25s linear infinite;
                    will-change: transform;
                    backface-visibility: hidden;
                }
                
                @keyframes pulse-slow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
                .animate-pulse-slow { 
                    animation: pulse-slow 3s infinite ease-in-out;
                    will-change: transform, opacity;
                    backface-visibility: hidden;
                }

                /* Chip shine animation */
                @keyframes chip-shine {
                    0% { transform: translateX(-60%) rotate(15deg); opacity: .0; }
                    10% { opacity: .35; }
                    50% { transform: translateX(10%) rotate(15deg); opacity: .25; }
                    100% { transform: translateX(80%) rotate(15deg); opacity: 0; }
                }
            `}</style>
    </div>
  );
}