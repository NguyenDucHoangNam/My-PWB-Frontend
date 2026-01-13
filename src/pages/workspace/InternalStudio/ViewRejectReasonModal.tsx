import { X } from 'lucide-react';
import type { TrackDetailResponse } from '../../../services/trackService';

interface ViewRejectReasonModalProps {
    show: boolean;
    onClose: () => void;
    track: TrackDetailResponse | null;
}

export const ViewRejectReasonModal: React.FC<ViewRejectReasonModalProps> = ({
    show,
    onClose,
    track,
}) => {
    if (!show || !track) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 backdrop-blur-lg border border-red-700 rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-red-800/50">
                    <div>
                        <h3 className="text-2xl font-bold text-white">Lý do từ chối</h3>
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
                    {(track.reason || track.rejectionReason) ? (
                        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                            <p className="text-white whitespace-pre-wrap">
                                {track.reason || track.rejectionReason}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 text-center">
                            <p className="text-gray-400 italic">
                                Không có lý do từ chối được cung cấp.
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-red-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

