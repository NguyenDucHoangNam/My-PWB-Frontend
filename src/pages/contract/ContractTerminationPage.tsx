import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Satellite, AlertTriangle } from "lucide-react";
import AnimatedBackground from "@/component/background/AnimatedBackground";
import BackToProjectButton from "@/component/buttons/BackToProjectButton";
import { useContractTermination } from "@/component/hooks/useContractTermination";
import { TerminationDetailView } from "./termination/TerminationDetailView";
import { TerminationPreviewCard } from "./termination/TerminationPreviewCard";
import { TerminationPreviewModal } from "./termination/TerminationPreviewModal";
import { TerminationDetailModal } from "./termination/TerminationDetailModal";
import projectService, {
  type ProjectPermissionResponse,
} from "../../services/projectService";

export default function ContractTerminationPage() {
  const [params] = useSearchParams();
  const contractId = params.get("contractId");
  const projectId = params.get("id") || params.get("projectId"); // Support both 'id' and 'projectId' for compatibility

  // UI-specific state
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [permissions, setPermissions] =
    useState<ProjectPermissionResponse | null>(null);

  // Load permissions
  useEffect(() => {
    const loadPermissions = async () => {
      if (!projectId) {
        setPermissions(null);
        return;
      }

      try {
        const perms = await projectService.getProjectPermissionByProjectId(
          projectId
        );
        setPermissions(perms);
      } catch (error: unknown) {
        console.warn(
          "Could not load permissions:",
          error instanceof Error ? error.message : String(error)
        );
        setPermissions(null);
      }
    };

    loadPermissions();
  }, [projectId]);

  // Use custom hook for termination logic
  const {
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    loading,
    previewData,
    error,
    handleCheckCompensation,
    terminationReason,
    setTerminationReason,
    isExecuting,
    terminationResult,
    handleExecuteTermination,
    paymentStatus,
    paymentOrderCode,
    terminationDetail,
    isLoadingDetail,
    isLoadingTerminationDetail,
    hasNoTermination,
    handleLoadTerminationDetail,
  } = useContractTermination({ contractId, projectId });

  return (
    <div className="relative min-h-screen text-white overflow-hidden mt-[73px]">
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto relative z-10 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="relative p-4 rounded-3xl bg-gradient-to-br from-orange-500/30 to-red-500/30 border border-orange-400/40 backdrop-blur-sm shadow-2xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-400/20 to-red-400/20 animate-pulse" />
              <AlertTriangle
                className="relative text-orange-300 w-8 h-8 animate-bounce"
                style={{ animationDuration: "2s" }}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="mt-1 text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 glow-text drop-shadow-[0_0_20px_rgba(251,146,60,0.35)]">
                  Xem trước chấm dứt hợp đồng
                </span>
              </h1>
              <div className="relative mt-3 h-1 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 opacity-70" />
                <div className="absolute -left-1/3 top-0 h-full w-1/3 bg-white/60 blur-md animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
              <div className="mt-2 flex items-center gap-2 text-orange-200/80 text-sm">
                <Satellite className="w-4 h-4 text-red-400 animate-pulse" />
                <span>Kiểm tra mức đền bù trước khi chấm dứt hợp đồng</span>
              </div>
            </div>
          </div>
          <BackToProjectButton projectId={projectId || undefined} />
        </header>

        {/* Main Content */}
        {isLoadingTerminationDetail ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
              <p className="text-white text-lg">
                Đang tải thông tin chấm dứt...
              </p>
            </div>
          </div>
        ) : terminationDetail ? (
          <TerminationDetailView
            terminationDetail={terminationDetail}
            projectId={projectId}
            onShowDetailModal={() => setShowDetailModal(true)}
            projectRole={permissions?.role.projectRole || null}
          />
        ) : (
          <TerminationPreviewCard
            contractId={contractId}
            hasNoTermination={hasNoTermination}
            error={error}
            isModalOpen={isModalOpen}
            onOpenModal={handleOpenModal}
            onLoadTerminationDetail={handleLoadTerminationDetail}
          />
        )}
      </div>

      {/* Termination Preview Modal */}
      <TerminationPreviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        loading={loading}
        previewData={previewData}
        error={error}
        terminationResult={terminationResult}
        terminationReason={terminationReason}
        setTerminationReason={setTerminationReason}
        isExecuting={isExecuting}
        paymentStatus={paymentStatus}
        paymentOrderCode={paymentOrderCode}
        contractId={contractId}
        projectId={projectId}
        terminationDetail={terminationDetail}
        onCheckCompensation={handleCheckCompensation}
        onExecuteTermination={handleExecuteTermination}
        onShowDetailModal={() => setShowDetailModal(true)}
        onLoadTerminationDetail={handleLoadTerminationDetail}
      />

      {/* Termination Detail Modal */}
      <TerminationDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        isLoading={isLoadingDetail}
        terminationDetail={terminationDetail}
        projectRole={permissions?.role.projectRole || null}
      />

      <style>{`
        .glow-text {
          text-shadow: 
            0 0 10px rgba(251, 146, 60, 0.5),
            0 0 20px rgba(251, 146, 60, 0.3),
            0 0 30px rgba(251, 146, 60, 0.2);
        }
      `}</style>
    </div>
  );
}
