import React, { useRef, useState, useCallback } from 'react';
import { PaperClipIcon, PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { FilePreview as FilePreviewType, MAX_FILES_PER_MESSAGE, MAX_FILE_SIZE } from '@/types/file';
import { ApiService } from '@/services/chatService';

interface FilePickerProps {
    onFilesSelected: (files: FilePreviewType[]) => void;
    onError?: (error: string) => void;
    maxFiles?: number;
    acceptedTypes?: string[];
    disabled?: boolean;
    className?: string;
}

export const FilePicker: React.FC<FilePickerProps> = ({
    onFilesSelected,
    onError,
    maxFiles = MAX_FILES_PER_MESSAGE,
    acceptedTypes,
    disabled = false,
    className = ''
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const processFiles = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const validation = ApiService.validateFiles(files);

        if (!validation.isValid) {
            const errorMessage = validation.errors.join('\n');
            onError?.(errorMessage);
            return;
        }

        if (files.length > maxFiles) {
            const errorMessage = `Maximum ${maxFiles} files allowed`;
            onError?.(errorMessage);
            return;
        }

        const filePreviews: FilePreviewType[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePreview: FilePreviewType = {
                file,
                id: `${file.name}-${Date.now()}-${i}`,
                name: file.name,
                size: file.size,
                type: file.type,
                isUploading: false
            };

            if (file.type.startsWith('image/')) {
                try {
                    filePreview.preview = await ApiService.createImagePreview(file);
                } catch (error) {
                    console.warn('Failed to create image preview:', error);
                }
            }

            filePreviews.push(filePreview);
        }

        onFilesSelected(filePreviews);
    }, [onFilesSelected, onError, maxFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processFiles(files);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [processFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragOver(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    }, [disabled, processFiles]);

    const openFileDialog = useCallback(() => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [disabled]);

    const acceptString = acceptedTypes?.join(',') || '*/*';

    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptString}
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
                className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                        <PaperClipIcon className="w-8 h-8 text-gray-400" />
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                        <DocumentIcon className="w-8 h-8 text-gray-400" />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {isDragOver ? 'Drop files here' : 'Choose files or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Up to {maxFiles} files, max {Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB each
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface QuickFilePickerProps {
    onFilesSelected: (files: FilePreviewType[]) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    className?: string;
}

export const QuickFilePicker: React.FC<QuickFilePickerProps> = ({
    onFilesSelected,
    onError,
    disabled = false,
    className = ''
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const processFiles = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const validation = ApiService.validateFiles(files);
        if (!validation.isValid) {
            onError?.(validation.errors.join('\n'));
            return;
        }

        const filePreviews: FilePreviewType[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePreview: FilePreviewType = {
                file,
                id: `${file.name}-${Date.now()}-${i}`,
                name: file.name,
                size: file.size,
                type: file.type,
                isUploading: false
            };

            if (file.type.startsWith('image/')) {
                try {
                    filePreview.preview = await ApiService.createImagePreview(file);
                } catch (error) {
                    console.warn('Failed to create image preview:', error);
                }
            }

            filePreviews.push(filePreview);
        }

        onFilesSelected(filePreviews);
    }, [onFilesSelected, onError]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processFiles(files);

        if (e.target) {
            e.target.value = '';
        }
    }, [processFiles]);

    const openFileDialog = useCallback(() => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [disabled]);

    const openImageDialog = useCallback(() => {
        if (!disabled && imageInputRef.current) {
            imageInputRef.current.click();
        }
    }, [disabled]);

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="*/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />

            <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />

            <button
                onClick={openImageDialog}
                disabled={disabled}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add images"
            >
                <PhotoIcon className="w-5 h-5" />
            </button>

            <button
                onClick={openFileDialog}
                disabled={disabled}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add files"
            >
                <PaperClipIcon className="w-5 h-5" />
            </button>
        </div>
    );
};
