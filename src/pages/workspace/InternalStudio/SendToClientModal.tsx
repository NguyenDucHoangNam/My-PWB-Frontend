import { X, Send, Music } from 'lucide-react';
import type { TrackDetailResponse } from '../../../services/trackService';
import { formatDuration, formatFileSize } from '../../../utils/internalStudio.helpers';

interface SendToClientModalProps {
    show: boolean;
    onClose: () => void;
    track: TrackDetailResponse | null;
    sendNote: string;
    onSendNoteChange: (note: string) => void;
    productCountRemaining: number;
    editCountRemaining: number;
    onSend: () => void;
}

export const SendToClientModal: React.FC<SendToClientModalProps> = ({
    show,
    onClose,
    track,
    sendNote,
    onSendNoteChange,
    productCountRemaining: _productCountRemaining,
    editCountRemaining: _editCountRemaining,
    onSend,
}) => {
    if (!show || !track) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 backdrop-blur-lg border border-cyan-700 rounded-xl shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-6 border-b border-cyan-800/50">
                    <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Send size={24} className="text-cyan-400" />
                            Gửi sản phẩm cho khách hàng
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Track: <span className="text-cyan-400 font-semibold">{track.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Music size={18} className="text-cyan-400" />
                            <span className="text-sm font-semibold text-gray-300">Chi tiết track</span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1 ml-7">
                            <div>📝 {track.name} ({track.version})</div>
                            <div>⏱️ {formatDuration(track.duration)}</div>
                            <div>💾 {formatFileSize(track.fileSize)}</div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">
                            Ghi chú cho khách hàng (tùy chọn)
                        </label>
                        <textarea
                            value={sendNote}
                            onChange={(e) => onSendNoteChange(e.target.value)}
                            placeholder="Ví dụ: Sản phẩm đã hoàn thiện theo yêu cầu, vui lòng kiểm tra..."
                            rows={4}
                            className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-cyan-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onSend}
                        className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors flex items-center gap-2"
                    >
                        <Send size={18} />
                        Gửi cho Client
                    </button>
                </div>
            </div>
        </div>
    );
};

