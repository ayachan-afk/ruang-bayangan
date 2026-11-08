/**
 * Export Modal Component
 * Renders shadow theater animation to WebM or MP4 video file with live progress
 */

import React, { useState } from 'react';
import { X, Video, Download, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { SceneProject } from '../types';
import { exportSceneToVideo, downloadVideoBlob } from '../engine/videoExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: SceneProject;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, scene }) => {
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [fps, setFps] = useState<24 | 30>(24);
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [totalFrames, setTotalFrames] = useState<number>(0);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setError(null);
    setExportedBlob(null);

    try {
      const blob = await exportSceneToVideo(scene, {
        resolution,
        fps,
        format,
        onProgress: (p, cur, tot) => {
          setProgress(p);
          setCurrentFrame(cur);
          setTotalFrames(tot);
        },
      });

      setExportedBlob(blob);
      setIsExporting(false);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Export failed. Try WebM format instead.');
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportedBlob) return;
    const sanitizedName = scene.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const ext = format === 'mp4' ? 'mp4' : 'webm';
    downloadVideoBlob(exportedBlob, `${sanitizedName}_${resolution}_${fps}fps.${ext}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141720] border border-[#272d3b] rounded-xl w-full max-w-md overflow-hidden shadow-2xl text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#232732] bg-[#11131a]">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-serif-brand tracking-wide">
              Render & Export Animation Video
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-[#202533] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {!isExporting && !exportedBlob && (
            <>
              {/* Resolution Setting */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Output Resolution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setResolution('1080p')}
                    className={`py-2 px-3 rounded text-xs font-medium border text-left transition-all ${
                      resolution === '1080p'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-semibold'
                        : 'bg-[#181b24] border-[#272d3b] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm">Full HD 1080p</div>
                    <div className="text-[10px] text-neutral-400 font-mono-numbers">1920 × 1080 (16:9)</div>
                  </button>
                  <button
                    onClick={() => setResolution('720p')}
                    className={`py-2 px-3 rounded text-xs font-medium border text-left transition-all ${
                      resolution === '720p'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-semibold'
                        : 'bg-[#181b24] border-[#272d3b] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm">HD 720p</div>
                    <div className="text-[10px] text-neutral-400 font-mono-numbers">1280 × 720 (16:9)</div>
                  </button>
                </div>
              </div>

              {/* Framerate & Format */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Framerate (FPS)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setFps(24)}
                      className={`py-1.5 px-2 rounded text-xs font-mono-numbers border text-center transition-all ${
                        fps === 24
                          ? 'bg-amber-500 text-black font-bold border-amber-500'
                          : 'bg-[#181b24] border-[#272d3b] text-neutral-400 hover:text-white'
                      }`}
                    >
                      24 FPS
                    </button>
                    <button
                      onClick={() => setFps(30)}
                      className={`py-1.5 px-2 rounded text-xs font-mono-numbers border text-center transition-all ${
                        fps === 30
                          ? 'bg-amber-500 text-black font-bold border-amber-500'
                          : 'bg-[#181b24] border-[#272d3b] text-neutral-400 hover:text-white'
                      }`}
                    >
                      30 FPS
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Video Format
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setFormat('webm')}
                      className={`py-1.5 px-2 rounded text-xs uppercase font-mono-numbers border text-center transition-all ${
                        format === 'webm'
                          ? 'bg-amber-500 text-black font-bold border-amber-500'
                          : 'bg-[#181b24] border-[#272d3b] text-neutral-400 hover:text-white'
                      }`}
                    >
                      WebM
                    </button>
                    <button
                      onClick={() => setFormat('mp4')}
                      className={`py-1.5 px-2 rounded text-xs uppercase font-mono-numbers border text-center transition-all ${
                        format === 'mp4'
                          ? 'bg-amber-500 text-black font-bold border-amber-500'
                          : 'bg-[#181b24] border-[#272d3b] text-neutral-400 hover:text-white'
                      }`}
                    >
                      MP4
                    </button>
                  </div>
                </div>
              </div>

              {/* Scene Summary */}
              <div className="p-3 rounded bg-[#11131a] border border-[#232732] text-xs text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>Scene Duration:</span>
                  <span className="font-mono-numbers text-neutral-200">{scene.duration} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Animation Frames:</span>
                  <span className="font-mono-numbers text-neutral-200">{scene.duration * fps} frames</span>
                </div>
                <div className="flex justify-between">
                  <span>Silhouette Layers:</span>
                  <span className="font-mono-numbers text-neutral-200">{scene.elements.length} elements</span>
                </div>
              </div>
            </>
          )}

          {/* Exporting Progress */}
          {isExporting && (
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <div className="text-center">
                <div className="text-sm font-semibold text-white">Rendering Shadow Theater Frames...</div>
                <div className="text-xs font-mono-numbers text-neutral-400 mt-1">
                  Frame {currentFrame} / {totalFrames} ({Math.round(progress * 100)}%)
                </div>
              </div>
              <div className="w-full bg-[#1e2330] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-150"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded bg-rose-950/40 border border-rose-800/50 flex items-start gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Completed State */}
          {exportedBlob && !isExporting && (
            <div className="py-4 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
              <div>
                <div className="text-base font-bold text-white">Animation Rendered Successfully!</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Size: {(exportedBlob.size / (1024 * 1024)).toFixed(2)} MB · {resolution} @ {fps}fps
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#232732] bg-[#11131a] flex items-center justify-end gap-2">
          {!exportedBlob ? (
            <>
              <button
                onClick={onClose}
                disabled={isExporting}
                className="px-4 py-2 rounded text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#202533] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-950/50"
              >
                <Video className="w-4 h-4" />
                <span>Start Video Render</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#202533] transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-950/50"
              >
                <Download className="w-4 h-4" />
                <span>Download Video File</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
