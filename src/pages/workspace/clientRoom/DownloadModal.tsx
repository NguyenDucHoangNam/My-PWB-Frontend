import { X, Download, Loader, CheckCircle, Music } from 'lucide-react';
import { formatDuration, formatFileSize } from '../../../utils/clientRoom.helpers';
import { type ClientTrackItem } from '../../../services/clientDeliveryService';

interface DownloadModalProps {
    show: boolean;
    clientTracks: ClientTrackItem[];
    selectedTrackIds: Set<number>;
    isDownloading: boolean;
    onClose: () => void;
    onToggleTrackSelection: (trackId: number) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onDownload: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
    show,
    clientTracks,
    selectedTrackIds,
    isDownloading,
    onClose,
    onToggleTrackSelection,
    onSelectAll,
    onDeselectAll,
    onDownload,
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 backdrop-blur-lg border border-cyan-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-cyan-800/50">
                    <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Download size={24} className="text-cyan-400" />
                            Tải về sản phẩm
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Chọn các track bạn muốn tải về dưới dạng file ZIP
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Select All / Deselect All */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                        <div className="text-sm text-gray-400">
                            Đã chọn:{' '}
                            <span className="text-cyan-400 font-semibold">
                                {selectedTrackIds.size}
                            </span>{' '}
                            / {clientTracks.length} tracks
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={onSelectAll}
                                className="px-3 py-1.5 text-xs bg-cyan-600/20 text-cyan-300 rounded-lg border border-cyan-500/50"
                            >
                                Chọn tất cả
                            </button>
                            <button
                                onClick={onDeselectAll}
                                className="px-3 py-1.5 text-xs bg-gray-600/20 text-gray-300 rounded-lg border border-gray-500/50"
                            >
                                Bỏ chọn tất cả
                            </button>
                        </div>
                    </div>

                    {/* Track List */}
                    <div className="space-y-2">
                        {clientTracks.map((item) => {
                            const isSelected = selectedTrackIds.has(item.track.id);
                            return (
                                <div
                                    key={item.track.id}
                                    onClick={() => onToggleTrackSelection(item.track.id)}
                                    className={`p-4 rounded-lg border cursor-pointer ${
                                        isSelected
                                            ? 'bg-cyan-900/30 border-cyan-500/50'
                                            : 'bg-gray-900/30 border-gray-700/50 hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                isSelected
                                                    ? 'bg-cyan-500 border-cyan-500'
                                                    : 'border-gray-500'
                                            }`}
                                        >
                                            {isSelected && (
                                                <CheckCircle size={14} className="text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Music
                                                    size={16}
                                                    className="text-cyan-400 flex-shrink-0"
                                                />
                                                <h4 className="text-white font-semibold truncate">
                                                    {item.track.name}
                                                </h4>
                                                <span className="text-xs text-gray-400 font-mono bg-gray-800/50 px-2 py-0.5 rounded">
                                                    {item.track.version}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span>
                                                    ⏱️ {formatDuration(item.track.duration)}
                                                </span>
                                                <span>💾 {formatFileSize(item.track.fileSize)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 border-t border-cyan-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onDownload}
                        disabled={selectedTrackIds.size === 0 || isDownloading}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isDownloading ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Đang tạo ZIP...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Tải về ({selectedTrackIds.size})
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

