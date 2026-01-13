import { X, Upload, Loader } from 'lucide-react';
import type { UploadProgress } from '../../../types/internalStudio';
import { formatFileSize } from '../../../utils/internalStudio.helpers';
import { SUPPORTED_FORMATS } from './constants';

interface UploadModalProps {
    show: boolean;
    onClose: () => void;
    uploadForm: {
        name: string;
        description: string;
        voiceTagEnabled: boolean;
        voiceTagText: string;
    };
    setUploadForm: (form: UploadModalProps['uploadForm']) => void;
    selectedFile: File | null;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadProgress: UploadProgress | null;
    onUpload: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
    show,
    onClose,
    uploadForm,
    setUploadForm,
    selectedFile,
    onFileSelect,
    uploadProgress,
    onUpload,
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-24">
            <div className="bg-black/90 backdrop-blur-lg border border-purple-700 rounded-lg shadow-2xl w-full max-w-xl">
                <div className="flex justify-between items-center p-4 border-b border-purple-800/50">
                    <h3 className="text-xl font-bold text-white">Upload Track</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {uploadProgress ? (
                        /* Upload Progress */
                        <div className="space-y-4">
                            <div className="text-center">
                                <Loader
                                    size={36}
                                    className="animate-spin mx-auto mb-2 text-purple-400"
                                />
                                <p className="text-base text-white mb-2">
                                    {uploadProgress.message}
                                </p>
                                {uploadProgress.phase === 'uploading' && (
                                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-purple-600 h-full transition-all duration-300"
                                            style={{ width: `${uploadProgress.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {uploadProgress.error && (
                                <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-300 text-sm">
                                    {uploadProgress.error}
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
                                        id="file-input"
                                    />
                                    <label
                                        htmlFor="file-input"
                                        className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-gray-900/50"
                                    >
                                        <Upload size={18} className="text-gray-400" />
                                        <span className="text-sm text-gray-300">
                                            {selectedFile
                                                ? selectedFile.name
                                                : 'Click để chọn file'}
                                        </span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Hỗ trợ: WAV, MP3, FLAC, M4A, AAC, OGG. Tối đa 1GB.
                                </p>
                                {selectedFile && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        📦 {formatFileSize(selectedFile.size)}
                                    </p>
                                )}
                            </div>

                            {/* Track Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                                    Tên track *
                                </label>
                                <input
                                    type="text"
                                    value={uploadForm.name}
                                    onChange={(e) =>
                                        setUploadForm({ ...uploadForm, name: e.target.value })
                                    }
                                    placeholder="Ví dụ: Beat Lofi Chill #1"
                                    className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                                    Mô tả (tùy chọn)
                                </label>
                                <textarea
                                    value={uploadForm.description}
                                    onChange={(e) =>
                                        setUploadForm({
                                            ...uploadForm,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Mô tả ngắn về track này..."
                                    rows={2}
                                    className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            {/* Voice Tag */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={uploadForm.voiceTagEnabled}
                                        onChange={(e) =>
                                            setUploadForm({
                                                ...uploadForm,
                                                voiceTagEnabled: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 bg-gray-900 border-gray-600 text-purple-600 focus:ring-purple-500 rounded cursor-pointer"
                                        id="voice-tag-check"
                                    />
                                    <label
                                        htmlFor="voice-tag-check"
                                        className="text-xs font-semibold text-gray-400 cursor-pointer"
                                    >
                                        Bật Voice Tag (Watermark giọng nói)
                                    </label>
                                </div>

                                {uploadForm.voiceTagEnabled && (
                                    <div className="ml-6">
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                                            Nội dung Voice Tag *
                                        </label>
                                        {!uploadForm.voiceTagText.trim() && (
                                            <p className="text-xs text-red-400 mb-1.5">
                                                Vui lòng nhập nội dung Voice Tag
                                            </p>
                                        )}
                                        <textarea
                                            value={uploadForm.voiceTagText}
                                            onChange={(e) =>
                                                setUploadForm({
                                                    ...uploadForm,
                                                    voiceTagText: e.target.value,
                                                })
                                            }
                                            placeholder="Ví dụ: Demo thuộc về Producer X, chỉ để nghe trước"
                                            rows={2}
                                            className={`w-full bg-gray-900 border text-white text-sm rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500 ${
                                                uploadForm.voiceTagEnabled && !uploadForm.voiceTagText.trim()
                                                    ? 'border-red-500 focus:border-red-500'
                                                    : 'border-gray-600'
                                            }`}
                                            required={uploadForm.voiceTagEnabled}
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

                {!uploadProgress && (
                    <div className="p-4 border-t border-purple-800/50 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onUpload}
                            disabled={
                                !selectedFile || 
                                !uploadForm.name.trim() || 
                                (uploadForm.voiceTagEnabled && !uploadForm.voiceTagText.trim())
                            }
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Upload size={16} />
                            Upload
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

