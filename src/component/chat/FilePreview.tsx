import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FilePreview as FilePreviewType, formatFileSize, getFileIcon, getFileIconColor, getFileCategory } from '@/types/file';

interface FilePreviewProps {
    file: FilePreviewType;
    onRemove?: (fileId: string) => void;
    showRemoveButton?: boolean;
    className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
    file,
    onRemove,
    showRemoveButton = true,
    className = ''
}) => {
    const fileCategory = getFileCategory(file.type);
    const isImage = fileCategory === 'IMAGE';

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRemove) {
            onRemove(file.id);
        }
    };

    return (
        <div className={`relative bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-md transition-all duration-200 ${className}`}>
            {showRemoveButton && onRemove && (
                <button
                    onClick={handleRemove}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 z-10 shadow-lg border-2 border-white"
                    title="Remove file"
                >
                    <XMarkIcon className="w-4 h-4 stroke-2" />
                </button>
            )}

            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {isImage && file.preview ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                            <img
                                src={file.preview}
                                alt={file.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-2xl shadow-sm">
                            {getFileIcon(file.type)}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate" title={file.name}>
                                {file.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </p>
                        </div>
                    </div>

                    {file.isUploading && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Uploading...</span>
                                <span>{file.uploadProgress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${file.uploadProgress || 0}%` }}
                                />
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
};

interface FilePreviewListProps {
    files: FilePreviewType[];
    onRemoveFile?: (fileId: string) => void;
    onImageClick?: (index: number) => void;
    className?: string;
}

export const FilePreviewList: React.FC<FilePreviewListProps> = ({
    files,
    onRemoveFile,
    onImageClick,
    className = ''
}) => {
    if (files.length === 0) return null;

    const images = files.filter(file => file.type.startsWith('image/'));
    const otherFiles = files.filter(file => !file.type.startsWith('image/'));

    return (
        <div className={`space-y-2 ${className}`}>
            {images.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-xs font-medium text-slate-600 dark:text-text-secondary">Images ({images.length})</p>
                    <div className="flex flex-wrap gap-2">
                        {images.map((file, index) => (
                            <div key={file.id} className="relative">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-dark-bg shadow-sm border border-slate-200 dark:border-border-color">
                                    <img
                                        src={file.preview}
                                        alt={file.name}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => onImageClick?.(index)}
                                    />
                                </div>
                                {onRemoveFile && (
                                    <button
                                        onClick={() => onRemoveFile(file.id)}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 z-20 shadow-lg border border-white"
                                        title="Remove image"
                                    >
                                        <XMarkIcon className="w-3 h-3 stroke-2" />
                                    </button>
                                )}
                                {file.isUploading && (
                                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                        <div className="text-white text-xs font-medium">
                                            {file.uploadProgress || 0}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {otherFiles.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-xs font-medium text-slate-600 dark:text-text-secondary">Files ({otherFiles.length})</p>
                    <div className="flex flex-wrap gap-2">
                        {otherFiles.map((file) => (
                            <div key={file.id} className="relative">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-dark-bg shadow-sm border border-slate-200 dark:border-border-color flex flex-col items-center justify-center p-1.5">
                                    <div className={`mb-0.5 text-base ${getFileIconColor(file.type)}`}>
                                        {getFileIcon(file.type)}
                                    </div>
                                    <div className="text-[10px] text-slate-600 dark:text-text-secondary text-center truncate w-full">
                                        {file.name.length > 6 ? file.name.substring(0, 6) + '...' : file.name}
                                    </div>
                                </div>
                                {onRemoveFile && (
                                    <button
                                        onClick={() => onRemoveFile(file.id)}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 z-20 shadow-lg border border-white"
                                        title="Remove file"
                                    >
                                        <XMarkIcon className="w-3 h-3 stroke-2" />
                                    </button>
                                )}
                                {file.isUploading && (
                                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                        <div className="text-white text-xs font-medium">
                                            {file.uploadProgress || 0}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface CompactFilePreviewProps {
    file: FilePreviewType;
    onClick?: () => void;
    className?: string;
}

export const CompactFilePreview: React.FC<CompactFilePreviewProps> = ({
    file,
    onClick,
    className = ''
}) => {
    const fileCategory = getFileCategory(file.type);
    const isImage = fileCategory === 'IMAGE';

    return (
        <div
            className={`flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${className}`}
            onClick={onClick}
        >
            <div className="flex-shrink-0">
                {isImage && file.preview ? (
                    <div className="w-8 h-8 rounded overflow-hidden">
                        <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-lg">
                        {getFileIcon(file.type)}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                </p>
                <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                </p>
            </div>
        </div>
    );
};

interface FileGridPreviewProps {
    files: FilePreviewType[];
    onFileClick?: (file: FilePreviewType) => void;
    onRemoveFile?: (fileId: string) => void;
    maxDisplay?: number;
    className?: string;
}

export const FileGridPreview: React.FC<FileGridPreviewProps> = ({
    files,
    onFileClick,
    onRemoveFile,
    maxDisplay = 4,
    className = ''
}) => {
    const displayFiles = files.slice(0, maxDisplay);
    const remainingCount = files.length - maxDisplay;

    return (
        <div className={`grid grid-cols-2 gap-2 ${className}`}>
            {displayFiles.map((file, index) => {
                const fileCategory = getFileCategory(file.type);
                const isImage = fileCategory === 'IMAGE';
                const isLast = index === displayFiles.length - 1 && remainingCount > 0;

                return (
                    <div
                        key={file.id}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => onFileClick?.(file)}
                    >
                        {isImage && file.preview ? (
                            <img
                                src={file.preview}
                                alt={file.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                <div className="text-2xl mb-1">{getFileIcon(file.type)}</div>
                                <div className="text-xs text-center px-1 truncate w-full">
                                    {file.name}
                                </div>
                            </div>
                        )}

                        {isLast && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-semibold">
                                    +{remainingCount}
                                </span>
                            </div>
                        )}

                        {onRemoveFile && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFile(file.id);
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
