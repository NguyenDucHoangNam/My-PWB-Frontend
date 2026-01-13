/**
 * Helper functions cho TrackDetailPage
 */

/**
 * Format duration in seconds to MM:SS format
 */
export const formatDuration = (seconds?: number | null): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

