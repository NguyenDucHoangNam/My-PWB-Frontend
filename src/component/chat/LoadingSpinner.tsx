import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'white' | 'gray' | 'purple';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'blue',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const colorClasses = {
        blue: 'border-blue-500',
        white: 'border-white',
        gray: 'border-gray-500',
        purple: 'border-purple-500'
    };

    return (
        <div
            className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin ${className}`}
        />
    );
};

interface LoadingDotsProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'white' | 'gray';
    className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
    size = 'md',
    color = 'blue',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-1 h-1',
        md: 'w-1.5 h-1.5',
        lg: 'w-2 h-2'
    };

    const colorClasses = {
        blue: 'bg-blue-500',
        white: 'bg-white',
        gray: 'bg-gray-500'
    };

    return (
        <div className={`flex items-center space-x-1 ${className}`}>
            <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}></div>
            <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
        </div>
    );
};

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
    className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isVisible,
    message = 'Loading...',
    className = ''
}) => {
    if (!isVisible) return null;

    return (
        <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 ${className}`}>
            <div className="flex flex-col items-center space-y-3">
                <LoadingSpinner size="lg" color="blue" />
                <p className="text-sm font-medium text-slate-600">{message}</p>
            </div>
        </div>
    );
};

interface SkeletonProps {
    className?: string;
    lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    lines = 1
}) => {
    return (
        <div className={`animate-pulse ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
                <div
                    key={index}
                    className={`bg-slate-200 rounded ${index === lines - 1 ? 'w-3/4' : 'w-full'} h-4 ${index > 0 ? 'mt-2' : ''}`}
                />
            ))}
        </div>
    );
};

interface MessageSkeletonProps {
    isMe?: boolean;
    className?: string;
}

export const MessageSkeleton: React.FC<MessageSkeletonProps> = ({
    isMe = false,
    className = ''
}) => {
    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${className}`}>
            <div className={`max-w-xs lg:max-w-md p-4 rounded-2xl ${isMe ? 'bg-blue-100 rounded-br-md' : 'bg-slate-100 rounded-bl-md'
                }`}>
                <Skeleton lines={2} />
            </div>
        </div>
    );
};
