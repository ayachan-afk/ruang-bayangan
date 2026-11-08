/**
 * Bottom Animation Timeline Component
 * Professional keyframing timeline with scrubbable playhead, time ruler,
 * layer tracks, keyframe markers, and playback controls.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Repeat,
  PlusCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Diamond,
} from 'lucide-react';
import { SceneProject, SceneElement, Keyframe } from '../types';

interface TimelineProps {
  scene: SceneProject;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onAddKeyframe: () => void;
  onDeleteKeyframe: (elementId: string, keyframeId: string) => void;
  onUpdateDuration: (duration: number) => void;
  onToggleVisibility: (elementId: string) => void;
  onToggleLock: (elementId: string) => void;
  onDeleteElement: (elementId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  scene,
  currentTime,
  isPlaying,
  onTogglePlay,
  onSeek,
  selectedElementId,
  onSelectElement,
  onAddKeyframe,
  onDeleteKeyframe,
  onUpdateDuration,
  onToggleVisibility,
  onToggleLock,
  onDeleteElement,
}) => {
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [selectedKeyframe, setSelectedKeyframe] = useState<{ elementId: string; keyframeId: string } | null>(null);
  const rulerContainerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const duration = scene.duration;
  const fps = scene.fps;
  const currentFrame = Math.floor(currentTime * fps);
  const totalFrames = Math.floor(duration * fps);

  // Format mm:ss.ms
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Convert click/drag on ruler to seconds
  const handleRulerInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerContainerRef.current) return;
    const rect = rulerContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(progress * duration);
  };

  const handleMouseDownRuler = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleRulerInteraction(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isScrubbing || !rulerContainerRef.current) return;
      const rect = rulerContainerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const progress = Math.max(0, Math.min(1, clickX / rect.width));
      onSeek(progress * duration);
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
    };

    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, duration, onSeek]);

  // Step frame forward/back
  const stepFrame = (delta: number) => {
    const nextTime = Math.max(0, Math.min(duration, currentTime + delta / fps));
    onSeek(nextTime);
  };

  // Keyboard shortcut: Spacebar toggles playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'SELECT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }
        e.preventDefault();
        onTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay]);

  return (
    <div className="h-64 bg-[#111319] border-t border-[#232732] flex flex-col select-none z-20">
      {/* 1. Playback Controls Toolbar */}
      <div className="h-11 bg-[#151821] border-b border-[#232732] px-4 flex items-center justify-between">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSeek(0)}
            title="Rewind to 0s (Home)"
            aria-label="Rewind to 0s"
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#202533] transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => stepFrame(-1)}
            title="Step 1 Frame Backward"
            aria-label="Step 1 Frame Backward"
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#202533] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-bold transition-transform active:scale-95 shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
          <button
            onClick={() => stepFrame(1)}
            title="Step 1 Frame Forward"
            aria-label="Step 1 Frame Forward"
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#202533] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsLooping(!isLooping)}
            title={isLooping ? 'Loop: ON' : 'Loop: OFF'}
            aria-label="Toggle Loop"
            className={`p-1.5 rounded transition-colors ${
              isLooping ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timecode & Frame Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#0c0e14] px-3 py-1 rounded border border-[#232732]">
            <span className="text-xs font-mono-numbers font-bold text-amber-400">
              {formatTime(currentTime)}
            </span>
            <span className="text-[10px] text-neutral-500">/</span>
            <span className="text-xs font-mono-numbers text-neutral-400">
              {formatTime(duration)}
            </span>
          </div>

          <div className="text-[11px] font-mono-numbers text-neutral-400">
            Frame <span className="text-neutral-200 font-semibold">{currentFrame}</span> / {totalFrames}
          </div>
        </div>

        {/* Right Tools: Add Keyframe & Scene Duration */}
        <div className="flex items-center gap-3">
          <button
            onClick={onAddKeyframe}
            disabled={!selectedElementId}
            title={selectedElementId ? 'Record keyframe at playhead' : 'Select an element first'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
              selectedElementId
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25'
                : 'text-neutral-600 border-[#232732] cursor-not-allowed'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Keyframe</span>
          </button>

          {/* Delete Selected Keyframe Button if one is selected */}
          {selectedKeyframe && (
            <button
              onClick={() => {
                onDeleteKeyframe(selectedKeyframe.elementId, selectedKeyframe.keyframeId);
                setSelectedKeyframe(null);
              }}
              title="Delete selected keyframe"
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-rose-950/40 text-rose-400 border border-rose-800/40 hover:bg-rose-900/60 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Del Key</span>
            </button>
          )}

          {/* Duration Selector */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span className="text-[10px] uppercase font-semibold">Length:</span>
            <select
              aria-label="Scene Duration"
              value={duration}
              onChange={(e) => onUpdateDuration(Number(e.target.value))}
              className="bg-[#181b24] text-xs font-mono-numbers text-neutral-200 px-2 py-1 rounded border border-[#272d3b] outline-none cursor-pointer"
            >
              <option value={5}>5s (120 frames)</option>
              <option value={8}>8s (192 frames)</option>
              <option value={10}>10s (240 frames)</option>
              <option value={15}>15s (360 frames)</option>
              <option value={20}>20s (480 frames)</option>
              <option value={30}>30s (720 frames)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Main Timeline Grid: Headers on Left, Ruler & Tracks on Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Track Names Column */}
        <div className="w-60 bg-[#12141a] border-r border-[#232732] flex flex-col shrink-0 overflow-y-auto">
          {/* Header spacer */}
          <div className="h-6 border-b border-[#232732] px-3 flex items-center justify-between text-[10px] uppercase font-bold text-neutral-500">
            <span>Layers ({scene.elements.length})</span>
            <span>Controls</span>
          </div>

          {/* Layer Headers List */}
          <div className="flex-1 divide-y divide-[#1e222d]">
            {scene.elements.map((el) => {
              const isSelected = el.id === selectedElementId;
              return (
                <div
                  key={el.id}
                  onClick={() => onSelectElement(el.id)}
                  className={`h-9 px-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-amber-500/15 border-l-2 border-amber-500 text-white font-medium' : 'hover:bg-[#181b24] text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="text-[10px] font-mono text-neutral-500 w-4">
                      Z{el.zIndex}
                    </span>
                    <span className="text-xs truncate">{el.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleLock(el.id)}
                      className="p-1 hover:text-white text-neutral-500 transition-colors"
                      title={el.locked ? 'Locked' : 'Unlocked'}
                    >
                      {el.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => onToggleVisibility(el.id)}
                      className="p-1 hover:text-white text-neutral-500 transition-colors"
                      title="Toggle Visibility"
                    >
                      {el.visible ? <Eye className="w-3 h-3 text-neutral-400" /> : <EyeOff className="w-3 h-3 text-neutral-600" />}
                    </button>
                    <button
                      onClick={() => onDeleteElement(el.id)}
                      className="p-1 hover:text-rose-400 text-neutral-500 transition-colors"
                      title="Delete layer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Timeline Lanes & Ruler */}
        <div className="flex-1 flex flex-col overflow-x-auto relative bg-[#0e1015]">
          {/* Time Ruler */}
          <div
            ref={rulerContainerRef}
            onMouseDown={handleMouseDownRuler}
            className="h-6 border-b border-[#232732] relative cursor-pointer bg-[#141720] select-none"
          >
            {/* Second Markers */}
            {Array.from({ length: Math.ceil(duration) + 1 }).map((_, sec) => {
              const leftPercent = (sec / duration) * 100;
              if (leftPercent > 100) return null;
              return (
                <div
                  key={sec}
                  className="absolute top-0 bottom-0 flex flex-col justify-between"
                  style={{ left: `${leftPercent}%` }}
                >
                  <div className="h-2 w-[1px] bg-neutral-600" />
                  <span className="text-[9px] font-mono-numbers text-neutral-400 -translate-x-1/2 leading-none pb-0.5">
                    {sec}s
                  </span>
                </div>
              );
            })}

            {/* Quarter-second subtle ticks */}
            {Array.from({ length: Math.ceil(duration * 4) }).map((_, tick) => {
              const sec = tick / 4;
              if (sec % 1 === 0) return null;
              const leftPercent = (sec / duration) * 100;
              if (leftPercent > 100) return null;
              return (
                <div
                  key={tick}
                  className="absolute top-0 h-1.5 w-[1px] bg-neutral-800"
                  style={{ left: `${leftPercent}%` }}
                />
              );
            })}

            {/* Playhead Marker on Ruler */}
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="w-3 h-3 bg-red-500 rotate-45 -translate-x-1/2 -translate-y-1 shadow-md shadow-red-950" />
            </div>
          </div>

          {/* Element Lanes with Keyframe Diamonds */}
          <div className="flex-1 divide-y divide-[#181c25] relative overflow-y-auto">
            {/* Vertical Playhead Scrub Line down all tracks */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-red-500/90 z-20 pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />

            {scene.elements.map((el) => {
              const isSelected = el.id === selectedElementId;
              return (
                <div
                  key={el.id}
                  onClick={() => onSelectElement(el.id)}
                  className={`h-9 relative transition-colors ${
                    isSelected ? 'bg-amber-500/5' : 'hover:bg-[#13161f]'
                  }`}
                >
                  {/* Subtle track center guideline */}
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#1e2330]" />

                  {/* Render Keyframe Diamonds */}
                  {el.keyframes.map((kf) => {
                    const kfPercent = (kf.time / duration) * 100;
                    const isKfSelected =
                      selectedKeyframe?.elementId === el.id && selectedKeyframe?.keyframeId === kf.id;
                    return (
                      <div
                        key={kf.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSeek(kf.time);
                          onSelectElement(el.id);
                          setSelectedKeyframe({ elementId: el.id, keyframeId: kf.id });
                        }}
                        style={{ left: `${kfPercent}%` }}
                        title={`${el.name} Keyframe @ ${kf.time.toFixed(2)}s`}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 cursor-pointer z-10 transition-transform hover:scale-125 ${
                          isKfSelected
                            ? 'bg-amber-400 border border-white shadow-md shadow-amber-500/50'
                            : 'bg-amber-600/90 hover:bg-amber-400 border border-black/80'
                        }`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
