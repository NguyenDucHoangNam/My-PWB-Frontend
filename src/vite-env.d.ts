/// <reference types="vite/client" />

declare module '*.JPG' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

// WaveSurfer.js type declarations
declare module 'wavesurfer.js' {
  export default WaveSurfer;
  
  interface WaveSurferOptions {
    container: HTMLElement;
    waveColor?: string;
    progressColor?: string;
    cursorColor?: string;
    barWidth?: number;
    barRadius?: number;
    cursorWidth?: number;
    height?: number;
    barGap?: number;
    normalize?: boolean;
    interact?: boolean;
    hideScrollbar?: boolean;
    backend?: string;
    media?: HTMLAudioElement;
  }

  class WaveSurfer {
    static create(options: WaveSurferOptions): WaveSurfer;
    
    destroy(): void;
    load(url: string): Promise<void>;
    play(): Promise<void>;
    pause(): void;
    seekTo(progress: number): void;
    getCurrentTime(): number;
    getDuration(): number;
    setVolume(volume: number): void;
    getVolume(): number;
    
    on(event: 'ready', callback: () => void): void;
    on(event: 'play', callback: () => void): void;
    on(event: 'pause', callback: () => void): void;
    on(event: 'finish', callback: () => void): void;
    on(event: 'audioprocess', callback: () => void): void;
    on(event: 'interaction', callback: (time: number) => void): void;
    on(event: 'error', callback: (error: unknown) => void): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
  }
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.pdf' {
  const src: string;
  export default src;
}