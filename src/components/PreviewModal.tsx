/**
 * Fullscreen Cinematic Preview Modal
 * Distraction-free theater viewing of the backlit silhouette story.
 */

import React, { useRef, useEffect, useState } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { SceneProject } from '../types';
import { renderShadowScene } from '../engine/renderer';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: SceneProject;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, scene }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Playback timer loop
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;
    let lastStamp = performance.now();

    const loop = (stamp: number) => {
      const dt = (stamp - lastStamp) / 1000;
      lastStamp = stamp;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt;
          return next > scene.duration ? 0 : next;
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPlaying, scene.duration]);

  // Canvas render update
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderShadowScene(ctx, scene, currentTime, {
      showGizmos: false,
    });
  }, [isOpen, scene, currentTime]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#050508] flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between z-10">
        <div>
          <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-semibold block">
            Shadow Theater Cinema Screening
          </span>
          <h2 className="text-lg font-bold text-neutral-100 font-serif-brand">
            {scene.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181b24] hover:bg-[#222736] text-neutral-300 hover:text-white text-xs font-semibold border border-[#272d3b] transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Exit Theater</span>
        </button>
      </div>

      {/* Main 16:9 Canvas Stage with warm glowing shadow bezel */}
      <div className="relative w-full max-w-5xl aspect-video rounded-md overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.12)] border border-[#382b26]">
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full object-contain bg-black"
        />
      </div>

      {/* Floating Bottom Screening Controls */}
      <div className="w-full max-w-xl bg-[#141720]/90 backdrop-blur border border-[#272d3b] rounded-full px-5 py-2.5 flex items-center gap-4 shadow-2xl z-10">
        <button
          onClick={() => setCurrentTime(0)}
          className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-[#202533] transition-colors"
          title="Restart"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-bold transition-transform active:scale-95"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Scrubber slider */}
        <div className="flex-1 flex items-center gap-3">
          <input
            type="range"
            min="0"
            max={scene.duration}
            step="0.05"
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="flex-1 cursor-pointer accent-amber-500"
          />
          <span className="text-xs font-mono-numbers text-amber-300 min-w-14 text-right font-medium">
            {currentTime.toFixed(1)}s / {scene.duration}s
          </span>
        </div>
      </div>
    </div>
  );
};
