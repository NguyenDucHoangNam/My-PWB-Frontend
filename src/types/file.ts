export interface FileMetaDataResponse {
    name: string;
    contentType: string;
    size: number;
    url: string;
    displayOrder?: number;
}

export interface MediaAttachment {
    mediaUrl: string;
    mediaName: string;
    mediaSize: number;
    mediaType: string;
    displayOrder?: number;
}

export enum MessageType {
    TEXT = 'TEXT',
    FILE = 'FILE'
}

export interface FilePreview {
    file: File;
    id: string;
    name: string;
    size: number;
    type: string;
    preview?: string;
    isUploading?: boolean;
    uploadProgress?: number;
    error?: string;
}

export interface UploadProgress {
    fileId: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
}

export const FILE_CATEGORIES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'],
    VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv'],
    AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/m4a', 'audio/wma'],
    DOCUMENT: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/rtf',
        'application/vnd.oasis.opendocument.text'
    ],
    SPREADSHEET: [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.spreadsheet',
        'text/csv'
    ],
    PRESENTATION: [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.oasis.opendocument.presentation'
    ],
    ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'],
    TEXT: ['text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript', 'text/xml', 'application/json', 'text/markdown']
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_MESSAGE = 10;

export const getFileCategory = (mimeType: string): keyof typeof FILE_CATEGORIES | 'OTHER' => {
    for (const [category, types] of Object.entries(FILE_CATEGORIES)) {
        if ((types as readonly string[]).includes(mimeType)) {
            return category as keyof typeof FILE_CATEGORIES;
        }
    }
    return 'OTHER';
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimeType: string): string => {
    const category = getFileCategory(mimeType);

    switch (category) {
        case 'IMAGE':
            return '🖼️';
        case 'VIDEO':
            return '🎥';
        case 'AUDIO':
            return '🎵';
        case 'DOCUMENT':
            return '📄';
        case 'SPREADSHEET':
            return '📊';
        case 'PRESENTATION':
            return '�️';
        case 'ARCHIVE':
            return '📦';
        case 'TEXT':
            return '📝';
        default:
            return '📎';
    }
};

export const getFileIconColor = (mimeType: string): string => {
    const category = getFileCategory(mimeType);

    switch (category) {
        case 'IMAGE':
            return 'text-green-500';
        case 'VIDEO':
            return 'text-red-500';
        case 'AUDIO':
            return 'text-purple-500';
        case 'DOCUMENT':
            return 'text-blue-500';
        case 'SPREADSHEET':
            return 'text-green-600';
        case 'PRESENTATION':
            return 'text-orange-500';
        case 'ARCHIVE':
            return 'text-yellow-600';
        case 'TEXT':
            return 'text-gray-600';
        default:
            return 'text-gray-500';
    }
};
