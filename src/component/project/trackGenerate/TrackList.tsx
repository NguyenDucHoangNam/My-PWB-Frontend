import {
  getTracksByProject,
  getTrackSuggestion,
  deleteTrack,
  TrackListItemResponse,
  TrackSuggestionResponse,
} from "@/services/boardService";
import React, { useState, useEffect, useCallback } from "react";
import { MdRefresh } from "react-icons/md";

interface TrackListProps {
  projectId: number;
}

// Giả định cấu trúc JSON cho aiSuggestions
interface AISuggestions {
  mood?: string;
  topic?: string;
  sections?: { label: string; lines: string[] }[];
}

const ProjectTrackList: React.FC<TrackListProps> = ({ projectId }) => {
  const [tracks, setTracks] = useState<TrackListItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [loadingDetails, setLoadingDetails] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<number | null>(null);
  const [selectedTrack, setSelectedTrack] =
    useState<TrackListItemResponse | null>(null);

  // Hàm chuyển đổi kích thước byte sang MB
  const formatBytes = (bytes: number): string =>
    (bytes / 1024 / 1024).toFixed(2);

  // Fetch danh sách track ban đầu (Không thay đổi logic)
  const fetchTracks = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const trackList = await getTracksByProject(id);
      console.log("Data: ", trackList);
      const basicTracks = trackList.map((t) => ({
        id: t.id,
        fileName: t.fileName,
        mimeType: t.mimeType,
        sizeBytes: t.sizeBytes,
        status: t.status,
      }));
      setTracks(basicTracks);
    } catch (err) {
      console.error("Lỗi khi tải tracks:", err);
      // Error handling removed - error state was unused
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch chi tiết track khi click (Không thay đổi logic)
  const fetchTrackDetail = useCallback(
    async (trackId: number) => {
      setLoadingDetails(trackId);
      try {
        const suggestion: TrackSuggestionResponse = await getTrackSuggestion(
          trackId
        );
        const trackDetail = tracks.find((t) => t.id === trackId);
        if (trackDetail) {
          setSelectedTrack({
            ...trackDetail,
            lyricsText: suggestion.lyricsText,
            aiSuggestions: suggestion.aiSuggestions,
            status: suggestion.status,
          });
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết track:", err);
        alert("Không thể giải mã dữ liệu Track. Vui lòng thử lại.");
      } finally {
        setLoadingDetails(null);
      }
    },
    [tracks]
  );

  // Xóa track (Không thay đổi logic)
  const handleDeleteTrack = useCallback(
    async (trackId: number) => {
      const confirmed = window.confirm(
        "Cảnh báo: Thao tác này sẽ xóa vĩnh viễn Track khỏi Vũ Trụ Âm Nhạc. Bạn có chắc chắn?"
      );
      if (!confirmed) return;

      setLoadingDelete(trackId);
      try {
        await deleteTrack(trackId);
        setTracks((prev) => prev.filter((t) => t.id !== trackId));
        if (selectedTrack?.id === trackId) {
          setSelectedTrack(null);
        }
      } catch (err) {
        console.error("Xóa track thất bại:", err);
        alert("Thất bại khi xóa Track. Vui lòng thử lại.");
      } finally {
        setLoadingDelete(null);
      }
    },
    [selectedTrack]
  );

  useEffect(() => {
    fetchTracks(projectId);
  }, [projectId, fetchTracks]);

  // --- Rendering UI with Space Theme ---

  const statusClass = (status: TrackListItemResponse["status"]): string => {
    switch (status) {
      case "COMPLETED":
        return "text-green-400 font-medium"; // Ánh sáng xanh lá hoàn thành
      case "SUGGESTING":
        return "text-yellow-400 animate-pulse"; // Ánh sáng vàng đang xử lý
      case "TRANSCRIBING":
        return "text-blue-400 animate-pulse"; // Ánh sáng xanh dương đang ghi âm
      case "FAILED":
        return "text-red-500 font-bold"; // Đèn đỏ lỗi
      default:
        return "text-gray-400";
    }
  };

  if (loading)
    return (
      <div className="text-gray-300 p-4 text-center">
        <div className="animate-spin inline-block mr-2">⚙️</div> Đang kết nối
        với vệ tinh Tracks...
      </div>
    );
  if (tracks.length === 0)
    return (
      <div className="text-gray-400 p-6 text-center border border-dashed border-gray-600 rounded-xl">
        <p className="text-2xl mb-2">🔭</p>
        <p>Kho lưu trữ tracks đang trống. Hãy Upload Beat đầu tiên của bạn!</p>
      </div>
    );

  return (
    <div className="track-list-container space-y-4">
      <h3 className="text-xl font-bold text-indigo-400 mb-4 border-b border-indigo-500/50 pb-2">
        Danh sách Track đã ghi âm (Project: {projectId})
      </h3>
      <button
        onClick={() => fetchTracks(projectId)}
        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full shadow hover:bg-blue-500 transition duration-300"
        disabled={loading}
      >
        <MdRefresh size={18} />
        {loading ? "Đang tải..." : "Tải lại"}
      </button>
      <ul className="track-list">
        {tracks.map((track) => (
          <li
            key={track.id}
            // Thẻ chứa track với hiệu ứng vũ trụ
            className="track-item bg-gray-800/60 p-4 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition duration-300 border border-transparent hover:border-indigo-500/50 flex justify-between items-center mb-4"
          >
            <div className="track-info text-gray-300 space-y-0.5">
              <p className="text-white font-semibold text-lg truncate w-64">
                Tên File:{" "}
                <span className="text-cyan-300">{track.fileName}</span>
              </p>
              <p className="text-sm">
                Loại: <span className="text-gray-400">{track.mimeType}</span>
              </p>
              <p className="text-sm">
                Kích thước:{" "}
                <span className="text-gray-400">
                  {formatBytes(track.sizeBytes)} MB
                </span>
              </p>
              <p className="text-sm">
                Trạng thái:{" "}
                <span className={statusClass(track.status)}>
                  {track.status}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2 min-w-[120px]">
              <button
                onClick={() => fetchTrackDetail(track.id)}
                disabled={loadingDetails === track.id}
                // Nút Xem chi tiết - màu Xanh/Cyan (Nút Xem chi tiết như trong ảnh)
                className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full shadow-lg hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 transition duration-300"
              >
                {loadingDetails === track.id
                  ? "Đang tải..."
                  : "Xem chi tiết"}
              </button>

              <button
                onClick={() => handleDeleteTrack(track.id)}
                disabled={loadingDelete === track.id}
                // Nút Xóa - màu Đỏ (Nút Xóa như trong ảnh)
                className="px-3 py-1 bg-red-600 text-white font-medium rounded-full shadow-lg hover:bg-red-500 disabled:opacity-50 transition duration-300"
              >
                {loadingDelete === track.id ? "Đang hủy..." : "Xóa"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal - Chi tiết Track */}
      {selectedTrack && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
          <div className="bg-gray-900 border border-purple-500/50 p-6 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-gray-200 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            {" "}
            <h3 className="text-2xl font-bold mb-4 text-purple-400 border-b border-purple-500/50 pb-2">
              Bảng điều khiển Track: {selectedTrack.fileName}
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
              <p>
                <strong>Loại:</strong>{" "}
                <span className="text-cyan-300">{selectedTrack.mimeType}</span>
              </p>
              <p>
                <strong>Kích thước:</strong>{" "}
                <span className="text-cyan-300">
                  {formatBytes(selectedTrack.sizeBytes)} MB
                </span>
              </p>
              <p className="col-span-2">
                <strong>Trạng thái:</strong>{" "}
                <span className={statusClass(selectedTrack.status)}>
                  {selectedTrack.status}
                </span>
              </p>
            </div>
            {/* Lyrics Section */}
            {selectedTrack.lyricsText && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <strong className="text-lg text-indigo-400 block mb-2">
                  Lời bài hát (Lyrics):
                </strong>
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 bg-gray-900 p-2 rounded">
                  {selectedTrack.lyricsText}
                </pre>
              </div>
            )}
            {/* AI Suggestions Section */}
            {selectedTrack.aiSuggestions && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <strong className="text-lg text-indigo-400 block mb-2">
                  Gợi ý AI (Trí tuệ Nhân tạo):
                </strong>
                {(() => {
                  try {
                    const ai: AISuggestions =
                      typeof selectedTrack.aiSuggestions === "string"
                        ? JSON.parse(selectedTrack.aiSuggestions)
                        : selectedTrack.aiSuggestions;
                    return (
                      <div className="space-y-3">
                        {ai.mood && (
                          <p>
                            <strong>Cảm xúc (Mood):</strong>{" "}
                            <span className="text-yellow-400">{ai.mood}</span>
                          </p>
                        )}
                        {ai.topic && (
                          <p>
                            <strong>Chủ đề (Topic):</strong>{" "}
                            <span className="text-yellow-400">{ai.topic}</span>
                          </p>
                        )}
                        {ai.sections && Array.isArray(ai.sections) && (
                          <div>
                            <strong className="block mb-1 text-gray-300">
                              Cấu trúc bài hát:
                            </strong>
                            <ul className="space-y-2 ml-4">
                              {ai.sections.map((sec, idx) => (
                                <li
                                  key={idx}
                                  className="bg-gray-700/50 p-2 rounded border-l-4 border-cyan-500"
                                >
                                  <p className="font-semibold text-cyan-300">
                                    {sec.label}:
                                  </p>
                                  <ul className="ml-4 list-disc text-sm text-gray-400">
                                    {sec.lines.map(
                                      (line: string, i: number) => (
                                        <li key={i}>{line}</li>
                                      )
                                    )}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  } catch (err) {
                    console.error("Lỗi parse AI suggestions:", err);
                    return (
                      <p className="text-red-400">
                        Không hiển thị được dữ liệu AI. Dữ liệu bị hỏng.
                      </p>
                    );
                  }
                })()}
              </div>
            )}
            <div className="mt-6 text-right">
              <button
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-full hover:bg-gray-600 transition duration-300"
                onClick={() => setSelectedTrack(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTrackList;
