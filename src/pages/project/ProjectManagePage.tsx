import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import projectService from "../../services/projectService";
import { useAuth } from "../../contexts/AuthContext";
import userService from "../../services/userService";
import type {
  Project,
  Page as PageType,
  GetMyProjectsParams,
} from "../../services/projectService";
type ProjectStatus = Project["status"];
import { ROUTER } from "../../routes/router";
import {
  Search,
  ListFilter,
  Loader,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Rocket,
  Orbit,
  Mic,
  UserCircle,
  CalendarDays,
  Sparkles,
  ChevronRight as ArrowRight,
  X,
  AlertCircle,
  CreditCard,
  Star,
} from "lucide-react";

// tsParticles
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadStarsPreset } from "@tsparticles/preset-stars";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import AnimatedBackground from "../../component/background/AnimatedBackground";
import { debounce } from "lodash";
import ViewReviewModal from "@/component/project/ViewReviewModal";
import ProjectReviewModal from "@/component/project/ProjectReviewModal";

/* ---------- Huy hiệu trạng thái (hologram) ---------- */
const StatusBadge: React.FC<{ status: Project["status"] }> = ({ status }) => {
  const scheme: Record<
    Project["status"],
    { text: string; ring: string; bg: string; textColor: string }
  > = {
    PENDING: {
      text: "Chờ duyệt",
      ring: "ring-yellow-400/40",
      bg: "bg-yellow-500/15",
      textColor: "text-yellow-200",
    },
    IN_PROGRESS: {
      text: "Đang tiến hành",
      ring: "ring-sky-400/40",
      bg: "bg-sky-500/15",
      textColor: "text-sky-200",
    },
    REVISION: {
      text: "Cần chỉnh sửa",
      ring: "ring-orange-400/40",
      bg: "bg-orange-500/15",
      textColor: "text-orange-200",
    },
    COMPLETED: {
      text: "Hoàn thành",
      ring: "ring-emerald-400/40",
      bg: "bg-emerald-500/15",
      textColor: "text-emerald-200",
    },
    CANCELLED: {
      text: "Đã hủy",
      ring: "ring-rose-400/40",
      bg: "bg-rose-500/15",
      textColor: "text-rose-200",
    },
  };

  const s = scheme[status] ?? {
    text: status,
    ring: "ring-zinc-400/30",
    bg: "bg-zinc-500/15",
    textColor: "text-zinc-200",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold",
        "backdrop-blur ring-1 shadow-[0_0_15px_rgba(255,255,255,0.06)]",
        s.bg,
        s.ring,
        s.textColor,
      ].join(" ")}
    >
      <Sparkles className="h-3 w-3" />
      {s.text}
    </span>
  );
};

/* ======================================================
   =============  SPACE HUB: MyProjectsPage  =============
   ====================================================== */
const MyProjectsPage: React.FC = () => {
  /** ---------- LOGIC GIỮ NGUYÊN ---------- */
  const navigate = useNavigate();
  const { userRole, user } = useAuth();
  const [projectsPage, setProjectsPage] = useState<PageType<Project> | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [canCreateProject, setCanCreateProject] = useState(false);
  const [showNoCccdModal, setShowNoCccdModal] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isViewReviewModalOpen, setIsViewReviewModalOpen] = useState(false);
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null);

  const [filters, setFilters] = useState<GetMyProjectsParams>({
    page: 0,
    size: 8,
    search: "",
    status: undefined,
    sort: "createdAt,desc",
  });

  const fetchProjects = useCallback(
    async (currentFilters: GetMyProjectsParams) => {
      setLoading(true);
      setError(null);
      try {
        const cleaned = Object.fromEntries(
          Object.entries(currentFilters).filter(
            ([, v]) => v !== "" && v !== undefined && v !== null
          )
        ) as GetMyProjectsParams;
        const data = await projectService.getMyProjects(cleaned);
        setProjectsPage(data);
      } catch (err: any) {
        setError(err?.message || "Đã xảy ra lỗi không xác định.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const debouncedFetch = useCallback(debounce(fetchProjects, 500), [
    fetchProjects,
  ]);

  useEffect(() => {
    debouncedFetch(filters);
    return () => debouncedFetch.cancel();
  }, [filters, debouncedFetch]);

  // Quyền tạo dự án: chỉ ADMIN hoặc PRODUCER
  useEffect(() => {
    const allowed = userRole === "ADMIN" || userRole === "PRODUCER";
    setCanCreateProject(Boolean(allowed));
  }, [userRole]);

  const handleFilterChange = (
    key: keyof GetMyProjectsParams,
    value: string | number | ProjectStatus | undefined
  ) => setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));

  /** ---------- STARFIELD (tsParticles) ---------- */
  const [particlesReady, setParticlesReady] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadStarsPreset(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  const particlesOptions: ISourceOptions = useMemo(
    () => ({
      preset: "stars",
      background: { color: { value: "transparent" } },
      fullScreen: { enable: true, zIndex: -1 },
      particles: {
        number: { value: 90, density: { enable: true, area: 900 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
          value: 0.55,
          random: { enable: true },
          animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false },
        },
        size: { value: { min: 1, max: 3 }, random: { enable: true } },
        links: { enable: false },
        move: {
          enable: true,
          speed: 0.45,
          direction: "bottom-right",
          random: true,
          straight: false,
          outModes: "out",
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" },
          onClick: { enable: true, mode: "push" },
        },
        modes: {
          repulse: { distance: 120, duration: 0.35 },
          push: { quantity: 3 },
        },
      },
    }),
    []
  );

  /** ---------- HANDLERS ---------- */
  const handleProjectClick = (projectId: number) => {
    navigate(`${ROUTER.USER.PROJECTDETAIL}?id=${projectId}`);
  };

  // Kiểm tra xác thực CCCD trước khi tạo dự án
  const handleCreateProject = async () => {
    try {
      const profile = await userService.getPersonalProfile();
      if (!profile.isVerified) {
        setShowNoCccdModal(true);
        return;
      }
      navigate(ROUTER.PRODUCER.CREATEPROJECT);
    } catch (error: any) {
      console.error("Error checking CCCD verification:", error);
      // Nếu có lỗi khi kiểm tra, vẫn cho phép tạo dự án (fallback)
      navigate(ROUTER.PRODUCER.CREATEPROJECT);
    }
  };
  const handleReviewClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Prevent navigation to detail page
    setReviewingProject(project);
    setIsReviewModalOpen(true);
  };

  const handleViewReviewClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Prevent navigation to detail page
    setReviewingProject(project);
    setIsViewReviewModalOpen(true);
  };

  const canReviewProject = (project: Project): boolean => {
    if (!user) return false;
    // Client chưa review và project completed
    return (
      project.status === "COMPLETED" &&
      project.myRole === "CLIENT" &&
      !project.hasReview
    );
  };

  const canViewReview = (project: Project): boolean => {
    if (!user) return false;
    // Client đã review hoặc Owner của project (khi có review)
    return (
      project.status === "COMPLETED" &&
      !!project.hasReview &&
      (project.myRole === "CLIENT" || project.myRole === "OWNER")
    );
  };

  /** ---------- RENDER HELPERS (UI mới) ---------- */
  const EmptyState = () => (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center">
      <Inbox className="mx-auto h-10 w-10 text-zinc-400" />
      <p className="mt-4 text-zinc-300">Không tìm thấy dự án nào.</p>
      <p className="text-sm text-zinc-400">
        Hãy điều chỉnh bộ lọc hoặc bắt đầu một hành trình mới.
      </p>
      {userRole === "PRODUCER" && (
        <button
          onClick={handleCreateProject}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-sky-600 px-5 py-2.5 text-white shadow-lg hover:from-fuchsia-500 hover:to-sky-500"
        >
          <Rocket className="h-4 w-4" />
          Khởi tạo Dự án
        </button>
      )}
    </div>
  );

  const LoadingState = () => (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-16 text-center">
      <Loader className="mx-auto h-10 w-10 animate-spin text-fuchsia-300" />
      <p className="mt-4 text-zinc-300">Đang định vị các hành tinh âm nhạc…</p>
    </div>
  );

  const ErrorState = () => (
    <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-xl p-12 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-rose-300" />
      <p className="mt-3 font-semibold text-rose-200">
        Lỗi kết nối tín hiệu thiên hà
      </p>
      <p className="mt-1 text-sm text-rose-200/80">{error}</p>
    </div>
  );

  /** ---------- RENDER ---------- */
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#060418] via-[#0A0A2A] to-[#0E0B3F] text-white">
      {/* Nebula layers */}
      <AnimatedBackground />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-sky-600/20 blur-3xl" />
      </div>

      {/* Star field */}
      {particlesReady && <Particles options={particlesOptions} />}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10">
        {/* Space HUD header */}
        <header className="mb-5 flex flex-col items-center gap-3 text-center mt-10 pt-4 ">
          <h1 className="bg-gradient-to-r from-sky-300 via-fuchsia-300 to-pink-300 bg-clip-text text-4xl font-extrabold leading-tight text-transparent md:text-5xl">
            Trạm Điều Khiển Dự Án Thiên Hà
          </h1>
          <p className="max-w-2xl text-balance text-zinc-300/90">
            Phi hành gia ơi, đây là bản đồ những hành tinh âm nhạc bạn đang tham
            gia. Khởi động bộ định vị và bắt đầu hành trình!
          </p>
        </header>

        {/* 🚀 Command Bar - Space Control Panel */}
        <div className="relative mb-2 rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden">
          {/* Ánh sáng di chuyển nền */}
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/10 via-cyan-500/10 to-purple-600/10 animate-[shimmer_8s_linear_infinite]" />

          <div className="relative grid grid-cols-1 gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
            {/* Search box */}
            <div className="relative group">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition group-focus-within:text-fuchsia-400" />
              <input
                type="text"
                placeholder="Quét tọa độ vũ trụ... 🔍"
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-12 py-3 text-sm font-medium text-zinc-100 shadow-inner outline-none ring-0 backdrop-blur-sm placeholder:text-zinc-400 focus:border-fuchsia-400/40 focus:bg-white/15 focus:shadow-[0_0_20px_rgba(236,72,153,0.25)]"
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-fuchsia-600/10 to-cyan-500/10" />
            </div>

            {/* Advanced Filter */}
            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className="relative inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-medium text-zinc-200 backdrop-blur transition hover:border-fuchsia-300/30 hover:bg-white/15 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 opacity-0 hover:opacity-100 transition-opacity" />
              <ListFilter className="relative h-4 w-4 text-fuchsia-300" />
              <span className="relative">Bộ Lọc Thiên Hà</span>
              <Orbit
                className={`relative h-4 w-4 text-cyan-300 transition-transform ${showAdvanced ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Create Project - only for ADMIN/PRODUCER */}
            {canCreateProject && (
              <button
                onClick={handleCreateProject}
                className="relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-sky-600 px-5 py-3 font-semibold text-white shadow-lg hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:from-fuchsia-500 hover:via-pink-500 hover:to-sky-500 transition-all"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <Rocket className="h-4 w-4 animate-pulse" />
                Khởi Tạo Hành Trình
              </button>
            )}
          </div>
        </div>

        {/* Thêm hiệu ứng shimmer chuyển sáng */}
        <style>
          {`
    @keyframes shimmer {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `}
        </style>

        {/* Advanced filters */}
        {/* Advanced filters */}
        <div
          className={[
            "grid grid-cols-1 gap-3 overflow-hidden transition-all duration-300 md:grid-cols-2",
            showAdvanced ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          {/* Select trạng thái */}
          <div className="relative">
            <select
              className="w-full appearance-none rounded-2xl border border-fuchsia-500/30 bg-[#1a1a2f]/90 
                 px-4 py-3 text-zinc-100 backdrop-blur-sm outline-none shadow-[0_0_15px_rgba(240,46,170,0.15)]
                 hover:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-400/40 transition"
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange(
                  "status",
                  (e.target.value || undefined) as ProjectStatus | undefined
                )
              }
            >
              <option className="bg-[#0c0c1c]" value="">
                🌌 Tất cả trạng thái
              </option>
              <option className="bg-[#0c0c1c]" value="IN_PROGRESS">
                🚀 Đang tiến hành
              </option>
              <option className="bg-[#0c0c1c]" value="PENDING">
                🪐 Chờ duyệt
              </option>
              <option className="bg-[#0c0c1c]" value="REVISION">
                🔧 Cần chỉnh sửa
              </option>
              <option className="bg-[#0c0c1c]" value="COMPLETED">
                ✨ Hoàn thành
              </option>
              <option className="bg-[#0c0c1c]" value="CANCELLED">
                🌑 Đã hủy
              </option>
            </select>

            {/* Icon mũi tên đẹp hơn */}
            <ChevronRight className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-fuchsia-300 pointer-events-none transition-transform group-hover:translate-y-[1px]" />
          </div>

          {/* Select sắp xếp */}
          <div className="relative">
            <select
              className="w-full appearance-none rounded-2xl border border-sky-500/30 bg-[#1a1a2f]/90 
                 px-4 py-3 text-zinc-100 backdrop-blur-sm outline-none shadow-[0_0_15px_rgba(56,189,248,0.15)]
                 hover:border-sky-400/50 focus:ring-2 focus:ring-sky-400/40 transition"
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
            >
              <option className="bg-[#0c0c1c]" value="createdAt,desc">
                🕓 Mới tạo ↓
              </option>
              <option className="bg-[#0c0c1c]" value="createdAt,asc">
                🕘 Mới tạo ↑
              </option>
              <option className="bg-[#0c0c1c]" value="title,asc">
                🔠 Tiêu đề A→Z
              </option>
              <option className="bg-[#0c0c1c]" value="title,desc">
                🔡 Tiêu đề Z→A
              </option>
              <option className="bg-[#0c0c1c]" value="updatedAt,desc">
                📅 Cập nhật ↓
              </option>
              <option className="bg-[#0c0c1c]" value="updatedAt,asc">
                📆 Cập nhật ↑
              </option>
            </select>

            <ChevronRight className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-sky-300 pointer-events-none" />
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : !projectsPage || projectsPage.content.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {projectsPage.content.map((p) => (
                  <article
                    key={p.id}
                    onClick={() => handleProjectClick(p.id)}
                    className="group relative rounded-3xl border border-white/10 bg-white/5 p-px transition hover:scale-[1.01] hover:border-fuchsia-400/40 cursor-pointer"
                  >
                    <div className="flex flex-col h-full rounded-[calc(1.5rem-1px)] bg-[#120C2F]/90 p-6 backdrop-blur-xl">
                      <header className="mb-4 flex items-start justify-between gap-4">
                        <h3 className="text-xl font-extrabold leading-tight tracking-wide">
                          {p.title}
                        </h3>
                        <StatusBadge status={p.status} />
                      </header>

                      <div className="space-y-3 text-sm text-zinc-300 flex-grow">
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-4 w-4 text-sky-300" />
                          <span>
                            Người tạo:{" "}
                            <b className="text-white">{p.creatorName}</b>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mic className="h-4 w-4 text-pink-300" />
                          <span>
                            Vai trò của bạn:{" "}
                            <b className="text-white">{p.myRole}</b>
                          </span>
                        </div>
                      </div>

                      <footer className="mt-5 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-zinc-300 border-t border-white/10 pt-4">
                          <CalendarDays className="h-4 w-4 text-emerald-300" />
                          <span>
                            Ngày tạo:{" "}
                            {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 inline-flex items-center gap-1 text-sm text-cyan-300 group-hover:text-cyan-200">
                            Khám phá
                            <ArrowRight className="h-4 w-4" />
                          </div>

                          {/* Create review button - client chưa review */}
                          {canReviewProject(p) && (
                            <button
                              onClick={(e) => handleReviewClick(e, p)}
                              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-yellow-400 hover:to-orange-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all transform hover:scale-105"
                            >
                              <Star size={16} className="fill-white" />
                              Đánh giá
                            </button>
                          )}

                          {/* View review button - client đã review hoặc owner */}
                          {canViewReview(p) && (
                            <button
                              onClick={(e) => handleViewReviewClick(e, p)}
                              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-purple-400 hover:to-pink-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all transform hover:scale-105"
                            >
                              <Star size={16} className="fill-white" />
                              Xem đánh giá
                            </button>
                          )}
                        </div>
                      </footer>
                    </div>

                    {/* Hologram glow */}
                    <div
                      className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-0 blur-2xl transition group-hover:opacity-80"
                      style={{
                        background:
                          "conic-gradient(from 180deg at 50% 50%, #8b5cf6, #22d3ee, #ec4899, #f43f5e, #8b5cf6)",
                      }}
                    />
                  </article>
                ))}
              </div>

              {/* Pagination - luôn hiển thị khi có dữ liệu, giống Withdrawal */}
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() =>
                    handleFilterChange("page", projectsPage.number - 1)
                  }
                  disabled={projectsPage.first || projectsPage.number <= 0}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-zinc-200 backdrop-blur transition disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trang trước
                </button>
                <span className="text-sm text-zinc-300">
                  Hiển thị{" "}
                  <b>{projectsPage.number * projectsPage.size + 1}</b> -{" "}
                  <b>
                    {projectsPage.totalElements
                      ? Math.min(
                          (projectsPage.number + 1) * projectsPage.size,
                          projectsPage.totalElements
                        )
                      : projectsPage.number * projectsPage.size +
                        projectsPage.content.length}
                  </b>{" "}
                  trong tổng số{" "}
                  <b>
                    {projectsPage.totalElements || projectsPage.content.length}
                  </b>{" "}
                  dự án
                </span>
                <button
                  onClick={() =>
                    handleFilterChange("page", projectsPage.number + 1)
                  }
                  disabled={
                    projectsPage.last ||
                    projectsPage.totalPages <= 1 ||
                    projectsPage.number >= projectsPage.totalPages - 1
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-zinc-200 backdrop-blur transition disabled:opacity-40"
                >
                  Trang sau
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Create Review Modal */}
      {reviewingProject && (
        <ProjectReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewingProject(null);
          }}
          projectId={reviewingProject.id}
          projectTitle={reviewingProject.title}
          producerName={reviewingProject.creatorName}
          onSubmitSuccess={() => {
            // Refresh projects list
            fetchProjects(filters);
          }}
        />
      )}

      {/* View Review Modal */}
      {reviewingProject && (
        <ViewReviewModal
          isOpen={isViewReviewModalOpen}
          onClose={() => {
            setIsViewReviewModalOpen(false);
            setReviewingProject(null);
          }}
          projectId={reviewingProject.id}
          projectTitle={reviewingProject.title}
          isOwner={reviewingProject.myRole === "OWNER"}
          onReviewUpdated={() => {
            // Refresh projects list
            fetchProjects(filters);
          }}
        />
      )}

      {/* Modal thông báo chưa có CCCD */}
      <AnimatePresence>
        {showNoCccdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#0A0F1A] to-[#1A0A2E] p-8 rounded-2xl w-full max-w-md border border-yellow-500/50 shadow-2xl shadow-yellow-500/20 text-gray-100 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6 z-10 relative">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                  <h3 className="text-2xl font-extrabold text-yellow-400 tracking-wide">
                    Chưa xác thực CCCD
                  </h3>
                </div>
                <button
                  onClick={() => setShowNoCccdModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-300 mb-6 z-10 relative">
                Bạn chưa xác thực CCCD. Vui lòng hoàn tất xác thực CCCD trong trang hồ sơ trước khi tạo dự án mới.
              </p>

              <div className="flex justify-end gap-3 z-10 relative">
                <button
                  onClick={() => setShowNoCccdModal(false)}
                  className="px-5 py-2.5 bg-[#2A1A3E] rounded-lg hover:bg-[#3A2A4E] 
                     transition-all text-sm font-medium border border-[#4A0E7E] text-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowNoCccdModal(false);
                    navigate(ROUTER.USER.PROFILE);
                  }}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                    bg-gradient-to-r from-[#9333EA] to-[#6366F1] hover:from-[#A755F2] hover:to-[#7B83F3] 
                    text-white shadow-lg shadow-[#9333EA]/30"
                >
                  <CreditCard className="w-4 h-4" />
                  Đến trang hồ sơ
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyProjectsPage;