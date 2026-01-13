import { X, Upload, Loader } from 'lucide-react';
import type { TrackDetailResponse } from '../../../services/trackService';
import type { UploadProgress } from '../../../types/internalStudio';
import { formatFileSize } from '../../../utils/internalStudio.helpers';
import { SUPPORTED_FORMATS } from './constants';

interface UploadVersionModalProps {
    show: boolean;
    onClose: () => void;
    selectedTrack: TrackDetailResponse | null;
    versionForm: {
        description: string;
        voiceTagEnabled: boolean;
        voiceTagText: string;
    };
    setVersionForm: (form: UploadVersionModalProps['versionForm']) => void;
    versionFile: File | null;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    versionProgress: UploadProgress | null;
    onUpload: () => void;
}

export const UploadVersionModal: React.FC<UploadVersionModalProps> = ({
    show,
    onClose,
    selectedTrack,
    versionForm,
    setVersionForm,
    versionFile,
    onFileSelect,
    versionProgress,
    onUpload,
}) => {
    if (!show || !selectedTrack) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 backdrop-blur-lg border border-blue-700 rounded-lg shadow-2xl w-full max-w-xl">
                <div className="flex justify-between items-center p-4 border-b border-blue-800/50">
                    <div>
                        <h3 className="text-xl font-bold text-white">Tải lên phiên bản mới</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            Cho track: <span className="text-blue-400 font-semibold">{selectedTrack.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {versionProgress ? (
                        /* Upload Progress */
                        <div className="space-y-4">
                            <div className="text-center">
                                <Loader
                                    size={36}
                                    className="animate-spin mx-auto mb-2 text-blue-400"
                                />
                                <p className="text-base text-white mb-2">
                                    {versionProgress.message}
                                </p>
                                {versionProgress.phase === 'uploading' && (
                                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full transition-all duration-300"
                                            style={{ width: `${versionProgress.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {versionProgress.error && (
                                <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-300 text-sm">
                                    {versionProgress.error}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Upload Form */
                        <div className="space-y-4">
                            {/* File Input */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                                    Chọn file audio *
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept={SUPPORTED_FORMATS.map((f) => f.ext).join(',')}
                                        onChange={onFileSelect}
                                        className="hidden"
                                        id="version-file-input"
                                    />
                                    <label
                                        htmlFor="version-file-input"
                                        className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-900/50"
                                    >
                                        <Upload size={18} className="text-gray-400" />
                                        <span className="text-sm text-gray-300">
                                            {versionFile
                                                ? versionFile.name
                                                : 'Click để chọn file'}
                                        </span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Hỗ trợ: WAV, MP3, FLAC, M4A, AAC, OGG. Tối đa 1GB.
                                </p>
                                {versionFile && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        📦 {formatFileSize(versionFile.size)}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                                    Mô tả version (tùy chọn)
                                </label>
                                <textarea
                                    value={versionForm.description}
                                    onChange={(e) =>
                                        setVersionForm({
                                            ...versionForm,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Mô tả những thay đổi trong version này..."
                                    rows={2}
                                    className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Voice Tag */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={versionForm.voiceTagEnabled}
                                        onChange={(e) =>
                                            setVersionForm({
                                                ...versionForm,
                                                voiceTagEnabled: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 bg-gray-900 border-gray-600 text-blue-600 focus:ring-blue-500 rounded cursor-pointer"
                                        id="version-voice-tag-check"
                                    />
                                    <label
                                        htmlFor="version-voice-tag-check"
                                        className="text-xs font-semibold text-gray-400 cursor-pointer"
                                    >
                                        Bật Voice Tag (Watermark giọng nói)
                                    </label>
                                </div>

                                {versionForm.voiceTagEnabled && (
                                    <div className="ml-6">
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                                            Nội dung Voice Tag *
                                        </label>
                                        {!versionForm.voiceTagText.trim() && (
                                            <p className="text-xs text-red-400 mb-1.5">
                                                Vui lòng nhập nội dung Voice Tag
                                            </p>
                                        )}
                                        <textarea
                                            value={versionForm.voiceTagText}
                                            onChange={(e) =>
                                                setVersionForm({
                                                    ...versionForm,
                                                    voiceTagText: e.target.value,
                                                })
                                            }
                                            placeholder="Ví dụ: Demo thuộc về Producer X, chỉ để nghe trước"
                                            rows={2}
                                            className={`w-full bg-gray-900 border text-white text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                versionForm.voiceTagEnabled && !versionForm.voiceTagText.trim()
                                                    ? 'border-red-500 focus:border-red-500'
                                                    : 'border-gray-600'
                                            }`}
                                            required={versionForm.voiceTagEnabled}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Voice tag sẽ được chèn vào track để bảo vệ bản quyền
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {!versionProgress && (
                    <div className="p-4 border-t border-blue-800/50 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onUpload}
                            disabled={!versionFile || (versionForm.voiceTagEnabled && !versionForm.voiceTagText.trim())}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Upload size={16} />
                            Tải lên phiên bản mới
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

