import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ImagePreviewModalProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
    images,
    initialIndex,
    isOpen,
    onClose
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                    break;
                case 'ArrowRight':
                    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, images.length, onClose]);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const extractFilename = (url: string, fallback: string): string => {
        try {
            const urlParts = url.split('/');
            const encodedFilename = urlParts[urlParts.length - 1];
            if (!encodedFilename) return fallback;

            // Decode and remove query parameters
            const decodedName = decodeURIComponent(encodedFilename).split('?')[0];
            return decodedName || fallback;
        } catch (e) {
            return fallback;
        }
    };

    const downloadImage = (url: string, index: number) => {
        try {
            if (!url) {
                toast.error('Invalid image URL');
                return;
            }

            const link = document.createElement('a');
            link.href = url;
            const fileName = extractFilename(url, `image-${index + 1}-${Date.now()}.jpg`);
            link.download = fileName;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Image downloaded successfully!', {
                duration: 3000,
            });
        } catch (error) {
            toast.error('Failed to download image. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/90"
            />

            <div
                className="relative z-10 w-screen h-screen flex items-center justify-center"
            >
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 z-[60] w-10 h-10 bg-white hover:bg-red-50 text-gray-800 hover:text-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg border border-gray-300 hover:border-red-400"
                    title="Đóng (ESC)"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                <div
                    className="relative w-full h-full flex items-center justify-center px-24 py-20"
                >

                    {/* Download button */}
                    <button
                        onClick={() => downloadImage(images[currentIndex], currentIndex)}
                        className="absolute top-6 right-24 z-20 w-12 h-12 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg border border-gray-200"
                        title="Tải xuống"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>

                    {/* Navigation buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg border border-gray-200"
                                title="Ảnh trước"
                            >
                                <ChevronLeftIcon className="w-7 h-7" />
                            </button>

                            <button
                                onClick={goToNext}
                                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg border border-gray-200"
                                title="Ảnh sau"
                            >
                                <ChevronRightIcon className="w-7 h-7" />
                            </button>
                        </>
                    )}

                    {/* Image container */}
                    <div className="flex items-center justify-center w-full h-full">
                        <img
                            src={images[currentIndex]}
                            alt={`Preview ${currentIndex + 1}`}
                            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
                        />
                    </div>

                    {/* Image counter and thumbnails */}
                    {images.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-auto">
                            {/* Counter */}
                            <div className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-gray-200">
                                {currentIndex + 1} / {images.length}
                            </div>

                            {/* Thumbnails */}
                            <div className="flex gap-2 bg-white/90 p-2 rounded-lg shadow-lg border border-gray-200">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-12 h-12 rounded-lg overflow-hidden transition-all duration-200 border-2 ${index === currentIndex
                                            ? 'border-gray-800 scale-110'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
