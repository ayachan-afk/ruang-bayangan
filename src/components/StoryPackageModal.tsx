/**
 * Story Package Modal: "Desa yang Terlupakan" (28 Detik)
 * Complete ready-to-export storytelling package representing the 3-act narrative:
 * 1. Hutan yang Tersisa (9s)
 * 2. Desa di Balik Kabut (9s)
 * 3. Pagi di Desa Sederhana (10s)
 *
 * Provides continuous 28s theater playback, act navigation,
 * unified 28s video export, individual scene exports, and JSON project bundle download.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Download,
  Video,
  Layers,
  Sparkles,
  CheckCircle,
  Loader2,
  FileText,
  RotateCcw,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { FORGOTTEN_VILLAGE_PACKAGE } from '../engine/storyPackage';
import { renderShadowScene } from '../engine/renderer';
import { exportStoryPackageToVideo, exportSceneToVideo, downloadVideoBlob } from '../engine/videoExporter';
import { SceneProject } from '../types';

interface StoryPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSceneToStudio: (scene: SceneProject) => void;
}

export const StoryPackageModal: React.FC<StoryPackageModalProps> = ({
  isOpen,
  onClose,
  onLoadSceneToStudio,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [globalTime, setGlobalTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeActIndex, setActiveActIndex] = useState<number>(0);

  // Export states
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [fps, setFps] = useState<24 | 30>(24);
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [exportedBlobs, setExportedBlobs] = useState<{ name: string; blob: Blob }[]>([]);

  const story = FORGOTTEN_VILLAGE_PACKAGE;
  const totalDuration = story.totalDuration; // 28s

  // Determine current active act and local time
  let accumulatedTime = 0;
  let currentAct = story.acts[0];
  let localTime = 0;

  for (let i = 0; i < story.acts.length; i++) {
    const act = story.acts[i];
    if (globalTime >= accumulatedTime && globalTime < accumulatedTime + act.duration) {
      currentAct = act;
      localTime = globalTime - accumulatedTime;
      if (activeActIndex !== i) setActiveActIndex(i);
      break;
    }
    accumulatedTime += act.duration;
  }
  if (globalTime >= totalDuration) {
    currentAct = story.acts[story.acts.length - 1];
    localTime = currentAct.duration;
  }

  // Continuous animation loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    let animId: number;
    let lastStamp = performance.now();

    const loop = (stamp: number) => {
      const dt = (stamp - lastStamp) / 1000;
      lastStamp = stamp;

      setGlobalTime((prev) => {
        const next = prev + dt;
        return next >= totalDuration ? 0 : next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPlaying, totalDuration]);

  // Canvas render update
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderShadowScene(ctx, currentAct.scene, localTime, {
      showGizmos: false,
    });
  }, [isOpen, currentAct, localTime]);

  if (!isOpen) return null;

  // Jump to specific act
  const jumpToAct = (actIdx: number) => {
    let t = 0;
    for (let i = 0; i < actIdx; i++) {
      t += story.acts[i].duration;
    }
    setGlobalTime(t + 0.1);
    setActiveActIndex(actIdx);
  };

  // Export Full 28s Unified Video
  const handleExportFullMovie = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportedBlobs([]);
    setExportStatusText('Merender Video Lengkap 28 Detik (Semua 3 Babak)...');

    try {
      const blob = await exportStoryPackageToVideo(story, {
        resolution,
        fps,
        format,
        onProgress: (p, cur, tot) => {
          setExportProgress(p);
          setExportStatusText(`Merender frame ${cur} dari ${tot} (${Math.round(p * 100)}%)...`);
        },
      });

      const filename = `paket_cerita_desa_terlupakan_28detik_${resolution}.${format}`;
      setExportedBlobs([{ name: filename, blob }]);
      setIsExporting(false);
      downloadVideoBlob(blob, filename);
    } catch (err: any) {
      alert('Gagal merender video: ' + (err?.message || 'Error'));
      setIsExporting(false);
    }
  };

  // Export All 3 Individual Scene Clips sequentially
  const handleExportIndividualScenes = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportedBlobs([]);
    const results: { name: string; blob: Blob }[] = [];

    try {
      for (let i = 0; i < story.acts.length; i++) {
        const act = story.acts[i];
        setExportStatusText(`Merender Bab ${i + 1}/${story.acts.length}: ${act.title}...`);

        const blob = await exportSceneToVideo(act.scene, {
          resolution,
          fps,
          format,
          onProgress: (p) => {
            const overallP = (i + p) / story.acts.length;
            setExportProgress(overallP);
          },
        });

        const cleanName = `0${i + 1}_bab_${i + 1}_${act.scene.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${act.duration}s.${format}`;
        results.push({ name: cleanName, blob });
        downloadVideoBlob(blob, cleanName);
      }

      setExportedBlobs(results);
      setIsExporting(false);
      setExportStatusText('Semua 3 klip video berhasil dirender dan diunduh!');
    } catch (err: any) {
      alert('Gagal mengeksport klip: ' + (err?.message || 'Error'));
      setIsExporting(false);
    }
  };

  // Download Complete Project Package JSON
  const handleDownloadPackageJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(story, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'paket_desa_yang_terlupakan_28s.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06070a]/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#12141c] border border-[#262c3c] rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-neutral-200">
        {/* Top Modal Header */}
        <div className="h-14 px-6 border-b border-[#232734] bg-[#0e1017] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white font-serif-brand tracking-wider">
                  Paket Cerita: Desa yang Terlupakan
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  Total 28 Detik · 3 Babak
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Visual shadow theater storytelling siap pakai & siap eksport
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPackageJson}
              title="Unduh paket konfigurasi JSON proyek"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1e2a] hover:bg-[#232838] text-neutral-300 hover:text-white text-xs font-medium border border-[#2a3042] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Unduh JSON Paket</span>
            </button>

            <button
              onClick={onClose}
              disabled={isExporting}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-[#232838] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Left 16:9 Cinema Viewport + Right Story & Export Controls */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: 16:9 Theater Canvas + Timeline Controls */}
          <div className="flex-1 p-6 flex flex-col justify-between bg-[#08090d] border-r border-[#202430]">
            {/* Canvas Stage */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl border border-[#302621] bg-black">
              <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="w-full h-full object-contain"
              />

              {/* Act Badge on Stage */}
              <div className="absolute top-3 left-3 bg-black/75 backdrop-blur px-2.5 py-1 rounded text-xs font-serif-brand text-amber-400 border border-amber-500/30">
                {currentAct.title}
              </div>
            </div>

            {/* Playback Controls & Scrubber */}
            <div className="mt-4 bg-[#12151e] border border-[#222736] rounded-lg p-3 flex items-center gap-3">
              <button
                onClick={() => setGlobalTime(0)}
                className="p-2 text-neutral-400 hover:text-white rounded hover:bg-[#1a1f2c] transition-colors"
                title="Mulai Dari Awal"
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

              {/* 28s Scrubber Slider */}
              <div className="flex-1 flex flex-col gap-1">
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  step="0.05"
                  value={globalTime}
                  onChange={(e) => setGlobalTime(Number(e.target.value))}
                  className="w-full cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono-numbers text-neutral-400">
                  <span>{globalTime.toFixed(1)}s</span>
                  <div className="flex gap-4">
                    <span className={activeActIndex === 0 ? 'text-amber-400 font-bold' : ''}>Bab 1 (0-9s)</span>
                    <span className={activeActIndex === 1 ? 'text-amber-400 font-bold' : ''}>Bab 2 (9-18s)</span>
                    <span className={activeActIndex === 2 ? 'text-amber-400 font-bold' : ''}>Bab 3 (18-28s)</span>
                  </div>
                  <span className="text-amber-300 font-bold">{totalDuration}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Story Acts Breakdown & Export Package Options */}
          <div className="w-96 flex flex-col justify-between p-5 bg-[#0e1017] overflow-y-auto space-y-4">
            {/* Story Acts Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Naskah Cerita (3 Babak)
                </span>
                <span className="text-[10px] text-amber-500 font-mono font-semibold">
                  Klik untuk pratinjau
                </span>
              </div>

              {story.acts.map((act, idx) => {
                const isActive = activeActIndex === idx;
                return (
                  <div
                    key={act.id}
                    onClick={() => jumpToAct(idx)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-md text-white'
                        : 'bg-[#151822] border-[#222736] hover:bg-[#1a1e2b] text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-serif-brand text-amber-400">
                        {act.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadSceneToStudio(act.scene);
                          onClose();
                        }}
                        className="text-[10px] text-amber-300 hover:text-amber-200 underline flex items-center gap-0.5"
                        title="Buka bab ini di Scene Canvas untuk diedit"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Edit Bab</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-300 italic leading-relaxed">
                      "{act.narration}"
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Export Settings & Triggers */}
            <div className="pt-4 border-t border-[#222736] space-y-3">
              <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                Opsi Eksport Video
              </span>

              {/* Format & Resolution Row */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Resolusi</label>
                  <select
                    aria-label="Resolusi Video"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as any)}
                    className="w-full bg-[#161a25] text-xs font-mono-numbers text-white px-2 py-1.5 rounded border border-[#272d3b] outline-none"
                  >
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Format Video</label>
                  <select
                    aria-label="Format Video"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full bg-[#161a25] text-xs uppercase font-mono-numbers text-white px-2 py-1.5 rounded border border-[#272d3b] outline-none"
                  >
                    <option value="webm">WebM (VP9)</option>
                    <option value="mp4">MP4 (H.264)</option>
                  </select>
                </div>
              </div>

              {/* Export Progress Indicator */}
              {isExporting && (
                <div className="p-3 rounded bg-[#161a25] border border-amber-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{exportStatusText}</span>
                  </div>
                  <div className="w-full bg-[#0a0c12] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-150"
                      style={{ width: `${exportProgress * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Export Trigger Buttons */}
              <div className="space-y-2 pt-1">
                {/* 1. Full 28s Video Export */}
                <button
                  onClick={handleExportFullMovie}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-lg shadow-amber-950/50 disabled:opacity-50"
                >
                  <Video className="w-4 h-4" />
                  <span>Eksport Film Penuh (28 Detik Sekaligus)</span>
                </button>

                {/* 2. Split 3 Acts Export */}
                <button
                  onClick={handleExportIndividualScenes}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#1a1f2c] hover:bg-[#23293a] text-neutral-200 text-xs font-semibold border border-[#2d3448] transition-colors disabled:opacity-50"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Eksport Terpisah (3 File Video Babak)</span>
                </button>
              </div>

              {/* Success Badge */}
              {exportedBlobs.length > 0 && !isExporting && (
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2 text-emerald-300 text-xs">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{exportedBlobs.length} file video telah berhasil diunduh ke komputermu!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
