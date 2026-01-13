/**
 * Helper functions cho ProjectWorkspaceDetailPage
 */

import React from 'react';
import { type MilestoneDetail } from '../types/projectWorkspaceDetail';

/**
 * Empty milestone detail constant
 */
export const emptyMilestoneDetail: MilestoneDetail = {
    id: '',
    title: '',
    status: 'Đang Chờ Lệnh',
    description: '',
    budget: 0,
    deadline: new Date().toISOString(),
};

/**
 * Get role badge component
 */
export const getRoleBadge = (role?: string): React.ReactElement | null => {
    switch (role) {
        case 'OWNER':
            return React.createElement('span', {
                className: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/50'
            }, 'OWNER');
        case 'CLIENT':
            return React.createElement('span', {
                className: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/50'
            }, 'CLIENT');
        case 'COLLABORATOR':
            return React.createElement('span', {
                className: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/50'
            }, 'COLLABORATOR');
        case 'OBSERVER':
            return React.createElement('span', {
                className: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-300 border border-gray-500/50'
            }, 'OBSERVER');
        default:
            return null;
    }
};

/**
 * Generate avatar URL from name
 */
export const generateAvatarUrl = (name: string, size: number = 40): string => {
    const initial = name.trim().charAt(0).toUpperCase() || 'U';
    const colors = [
        { bg: '#7c3aed', text: '#ffffff' },
        { bg: '#f59e0b', text: '#ffffff' },
        { bg: '#10b981', text: '#ffffff' },
        { bg: '#3b82f6', text: '#ffffff' },
        { bg: '#ef4444', text: '#ffffff' },
        { bg: '#8b5cf6', text: '#ffffff' },
    ];
    const colorIndex = initial.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    const fontSize = Math.floor(size * 0.5);
    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color.bg}"/>
  <text x="${size/2}" y="${size/2}" dominant-baseline="central" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" 
        fill="${color.text}">${initial}</text>
</svg>`;
    
    const encodedSvg = encodeURIComponent(svg);
    return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
};

/**
 * Sanitize numeric parameter from URL/search params
 */
export const sanitizeNumericParam = (value: string | null | undefined): string | undefined => {
    if (!value) return undefined;
    const match = value.match(/^\d+/);
    return match ? match[0] : undefined;
};

