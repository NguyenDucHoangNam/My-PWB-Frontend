import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  ArrowRightCircle,
  Library,
  Trash2,
  X,
  Pencil,
  Eye,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MAJOR_CHORDS,
  MINOR_CHORDS,
  Block,
  BLOCK_OPTIONS,
  BLOCK_TITLES,
  useDescriptionModal,
} from "@/component/hooks/useDescriptionModal";

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  milestoneId: number;
  initialScope?: "EXTERNAL" | "INTERNAL";
}

export default function DescriptionModal({
  isOpen,
  onClose,
  projectId,
  milestoneId,
  initialScope = "EXTERNAL",
}: DescriptionModalProps) {
  const {
    sections,
    role,
    // loading, // Có thể dùng để hiện spinner nếu muốn
    savingAction,
    selectedSection,
    viewInternal,
    isDirty: _isDirty,
    isDeleteMode,
    isManageMode,
    isEditMode,
    selectedDeleteIds,
    mainRef,
    setViewInternal: _setViewInternal,
    setSelectedSection,
    setIsDeleteMode,
    setIsManageMode,
    setIsEditMode,
    addSection,
    addBlock,
    deleteBlock,
    updateBlockContent,
    updateSectionTitle,
    onDragEnd,
    handleUploadImage,
    handleUploadMelody,
    handleCreate,
    handleUpdate,
    handleForwardToInternal,
    toggleDeleteSelection,
    handleBulkDelete,
    pendingForward,
    setPendingForward,
  } = useDescriptionModal(projectId, milestoneId, isOpen, initialScope);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="w-[95vw] max-w-[1600px] h-[75vh] bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-xl border border-purple-500/40 shadow-2xl shadow-purple-500/20 overflow-hidden relative flex flex-col z-10 backdrop-blur-xl">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-purple-500/30 bg-gradient-to-r from-gray-900/90 via-purple-900/50 to-gray-900/90 backdrop-blur-xl shrink-0 relative">
          {/* Decorative particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-2 left-1/4 w-1 h-1 bg-cyan-400 rounded-full opacity-60"></div>
            <div className="absolute top-2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-70"></div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <span className="text-2xl">🌌</span>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400">
              {viewInternal ? "Mô Tả Phòng Nội Bộ" : "Mô Tả Phòng Khách Hàng"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white relative z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden relative flex">
          <DragDropContext onDragEnd={onDragEnd}>
            {/* Static Background - Cosmic Pattern */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
              {/* Grid Pattern - Subtle */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: "60px 60px",
                }}
              />
              {/* Radial Gradients for Depth */}
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-400/5 rounded-full blur-3xl" />
              {/* Static Stars Pattern - Fixed positions for performance */}
              <div className="absolute inset-0">
                <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-purple-400 rounded-full opacity-60" />
                <div className="absolute top-[20%] left-[80%] w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-70" />
                <div className="absolute top-[35%] left-[25%] w-1 h-1 bg-purple-300 rounded-full opacity-50" />
                <div className="absolute top-[45%] left-[70%] w-1 h-1 bg-cyan-300 rounded-full opacity-65" />
                <div className="absolute top-[60%] left-[10%] w-1.5 h-1.5 bg-purple-400 rounded-full opacity-60" />
                <div className="absolute top-[70%] left-[85%] w-1 h-1 bg-cyan-400 rounded-full opacity-70" />
                <div className="absolute top-[80%] left-[30%] w-1 h-1 bg-purple-300 rounded-full opacity-50" />
                <div className="absolute top-[15%] left-[50%] w-1 h-1 bg-cyan-300 rounded-full opacity-65" />
                <div className="absolute top-[55%] left-[60%] w-1.5 h-1.5 bg-purple-400 rounded-full opacity-60" />
                <div className="absolute top-[25%] left-[40%] w-1 h-1 bg-cyan-400 rounded-full opacity-70" />
              </div>
            </div>

            {/* Left Sidebar */}
            <aside className="w-64 min-w-[240px] h-full flex flex-col border-r border-purple-500/30 bg-gradient-to-b from-gray-900/60 via-purple-900/30 to-gray-900/60 backdrop-blur-xl">
              {/* Buttons Header */}
              <div className="p-3 pb-0 flex flex-col gap-2">
                {/* EXTERNAL: Owner và Client được CRUD, Observer chỉ xem */}
                {/* INTERNAL: Owner được CRUD, Milestone Members chỉ xem */}
                {((!viewInternal && (role === "OWNER" || role === "CLIENT")) ||
                  (viewInternal && role === "OWNER")) && (
                  <div className="flex gap-2">
                    {!isDeleteMode && (
                      <button
                        onClick={addSection}
                        className="flex-1 py-2 text-xs bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-1.5"
                      >
                        <span>✨</span> Thêm Mới
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsDeleteMode(!isDeleteMode);
                      }}
                      className={`px-3 py-2 text-xs rounded-lg font-semibold flex items-center justify-center gap-1.5 ${
                        isDeleteMode
                          ? "w-full bg-gray-700 text-white shadow-lg shadow-red-500/20"
                          : "bg-gray-800/80 text-red-400"
                      }`}
                      title={
                        isDeleteMode ? "Thoát chế độ xóa" : "Xóa nhiều mục"
                      }
                    >
                      {isDeleteMode ? "Thoát" : <Trash2 size={16} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Sections List */}
              <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  {sections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      onClick={() => !isDeleteMode && setSelectedSection(sec)}
                      className={`p-3 rounded-lg border relative ${
                        selectedSection?.id === sec.id && !isDeleteMode
                          ? "bg-gradient-to-r from-purple-600/40 via-purple-500/30 to-purple-600/40 border-purple-400/60 shadow-lg shadow-purple-500/30"
                          : "bg-white/5 border-purple-500/20"
                      } ${isDeleteMode ? "cursor-pointer" : "cursor-pointer"}`}
                    >
                      {isDeleteMode && (
                        <div
                          className="absolute inset-0 z-10 flex items-center pl-3"
                          onClick={() => toggleDeleteSelection(sec.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDeleteIds.has(sec.id)}
                            readOnly
                            className="w-5 h-5 accent-red-500 cursor-pointer"
                          />
                        </div>
                      )}
                      <div
                        className={`flex justify-between items-center ${
                          isDeleteMode ? "pl-7 opacity-80" : ""
                        }`}
                      >
                        <span className="font-semibold text-sm text-purple-200 truncate">
                          {(sec.title || `Section ${idx + 1}`).replace(
                            " (Forwarded)",
                            ""
                          )}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] text-gray-400 truncate mt-0.5 ${
                          isDeleteMode ? "pl-7" : ""
                        }`}
                      >
                        {sec.blocks.length} blocks
                      </div>
                    </div>
                  ))}
                  {sections.length === 0 && (
                    <div className="text-center text-gray-400 py-8 italic">
                      Chưa có mô tả nào
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-purple-500/30 bg-gradient-to-t from-gray-900/90 to-purple-900/40 backdrop-blur-xl flex flex-col gap-2">
                {isDeleteMode ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsDeleteMode(false)}
                      className="flex-1 py-2 bg-gray-700/80 text-white font-bold rounded-lg"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={selectedDeleteIds.size === 0}
                      className="flex-1 py-2 bg-gradient-to-r from-red-600 to-red-500 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                    >
                      <Trash2 size={18} /> Xóa ({selectedDeleteIds.size})
                    </button>
                  </div>
                ) : (
                  <>
                    {/* B. OWNER */}
                    {role === "OWNER" && (
                      <>
                        {/* 1. MANAGE MODE - chỉ ở EXTERNAL */}
                        {isManageMode && !viewInternal ? (
                          <div className="flex flex-col gap-2">
                            <div className="text-xs text-center text-orange-300 font-semibold mb-1 uppercase tracking-wider">
                              --- Chế độ chuyển tiếp ---
                            </div>
                            <button
                              onClick={() => handleForwardToInternal(false)}
                              disabled={
                                savingAction !== null || !selectedSection
                              }
                              className="w-full py-2 text-xs bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {savingAction === "FORWARD" ? (
                                "Đang xử lý..."
                              ) : (
                                <>
                                  <ArrowRightCircle size={14} /> Nguyên Bản
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (selectedSection) {
                                  setPendingForward(true); // Đánh dấu cần forward sau khi chỉnh sửa
                                  setIsManageMode(false);
                                  setSelectedSection(selectedSection);
                                  setIsEditMode(true);
                                }
                              }}
                              disabled={!selectedSection}
                              className="w-full py-2 text-xs text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                            >
                              <Pencil size={14} /> Chỉnh Sửa
                            </button>
                            <button
                              onClick={() => setIsManageMode(false)}
                              className="w-full py-2 text-xs bg-gray-700/80 text-gray-200 font-semibold rounded-lg border border-gray-600/50 flex items-center justify-center gap-1.5"
                            >
                              <X size={14} /> Thoát
                            </button>
                          </div>
                        ) : (
                          /* 2. NORMAL MODE */
                          <div className="flex flex-col gap-2">
                            {/* Chỉ ở EXTERNAL mới có nút chuyển tiếp */}
                            {!viewInternal && (
                              <button
                                onClick={() => {
                                  setIsManageMode(true);
                                  setSelectedSection(null);
                                  setIsEditMode(false);
                                }}
                                className="w-full py-2 text-xs mt-1 bg-gradient-to-r from-gray-800/80 to-purple-900/60 border border-purple-500/50 text-purple-200 font-semibold rounded-lg shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5"
                              >
                                <Library size={14} /> Chuyển Tiếp
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* COLLABORATOR/OBSERVER: chỉ xem */}
                    {(role === "COLLABORATOR" ||
                      (!viewInternal &&
                        role !== "OWNER" &&
                        role !== "CLIENT") ||
                      (viewInternal && role !== "OWNER")) && (
                      <div className="text-center text-gray-400 text-sm italic">
                        Chế độ chỉ xem
                      </div>
                    )}
                  </>
                )}
              </div>
            </aside>

            {/* Right Panel */}
            <main
              ref={mainRef}
              className="flex-1 h-full overflow-hidden relative flex flex-col bg-gradient-to-br from-gray-900/40 via-purple-900/20 to-gray-900/40 backdrop-blur-sm"
            >
              {!selectedSection ? (
                <div className="flex-1 flex flex-col items-center justify-center text-purple-200">
                  <div className="text-5xl mb-4">👈</div>
                  <p className="text-sm text-center px-4 text-gray-300">
                    {viewInternal
                      ? "Chọn một mục bên trái để xem mô tả nội bộ"
                      : "Chọn một mục bên trái để xem mô tả phòng khách hàng"}
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                  {/* Header với nút chỉnh sửa */}
                  <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-purple-500/30 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent">
                    <div className="flex-1">
                      {isEditMode ? (
                        <input
                          value={(selectedSection.title || "").replace(
                            " (Forwarded)",
                            ""
                          )}
                          onChange={(e) =>
                            updateSectionTitle(
                              selectedSection.id,
                              e.target.value
                            )
                          }
                          placeholder="Tiêu đề section..."
                          className="w-full text-xl font-bold bg-transparent border-b-2 border-purple-400/60 pb-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                        />
                      ) : (
                        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-cyan-300 to-purple-300">
                          {(selectedSection.title || "Chưa có tiêu đề").replace(
                            " (Forwarded)",
                            ""
                          )}
                        </h2>
                      )}
                    </div>
                    {/* Nút chỉnh sửa và Lưu - chỉ hiện khi có quyền */}
                    {((!viewInternal &&
                      (role === "OWNER" || role === "CLIENT")) ||
                      (viewInternal && role === "OWNER")) && (
                      <div className="flex items-center gap-2 shrink-0">
                        {isEditMode && (
                          <button
                            onClick={() => {
                              // Nếu có pendingForward, forward trực tiếp sang phòng nội bộ (không lưu ở phòng khách hàng)
                              if (pendingForward) {
                                handleForwardToInternal(true);
                              } else {
                                // Bình thường: lưu ở phòng hiện tại
                                const isNewSection =
                                  selectedSection.id > 1000000000000;
                                if (isNewSection) {
                                  handleCreate();
                                } else {
                                  handleUpdate();
                                }
                              }
                            }}
                            disabled={savingAction !== null}
                            className="px-4 py-2 text-xs rounded-lg font-semibold flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-emerald-500/30"
                          >
                            {savingAction === "CREATE" ||
                            savingAction === "UPDATE" ||
                            savingAction === "FORWARD" ? (
                              <>
                                <span>⏳</span>
                                {pendingForward
                                  ? "Đang chuyển tiếp..."
                                  : "Đang lưu..."}
                              </>
                            ) : (
                              <>
                                {pendingForward ? "➡️ Chuyển Tiếp" : "💾 Lưu"}
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (isEditMode) {
                              setPendingForward(false); // Reset flag khi hủy
                            }
                            setIsEditMode(!isEditMode);
                          }}
                          className={`px-4 py-2 text-xs rounded-lg font-semibold flex items-center gap-1.5 shrink-0 ${
                            isEditMode
                              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30"
                              : "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30"
                          }`}
                        >
                          {isEditMode ? (
                            <>
                              <Eye size={14} />
                              Hủy
                            </>
                          ) : (
                            <>
                              <Pencil size={14} />
                              Sửa
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedSection.blocks.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white/5 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm relative shadow-lg shadow-purple-500/10"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-pink-300 font-semibold text-sm flex items-center gap-1.5">
                            {BLOCK_OPTIONS.find((o) => o.type === b.type)?.icon}{" "}
                            {BLOCK_TITLES[b.type]}
                          </span>
                          {isEditMode &&
                            ((!viewInternal &&
                              (role === "OWNER" || role === "CLIENT")) ||
                              (viewInternal && role === "OWNER")) && (
                              <button
                                onClick={() =>
                                  deleteBlock(selectedSection.id, b.id)
                                }
                                className="text-gray-500"
                              >
                                🗑️
                              </button>
                            )}
                        </div>

                        {/* Render nội dung block */}
                        {b.type === "DESCRIPTION" &&
                          (isEditMode ? (
                            <textarea
                              value={b.content}
                              onChange={(e) =>
                                updateBlockContent(
                                  selectedSection.id,
                                  b.id!,
                                  e.target.value
                                )
                              }
                              rows={4}
                              className="w-full text-sm bg-white/5 border border-purple-500/30 rounded-lg p-3 text-gray-100 focus:border-cyan-400 outline-none resize-none placeholder:text-gray-400"
                              placeholder="Nhập nội dung..."
                            />
                          ) : (
                            <div className="w-full text-sm bg-white/5 border border-purple-500/20 rounded-lg p-3 text-gray-100 whitespace-pre-wrap min-h-[80px]">
                              {b.content || (
                                <span className="text-gray-400 italic text-xs">
                                  Chưa có nội dung
                                </span>
                              )}
                            </div>
                          ))}

                        {(b.type === "IMAGE" || b.type === "HUM_MELODY") && (
                          <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-purple-500/40 rounded-lg bg-white/5">
                            {b.previewUrl ? (
                              <div className="text-center w-full">
                                {b.type === "IMAGE" ? (
                                  <img
                                    src={b.previewUrl}
                                    alt="Preview"
                                    className="max-h-40 rounded-lg shadow-md mb-1.5 object-contain mx-auto"
                                  />
                                ) : (
                                  <audio
                                    controls
                                    src={b.previewUrl}
                                    className="mb-1.5 w-full h-8"
                                  />
                                )}
                                <p className="text-[10px] text-gray-300 mb-1.5">
                                  {b.label}
                                </p>
                                {isEditMode && (
                                  <button
                                    onClick={() =>
                                      document
                                        .getElementById(`file-${b.id}`)
                                        ?.click()
                                    }
                                    className="text-xs text-purple-300 underline"
                                  >
                                    Thay đổi
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="text-center">
                                {isEditMode ? (
                                  <button
                                    onClick={() =>
                                      document
                                        .getElementById(`file-${b.id}`)
                                        ?.click()
                                    }
                                    className="px-4 py-2 text-xs bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg text-white font-medium shadow-lg shadow-purple-500/30"
                                  >
                                    Upload{" "}
                                    {b.type === "IMAGE" ? "Ảnh" : "Audio"}
                                  </button>
                                ) : (
                                  <p className="text-gray-400 italic text-xs">
                                    Chưa có{" "}
                                    {b.type === "IMAGE" ? "ảnh" : "file audio"}
                                  </p>
                                )}
                              </div>
                            )}
                            {isEditMode && (
                              <input
                                id={`file-${b.id}`}
                                type="file"
                                hidden
                                accept={
                                  b.type === "IMAGE" ? "image/*" : "audio/*"
                                }
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) {
                                    if (b.type === "IMAGE") {
                                      handleUploadImage(
                                        selectedSection.id,
                                        b.id!,
                                        f
                                      );
                                    } else {
                                      handleUploadMelody(
                                        selectedSection.id,
                                        b.id!,
                                        f
                                      );
                                    }
                                  }
                                }}
                              />
                            )}
                          </div>
                        )}

                        {b.type === "HARMONY" &&
                          (isEditMode ? (
                            <div className="flex flex-col lg:flex-row gap-3">
                              <div className="w-full lg:w-48 bg-white/5 p-3 rounded-lg border border-purple-500/30">
                                <div className="text-[10px] text-gray-300 mb-2 font-semibold uppercase">
                                  Kho Hợp Âm
                                </div>
                                <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                                  {/* Âm Trưởng */}
                                  <div>
                                    <div className="text-[9px] text-cyan-400 mb-1.5 font-semibold uppercase flex items-center gap-1">
                                      <span>🎹</span> Âm Trưởng
                                    </div>
                                    <Droppable
                                      droppableId="source-major"
                                      isDropDisabled
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.droppableProps}
                                          className="flex flex-wrap gap-1.5"
                                        >
                                          {MAJOR_CHORDS.map((chord, idx) => (
                                            <Draggable
                                              key={`src-major-${chord}`}
                                              draggableId={`source-${chord}`}
                                              index={idx}
                                            >
                                              {(p) => (
                                                <div
                                                  ref={p.innerRef}
                                                  {...p.draggableProps}
                                                  {...p.dragHandleProps}
                                                  className="px-1.5 py-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] rounded cursor-grab shadow-sm"
                                                >
                                                  {chord}
                                                </div>
                                              )}
                                            </Draggable>
                                          ))}
                                          {provided.placeholder}
                                        </div>
                                      )}
                                    </Droppable>
                                  </div>
                                  {/* Âm Thứ */}
                                  <div>
                                    <div className="text-[9px] text-purple-400 mb-1.5 font-semibold uppercase flex items-center gap-1">
                                      <span>🎵</span> Âm Thứ
                                    </div>
                                    <Droppable
                                      droppableId="source-minor"
                                      isDropDisabled
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.droppableProps}
                                          className="flex flex-wrap gap-1.5"
                                        >
                                          {MINOR_CHORDS.map((chord, idx) => (
                                            <Draggable
                                              key={`src-minor-${chord}`}
                                              draggableId={`source-${chord}`}
                                              index={MAJOR_CHORDS.length + idx}
                                            >
                                              {(p) => (
                                                <div
                                                  ref={p.innerRef}
                                                  {...p.draggableProps}
                                                  {...p.dragHandleProps}
                                                  className="px-1.5 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] rounded cursor-grab shadow-sm"
                                                >
                                                  {chord}
                                                </div>
                                              )}
                                            </Draggable>
                                          ))}
                                          {provided.placeholder}
                                        </div>
                                      )}
                                    </Droppable>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 bg-white/5 p-3 rounded-lg border border-purple-500/30 min-h-[120px]">
                                <div className="text-[10px] text-gray-300 mb-2 font-semibold uppercase">
                                  Vòng Hòa Âm
                                </div>
                                <Droppable
                                  droppableId={`target-${b.id || "temp"}`}
                                  direction="horizontal"
                                >
                                  {(provided, snap) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`flex items-end gap-1 p-3 rounded-lg min-h-[100px] ${
                                        snap.isDraggingOver
                                          ? "bg-purple-500/20 border-2 border-dashed border-pink-400 shadow-lg shadow-pink-500/30"
                                          : "bg-white/5"
                                      }`}
                                    >
                                      {(b.content
                                        ? b.content
                                            .split(" ")
                                            .filter((c) => c.trim())
                                        : []
                                      ).map((chord, idx) => {
                                        // Xác định hợp âm là trưởng hay thứ để hiển thị màu phù hợp
                                        const isMajor =
                                          MAJOR_CHORDS.includes(chord);
                                        const isMinor =
                                          MINOR_CHORDS.includes(chord);

                                        return (
                                          <Draggable
                                            key={`tgt-${chord}-${idx}`}
                                            draggableId={`target-${chord}-${idx}`}
                                            index={idx}
                                          >
                                            {(p) => (
                                              <div
                                                ref={p.innerRef}
                                                {...p.draggableProps}
                                                {...p.dragHandleProps}
                                                className={`relative flex flex-col items-center cursor-grab ${
                                                  isMajor
                                                    ? "bg-gradient-to-b from-white to-slate-200 text-slate-800 shadow-lg"
                                                    : isMinor
                                                    ? "bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-lg"
                                                    : "bg-gradient-to-b from-slate-600 to-slate-700 text-white"
                                                }`}
                                                style={{
                                                  width: "40px",
                                                  height: isMajor
                                                    ? "80px"
                                                    : "60px",
                                                  borderRadius: "4px 4px 0 0",
                                                  marginTop: isMinor
                                                    ? "20px"
                                                    : "0",
                                                }}
                                              >
                                                <span className="text-[10px] font-bold mt-1">
                                                  {chord}
                                                </span>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const list = b.content
                                                      ? b.content
                                                          .split(" ")
                                                          .filter((c) =>
                                                            c.trim()
                                                          )
                                                      : [];
                                                    list.splice(idx, 1);
                                                    updateBlockContent(
                                                      selectedSection.id,
                                                      b.id!,
                                                      list.join(" ")
                                                    );
                                                  }}
                                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-100"
                                                >
                                                  ×
                                                </button>
                                              </div>
                                            )}
                                          </Draggable>
                                        );
                                      })}
                                      {provided.placeholder}
                                      {(!b.content ||
                                        b.content.trim() === "") && (
                                        <div className="text-gray-400 italic text-xs flex-1 text-center py-8">
                                          Kéo hợp âm vào đây để tạo vòng hòa âm
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Droppable>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full bg-white/5 border border-purple-500/30 rounded-lg p-3">
                              <div className="text-[10px] text-gray-300 mb-2 font-semibold uppercase">
                                Vòng Hòa Âm
                              </div>
                              <div className="flex items-end gap-1 p-2 min-h-[100px]">
                                {b.content && b.content.trim() ? (
                                  b.content
                                    .split(" ")
                                    .filter((c) => c.trim())
                                    .map((chord, idx) => {
                                      const isMajor =
                                        MAJOR_CHORDS.includes(chord);
                                      const isMinor =
                                        MINOR_CHORDS.includes(chord);

                                      return (
                                        <div
                                          key={idx}
                                          className={`flex flex-col items-center ${
                                            isMajor
                                              ? "bg-gradient-to-b from-white to-slate-200 text-slate-800 shadow-lg"
                                              : isMinor
                                              ? "bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-lg"
                                              : "bg-gradient-to-b from-slate-600 to-slate-700 text-white"
                                          }`}
                                          style={{
                                            width: "40px",
                                            height: isMajor ? "80px" : "60px",
                                            borderRadius: "4px 4px 0 0",
                                            marginTop: isMinor ? "20px" : "0",
                                          }}
                                        >
                                          <span className="text-[10px] font-bold mt-1">
                                            {chord}
                                          </span>
                                        </div>
                                      );
                                    })
                                ) : (
                                  <span className="text-gray-400 italic text-xs flex-1 text-center py-8">
                                    Chưa có vòng hòa âm
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>

                  {isEditMode &&
                    ((!viewInternal &&
                      (role === "OWNER" || role === "CLIENT")) ||
                      (viewInternal && role === "OWNER")) && (
                      <div className="flex gap-2 pt-4 border-t border-purple-500/30">
                        {BLOCK_OPTIONS.map((opt) => (
                          <button
                            key={opt.type}
                            onClick={() =>
                              addBlock(
                                selectedSection.id,
                                opt.type as Block["type"]
                              )
                            }
                            className="px-4 py-2 text-xs bg-white/5 border border-purple-500/30 rounded-lg text-gray-100 flex items-center gap-1.5"
                          >
                            <span className="text-xs">{opt.icon}</span>{" "}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </main>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}

// Wrapper for router usage - reads params from URL
export function DescriptionPage() {
  const { projectId, milestoneId } = useParams<{
    projectId: string;
    milestoneId: string;
  }>();
  const navigate = useNavigate();

  if (!projectId || !milestoneId) {
    return (
      <div className="text-white p-4">Invalid project or milestone ID</div>
    );
  }

  return (
    <DescriptionModal
      isOpen={true}
      onClose={() => navigate(-1)}
      projectId={parseInt(projectId, 10)}
      milestoneId={parseInt(milestoneId, 10)}
    />
  );
}
