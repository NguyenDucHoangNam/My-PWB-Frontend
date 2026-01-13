import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  Rocket,
  FileClock,
  Box,
  Wrench,
  Coins,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { ROUTER } from "../../../routes/router";
import NoContractNotification from "../../../component/project/NoContractNotification";
import IncompleteContractNotification from "../../../component/project/IncompleteContractNotification";
import ContractOverviewCard from "./ContractOverviewCard";
import MilestoneFormModal from "./MilestoneFormModal";
import { ConfirmModal } from "../../../component/modal/ConfirmModal";
import { motion } from "framer-motion";
// Import types và helpers từ các file riêng
import {
  type Milestone,
  type MilestoneNodeProps,
  type MilestoneDashboardProps,
} from "../../../types/workspace";

// Import custom hooks
import { useWorkspaceContract } from "../../../component/hooks/useWorkspace/useWorkspaceContract";
import { useWorkspaceProject } from "../../../component/hooks/useWorkspace/useWorkspaceProject";
import { useWorkspaceMilestones } from "../../../component/hooks/useWorkspace/useWorkspaceMilestones";
import { useMilestoneForm } from "../../../component/hooks/userMilestone/useMilestoneForm";
import { useWorkspaceCalculations } from "../../../component/hooks/useWorkspace/useWorkspaceCalculations";
import { useMilestoneActions } from "../../../component/hooks/userMilestone/useMilestoneActions";
import { usePermissions } from "../../../component/hooks/usePermissions";
import AnimatedBackground from "@/component/background/AnimatedBackground";
import { useCosmicToast } from "../../../component/toast/CosmicToastProvider";
import contractService from "../../../services/contractService";
import paymentService from "../../../services/paymentService";
import projectService from "../../../services/projectService";
import ProjectReviewModal from "../../../component/project/ProjectReviewModal";

// Planet Icon Components
const EarthIcon = ({ size = 64 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className="drop-shadow-[0_0_30px_rgba(59,130,246,0.8)]"
  >
    <defs>
      <radialGradient id="earthGradient" cx="30%" cy="30%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="30%" stopColor="#3b82f6" />
        <stop offset="60%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1e40af" />
      </radialGradient>
      <radialGradient id="earthLand" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#16a34a" stopOpacity="0.4" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="url(#earthGradient)" />
    <ellipse cx="25" cy="28" rx="8" ry="6" fill="url(#earthLand)" />
    <ellipse cx="40" cy="35" rx="6" ry="8" fill="url(#earthLand)" />
    <ellipse cx="35" cy="20" rx="5" ry="4" fill="url(#earthLand)" />
    <circle cx="20" cy="15" r="2.5" fill="rgba(255,255,255,0.9)" />
    <circle cx="45" cy="18" r="1.5" fill="rgba(255,255,255,0.7)" />
  </svg>
);

const SaturnIcon = ({ size = 64 }: { size?: number }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="absolute inset-0 drop-shadow-[0_0_40px_rgba(251,191,36,1)]"
    >
      <defs>
        <radialGradient id="saturnGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="30%" stopColor="#fbbf24" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </radialGradient>
      </defs>
      {/* Saturn Planet */}
      <circle cx="32" cy="32" r="18" fill="url(#saturnGradient)" />
      <circle cx="25" cy="28" r="3" fill="rgba(234, 88, 12, 0.6)" />
      <circle cx="35" cy="30" r="2" fill="rgba(234, 88, 12, 0.5)" />
      <circle cx="30" cy="38" r="2.5" fill="rgba(234, 88, 12, 0.6)" />
      <circle cx="38" cy="35" r="1.5" fill="rgba(251, 191, 36, 0.7)" />
    </svg>
    {/* Saturn Rings - Separate divs for animation */}
    <div
      className="absolute top-1/2 left-1/2 planet-ring"
      style={{
        width: "56px",
        height: "16px",
        transform: "translate(-50%, -50%) rotateX(75deg)",
        border: "2.5px solid rgba(251, 191, 36, 0.8)",
        borderRadius: "50%",
        boxShadow:
          "0 0 25px rgba(251, 191, 36, 0.6), 0 0 50px rgba(251, 191, 36, 0.4)",
      }}
    ></div>
    <div
      className="absolute top-1/2 left-1/2 planet-ring"
      style={{
        width: "50px",
        height: "14px",
        transform: "translate(-50%, -50%) rotateX(75deg)",
        border: "2px solid rgba(251, 191, 36, 0.6)",
        borderRadius: "50%",
        boxShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
        animationDelay: "0.1s",
      }}
    ></div>
    <div
      className="absolute top-1/2 left-1/2 planet-ring"
      style={{
        width: "60px",
        height: "18px",
        transform: "translate(-50%, -50%) rotateX(75deg)",
        border: "1.5px solid rgba(234, 88, 12, 0.5)",
        borderRadius: "50%",
        boxShadow: "0 0 15px rgba(234, 88, 12, 0.4)",
        animationDelay: "0.2s",
      }}
    ></div>
  </div>
);

const MoonIcon = ({ size = 64 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className="drop-shadow-[0_0_25px_rgba(203,213,225,0.6)]"
  >
    <defs>
      <radialGradient id="moonGradient" cx="30%" cy="30%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="30%" stopColor="#cbd5e1" />
        <stop offset="60%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#moonGradient)" />
    {/* Moon Craters */}
    <circle cx="25" cy="25" r="3" fill="rgba(100, 116, 139, 0.5)" />
    <circle cx="40" cy="30" r="2" fill="rgba(100, 116, 139, 0.4)" />
    <circle cx="30" cy="40" r="2.5" fill="rgba(100, 116, 139, 0.5)" />
    <circle cx="38" cy="38" r="1.5" fill="rgba(100, 116, 139, 0.3)" />
    <circle cx="20" cy="35" r="2" fill="rgba(100, 116, 139, 0.4)" />
    {/* Rim Light */}
    <circle
      cx="32"
      cy="32"
      r="28"
      fill="none"
      stroke="rgba(203, 213, 225, 0.5)"
      strokeWidth="1.5"
    />
    {/* Highlight */}
    <circle cx="22" cy="22" r="4" fill="rgba(255, 255, 255, 0.3)" />
  </svg>
);

const MilestoneNode = ({
  milestone,
  onNavigate,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  isDeleting,
  canViewFinancialInfo = false,
  contractStatus,
  paymentType,
}: MilestoneNodeProps) => {
  const canShowFinancialInfo =
    canViewFinancialInfo &&
    (contractStatus === "PAID" ||
      contractStatus === "COMPLETED" ||
      contractStatus === "TERMINATED");

  // Ẩn nút chỉnh sửa và xóa nếu payment type là MILESTONE
  const isMilestonePayment = paymentType?.toUpperCase() === "MILESTONE";
  const shouldShowEditDelete = !isMilestonePayment && (canEdit || canDelete);
  const formattedBudget =
    canShowFinancialInfo && milestone.budget > 0
      ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(milestone.budget)
      : null;

  // Determine status for styling
  const getStatusType = () => {
    if (milestone.status === "Nhiệm Vụ Hoàn Thành") return "completed";
    if (milestone.status === "Đang Vận Hành") return "active";
    return "pending";
  };

  const statusType = getStatusType();

  // Get status dot color and text
  const getStatusConfig = () => {
    switch (milestone.status) {
      case "Nhiệm Vụ Hoàn Thành":
        return {
          dotColor: "bg-green-400",
          dotGlow: "shadow-[0_0_8px_rgba(34,197,94,0.8)]",
          textColor: "text-green-400",
          text: "Nhiệm Vụ Hoàn Thành",
        };
      case "Đang Vận Hành":
        return {
          dotColor: "bg-cyan-400",
          dotGlow: "shadow-[0_0_8px_rgba(34,211,238,0.8)]",
          textColor: "text-cyan-400",
          text: "Đang Vận Hành",
        };
      case "Chờ Khách hàng duyệt":
        return {
          dotColor: "bg-yellow-400",
          dotGlow: "shadow-[0_0_8px_rgba(234,179,8,0.8)]",
          textColor: "text-yellow-400",
          text: "CHỜ KHÁCH HÀNG DUYỆT",
        };
      default:
        return {
          dotColor: "bg-gray-500",
          dotGlow: "",
          textColor: "text-gray-400",
          text: "Đang Chờ Lệnh",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div
      className="relative bg-[#0B0E1E]/90 backdrop-blur-md border border-purple-500/40 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 group cursor-pointer hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] sonic-data-drive"
      data-status={statusType}
      onClick={() => onNavigate(milestone.id)}
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)",
      }}
    >
      {/* Vinyl Groove Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          background: `
                        repeating-conic-gradient(
                            from 0deg at 50% 50%,
                            transparent 0deg,
                            rgba(168, 85, 247, 0.08) 0.5deg,
                            transparent 1deg,
                            transparent 2deg
                        ),
                        repeating-radial-gradient(
                            circle at center,
                            transparent 0px,
                            transparent 2px,
                            rgba(34, 211, 238, 0.06) 2px,
                            rgba(34, 211, 238, 0.06) 3px,
                            transparent 3px,
                            transparent 5px
                        )
                    `,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
        }}
      />

      {/* Glass Shine Animation */}
      <div className="absolute inset-0 glass-shine pointer-events-none"></div>

      {/* Left Gradient Border (Progress Bar) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-cyan-500 to-purple-500 group-hover:from-purple-400 group-hover:via-cyan-400 group-hover:to-purple-400 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.8),0_0_40px_rgba(34,211,238,0.6)] group-hover:w-1.5"></div>

      {/* Holographic HUD Corners - Top Left */}
      <svg
        className="absolute top-0 left-0 w-16 h-16 text-cyan-400/60 group-hover:text-cyan-400/90 transition-colors pointer-events-none z-20"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0 L0 20 L20 0 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className="drop-shadow-[0_0_4px_currentColor]"
        />
        <path
          d="M8 0 L0 0 L0 8"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
      </svg>

      {/* Holographic HUD Corners - Bottom Right */}
      <svg
        className="absolute bottom-0 right-0 w-16 h-16 text-purple-400/60 group-hover:text-purple-400/90 transition-colors pointer-events-none z-20"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M64 64 L64 44 L44 64 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className="drop-shadow-[0_0_4px_currentColor]"
        />
        <path
          d="M56 64 L64 64 L64 56"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
      </svg>

      {/* Cyber Serial Number / Barcode */}
      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="flex gap-0.5">
          {Array.from({ length: 12 }).map((_, i) => {
            // Generate stable height based on milestone ID and index
            const seed = (milestone.id * 7 + i * 3) % 8;
            const height = seed + 4;
            return (
              <div
                key={i}
                className="w-[1px] bg-current"
                style={{ height: `${height}px` }}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Content - Vertical Layout (3 Rows) */}
      <div className="p-5 relative z-10 flex flex-col gap-4">
        {/* Row 1: Title + Status */}
        <div className="flex items-center justify-between gap-4">
          {/* Title */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <h3 className="text-xl font-bold text-white leading-tight group-hover:text-cyan-300 transition-colors break-words flex-1">
              {milestone.title}
            </h3>
            {/* Icon-only Ghost Buttons */}
            {shouldShowEditDelete && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {canEdit && onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(milestone);
                    }}
                    className="p-1.5 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-900/20 rounded transition-all"
                    title="Sửa"
                  >
                    <Edit size={14} />
                  </button>
                )}
                {canDelete && onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(milestone);
                    }}
                    disabled={isDeleting}
                    className="p-1.5 text-red-300 hover:text-red-200 hover:bg-red-900/20 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isDeleting ? "Đang xóa..." : "Xóa"}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Status with Music Visualizer */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`w-2.5 h-2.5 rounded-full ${statusConfig.dotColor} ${statusConfig.dotGlow} flex-shrink-0`}
            ></div>
            <span
              className={`text-sm font-bold ${statusConfig.textColor} whitespace-nowrap`}
            >
              {milestone.status}
            </span>
            {/* Animated Music Equalizer */}
            <div className="flex items-end gap-0.5 h-4 ml-1">
              <div className="w-1 bg-cyan-400 rounded-t equalizer-bar-1 group-hover:bg-cyan-300 transition-colors"></div>
              <div className="w-1 bg-purple-400 rounded-t equalizer-bar-2 group-hover:bg-purple-300 transition-colors"></div>
              <div className="w-1 bg-cyan-400 rounded-t equalizer-bar-3 group-hover:bg-cyan-300 transition-colors"></div>
              <div className="w-1 bg-purple-400 rounded-t equalizer-bar-4 group-hover:bg-purple-300 transition-colors"></div>
            </div>
            {/* Chevron Arrow */}
            <div className="w-8 h-8 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 transition-all group-hover:translate-x-1 flex-shrink-0 ml-2">
              <ChevronRight
                size={20}
                className="transition-transform drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Description */}
        <div className="w-full">
          <p className="text-sm text-slate-400 line-clamp-2 w-full">
            {milestone.description}
          </p>
        </div>

        {/* Row 3: Stats (3 equal columns with Grid System) */}
        <div className="relative grid grid-cols-3 gap-0">
          {/* Vertical Divider 1 */}
          <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-px h-[60%] bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none z-10"></div>

          {/* Vertical Divider 2 */}
          <div className="absolute left-2/3 top-1/2 -translate-y-1/2 w-px h-[60%] bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none z-10"></div>

          {/* Stat 1: Số sản phẩm */}
          <div className="relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-300 hover:bg-white/5 stat-cell">
            {canShowFinancialInfo &&
              typeof milestone.productCount === "number" ? (
              <>
                {/* Icon with Background and Glow */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md"></div>
                  <div className="relative bg-white/5 p-1.5 rounded-full border border-purple-500/30">
                    <Box
                      size={16}
                      className="text-purple-400 flex-shrink-0 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                    />
                  </div>
                </div>

                {/* Label Tag with Data Dot */}

                {/* Number */}
                <span className="text-xl font-mono font-bold text-white">
                  {milestone.productCount}
                </span>

                {/* Label Text */}
                <span className="text-[9px] uppercase tracking-wider text-slate-500 text-center">
                  SỐ SẢN PHẨM
                </span>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center">
                  <div className="relative bg-white/5 p-1.5 rounded-full border border-slate-600/30 opacity-50">
                    <Box size={16} className="text-slate-500 flex-shrink-0" />
                  </div>
                </div>

                <span className="text-xl font-mono font-bold text-slate-600">
                  -
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 text-center">
                  SỐ SẢN PHẨM
                </span>
              </>
            )}
          </div>

          {/* Stat 2: Số lượt sửa */}
          <div className="relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-300 hover:bg-white/5 stat-cell">
            {canShowFinancialInfo && typeof milestone.editCount === "number" ? (
              <>
                {/* Icon with Background and Glow */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md"></div>
                  <div className="relative bg-white/5 p-1.5 rounded-full border border-blue-500/30">
                    <Wrench
                      size={16}
                      className="text-blue-400 flex-shrink-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                    />
                  </div>
                </div>

                {/* Label Tag with Data Dot */}

                {/* Number */}
                <span className="text-xl font-mono font-bold text-white">
                  {milestone.editCount}
                </span>

                {/* Label Text */}
                <span className="text-[9px] uppercase tracking-wider text-slate-500 text-center">
                  SỐ LƯỢT SỬA
                </span>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center">
                  <div className="relative bg-white/5 p-1.5 rounded-full border border-slate-600/30 opacity-50">
                    <Wrench
                      size={16}
                      className="text-slate-500 flex-shrink-0"
                    />
                  </div>
                </div>

                <span className="text-xl font-mono font-bold text-slate-600">
                  -
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 text-center">
                  SỐ LƯỢT SỬA
                </span>
              </>
            )}
          </div>

          {/* Stat 3: Số tiền */}
          <div className="relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-300 hover:bg-white/5 stat-cell">
            {formattedBudget ? (
              <>
                {/* Icon with Background and Glow */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-md"></div>
                  <div className="relative bg-white/5 p-1.5 rounded-full border border-green-500/30">
                    <Coins
                      size={16}
                      className="text-green-400 flex-shrink-0 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                    />
                  </div>
                </div>

                {/* Number */}
                <span className="text-xl font-mono font-bold text-white text-center">
                  {formattedBudget.replace(/\s/g, "").replace(/₫/g, "")}
                </span>

                {/* Label Text */}
                <span className="text-[9px] uppercase tracking-wider text-slate-500 text-center">
                  SỐ TIỀN VNĐ
                </span>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center">
                  <div className="relative bg-white/5 p-1.5 rounded-full border border-slate-600/30 opacity-50">
                    <Coins size={16} className="text-slate-500 flex-shrink-0" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500/60 font-semibold">
                    BUDGET
                  </span>
                  <div className="w-1 h-1 bg-slate-500 rounded-full opacity-50"></div>
                  <span className="text-[8px] px-1.5 py-0.5 bg-slate-500/20 text-slate-500/60 rounded border border-slate-600/30 font-mono opacity-50">
                    VND
                  </span>
                </div>
                <span className="text-xl font-mono font-bold text-slate-600">
                  -
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 text-center">
                  SỐ TIỀN
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <motion.div
        className="absolute z-50 pointer-events-none"
        style={{
          bottom: "0px",
          right: "16px",
        }}
        initial={{ y: 0 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="70"
          height="50"
          viewBox="0 0 70 50"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -top-4 right-2 drop-shadow-[0_0_6px_rgba(129,140,248,0.8)] pointer-events-none"
        >
          <path
            d="M50 0 C40 15, 25 30, 20 50"
            stroke={`url(#gradientLine-${milestone.id})`}
            strokeWidth="2"
            fill="none"
          />
          <defs>
            <linearGradient
              id={`gradientLine-${milestone.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="50"
            >
              <stop stopColor="#A855F7" stopOpacity="0.9" />
              <stop offset="0.5" stopColor="#22D3EE" stopOpacity="0.8" />
              <stop offset="1" stopColor="#A855F7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
};

// --- (Component) Bảng điều khiển Tổng quan ---
// Đây là Cấp độ 1, đã được thiết kế lại với layout "Galaxy Timeline"

const MilestoneDashboard = ({
  project,
  milestones,
  canCreateMilestone,
  canEditMilestone,
  canDeleteMilestone,
  canViewFinancialInfo,
  onNavigateToMilestone,
  onCreateMilestone,
  contractStatus,
  onNavigateToContract,
  onEditMilestone,
  onDeleteMilestone,
  deletingMilestoneId,
  canShowContent,
  canViewContractOverview,
  // Values from useWorkspaceCalculations hook
  currencyFormatter,
  numberFormatter,
  usedAmount,
  usedProducts,
  usedEdits,
  contractAmountLimit,
  productLimit,
  editLimit,
}: MilestoneDashboardProps) => {
  // State để quản lý việc hiển thị/ẩn thông tin hợp đồng
  const [showContractInfo, setShowContractInfo] = useState(false);

  const shouldShowContractOverview = useMemo(() => {
    // Hiển thị cho chủ dự án (OWNER) và khách hàng (CLIENT) - sử dụng permission từ permission system
    // Hỗ trợ cả FULL và MILESTONE payment types
    return (
      canViewContractOverview &&
      canViewFinancialInfo &&
      (contractStatus === "PAID" ||
        contractStatus === "COMPLETED" ||
        contractStatus === "TERMINATED")
    );
  }, [canViewContractOverview, canViewFinancialInfo, contractStatus]);

  return (
    <div className="p-6 md:p-10 animate-fade-in relative">
      {/* Hyper-Future Command Deck Header */}
      <header className="relative pt-14 pb-8 w-full">
        <div className="relative w-full flex items-center justify-center">
          {/* Left Action Module - Holographic Scanner - Positioned at left edge */}
          {canShowContent && shouldShowContractOverview && (
            <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20">
              <button
                onClick={() => setShowContractInfo(!showContractInfo)}
                className="group relative flex items-center justify-center transition-all duration-300"
                title={
                  showContractInfo
                    ? "Ẩn Thông tin Hợp đồng"
                    : "Hiển thị Thông tin Hợp đồng"
                }
              >
                {/* Orbital Rotating Ring */}
                <div className="absolute -inset-2 rounded-2xl border border-dashed border-cyan-400/40 animate-spin-slow group-hover:animate-spin group-hover:border-cyan-400/70"></div>

                {/* Pulsing Ring Animation */}
                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/40 animate-pulse-ring"></div>

                {/* Tech Frame - Hexagonal Squircle */}
                <div className="relative w-16 h-16 rounded-2xl border-2 border-cyan-500/60 bg-cyan-900/40 backdrop-blur-xl group-hover:border-cyan-400 group-hover:bg-cyan-800/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] shadow-2xl">
                  {/* Inner Glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20"></div>
                  {/* Icon */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <FileClock
                      size={28}
                      className="text-cyan-300 group-hover:text-cyan-100 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(34,211,238,0.9)]"
                    />
                  </div>
                </div>

                {/* Active Indicator */}
                {showContractInfo && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-[0_0_12px_rgba(34,197,94,1)] animate-pulse"></span>
                )}
                <span className="sr-only">
                  {showContractInfo
                    ? "Ẩn Thông tin Hợp đồng"
                    : "Hiển thị Thông tin Hợp đồng"}
                </span>
              </button>

              {/* Connector Line to Center */}
              <div className="absolute left-[4.5rem] top-1/2 -translate-y-1/2 w-24 md:w-48 h-[2px] bg-gradient-to-r from-cyan-400/60 via-cyan-400/30 to-transparent pointer-events-none"></div>
            </div>
          )}

          {/* Central Command Panel - The Neon Core */}
          <div className="relative">
            {/* Tech Decals - Corner Patterns */}
            <div className="absolute -top-2 -left-2 text-cyan-400/30 text-xs font-mono">
              +
            </div>
            <div className="absolute -top-2 -right-2 text-purple-400/30 text-xs font-mono">
              +
            </div>
            <div className="absolute -bottom-2 -left-2 text-cyan-400/30 text-xs font-mono">
              +
            </div>
            <div className="absolute -bottom-2 -right-2 text-purple-400/30 text-xs font-mono">
              +
            </div>

            {/* Double Border Effect with Holographic Shimmer */}
            <div className="relative bg-[#0B0E1E]/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border-2 border-gray-800 overflow-hidden">
              {/* Holographic Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full animate-shimmer pointer-events-none">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
              </div>

              {/* Inner Neon Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 p-[2px] -z-10">
                <div className="w-full h-full rounded-2xl bg-[#0B0E1E]/90"></div>
              </div>

              {/* Content */}
              <div className="relative flex flex-col items-center">
                {/* Top Label with Dynamic Status Ticker */}
                <div className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-2 font-semibold flex items-center gap-2">
                  <span className="relative flex items-center">
                    <span className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                    <span className="relative w-2 h-2 bg-cyan-400/30 rounded-full"></span>
                  </span>
                  <span>KHÔNG GIAN LÀM VIỆC</span>
                </div>

                {/* Main Title - Huge with Text Glow */}
                <div className="relative">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-300 drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]">
                    {project.name}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Module - Launch Key - Positioned at right edge */}
          {canShowContent && canCreateMilestone && (
            <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20">
              {/* Connector Line from Center */}
              <div className="absolute right-[4.5rem] top-1/2 -translate-y-1/2 w-24 md:w-48 h-[2px] bg-gradient-to-l from-pink-400/60 via-pink-400/30 to-transparent pointer-events-none"></div>

              <button
                onClick={onCreateMilestone}
                className="group relative flex items-center justify-center transition-all duration-300"
                title={
                  project?.paymentType?.toUpperCase() === "MILESTONE"
                    ? "Không thể tạo cột mốc với loại hợp đồng này"
                    : "Tạo Cột mốc Mới"
                }
              >
                {/* Orbital Rotating Ring */}
                <div className="absolute -inset-2 rounded-2xl border border-dashed border-pink-400/40 animate-spin-slow group-hover:animate-spin group-hover:border-pink-400/70"></div>

                {/* Tech Frame - Hexagonal Squircle */}
                <div className="relative w-16 h-16 rounded-2xl border-2 border-pink-500/60 bg-gradient-to-br from-pink-900/40 to-red-900/40 backdrop-blur-xl group-hover:border-pink-400 group-hover:from-pink-800/60 group-hover:to-red-800/60 transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(236,72,153,0.9)] shadow-2xl">
                  {/* Intense Glow on Hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-500/0 to-red-500/0 group-hover:from-pink-500/30 group-hover:to-red-500/30 transition-all duration-300"></div>
                  {/* Icon */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Rocket
                      size={28}
                      className="text-pink-300 group-hover:text-pink-100 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(236,72,153,0.9)]"
                    />
                  </div>
                </div>
                <span className="sr-only">Tạo Cột mốc Mới</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Actions và Financial Info - Chỉ hiển thị khi hợp đồng Nhiệm Vụ Hoàn Thành và đã thanh toán */}

      {/* Thông báo khi hợp đồng chưa hoàn tất hoặc chưa thanh toán - chỉ hiển thị cho người có quyền tạo milestone */}
      {!canShowContent && canCreateMilestone && onNavigateToContract && (
        <div className="mb-12">
          <IncompleteContractNotification
            onNavigateToContract={onNavigateToContract}
          />
        </div>
      )}

      {canShowContent &&
        canViewFinancialInfo &&
        shouldShowContractOverview &&
        showContractInfo && (
          <ContractOverviewCard
            project={project}
            contractStatus={contractStatus ?? null}
            currencyFormatter={currencyFormatter}
            numberFormatter={numberFormatter}
            usedAmount={usedAmount}
            usedProducts={usedProducts}
            usedEdits={usedEdits}
            contractAmountLimit={contractAmountLimit}
            productLimit={productLimit}
            editLimit={editLimit}
          />
        )}

      {/* Hiển thị ContractOverviewCard luôn khi có quyền xem nhưng không có nút toggle (cho trường hợp không phải FULL hoặc chưa PAID) */}
      {canShowContent &&
        canViewContractOverview &&
        !shouldShowContractOverview && (
          <ContractOverviewCard
            project={project}
            contractStatus={contractStatus ?? null}
            currencyFormatter={currencyFormatter}
            numberFormatter={numberFormatter}
            usedAmount={usedAmount}
            usedProducts={usedProducts}
            usedEdits={usedEdits}
            contractAmountLimit={contractAmountLimit}
            productLimit={productLimit}
            editLimit={editLimit}
          />
        )}

      {/* Galactic Journey - Milestone Timeline */}
      {canShowContent && (
        <div className="relative w-full max-w-6xl mx-auto mt-16">
          {/* The Stardust Trail - Dashed Hyperlane */}
          <div
            className="absolute top-0 bottom-0 left-1/2 w-[2px] -z-10"
            style={{ transform: "translateX(-50%)" }}
          >
            {/* Dashed line with glow */}
            <div
              className="absolute inset-0 border-l-2 border-dashed border-purple-400/40"
              style={{
                filter:
                  "drop-shadow(0 0 4px rgba(168, 85, 247, 0.6)) drop-shadow(0 0 8px rgba(34, 211, 238, 0.4))",
                borderImage:
                  "linear-gradient(to bottom, rgba(168, 85, 247, 0.4), rgba(34, 211, 238, 0.4), rgba(168, 85, 247, 0.4)) 1",
              }}
            ></div>

            {/* Data Pulse Animation */}
            <div
              className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-cyan-400 via-white to-transparent rounded-full animate-data-pulse shadow-[0_0_20px_rgba(34,211,238,0.8)]"
              style={{ transform: "translateX(-50%)", left: "50%" }}
            ></div>
          </div>

          {milestones.map((ms: Milestone, index: number) => {
            // Determine status for waypoint styling
            const getStatusType = () => {
              if (ms.status === "Nhiệm Vụ Hoàn Thành") return "completed";
              if (ms.status === "Đang Vận Hành") return "active";
              return "pending";
            };

            const statusType = getStatusType();
            const isEven = index % 2 === 0;

            return (
              <div
                key={ms.id}
                className={`relative mb-16 animate-slide-up-fade milestone-item ${index > 0 && index % 2 !== 0 ? "md:-mt-32" : ""
                  }`}
                style={{
                  animationDelay: `${index * 200}ms`,
                  zIndex: milestones.length - index,
                }}
              >
                {/* 3D Planet Waypoint */}
                <div
                  className="absolute top-0 left-1/2 z-20 waypoint-node planet-container"
                  style={{ transform: "translate(-50%, -50%)" }}
                  data-status={statusType}
                >
                  {/* Type A: Earth (Completed) */}
                  {statusType === "completed" && (
                    <div className="relative w-16 h-16 planet-life flex items-center justify-center">
                      <EarthIcon size={64} />
                    </div>
                  )}

                  {/* Type B: Saturn (Active) */}
                  {statusType === "active" && (
                    <div className="relative w-16 h-16 planet-ringed flex items-center justify-center">
                      {/* Star Twinkle Effect */}
                      <div className="absolute -inset-4 star-twinkle">
                        <div
                          className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full animate-twinkle"
                          style={{ animationDelay: "0s" }}
                        ></div>
                        <div
                          className="absolute top-1/4 right-0 w-1 h-1 bg-yellow-300 rounded-full animate-twinkle"
                          style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                          className="absolute bottom-1/4 left-0 w-1 h-1 bg-orange-300 rounded-full animate-twinkle"
                          style={{ animationDelay: "1s" }}
                        ></div>
                        <div
                          className="absolute bottom-0 right-1/4 w-1 h-1 bg-amber-300 rounded-full animate-twinkle"
                          style={{ animationDelay: "1.5s" }}
                        ></div>
                      </div>

                      <SaturnIcon size={64} />
                    </div>
                  )}

                  {/* Type C: Moon (Pending) */}
                  {statusType === "pending" && (
                    <div className="relative w-16 h-16 planet-ice flex items-center justify-center">
                      <MoonIcon size={64} />
                    </div>
                  )}
                </div>

                {/* Connector Beam (appears on hover) */}
                <div
                  className={`absolute top-0 h-[2px] opacity-0 transition-opacity duration-300 connector-beam ${isEven
                    ? "left-1/2 md:left-[calc(50%+2rem)]"
                    : "right-1/2 md:right-[calc(50%+2rem)]"
                    }`}
                  style={{
                    ...(isEven
                      ? {
                        transform: "translateX(-50%)",
                        right: "calc(50% - 2rem)",
                        background:
                          "linear-gradient(to right, rgba(34,211,238,0.8), rgba(34,211,238,0.4), transparent)",
                      }
                      : {
                        transform: "translateX(50%)",
                        left: "calc(50% - 2rem)",
                        background:
                          "linear-gradient(to left, rgba(34,211,238,0.8), rgba(34,211,238,0.4), transparent)",
                      }),
                    boxShadow: "0 0 10px rgba(34,211,238,0.5)",
                  }}
                ></div>

                {/* Mission Card */}
                <div
                  className={`
                                    w-full md:w-[calc(50%-1.5rem)] 
                                    ${isEven
                      ? "md:mr-auto md:pr-6"
                      : "md:ml-auto md:pl-6"
                    }
                                    pt-8 md:pt-0
                                `}
                >
                  <MilestoneNode
                    milestone={ms}
                    onNavigate={onNavigateToMilestone}
                    canEdit={canEditMilestone && Boolean(onEditMilestone)}
                    canDelete={canDeleteMilestone && Boolean(onDeleteMilestone)}
                    onEdit={onEditMilestone}
                    onDelete={onDeleteMilestone}
                    isDeleting={deletingMilestoneId === ms.id}
                    canViewFinancialInfo={canViewFinancialInfo}
                    contractStatus={contractStatus}
                    paymentType={project.paymentType}
                    projectId={project.id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- Component Cha (Trang chính) ---
export default function ProjectWorkspacePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lấy projectId từ URL params
  const projectIdParam =
    searchParams.get("id") || searchParams.get("projectId");
  const projectId = projectIdParam ? parseInt(projectIdParam) : null;

  // Custom hooks
  const { hasContract, checkingContract, contractStatus } =
    useWorkspaceContract(projectId);
  const {
    project,
    loading: projectLoading,
    error: projectError,
    projectRole,
    permissions,
  } = useWorkspaceProject(projectId, checkingContract, hasContract);
  const {
    milestones,
    loading: milestonesLoading,
    refreshMilestones,
  } = useWorkspaceMilestones(projectId, checkingContract, hasContract);
  const {
    showMilestoneModal,
    modalMode,
    editingMilestone,
    isSubmitting,
    setIsSubmitting,
    createForm,
    setCreateForm,
    openCreateModal,
    openEditModal,
    closeModal,
    parsedAmountInput,
    parsedProductInput,
    parsedEditInput,
    originalAmountForEditing,
    originalProductsForEditing,
    originalEditsForEditing,
  } = useMilestoneForm();

  const {
    currencyFormatter,
    numberFormatter,
    usedAmount,
    usedProducts,
    usedEdits,
    contractAmountLimit,
    productLimit,
    editLimit,
    remainingAmountForModal,
    remainingProductsForModal,
    remainingEditsForModal,
    remainingAmountAfter,
    remainingProductsAfter,
    remainingEditsAfter,
    remainingAmountAfterRaw,
    remainingProductsAfterRaw,
    remainingEditsAfterRaw,
    amountIsOverLimit,
    productIsOverLimit,
    editIsOverLimit,
  } = useWorkspaceCalculations(
    project,
    milestones,
    parsedAmountInput,
    parsedProductInput,
    parsedEditInput,
    originalAmountForEditing,
    originalProductsForEditing,
    originalEditsForEditing
  );

  const { deletingMilestoneId, deleteMilestone, submitMilestone } =
    useMilestoneActions(
      projectId,
      refreshMilestones,
      currencyFormatter,
      contractAmountLimit,
      productLimit,
      editLimit,
      usedAmount,
      usedProducts,
      usedEdits
    );

  // State cho delete confirmation modal
  const [milestoneToDelete, setMilestoneToDelete] = useState<Milestone | null>(
    null
  );
  // State cho modal thanh toán milestone
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMilestone, setSelectedPaymentMilestone] = useState<Milestone | null>(null);
  const [isCreatingPaymentLink, setIsCreatingPaymentLink] = useState(false);
  const [contractId, setContractId] = useState<number | null>(null);

  // State cho xác nhận hoàn thành dự án
  const [showCompleteProjectModal, setShowCompleteProjectModal] = useState(false);
  const [isCompletingProject, setIsCompletingProject] = useState(false);

  // State cho modal đánh giá dự án sau khi hoàn thành
  const [showProjectReviewModal, setShowProjectReviewModal] = useState(false);

  // Combined loading state
  const loading = projectLoading || milestonesLoading;
  const error = projectError;

  // Sử dụng custom hook để extract permissions dễ dàng
  const perms = usePermissions(permissions);

  // Milestone permissions - sử dụng permission flags từ API
  const canCreateMilestone = perms.milestone.canCreateMilestone;
  const canEditMilestone = perms.milestone.canEditMilestone;
  const canDeleteMilestone = perms.milestone.canDeleteMilestone;

  // Payment permissions - sử dụng permission flag thay vì check role
  const canViewFinancialInfo =
    perms.payment.canViewPayment ||
    projectRole === "OWNER" ||
    projectRole === "CLIENT";

  // Permission để xem contract overview - dành cho OWNER và CLIENT
  const canViewContractOverview = useMemo(() => {
    return (
      (perms.projectRole === "OWNER" || perms.projectRole === "CLIENT") &&
      perms.payment.canViewPayment
    );
  }, [perms.projectRole, perms.payment.canViewPayment]);

  // Permission để xem addendum
  const canViewAddendum = perms.addendum.canViewAddendum;

  // Kiểm tra xem có thể hiển thị nội dung hay không
  // Chỉ hiển thị khi hợp đồng đã được thanh toán (PAID, COMPLETED hoặc TERMINATED)
  const canShowContent = useMemo(() => {
    return (
      contractStatus === "PAID" ||
      contractStatus === "COMPLETED" ||
      contractStatus === "TERMINATED"
    );
  }, [contractStatus]);

  // Điều kiện hiển thị nút xác nhận hoàn thành dự án
  // - Chỉ CLIENT trong dự án
  // - Dự án chưa được hoàn thành trước đó (project.status !== COMPLETED)
  // - Payment FULL: cho phép xác nhận hoàn thành hợp đồng (khi canShowContent true)
  // - Payment MILESTONE: chỉ cho phép khi tất cả cột mốc đã hoàn thành
  const isClientInProject = projectRole === "CLIENT";
  const paymentType = project?.paymentType
    ? project.paymentType.toString().toUpperCase()
    : null;
  const isFullPayment = paymentType === "FULL";
  const isMilestonePayment = paymentType === "MILESTONE";
  const allMilestonesCompleted =
    milestones.length > 0 &&
    milestones.every(
      (ms) => ms.status === "Nhiệm Vụ Hoàn Thành"
    );
  const canConfirmCompleteProject =
    isClientInProject &&
    canShowContent &&
    project?.status !== "COMPLETED" &&
    ((isFullPayment && Boolean(contractStatus)) ||
      (isMilestonePayment && allMilestonesCompleted));

  // Lấy contractId để phục vụ tạo link thanh toán (milestone payment)
  useEffect(() => {
    const loadContractId = async () => {
      if (!projectId) return;
      try {
        const meta = await contractService.getContractMetadata(projectId);
        if (meta?.id) {
          setContractId(meta.id);
        }
      } catch (err) {
        console.warn("Không thể lấy contract metadata:", err);
        setContractId(null);
      }
    };
    loadContractId();
  }, [projectId]);

  // Handlers
  const handleNavigateToMilestone = (id: number) => {
    const target = milestones.find((m) => m.id === id);
    const isPendingMilestone = target?.status === "Đang Chờ Lệnh";
    const isPaymentPending = (target?.paymentStatus || "").toString().toUpperCase() === "PENDING";

    // 1) Kiểm tra cột mốc trước đã hoàn thành chưa
    if (typeof target?.sequence === "number") {
      const prev = milestones
        .filter(
          (m) =>
            typeof m.sequence === "number" &&
            (m.sequence as number) < target.sequence!
        )
        .sort((a, b) => (b.sequence ?? 0) - (a.sequence ?? 0))[0];

      const prevNotDone =
        prev &&
        prev.status !== "Nhiệm Vụ Hoàn Thành" &&
        prev.status !== "Chờ Khách hàng duyệt";

      if (prevNotDone) {
        showToast({
          type: "error",
          message: "Không thể vào cột mốc này vì cột mốc trước đó chưa hoàn thành.",
        });
        return;
      }
    }

    // 2) Kiểm tra cột mốc hiện tại có đang chờ thanh toán không
    if (isPendingMilestone && isPaymentPending) {
      // Chỉ CLIENT mới được mở modal thanh toán; role khác vẫn báo toast như cũ
      if (projectRole === "CLIENT") {
        setSelectedPaymentMilestone(target || null);
        setShowPaymentModal(true);
      } else {
        showToast({
          type: "error",
          message: "Cột mốc đang chờ thanh toán. Vui lòng hoàn tất thanh toán trước khi truy cập.",
        });
      }
      return;
    }

    navigate(`${ROUTER.USER.PROJECT_WORKSPACE}?milestoneId=${id}`);
  };

  const handleNavigateToCreateContract = () => {
    if (projectId) {
      navigate(`${ROUTER.USER.CONTRACTSPACE}?id=${projectId}`);
    }
  };

  const handleNavigateToAddendum = () => {
    if (projectId) {
      navigate(`${ROUTER.USER.ADDENDUM_LIST}?id=${projectId}`);
    }
  };

  // Toast hook
  const { showToast } = useCosmicToast();

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPaymentMilestone(null);
  };

  const handleCreateMilestonePaymentLink = async () => {
    if (!projectId || !contractId || !selectedPaymentMilestone) {
      showToast({
        type: "error",
        message: "Thiếu thông tin để tạo liên kết thanh toán cột mốc.",
      });
      return;
    }
    try {
      setIsCreatingPaymentLink(true);
      const milestoneId = Number(selectedPaymentMilestone.id);

      if (!Number.isFinite(milestoneId)) {
        showToast({
          type: "error",
          message: "Định danh cột mốc không hợp lệ. Vui lòng tải lại trang và thử lại.",
        });
        return;
      }

      const base = window.location.origin;
      // Sử dụng generic payment return route để BE/PayOS redirect về
      const returnUrl = `${base}${ROUTER.USER.PAYMENTS_RETURN}?projectId=${projectId}&contractId=${contractId}&milestoneId=${milestoneId}`;
      const cancelUrl = `${base}${ROUTER.USER.PAYMENTS_RETURN}?projectId=${projectId}&contractId=${contractId}&milestoneId=${milestoneId}&cancel=true`;
      const result = await paymentService.createContractPaymentLink(
        projectId,
        contractId,
        {
          returnUrl,
          cancelUrl,
          milestoneId,
        }
      );
      window.open(result.paymentUrl, "_blank", "noopener,noreferrer");
      showToast({
        type: "success",
        message: "Đã tạo liên kết thanh toán. Vui lòng hoàn tất trên PayOS.",
      });
      handleClosePaymentModal();
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Không thể tạo liên kết thanh toán.";
      showToast({
        type: "error",
        message,
      });
    } finally {
      setIsCreatingPaymentLink(false);
    }
  };

  const handleOpenCompleteProjectModal = () => {
    if (!projectId || !canConfirmCompleteProject) {
      return;
    }
    setShowCompleteProjectModal(true);
  };

  const handleConfirmCompleteProject = async () => {
    if (!projectId) {
      return;
    }

    try {
      setIsCompletingProject(true);
      await projectService.completeProject(projectId);
      showToast({
        type: "success",
        message: "Bạn đã xác nhận hoàn thành dự án. Cảm ơn bạn đã đồng hành!",
      });
      setShowCompleteProjectModal(false);

      // Sau khi hoàn thành dự án, mở modal Đánh giá Dự án cho CLIENT
      if (projectRole === "CLIENT") {
        setShowProjectReviewModal(true);
      } else {
        // Với role khác, chỉ cần reload để cập nhật trạng thái
        window.location.reload();
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : "Không thể xác nhận hoàn thành dự án. Vui lòng thử lại.";
      showToast({
        type: "error",
        message,
      });
    } finally {
      setIsCompletingProject(false);
    }
  };

  // Handler for create milestone button click
  const handleCreateMilestoneClick = () => {
    if (project?.paymentType?.toUpperCase() === "MILESTONE") {
      showToast({
        message:
          "Bạn không thể tạo cột mốc vì loại hợp đồng này không cho phép tạo cột mốc thủ công.",
        type: "error",
      });
    } else {
      openCreateModal();
    }
  };

  const handleSubmitMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await submitMilestone(
        createForm,
        modalMode,
        editingMilestone
      );
      if (success) {
        closeModal();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler để mở modal xác nhận xóa
  const handleDeleteClick = (milestone: Milestone) => {
    setMilestoneToDelete(milestone);
  };

  // Handler để xác nhận xóa
  const handleConfirmDelete = async () => {
    if (milestoneToDelete) {
      await deleteMilestone(milestoneToDelete);
      setMilestoneToDelete(null);
    }
  };

  // Handler để hủy xóa
  const handleCancelDelete = () => {
    setMilestoneToDelete(null);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        background: "radial-gradient(circle at top, #242446, #151526 70%)",
      }}
    >
      {/* Import font */}
      <style>
        {`
                    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
                    
                    /* Keyframes cho animation */
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUpFade {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fadeIn 0.5s ease-out forwards;
                    }
                    .animate-slide-up-fade {
                        opacity: 0; /* Bắt đầu ẩn */
                        animation: slideUpFade 0.6s ease-out forwards;
                    }

                    /* === NEW: Animation cho "Dòng năng lượng" === */
                    @keyframes flow {
                        0% { transform: translateY(0); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: translateY(400%); opacity: 0; } 
                    }
                    .animate-flow {
                        /* Loop vô hạn, mỗi 3s */
                        animation: flow 3s ease-in-out infinite; 
                        animation-delay: 1s; /* Bắt đầu sau 1s */
                    }

                    /* === Universe Theme Animations === */
                    @keyframes twinkle {
                        0%, 100% { opacity: 0.3; transform: scale(1); }
                        50% { opacity: 1; transform: scale(1.2); }
                    }
                    .animate-twinkle {
                        animation: twinkle 3s ease-in-out infinite;
                    }

                    @keyframes float {
                        0%, 100% { transform: translateY(0px) translateX(0px); }
                        33% { transform: translateY(-10px) translateX(5px); }
                        66% { transform: translateY(5px) translateX(-5px); }
                    }
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }

                    @keyframes float-delayed {
                        0%, 100% { transform: translateY(0px) translateX(0px); }
                        33% { transform: translateY(8px) translateX(-8px); }
                        66% { transform: translateY(-5px) translateX(8px); }
                    }
                    .animate-float-delayed {
                        animation: float-delayed 8s ease-in-out infinite;
                        animation-delay: 1s;
                    }

                    @keyframes float-slow {
                        0%, 100% { transform: translateY(0px) translateX(0px); }
                        50% { transform: translateY(-15px) translateX(10px); }
                    }
                    .animate-float-slow {
                        animation: float-slow 10s ease-in-out infinite;
                        animation-delay: 2s;
                    }

                    @keyframes glow {
                        0%, 100% { 
                            text-shadow: 0 0 20px rgba(168, 85, 247, 0.5),
                                         0 0 40px rgba(168, 85, 247, 0.3),
                                         0 0 60px rgba(168, 85, 247, 0.2);
                        }
                        50% { 
                            text-shadow: 0 0 30px rgba(168, 85, 247, 0.8),
                                         0 0 60px rgba(168, 85, 247, 0.5),
                                         0 0 90px rgba(168, 85, 247, 0.3);
                        }
                    }
                    .animate-glow {
                        animation: glow 3s ease-in-out infinite;
                    }

                    /* Button animations */
                    @keyframes pulse-slow {
                        0%, 100% { opacity: 0.6; transform: scale(1); }
                        50% { opacity: 0.9; transform: scale(1.05); }
                    }
                    .animate-pulse-slow {
                        animation: pulse-slow 3s ease-in-out infinite;
                    }

                    @keyframes glow-button-blue {
                        0%, 100% { 
                            box-shadow: 0 0 30px rgba(96, 165, 250, 0.8),
                                        0 0 50px rgba(96, 165, 250, 0.4),
                                        0 0 70px rgba(96, 165, 250, 0.2);
                        }
                        50% { 
                            box-shadow: 0 0 40px rgba(96, 165, 250, 1),
                                        0 0 70px rgba(96, 165, 250, 0.6),
                                        0 0 100px rgba(96, 165, 250, 0.3);
                        }
                    }
                    .animate-glow-button-blue {
                        animation: glow-button-blue 2s ease-in-out infinite;
                    }

                    @keyframes glow-button-purple {
                        0%, 100% { 
                            box-shadow: 0 0 30px rgba(168, 85, 247, 0.8),
                                        0 0 50px rgba(168, 85, 247, 0.4),
                                        0 0 70px rgba(168, 85, 247, 0.2);
                        }
                        50% { 
                            box-shadow: 0 0 40px rgba(168, 85, 247, 1),
                                        0 0 70px rgba(168, 85, 247, 0.6),
                                        0 0 100px rgba(168, 85, 247, 0.3);
                        }
                    }
                    .animate-glow-button-purple {
                        animation: glow-button-purple 2s ease-in-out infinite;
                        animation-delay: 0.3s;
                    }

                    @keyframes bounce-slow {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-5px); }
                    }
                    .animate-bounce-slow {
                        animation: bounce-slow 2s ease-in-out infinite;
                    }

                    /* Scanning line animation for header */
                    @keyframes scan {
                        0% { transform: translateX(-100%); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: translateX(100%); opacity: 0; }
                    }
                    .animate-scan {
                        animation: scan 3s ease-in-out infinite;
                    }

                    /* Pulsing ring animation for holographic scanner */
                    @keyframes pulse-ring {
                        0% { 
                            transform: scale(1);
                            opacity: 0.6;
                        }
                        50% { 
                            transform: scale(1.15);
                            opacity: 0.3;
                        }
                        100% { 
                            transform: scale(1);
                            opacity: 0.6;
                        }
                    }
                    .animate-pulse-ring {
                        animation: pulse-ring 2s ease-in-out infinite;
                    }

                    /* Slow spin for orbital rings */
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-spin-slow {
                        animation: spin-slow 8s linear infinite;
                    }

                    /* Holographic shimmer effect */
                    @keyframes shimmer {
                        0% { transform: translateX(-100%) translateY(-100%) skewX(12deg); }
                        100% { transform: translateX(200%) translateY(200%) skewX(12deg); }
                    }
                    .animate-shimmer {
                        animation: shimmer 4s ease-in-out infinite;
                    }

                    /* Audio waveform animations - 7 bars with different rhythms */
                    @keyframes waveform-1 {
                        0%, 100% { height: 0.25rem; }
                        25% { height: 0.75rem; }
                        50% { height: 0.5rem; }
                        75% { height: 1rem; }
                    }
                    .animate-waveform-1 {
                        animation: waveform-1 1.2s ease-in-out infinite;
                    }

                    @keyframes waveform-2 {
                        0%, 100% { height: 0.5rem; }
                        20% { height: 1.25rem; }
                        40% { height: 0.75rem; }
                        60% { height: 1.5rem; }
                        80% { height: 0.4rem; }
                    }
                    .animate-waveform-2 {
                        animation: waveform-2 1.4s ease-in-out infinite;
                        animation-delay: 0.1s;
                    }

                    @keyframes waveform-3 {
                        0%, 100% { height: 0.75rem; }
                        30% { height: 1.5rem; }
                        60% { height: 0.6rem; }
                        90% { height: 1.25rem; }
                    }
                    .animate-waveform-3 {
                        animation: waveform-3 1.1s ease-in-out infinite;
                        animation-delay: 0.2s;
                    }

                    @keyframes waveform-4 {
                        0%, 100% { height: 1rem; }
                        15% { height: 0.4rem; }
                        35% { height: 1.75rem; }
                        55% { height: 0.8rem; }
                        75% { height: 1.5rem; }
                    }
                    .animate-waveform-4 {
                        animation: waveform-4 1.3s ease-in-out infinite;
                        animation-delay: 0.3s;
                    }

                    @keyframes waveform-5 {
                        0%, 100% { height: 0.6rem; }
                        25% { height: 1.25rem; }
                        50% { height: 0.5rem; }
                        75% { height: 1.5rem; }
                    }
                    .animate-waveform-5 {
                        animation: waveform-5 1.2s ease-in-out infinite;
                        animation-delay: 0.4s;
                    }

                    @keyframes waveform-6 {
                        0%, 100% { height: 0.75rem; }
                        20% { height: 1.5rem; }
                        40% { height: 0.6rem; }
                        60% { height: 1.25rem; }
                        80% { height: 0.5rem; }
                    }
                    .animate-waveform-6 {
                        animation: waveform-6 1.4s ease-in-out infinite;
                        animation-delay: 0.5s;
                    }

                    @keyframes waveform-7 {
                        0%, 100% { height: 0.5rem; }
                        30% { height: 1.25rem; }
                        60% { height: 0.75rem; }
                        90% { height: 1rem; }
                    }
                    .animate-waveform-7 {
                        animation: waveform-7 1.1s ease-in-out infinite;
                        animation-delay: 0.6s;
                    }

                    /* Hyperlane Data Pulse Animation */
                    @keyframes data-pulse {
                        0% { 
                            transform: translateY(0);
                            opacity: 0;
                        }
                        10% { 
                            opacity: 1;
                        }
                        90% { 
                            opacity: 1;
                        }
                        100% { 
                            transform: translateY(calc(100vh - 100px));
                            opacity: 0;
                        }
                    }
                    .animate-data-pulse {
                        animation: data-pulse 4s linear infinite;
                    }

                    /* Saturn Ring Rotation Animation */
                    @keyframes ring-rotate {
                        from { 
                            transform: translate(-50%, -50%) rotateX(75deg) rotateZ(0deg);
                        }
                        to { 
                            transform: translate(-50%, -50%) rotateX(75deg) rotateZ(360deg);
                        }
                    }
                    .planet-ring {
                        animation: ring-rotate 8s linear infinite;
                        transform-origin: center;
                    }

                    /* Star Twinkle Animation */
                    @keyframes twinkle {
                        0%, 100% { 
                            opacity: 0.3;
                            transform: scale(1);
                        }
                        50% { 
                            opacity: 1;
                            transform: scale(1.5);
                        }
                    }
                    .star-twinkle .animate-twinkle {
                        animation: twinkle 2s ease-in-out infinite;
                    }

                    /* Planet Hover Effects */
                    .milestone-item:hover .waypoint-node[data-status="completed"] .planet-life {
                        transform: scale(1.15);
                        filter: brightness(1.3);
                    }

                    .milestone-item:hover .waypoint-node[data-status="active"] .planet-ringed {
                        transform: scale(1.15);
                        filter: brightness(1.2);
                    }

                    .milestone-item:hover .waypoint-node[data-status="active"] .planet-ring {
                        animation-duration: 4s;
                        box-shadow: 0 0 30px rgba(251, 191, 36, 0.6), 0 0 60px rgba(251, 191, 36, 0.4);
                    }

                    .milestone-item:hover .waypoint-node[data-status="pending"] .planet-ice {
                        transform: scale(1.1);
                        filter: brightness(1.4);
                    }

                    .milestone-item:hover .waypoint-node[data-status="pending"] .planet-ice::after {
                        box-shadow: 0 0 25px rgba(148, 163, 184, 0.4);
                    }

                    /* Connector Beam Hover Effect */
                    .milestone-item:hover .connector-beam {
                        opacity: 1;
                    }

                    /* Planet Container Base Styles */
                    .planet-container {
                        transition: transform 0.3s ease, filter 0.3s ease;
                    }

                    .planet-life,
                    .planet-ringed,
                    .planet-ice {
                        transition: transform 0.3s ease, filter 0.3s ease;
                    }

                    /* === Sonic Data Drive Animations === */
                    
                    /* Glass Shine Animation - Sweeps diagonally every 5 seconds */
                    @keyframes glass-shine {
                        0% {
                            transform: translateX(-100%) translateY(-100%) skewX(-12deg);
                            opacity: 0;
                        }
                        10% {
                            opacity: 0.6;
                        }
                        20% {
                            opacity: 0.8;
                        }
                        30% {
                            opacity: 0.6;
                        }
                        100% {
                            transform: translateX(200%) translateY(200%) skewX(-12deg);
                            opacity: 0;
                        }
                    }
                    .glass-shine {
                        background: linear-gradient(
                            135deg,
                            transparent 0%,
                            transparent 40%,
                            rgba(255, 255, 255, 0.1) 50%,
                            transparent 60%,
                            transparent 100%
                        );
                        animation: glass-shine 5s ease-in-out infinite;
                    }

                    /* Equalizer Bar Animations - Different rhythms for each bar */
                    @keyframes equalizer-1 {
                        0%, 100% { height: 0.25rem; }
                        25% { height: 0.75rem; }
                        50% { height: 0.5rem; }
                        75% { height: 1rem; }
                    }
                    .equalizer-bar-1 {
                        animation: equalizer-1 1.2s ease-in-out infinite;
                        animation-delay: 0s;
                    }

                    @keyframes equalizer-2 {
                        0%, 100% { height: 0.5rem; }
                        20% { height: 1.25rem; }
                        40% { height: 0.75rem; }
                        60% { height: 1.5rem; }
                        80% { height: 0.4rem; }
                    }
                    .equalizer-bar-2 {
                        animation: equalizer-2 1.4s ease-in-out infinite;
                        animation-delay: 0.1s;
                    }

                    @keyframes equalizer-3 {
                        0%, 100% { height: 0.75rem; }
                        30% { height: 1.5rem; }
                        60% { height: 0.6rem; }
                        90% { height: 1.25rem; }
                    }
                    .equalizer-bar-3 {
                        animation: equalizer-3 1.1s ease-in-out infinite;
                        animation-delay: 0.2s;
                    }

                    @keyframes equalizer-4 {
                        0%, 100% { height: 1rem; }
                        15% { height: 0.4rem; }
                        35% { height: 1.75rem; }
                        55% { height: 0.8rem; }
                        75% { height: 1.5rem; }
                    }
                    .equalizer-bar-4 {
                        animation: equalizer-4 1.3s ease-in-out infinite;
                        animation-delay: 0.3s;
                    }

                    /* Enhanced hover effects for Sonic Data Drive */
                    .sonic-data-drive:hover .glass-shine {
                        opacity: 1;
                        animation-duration: 3s;
                    }
                `}
      </style>

      {/* Container chính của nội dung */}
      <main className="max-w-7xl mx-auto">
        <AnimatedBackground />
        {/* Checking contract state */}
        {checkingContract && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Đang kiểm tra hợp đồng...</p>
            </div>
          </div>
        )}

        {/* No contract state */}
        {!checkingContract && !hasContract && (
          <NoContractNotification
            onNavigateToContract={handleNavigateToCreateContract}
          />
        )}

        {/* Loading state */}
        {!checkingContract && hasContract && loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-gray-400">Đang tải dữ liệu...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!checkingContract && hasContract && !loading && error && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4 text-center p-6">
              <AlertCircle className="w-12 h-12 text-red-400" />
              <p className="text-red-400 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Main content */}
        {!checkingContract && hasContract && !loading && !error && project && (
          <>
            <MilestoneDashboard
              project={project}
              milestones={milestones}
              canCreateMilestone={canCreateMilestone}
              canEditMilestone={canEditMilestone}
              canDeleteMilestone={canDeleteMilestone}
              canViewFinancialInfo={canViewFinancialInfo}
              onNavigateToMilestone={handleNavigateToMilestone}
              onCreateMilestone={handleCreateMilestoneClick}
              contractStatus={contractStatus}
              onNavigateToContract={handleNavigateToCreateContract}
              onEditMilestone={openEditModal}
              onDeleteMilestone={handleDeleteClick}
              deletingMilestoneId={deletingMilestoneId}
              canShowContent={canShowContent}
              canViewContractOverview={canViewContractOverview}
              currencyFormatter={currencyFormatter}
              numberFormatter={numberFormatter}
              usedAmount={usedAmount}
              usedProducts={usedProducts}
              usedEdits={usedEdits}
              contractAmountLimit={contractAmountLimit}
              productLimit={productLimit}
              editLimit={editLimit}
            />
          </>
        )}

        {/* Modal: Yêu cầu thanh toán cột mốc */}
        {showPaymentModal && selectedPaymentMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-100">Cần thanh toán cột mốc</h3>
                  <p className="text-sm text-slate-200/80 mt-1">
                    Cột mốc <span className="font-semibold text-cyan-200">{selectedPaymentMilestone.title}</span> đang chờ thanh toán.
                  </p>
                </div>
                <button
                  onClick={handleClosePaymentModal}
                  className="text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                <div className="flex items-center justify-between text-sm text-cyan-100">
                  <span>Số tiền cần thanh toán</span>
                  <span className="text-lg font-bold text-cyan-200">
                    {selectedPaymentMilestone.budget?.toLocaleString("vi-VN") || "0"} VNĐ
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300/80 space-y-1">
                <p>- Hệ thống sẽ tạo liên kết PayOS cho cột mốc này.</p>
                <p>- Sau khi thanh toán thành công, trạng thái sẽ tự cập nhật.</p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleClosePaymentModal}
                  className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700/50 transition"
                  disabled={isCreatingPaymentLink}
                >
                  Để sau
                </button>
                <button
                  onClick={handleCreateMilestonePaymentLink}
                  disabled={isCreatingPaymentLink}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition disabled:opacity-60"
                >
                  {isCreatingPaymentLink ? "Đang tạo link..." : "Thanh toán ngay"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Milestone Modal */}
        <MilestoneFormModal
          isOpen={showMilestoneModal}
          modalMode={modalMode}
          isSubmitting={isSubmitting}
          formData={createForm}
          onFormChange={setCreateForm}
          onSubmit={handleSubmitMilestone}
          onClose={closeModal}
          currencyFormatter={currencyFormatter}
          numberFormatter={numberFormatter}
          usedAmount={usedAmount}
          usedProducts={usedProducts}
          usedEdits={usedEdits}
          contractAmountLimit={contractAmountLimit}
          productLimit={productLimit}
          editLimit={editLimit}
          remainingAmountForModal={remainingAmountForModal}
          remainingProductsForModal={remainingProductsForModal}
          remainingEditsForModal={remainingEditsForModal}
          remainingAmountAfter={remainingAmountAfter}
          remainingProductsAfter={remainingProductsAfter}
          remainingEditsAfter={remainingEditsAfter}
          remainingAmountAfterRaw={remainingAmountAfterRaw}
          remainingProductsAfterRaw={remainingProductsAfterRaw}
          remainingEditsAfterRaw={remainingEditsAfterRaw}
          amountIsOverLimit={amountIsOverLimit}
          productIsOverLimit={productIsOverLimit}
          editIsOverLimit={editIsOverLimit}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          show={milestoneToDelete !== null}
          title="Xác nhận xóa cột mốc"
          message={`Bạn có chắc chắn muốn xóa cột mốc "${milestoneToDelete?.title}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          confirmButtonClass="bg-red-600 hover:bg-red-500"
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          isProcessing={deletingMilestoneId === milestoneToDelete?.id}
        />

        {/* Fixed Action Buttons - Bottom Left Corner */}
        <div className="fixed bottom-6 left-12 z-50 flex flex-col gap-4">
          {/* Complete Project Button - chỉ cho CLIENT */}
          {canConfirmCompleteProject && (
            <button
              onClick={handleOpenCompleteProjectModal}
              className="group relative flex items-center justify-center transition-all duration-300"
              title="Xác nhận hoàn thành dự án"
            >
              {/* Orbital Rotating Ring */}
              <div className="absolute -inset-2 rounded-2xl border border-dashed border-sky-400/40 animate-spin-slow group-hover:animate-spin group-hover:border-sky-400/70"></div>

              {/* Pulsing Ring Animation */}
              <div className="absolute inset-0 rounded-2xl border-2 border-sky-400/40 animate-pulse-ring"></div>

              {/* Tech Frame */}
              <div className="relative w-16 h-16 rounded-2xl border-2 border-sky-500/60 bg-sky-900/40 backdrop-blur-xl group-hover:border-sky-400 group-hover:bg-sky-800/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.8)] shadow-2xl">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                  <CheckCircle2
                    size={28}
                    className="text-sky-300 group-hover:text-sky-100 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(56,189,248,0.9)]"
                  />
                </div>
              </div>
              <span className="sr-only">Xác nhận hoàn thành dự án</span>
            </button>
          )}

          {/* Addendum Button */}
          {canViewAddendum && (
            <button
              onClick={handleNavigateToAddendum}
              className="group relative flex items-center justify-center transition-all duration-300"
              title="Xem Phụ lục Hợp đồng"
            >
              {/* Orbital Rotating Ring */}
              <div className="absolute -inset-2 rounded-2xl border border-dashed border-emerald-400/40 animate-spin-slow group-hover:animate-spin group-hover:border-emerald-400/70"></div>

              {/* Pulsing Ring Animation */}
              <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/40 animate-pulse-ring"></div>

              {/* Tech Frame - Hexagonal Squircle */}
              <div className="relative w-16 h-16 rounded-2xl border-2 border-emerald-500/60 bg-emerald-900/40 backdrop-blur-xl group-hover:border-emerald-400 group-hover:bg-emerald-800/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.8)] shadow-2xl">
                {/* Inner Glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20"></div>
                {/* Icon */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <FileText
                    size={28}
                    className="text-emerald-300 group-hover:text-emerald-100 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.9)]"
                  />
                </div>
              </div>
              <span className="sr-only">Xem Phụ lục Hợp đồng</span>
            </button>
          )}
        </div>

        {/* Modal xác nhận hoàn thành dự án */}
        <ConfirmModal
          show={showCompleteProjectModal}
          title="Xác nhận hoàn thành dự án"
          message="Bạn xác nhận dự án này đã hoàn thành toàn bộ? Sau khi xác nhận, thông tin trạng thái dự án sẽ được cập nhật."
          confirmText="Xác nhận hoàn thành"
          cancelText="Hủy"
          confirmButtonClass="bg-sky-600 hover:bg-sky-500"
          onClose={() => setShowCompleteProjectModal(false)}
          onConfirm={handleConfirmCompleteProject}
          isProcessing={isCompletingProject}
        />

        {/* Modal Đánh giá Dự án - hiển thị sau khi CLIENT xác nhận hoàn thành */}
        {project && (
          <ProjectReviewModal
            isOpen={showProjectReviewModal}
            onClose={() => {
              setShowProjectReviewModal(false);
              // Sau khi đóng modal review, reload để cập nhật trạng thái/todolist
              window.location.reload();
            }}
            projectId={project.id}
            projectTitle={project.name}
            producerName={
              // Tạm thời chưa có tên producer trong Project workspace,
              // BE đã biết projectId nên có thể không cần hiển thị chính xác ở đây.
              "" as string
            }
          />
        )}
      </main>
    </div>
  );
}
