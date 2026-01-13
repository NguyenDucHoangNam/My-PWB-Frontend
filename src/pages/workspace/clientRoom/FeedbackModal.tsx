import { X, ThumbsDown, Edit3, Send, Music } from 'lucide-react';
import { formatDuration, formatFileSize } from '../../../utils/clientRoom.helpers';
import { type ClientTrackItem } from '../../../services/clientDeliveryService';

interface FeedbackModalProps {
    show: boolean;
    feedbackType: 'REJECTED' | 'REQUEST_EDIT';
    selectedItem: ClientTrackItem | null;
    feedbackReason: string;
    onClose: () => void;
    onReasonChange: (reason: string) => void;
    onSubmit: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
    show,
    feedbackType,
    selectedItem,
    feedbackReason,
    onClose,
    onReasonChange,
    onSubmit,
}) => {
    if (!show || !selectedItem) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                className={`bg-black/90 backdrop-blur-lg border ${
                    feedbackType === 'REJECTED'
                        ? 'border-red-700'
                        : 'border-yellow-700'
                } rounded-xl shadow-2xl w-full max-w-lg`}
            >
                <div
                    className={`flex justify-between items-center p-6 border-b ${
                        feedbackType === 'REJECTED'
                            ? 'border-red-800/50'
                            : 'border-yellow-800/50'
                    }`}
                >
                    <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            {feedbackType === 'REJECTED' ? (
                                <>
                                    <ThumbsDown size={24} className="text-red-400" />
                                    Yêu cầu làm mới
                                </>
                            ) : (
                                <>
                                    <Edit3 size={24} className="text-yellow-400" />
                                    Yêu cầu chỉnh sửa
                                </>
                            )}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Track:{' '}
                            <span
                                className={`font-semibold ${
                                    feedbackType === 'REJECTED'
                                        ? 'text-red-400'
                                        : 'text-yellow-400'
                                }`}
                            >
                                {selectedItem.track.name}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div
                        className={`${
                            feedbackType === 'REJECTED'
                                ? 'bg-red-900/20 border-red-700/50'
                                : 'bg-yellow-900/20 border-yellow-700/50'
                        } border rounded-lg p-4`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Music size={18} className="text-cyan-400" />
                            <span className="text-sm font-semibold text-gray-300">
                                Chi tiết track
                            </span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1 ml-7">
                            <div>
                                📝 {selectedItem.track.name} ({selectedItem.track.version})
                            </div>
                            <div>
                                ⏱️ {formatDuration(selectedItem.track.duration)}
                            </div>
                            <div>💾 {formatFileSize(selectedItem.track.fileSize)}</div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">
                            {feedbackType === 'REJECTED'
                                ? 'Lý do từ chối (tùy chọn)'
                                : 'Yêu cầu chỉnh sửa (bắt buộc)'}
                            {feedbackType === 'REQUEST_EDIT' && (
                                <span className="text-red-400 ml-1">*</span>
                            )}
                        </label>
                        <textarea
                            value={feedbackReason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder={
                                feedbackType === 'REJECTED'
                                    ? 'Ví dụ: Chất lượng âm thanh chưa đạt yêu cầu, bass quá mạnh... (tùy chọn)'
                                    : 'Ví dụ: Giảm bass xuống 2dB, tăng treble nhẹ, thêm hiệu ứng reverb...'
                            }
                            rows={5}
                            className={`w-full bg-gray-900 border ${
                                feedbackType === 'REJECTED'
                                    ? 'border-red-700 focus:ring-red-500 focus:border-red-500'
                                    : 'border-yellow-700 focus:ring-yellow-500 focus:border-yellow-500'
                            } text-white rounded-lg p-3`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {feedbackType === 'REJECTED'
                                ? 'Lý do từ chối là tùy chọn, nhưng nên mô tả để Producer hiểu rõ'
                                : 'Vui lòng mô tả chi tiết để Producer có thể hiểu rõ yêu cầu của bạn'}
                        </p>
                    </div>
                </div>

                <div
                    className={`p-6 border-t ${
                        feedbackType === 'REJECTED'
                            ? 'border-red-800/50'
                            : 'border-yellow-800/50'
                    } flex justify-end gap-3`}
                >
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={feedbackType === 'REQUEST_EDIT' && !feedbackReason.trim()}
                        className={`px-6 py-3 ${
                            feedbackType === 'REJECTED'
                                ? 'bg-red-600 hover:bg-red-500'
                                : 'bg-yellow-600 hover:bg-yellow-500'
                        } text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                    >
                        <Send size={18} />
                        Gửi phản hồi
                    </button>
                </div>
            </div>
        </div>
    );
};

