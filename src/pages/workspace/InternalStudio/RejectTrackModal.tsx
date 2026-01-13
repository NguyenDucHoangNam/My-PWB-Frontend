import { X } from 'lucide-react';
import type { TrackDetailResponse } from '../../../services/trackService';

interface RejectTrackModalProps {
    show: boolean;
    onClose: () => void;
    track: TrackDetailResponse | null;
    rejectReason: string;
    onRejectReasonChange: (reason: string) => void;
    onReject: () => void;
}

export const RejectTrackModal: React.FC<RejectTrackModalProps> = ({
    show,
    onClose,
    track,
    rejectReason,
    onRejectReasonChange,
    onReject,
}) => {
    if (!show || !track) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 backdrop-blur-lg border border-red-700 rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-red-800/50">
                    <div>
                        <h3 className="text-2xl font-bold text-white">Từ chối Track</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Track: <span className="text-red-400 font-semibold">{track.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-400 mb-2">
                            Lý do từ chối (tùy chọn)
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => onRejectReasonChange(e.target.value)}
                            placeholder="Nhập lý do từ chối track này..."
                            rows={4}
                            className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-3 focus:ring-red-500 focus:border-red-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Lý do này sẽ được gửi qua email cho người tạo track
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-red-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onReject}
                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2"
                    >
                        <X size={18} />
                        Từ chối
                    </button>
                </div>
            </div>
        </div>
    );
};

