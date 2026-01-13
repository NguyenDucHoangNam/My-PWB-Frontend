// src/pages/project/live-room/music/AudioVisualizer.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  className?: string;
  barCount?: number;
  barColor?: string;
  showWaveform?: boolean;
}

// Use WeakMap to track connected audio elements (prevents double connection error)
const connectedAudioElements = new WeakMap<HTMLAudioElement, {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  source: MediaElementAudioSourceNode;
}>();

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioElement,
  isPlaying,
  className = '',
  barCount = 64,
  barColor = '#a855f7',
  showWaveform = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastDataRef = useRef<Uint8Array | null>(null);

  // Setup canvas with proper devicePixelRatio for sharp rendering
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    // Set actual canvas size in memory (scaled by dpr)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale canvas back down using CSS
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Scale context to match dpr
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioElement) return;

    const existing = connectedAudioElements.get(audioElement);
    if (existing) {
      analyserRef.current = existing.analyser;
      const bufferLength = existing.analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      setIsInitialized(true);
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioElement);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);
      analyser.connect(audioContext.destination);

      connectedAudioElements.set(audioElement, { audioContext, analyser, source });

      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      setIsInitialized(true);
    } catch (error) {
      console.error('Audio visualizer initialization error:', error);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioElement]);

  // Setup canvas on mount and resize
  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas, isInitialized]);

  // Draw sharper bars with minimal blur
  const drawBars = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const barWidth = width / barCount;
    const gap = Math.max(1, barWidth * 0.2);
    const centerY = height / 2;

    // Clear any previous shadow settings for sharpness
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor(i * dataArray.length / barCount);
      const value = dataArray[dataIndex] / 255;
      const barHeight = Math.max(2, value * height * 0.45);

      const x = i * barWidth;
      const actualBarWidth = barWidth - gap;

      // Create solid gradient for sharper look
      const gradient = ctx.createLinearGradient(x, centerY - barHeight, x, centerY + barHeight);
      gradient.addColorStop(0, '#c084fc');
      gradient.addColorStop(0.3, '#a855f7');
      gradient.addColorStop(0.5, '#9333ea');
      gradient.addColorStop(0.7, '#a855f7');
      gradient.addColorStop(1, '#c084fc');

      ctx.fillStyle = gradient;

      // Draw crisp rectangles using Math.round for pixel-perfect alignment
      ctx.fillRect(
        Math.round(x + gap / 2),
        Math.round(centerY - barHeight),
        Math.round(actualBarWidth),
        Math.round(barHeight)
      );
      ctx.fillRect(
        Math.round(x + gap / 2),
        Math.round(centerY),
        Math.round(actualBarWidth),
        Math.round(barHeight)
      );
    }
  }, [barCount]);

  const drawWaveform = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = barColor;
    ctx.shadowBlur = 6;
    ctx.shadowColor = barColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 255.0;
      const y = height / 2 + (v - 0.5) * height * 0.8;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [barColor]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !analyserRef.current || !dataArrayRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const draw = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // @ts-ignore
      analyser.getByteFrequencyData(dataArray);
      lastDataRef.current = new Uint8Array(dataArray);

      ctx.clearRect(0, 0, width, height);

      if (showWaveform) {
        drawWaveform(ctx, width, height, dataArray);
      } else {
        drawBars(ctx, width, height, dataArray);
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    if (isPlaying) {
      setupCanvas();
      draw();
    } else {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      if (lastDataRef.current) {
        if (showWaveform) {
          drawWaveform(ctx, rect.width, rect.height, lastDataRef.current);
        } else {
          drawBars(ctx, rect.width, rect.height, lastDataRef.current);
        }
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, showWaveform, drawBars, drawWaveform, setupCanvas]);

  // Idle animation when not initialized
  const IdleAnimation = () => {
    const bars = Array.from({ length: 32 }, (_, i) => i);

    return (
      <div className="flex items-center justify-center gap-0.5 h-full">
        {bars.map((i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0.3 }}
            animate={{ scaleY: [0.3, 0.8, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.04,
              ease: 'easeInOut'
            }}
            className="w-1 h-20 rounded-full origin-center bg-purple-500"
            style={{ opacity: 0.5 }}
          />
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {isInitialized ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      ) : (
        <IdleAnimation />
      )}

      {/* Subtle decorative overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default AudioVisualizer;
