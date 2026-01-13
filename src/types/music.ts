// src/types/music.ts

export interface Track {
  id: number;              // ✅ Changed to number to match backend Long
  title: string;
  artist: string;
  duration: number;        // seconds
  url: string;             // /music/track1.mp3 or hlsPlaybackUrl
  hlsPlaybackUrl?: string; // HLS URL from backend
  coverUrl?: string;
  genre?: string;
  bpm?: number;
  roomType?: 'INTERNAL' | 'CLIENT'; // Room type from backend
  voiceTagEnabled?: boolean; // Voice tag enabled flag
  version?: string; // Track version (v1, v2, ...)
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
}

export interface MusicEvent {
  action: 'PLAY' | 'PAUSE' | 'SEEK' | 'NEXT' | 'PREVIOUS' | 'STOP' | 'VOLUME';
  trackId?: string;
  position?: number;      // Current time in seconds
  volume?: number;        // 0-1
  timestamp?: string;
  triggeredByUserId?: number;
  triggeredByUserName?: string;
}

export type MusicEventAction = MusicEvent['action'];
