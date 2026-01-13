import { useState, useRef } from "react";
import {
  Music,
  ImageIcon,
  FileText,
  UploadCloud,
  Video,
  Play,
  XCircle,
} from "lucide-react";
import AnimatedBackground from "@/component/background/AnimatedBackground";
import { getInspirationDownloadUrl } from "@/services/boardService";
import { useNavigate } from "react-router-dom";
import { useCosmicToast } from "@/component/toast/CosmicToastProvider";
import BackToProjectButton from "@/component/buttons/BackToProjectButton";
import { useInspirationBoardLogic } from "@/component/hooks/useInspirationBoard";

type NodeType = "image" | "audio" | "text" | "video";
type InspirationNodeData = {
  id: number;
  type: NodeType;
  content: string;
  title?: string;
  isDataUrl?: boolean;
};
type NodeState = InspirationNodeData & {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const AudioVisualizer = () => (
  <div className="flex justify-center items-center h-full w-20">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="w-1.5 h-full bg-purple-400 rounded-full mx-0.5 animate-eq"
        style={{ animationDelay: `${i * 120}ms` }}
      ></div>
    ))}
  </div>
);

const Node = ({
  node,
  onClick,
}: {
  node: InspirationNodeData;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="absolute rounded-2xl overflow-hidden cursor-pointer transition-transform duration-500 hover:scale-110 group node-item will-change-transform"
      style={{ width: "240px", height: "180px" }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-700/10 to-blue-400/5 blur-3xl group-hover:blur-2xl"></div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-700/30 to-transparent opacity-50 group-hover:opacity-80 transition-all"></div>

      {node.type === "image" && (
        <img
          src={node.content}
          alt={node.title}
          className="w-full h-full object-cover rounded-2xl"
        />
      )}
      {node.type === "audio" && (
        <div className="flex flex-col items-center justify-center h-full text-center backdrop-blur-md bg-black/40 rounded-2xl">
          <div className="w-24 h-24 rounded-full border border-purple-400/50 flex items-center justify-center bg-purple-500/10">
            <AudioVisualizer />
          </div>
          <p className="mt-2 text-sm text-purple-300 font-medium">
            {node.title}
          </p>
        </div>
      )}
      {node.type === "video" && (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src="https://images.pexels.com/videos/853875/free-video-853875.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500"
            className="w-full h-full object-cover rounded-2xl opacity-60"
          />
          <Play size={40} className="absolute text-blue-300 drop-shadow-lg" />
        </div>
      )}
      {node.type === "text" && (
        <div className="h-full flex items-center justify-center px-4 bg-gradient-to-br from-purple-900/40 to-transparent rounded-2xl backdrop-blur-sm">
          <p className="text-center text-gray-300 italic text-sm">
            “{node.content}”
          </p>
        </div>
      )}
    </div>
  );
};

const NodeDetailModal = ({
  node,
  onClose,
  projectId,
  onDelete,
}: {
  node: NodeState | null;
  onClose: () => void;
  projectId: number | null;
  onDelete: (nodeId: number) => void;
}) => {
  const { showToast } = useCosmicToast();
  if (!node) return null;

  const handleDownload = async () => {
    if (!projectId) return;
    try {
      const url = await getInspirationDownloadUrl(
        projectId,
        node.id,
        node.title
      );
      window.open(url, "_blank");
      showToast("⬇ Tải xuống thành công!", "success");
    } catch (err) {
      console.error("Download thất bại", err);
      showToast("❌ Không thể tải xuống 😢", "error");
    }
  };

  // Xóa node sẽ được xử lý qua prop onDelete (kết nối với hook)
  const handleDelete = () => {
    if (!window.confirm("Bạn có chắc muốn xóa cảm hứng này?")) return;
    onDelete(node.id);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-lg z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-[#1a0033]/90 to-[#050011]/90 border border-purple-500/30 rounded-2xl p-6 max-w-4xl w-full animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <XCircle />
        </button>
        <h2 className="text-2xl font-semibold text-purple-300 mb-4 flex items-center gap-2">
          {node.type === "image" && <ImageIcon />}
          {node.type === "audio" && <Music />}
          {node.type === "text" && <FileText />}
          {node.type === "video" && <Video />}
          {node.title || "Chi tiết cảm hứng"}
        </h2>
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          {node.type === "image" && (
            <img
              src={node.content}
              className="rounded-lg w-full"
              alt={node.title}
            />
          )}
          {node.type === "audio" && (
            <audio controls src={node.content} className="w-full mt-4" />
          )}
          {node.type === "video" && (
            <video controls src={node.content} className="rounded-lg w-full" />
          )}
          {node.type === "text" && (
            <p className="italic text-gray-200 mt-2">{node.content}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {node.type !== "text" && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg transition-all"
            >
              ⬇ Tải về
            </button>
          )}

          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white font-medium shadow-lg transition-all"
          >
            🗑 Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default function InspirationBoard() {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useCosmicToast();
  const navigate = useNavigate();
  const {
    projectId,
    visibleNodes,
    hiddenNodes,
    selectedNode,
    loading,
    totalCanvasHeight,
    setSelectedNode,
    handleUpload: hookHandleUpload,
    handleDeleteNode,
    loadMoreRef,
  } = useInspirationBoardLogic(frameRef, canvasRef);

  const handleUploadWrapper = async () => {
    if (!note.trim() && !file) {
      showToast("Hãy viết vài dòng hoặc chọn một tệp để gieo mầm ✨", "error");
      return;
    }

    if (note.trim() && file) {
      showToast(
        "Bạn chỉ được phép gieo mầm hoặc là Ghi chú (Note) HOẶC là Tệp (File), không được đồng thời cả hai.",
        "error"
      );
      return;
    }

    setUploading(true);
    await hookHandleUpload(note, file, setNote, setFile, setShowUploadModal);
    setUploading(false);
  };
  const handleClearFile = () => {
    setFile(null);
    // Reset giá trị của input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-[#07001a] via-[#0a0030] to-[#180050] overflow-hidden text-white">
      <AnimatedBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(150,0,255,0.15),transparent_70%)] animate-pulse-slow"></div>

      <header className="text-center py-10 z-20 relative mt-14">
        <h1 className="text-5xl font-extrabold tracking-tight">
          ✨ Tinh Vân <span className="text-purple-600"> Ý Tưởng</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Không gian sáng tạo giữa các vì sao 🎵
        </p>
      </header>
      <div className="fixed top-[80px] left-7 z-[9999]">
        <BackToProjectButton />
      </div>

      <main
        ref={frameRef}
        className="relative flex-grow flex justify-center items-start"
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        ></canvas>

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-3 text-lg text-purple-300">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            Đang thu thập cảm hứng...
          </div>
        )}

        <div
          className="relative z-10 w-[1000px]"
          style={{
            height: `${totalCanvasHeight}px`,
            position: "relative",
          }}
        >
          {visibleNodes.map((node, index) => (
            <Node
              key={`${node.id}-${node.type}-${index}`}
              node={node}
              onClick={() => setSelectedNode(node)}
            />
          ))}

          {hiddenNodes.length > 0 && (
            <div
              ref={loadMoreRef}
              className="absolute bottom-0 w-full h-20"
            ></div>
          )}
        </div>

        <footer className="fixed bottom-0 z-20 py-10 flex justify-center">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-[0_0_25px_rgba(236,72,153,0.8)] transition-all"
          >
            🌱 Gieo mầm ý tưởng
          </button>

          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg animate-fade-in">
              <div
                className="bg-gradient-to-br from-[#1b003a]/90 to-[#050011]/90 border border-purple-500/30 rounded-2xl p-8 w-full max-w-lg text-white animate-zoom-in"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-4 text-center text-purple-300">
                  🌱 Gieo mầm Ý Tưởng
                </h2>
                <label className="block text-sm text-gray-300 mb-2">
                  Ghi chú / Cảm hứng
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Hôm nay mình muốn thử một đoạn hook thật lạ..."
                  className="w-full p-3 rounded-xl bg-black/30 border border-purple-400/30 focus:outline-none focus:border-purple-400 transition text-sm mb-4"
                  rows={3}
                />
                <label className="block text-sm text-gray-300 mb-2">
                  Chọn tệp (ảnh / nhạc / video)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,audio/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-600/80 file:text-white hover:file:bg-purple-700/90 transition mb-4"
                />
                {file && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    📎 Tệp đã chọn:{" "}
                    <span className="text-purple-300">{file.name}</span>
                    {/* NÚT XÓA ẢNH ĐÃ CHỌN */}
                    <button
                      onClick={handleClearFile}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Xóa tệp đã chọn"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-full bg-gray-700/50 hover:bg-gray-600 transition text-sm"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUploadWrapper}
                    disabled={uploading}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_35px_rgba(236,72,153,0.9)] transition-all duration-500 text-sm"
                  >
                    <UploadCloud size={18} />{" "}
                    {uploading ? "Đang gieo mầm..." : "Tải lên vũ trụ 🚀"}
                  </button>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() =>
              navigate(`/lyrics-suggestion?projectId=${projectId}`)
            }
            className="
    relative px-7 py-3 rounded-full font-semibold text-white
    bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500
    shadow-[0_0_20px_rgba(200,70,255,0.7)]
    hover:shadow-[0_0_40px_rgba(255,100,255,0.9)]
    transition-all duration-300 flex items-center gap-2
    hover:scale-[1.07] active:scale-95
    overflow-hidden ml-3
  "
          >
            <span
              className="
      absolute inset-0 
      bg-gradient-to-r from-transparent via-white/30 to-transparent
      translate-x-[-120%]
      group-hover:translate-x-[120%]
      transition-transform duration-[1200ms] ease-out 
      blur-xl opacity-0 group-hover:opacity-100
    "
            ></span>

            <span
              className="
      absolute inset-0 rounded-full 
      animate-[spin_5s_linear_infinite]
      bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-400
      opacity-20
    "
            ></span>

            <span className="relative z-10 animate-pulse">🎵</span>
            <span className="relative z-10">Gợi ý lời bài hát</span>
          </button>
        </footer>
      </main>

      <NodeDetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        projectId={projectId}
        onDelete={handleDeleteNode}
      />
    </div>
  );
}
