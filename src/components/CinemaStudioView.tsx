/**
 * CinemaStudioView - Preview & Export Centric Shadow Theater
 * - Pure visual silhouette animation (no text inside the scene canvas)
 * - Script narration displayed cleanly alongside in the sidebar
 * - Continuous playback of the multi-act story (e.g. 28s)
 * - 1-Click Export of the full unified movie or individual act clips
 * - "Hapus Cerita" (Delete Story) button so exported stories can be cleared to save memory
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Video,
  Download,
  Sparkles,
  Maximize2,
  Clock,
  CheckCircle,
  Loader2,
  Trash2,
  Film,
  AlertTriangle,
} from 'lucide-react';
import { StoryPackage, StoryAct } from '../types';
import { renderStoryFrame, renderPortraitStoryFrame } from '../engine/renderer';
import { getActAtContentTime, getContentTime, getRenderDuration } from '../engine/episodeTiming';
import {
  exportStoryPackageToVideo,
  exportSceneToVideo,
  downloadVideoBlob,
} from '../engine/videoExporter';

interface CinemaStudioViewProps {
  story: StoryPackage | null;
  presetStories: StoryPackage[];
  onSelectPresetStory: (storyId: string) => void;
  onDeleteStory: (storyId: string) => void;
}

export const CinemaStudioView: React.FC<CinemaStudioViewProps> = ({
  story,
  presetStories,
  onSelectPresetStory,
  onDeleteStory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const [globalTime, setGlobalTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // No auto-play by default
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [fps, setFps] = useState<24 | 30>(24);
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [audioReady, setAudioReady] = useState(false);

  // Reset playback and playhead when story switches (never auto-play)
  useEffect(() => {
    setIsPlaying(false);
    setGlobalTime(0);
  }, [story?.id]);

  // Load audio as an in-memory Blob URL. This prevents download managers such
  // as IDM from intercepting the public MP3 URL as a file download.
  useEffect(() => {
    const audio = audioRef.current;
    const sourceUrl = story?.episode?.audioUrl;
    if (!audio || !sourceUrl) return;
    let cancelled = false;
    setAudioReady(false);
    audio.pause();
    audio.removeAttribute('src');
    audio.load();

    fetch(sourceUrl, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`Audio gagal dimuat (${response.status})`);
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        if (audioObjectUrlRef.current) URL.revokeObjectURL(audioObjectUrlRef.current);
        audioObjectUrlRef.current = objectUrl;
        audio.src = objectUrl;
        audio.load();
      })
      .catch(() => setAudioReady(false));

    return () => {
      cancelled = true;
      audio.pause();
      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
        audioObjectUrlRef.current = null;
      }
    };
  }, [story?.id, story?.episode?.audioUrl]);

  // Preview audio follows the content portion of the episode timeline.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !story?.episode?.audioUrl || !audioReady) return;
    const intro = story.episode.introDuration;
    const contentTime = getContentTime(story, globalTime);
    const inContent = globalTime >= intro && globalTime < intro + story.totalDuration;
    if (Math.abs(audio.currentTime - contentTime) > 0.15) {
      audio.currentTime = contentTime;
    }
    if (isPlaying && inContent) {
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }, [story, globalTime, isPlaying, audioReady]);

  // Procedural Spot SFX Trigger during Web Studio Preview
  const triggeredCuesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isPlaying) {
      triggeredCuesRef.current.clear();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || !story?.episode?.audioCues) return;
    const cues = story.episode.audioCues;
    cues.forEach((cue, idx) => {
      if (globalTime >= cue.time && globalTime <= cue.time + 0.35 && !triggeredCuesRef.current.has(idx)) {
        triggeredCuesRef.current.add(idx);
        const sfxAudio = new Audio(`/sfx/${cue.sfxType}.wav`);
        sfxAudio.volume = cue.volume ?? 0.3;
        sfxAudio.play().catch(() => undefined);
      }
    });
  }, [globalTime, isPlaying, story]);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Export states
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [isExportDrawerOpen, setIsExportDrawerOpen] = useState<boolean>(false);
  const [lastExportedFile, setLastExportedFile] = useState<string | null>(null);
  const [lastRenderJobId, setLastRenderJobId] = useState<string | null>(null);

  useEffect(() => {
    setLastRenderJobId(null);
    setLastExportedFile(null);
  }, [story?.id]);

  const totalDuration = story?.totalDuration || 0;
  const renderDuration = story ? getRenderDuration(story) : 0;
  const contentTime = story ? getContentTime(story, globalTime) : 0;

  // Determine active act and local time in that act
  let activeActIndex = 0;
  let currentAct: StoryAct | null = null;
  let localTime = 0;
  if (story && story.acts.length > 0) {
    const active = getActAtContentTime(story, contentTime);
    activeActIndex = active.index;
    currentAct = active.act;
    localTime = active.localTime;
  }

  // Animation Playback Loop
  useEffect(() => {
    if (!isPlaying || !story || totalDuration <= 0) return;
    let animId: number;
    let lastStamp = performance.now();

    const loop = (stamp: number) => {
      const dt = (stamp - lastStamp) / 1000;
      lastStamp = stamp;

      setGlobalTime((prev) => {
        const next = prev + dt;
        if (next >= renderDuration) {
          return isLooping ? 0 : renderDuration;
        }
        return next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, renderDuration, isLooping, story]);

  // Real-time Canvas Rendering Update (Lightweight Draft Preview, no canvas text)
  useEffect(() => {
    if (!story) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (story.episode?.orientation === 'portrait') {
      ctx.scale(540 / 1080, 960 / 1920);
      renderPortraitStoryFrame(ctx, story, globalTime);
    } else {
      // Keep the landscape preview buffer small; scene coordinates remain 1920x1080.
      ctx.scale(1280 / 1920, 720 / 1080);
      renderStoryFrame(ctx, story, globalTime, {
        showGizmos: false,
        isDraftPreview: true,
        showTitleCards: true,
      });
    }
    ctx.restore();
  }, [story, globalTime]);

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
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Jump to specific act
  const jumpToAct = (actIdx: number) => {
    if (!story) return;
    let t = 0;
    for (let i = 0; i < actIdx; i++) {
      t += story.acts[i].duration;
    }
    setGlobalTime((story.episode?.introDuration ?? 0) + t + 0.05);
  };

  // Step frame forward/back
  const stepFrame = (delta: number) => {
    if (!story) return;
    const nextTime = Math.max(0, Math.min(renderDuration, globalTime + delta / fps));
    setGlobalTime(nextTime);
  };

  // Format mm:ss.ms
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Export Full Unified Video
  const handleExportFullMovie = async () => {
    if (!story) return;
    setIsExporting(true);
    setExportProgress(0);
    setLastExportedFile(null);
    setLastRenderJobId(null);

    // Legacy presets without episode metadata keep the original browser export.
    if (!story.episode) {
      setExportStatusText(`Merender Film Penuh ${totalDuration} Detik (Semua Babak)...`);
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
        const filename = `${story.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${totalDuration}detik_${resolution}.${format}`;
        setIsExporting(false);
        setLastExportedFile(filename);
        downloadVideoBlob(blob, filename);
      } catch (err: any) {
        alert('Gagal mengeksport video: ' + (err?.message || 'Error'));
        setIsExporting(false);
      }
      return;
    }

    setExportStatusText(`Menyiapkan render offline Episode ${story.episode?.episodeNumber ?? 1}...`);

    try {
      const startResponse = await fetch('/api/render-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId: story.episode.episodeId ?? `episode-${String(story.episode.episodeNumber).padStart(3, '0')}`,
        }),
      });
      if (!startResponse.ok) throw new Error('Server render lokal tidak merespons.');
      const { jobId } = await startResponse.json();

      let finished = false;
      let renderedName = `episode-${String(story.episode?.episodeNumber ?? 1).padStart(3, '0')}.mp4`;
      while (!finished) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        const statusResponse = await fetch(`/api/render-status/${jobId}`);
        const status = await statusResponse.json();
        if (status.outputName) renderedName = status.outputName;
        setExportProgress(status.progress || 0);
        setExportStatusText(`Render offline: ${Math.round((status.progress || 0) * 100)}%`);
        if (status.status === 'error') throw new Error(status.error || 'Render offline gagal.');
        finished = status.status === 'done';
      }

      const episodeId = story.episode.episodeId ?? `episode-${String(story.episode.episodeNumber).padStart(3, '0')}`;
      setIsExporting(false);
      setLastRenderJobId(jobId);
      setLastExportedFile(`renders/${renderedName || `${episodeId}.mp4`}`);
    } catch (err: any) {
      alert('Gagal mengeksport video: ' + (err?.message || 'Error'));
      setIsExporting(false);
    }
  };

  const handleDownloadRenderedVideo = async () => {
    if (!lastRenderJobId) return;
    try {
      const response = await fetch(`/api/render-download/${lastRenderJobId}`);
      if (!response.ok) throw new Error('Hasil render tidak dapat diambil.');
      const blob = await response.blob();
      const filename = lastExportedFile?.replace(/^renders[\\/]/, '') || `${story?.episode?.episodeId ?? 'episode'}.mp4`;
      downloadVideoBlob(blob, filename);
    } catch (err: any) {
      alert('Gagal mengunduh video: ' + (err?.message || 'Error'));
    }
  };

  // Export Specific Act Clip
  const handleExportSingleAct = async (act: StoryAct) => {
    setIsExporting(true);
    setExportProgress(0);
    setLastExportedFile(null);
    setExportStatusText(`Merender Klip Bab ${act.actNumber}: ${act.title}...`);

    try {
      const blob = await exportSceneToVideo(act.scene, {
        resolution,
        fps,
        format,
        onProgress: (p) => {
          setExportProgress(p);
        },
      });

      const filename = `bab_${act.actNumber}_${act.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${act.duration}s.${format}`;
      setIsExporting(false);
      setLastExportedFile(filename);
      downloadVideoBlob(blob, filename);
    } catch (err: any) {
      alert('Gagal mengeksport klip bab: ' + (err?.message || 'Error'));
      setIsExporting(false);
    }
  };

  // Download Project Package JSON
  const handleDownloadJson = () => {
    if (!story) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(story, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${story.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Toggle Browser Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Confirm delete current story
  const confirmDeleteStory = () => {
    if (story) {
      onDeleteStory(story.id);
      setIsDeleteModalOpen(false);
      setGlobalTime(0);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0b0e] text-neutral-100 select-none overflow-hidden font-sans">
      {/* 1. TOP CINEMA HEADER */}
      <header className="h-14 bg-[#101218] border-b border-[#212532] px-6 flex items-center justify-between z-30 shrink-0">
        {/* Brand & Story Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-md shadow-amber-950/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-amber-400 font-serif-brand uppercase leading-none">
                Shadow Theater Studio
              </h1>
              <span className="text-[10px] text-neutral-400 tracking-wide font-sans">
                Pure Silhouette Animation & Screening Studio
              </span>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-[#2a2f3d]" />

          {/* Story Selector Dropdown */}
          {presetStories.length > 0 && story && (
            <div className="flex items-center gap-2 bg-[#171a24] border border-[#272d3d] rounded-lg px-3 py-1.5">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Pilih Cerita:</span>
              <select
                aria-label="Pilih Cerita"
                value={story.id}
                onChange={(e) => onSelectPresetStory(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-300 outline-none cursor-pointer pr-1 max-w-[260px] truncate"
              >
                {presetStories.map((pkg) => (
                  <option key={pkg.id} value={pkg.id} className="bg-[#171a24] text-neutral-200">
                    {pkg.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Delete Story Button */}
          {story && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-800/40 transition-colors"
              title="Hapus cerita yang sudah diekspor agar tidak memberatkan memori"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Hapus Cerita</span>
            </button>
          )}
        </div>

        {/* Right Tools: Framerate, Fullscreen, JSON & Primary Export */}
        <div className="flex items-center gap-3">
          {story && (
            <>
              {/* FPS toggle */}
              <div className="flex items-center bg-[#171a24] border border-[#272d3d] rounded p-0.5 text-[11px]">
                <button
                  onClick={() => setFps(24)}
                  className={`px-2 py-0.5 rounded font-mono-numbers transition-colors ${
                    fps === 24 ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="24 FPS - Cinematic film look"
                >
                  24 FPS
                </button>
                <button
                  onClick={() => setFps(30)}
                  className={`px-2 py-0.5 rounded font-mono-numbers transition-colors ${
                    fps === 30 ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="30 FPS - Smooth motion"
                >
                  30 FPS
                </button>
              </div>

              {/* Fullscreen cinema */}
              <button
                onClick={handleToggleFullscreen}
                title="Layar Penuh"
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#202534] transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Download JSON package */}
              <button
                onClick={handleDownloadJson}
                title="Unduh Paket Proyek JSON"
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#202534] transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Direct Video Export Button */}
              <button
                onClick={() => setIsExportDrawerOpen(!isExportDrawerOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-md shadow-amber-950/40"
              >
                <Video className="w-4 h-4" />
                <span>Eksport Video ({totalDuration}s)</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* 2. MAIN THEATER WORKSPACE */}
      {story && currentAct ? (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar: Script Narration & Scene Acts */}
          <aside className="w-84 bg-[#10131a] border-r border-[#202432] flex flex-col justify-between shrink-0 z-20 overflow-y-auto">
            {/* Story Overview */}
            <div className="p-4 border-b border-[#202432] bg-[#0c0e14]">
              <span className="text-[10px] text-amber-500 uppercase font-mono font-bold tracking-wider block mb-1">
                Naskah Cerita Aktif
              </span>
              <h2 className="text-sm font-bold text-white font-serif-brand">
                {story.title}
              </h2>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                {story.description}
              </p>
            </div>

            {/* Acts List with Narration Text */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {story.acts.map((act, idx) => {
                const isActive = activeActIndex === idx;
                return (
                  <div
                    key={act.id}
                    onClick={() => jumpToAct(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-lg text-white'
                        : 'bg-[#151822] border-[#222736] hover:bg-[#1a1e2b] text-neutral-300'
                    }`}
                  >
                    {/* Act Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold font-serif-brand text-amber-400">
                        {act.title}
                      </span>
                      <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-[#0b0d13] text-neutral-400 border border-[#202430]">
                        {act.duration}s
                      </span>
                    </div>

                    {/* Pure Narration Script Text */}
                    <p className="text-xs text-neutral-200 leading-relaxed italic">
                      "{act.narration}"
                    </p>

                    {/* Act Footer: Quick Export Act Clip */}
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-[10px] text-neutral-400">
                        {act.scene.elements.length} Elemen Siluet
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportSingleAct(act);
                        }}
                        disabled={isExporting}
                        className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 text-[10px]"
                        title={`Eksport klip video khusus ${act.title}`}
                      >
                        <Download className="w-3 h-3" />
                        <span>Eksport Klip Bab</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar Footer Stats & Delete Trigger */}
            <div className="p-3 bg-[#0c0e14] border-t border-[#202432] space-y-2">
              <div className="text-xs text-neutral-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Total Durasi:</span>
                </div>
                <span className="font-mono-numbers font-bold text-amber-300">
                  {renderDuration.toFixed(0)} Detik ({Math.floor(renderDuration * fps)} frames)
                </span>
              </div>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-950/25 hover:bg-rose-950/50 text-rose-400 text-xs font-semibold border border-rose-900/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Cerita Ini</span>
              </button>
            </div>
          </aside>

          {/* Center: Majestic 16:9 Cinema Viewport */}
          <main className="flex-1 bg-[#06070a] flex flex-col justify-between p-6 overflow-hidden">
            {/* 16:9 Canvas Stage */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className={`relative w-full ${story?.episode?.orientation === 'portrait' ? 'max-w-md aspect-[9/16]' : 'max-w-5xl aspect-video'} rounded-xl overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.08)] border border-[#2a221e] bg-black group`}>
                {/* Lightweight Canvas Rendering (No Text Inside, 1280x720 Draft Buffer) */}
                <canvas
                  ref={canvasRef}
                  width={story?.episode?.orientation === 'portrait' ? 540 : 1280}
                  height={story?.episode?.orientation === 'portrait' ? 960 : 720}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setIsPlaying(!isPlaying)}
                />
                {story.episode?.audioUrl && (
                  <audio
                    className="hidden"
                    ref={audioRef}
                    preload="auto"
                    onLoadedMetadata={() => setAudioReady(true)}
                  />
                )}

                {/* Floating Active Bab Indicator in Theater Corner */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-serif-brand text-amber-400 border border-amber-500/30 flex items-center gap-2 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{currentAct.title}</span>
                </div>

                {/* Floating Draft Indicator (User Assurance) */}
                <div
                  className="absolute top-4 right-4 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium text-amber-300 border border-amber-500/25 flex items-center gap-1.5 shadow-md pointer-events-none"
                  title="Pratinjau dioptimalkan agar ringan & hemat CPU. Hasil ekspor video tetap 1080p Full HD kualitas maksimal."
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Pratinjau Ringan (Ekspor 1080p Penuh)</span>
                </div>

                {/* Play Overlay Button When Paused */}
                {!isPlaying && (
                  <div
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px] cursor-pointer transition-all hover:bg-black/20"
                    title="Klik untuk memutar animasi (atau tekan Spasi)"
                  >
                    <div className="w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 hover:scale-105 text-black flex items-center justify-center shadow-2xl shadow-amber-950/80 transition-all duration-150">
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Cinema Scrub Bar & Playback Controls */}
            <div className="mt-4 w-full max-w-5xl mx-auto bg-[#12151e]/90 backdrop-blur-lg border border-[#222736] rounded-xl p-3 flex flex-col gap-2.5 shadow-2xl">
              {/* Act Timeline Segments on Scrubber */}
              <div className="relative w-full">
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  step="0.05"
                  value={globalTime}
                  onChange={(e) => setGlobalTime(Number(e.target.value))}
                  className="w-full cursor-pointer accent-amber-500 relative z-10"
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between">
                {/* Left Playback Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGlobalTime(0)}
                    title="Mulai Dari Awal"
                    className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#1f2434] transition-colors"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => stepFrame(-1)}
                    title="Mundur 1 Frame"
                    className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#1f2434] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    title={isPlaying ? 'Pause (Spasi)' : 'Putar (Spasi)'}
                    className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-bold transition-transform active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={() => stepFrame(1)}
                    title="Maju 1 Frame"
                    className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#1f2434] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    title={isLooping ? 'Loop: Aktif' : 'Loop: Nonaktif'}
                    className={`p-1.5 rounded transition-colors ${
                      isLooping ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>

                {/* Center Timecode */}
                <div className="flex items-center gap-2 bg-[#090b10] px-3 py-1 rounded-lg border border-[#202430]">
                  <span className="text-xs font-mono-numbers font-bold text-amber-400">
                    {formatTime(globalTime)}
                  </span>
                  <span className="text-neutral-600">/</span>
                  <span className="text-xs font-mono-numbers text-neutral-400">
                    {formatTime(renderDuration)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono-numbers ml-2">
                    (Frame {Math.floor(globalTime * fps)})
                  </span>
                </div>

                {/* Right Quick Export Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={lastRenderJobId ? handleDownloadRenderedVideo : handleExportFullMovie}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lastRenderJobId ? `Download Video (${totalDuration}s)` : 'Render Film Penuh'}</span>
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* 3. EXPORT STUDIO DRAWER (Slide in from right) */}
          {isExportDrawerOpen && (
            <div className="w-96 bg-[#11141d] border-l border-[#242938] flex flex-col justify-between p-5 z-30 shrink-0 shadow-2xl animate-in slide-in-from-right duration-200">
              <div className="space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Studio Eksport Video
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsExportDrawerOpen(false)}
                    className="p-1 text-neutral-400 hover:text-white rounded"
                  >
                    ✕
                  </button>
                </div>

                {/* Settings */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Kualitas Resolusi
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setResolution('1080p')}
                        className={`p-2 rounded text-xs text-left border ${
                          resolution === '1080p'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                            : 'bg-[#181b24] border-[#252a3a] text-neutral-400'
                        }`}
                      >
                        <div>1080p Full HD</div>
                        <div className="text-[10px] text-neutral-500">1920 × 1080</div>
                      </button>
                      <button
                        onClick={() => setResolution('720p')}
                        className={`p-2 rounded text-xs text-left border ${
                          resolution === '720p'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                            : 'bg-[#181b24] border-[#252a3a] text-neutral-400'
                        }`}
                      >
                        <div>720p HD</div>
                        <div className="text-[10px] text-neutral-500">1280 × 720</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Format Video
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFormat('webm')}
                        className={`py-1.5 px-3 rounded text-xs text-center border font-mono ${
                          format === 'webm'
                            ? 'bg-amber-500 text-black font-bold border-amber-500'
                            : 'bg-[#181b24] border-[#252a3a] text-neutral-400'
                        }`}
                      >
                        WebM (VP9)
                      </button>
                      <button
                        onClick={() => setFormat('mp4')}
                        className={`py-1.5 px-3 rounded text-xs text-center border font-mono ${
                          format === 'mp4'
                            ? 'bg-amber-500 text-black font-bold border-amber-500'
                            : 'bg-[#181b24] border-[#252a3a] text-neutral-400'
                        }`}
                      >
                        MP4 (H.264)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar when exporting */}
                {isExporting && (
                  <div className="p-3 rounded-lg bg-[#181b24] border border-amber-500/50 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span className="truncate">{exportStatusText}</span>
                    </div>
                    <div className="w-full bg-[#0d0f14] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-150"
                        style={{ width: `${exportProgress * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Completed Notice */}
                {lastExportedFile && !isExporting && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">Tersimpan: {lastExportedFile}</span>
                  </div>
                )}

                {/* Export Triggers */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleExportFullMovie}
                    disabled={isExporting}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-md shadow-amber-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Video className="w-4 h-4" />
                    <span>Eksport Film Penuh ({totalDuration}s)</span>
                  </button>

                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider pt-2">
                    Eksport Klip Babak Tertentu:
                  </div>

                  {story.acts.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => handleExportSingleAct(act)}
                      disabled={isExporting}
                      className="w-full py-2 px-3 rounded-lg bg-[#181b25] hover:bg-[#202534] text-neutral-200 text-xs font-medium border border-[#272d3e] flex items-center justify-between transition-colors disabled:opacity-50"
                    >
                      <span>{act.title}</span>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">
                        {act.duration}s
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#242938] text-[10px] text-neutral-500 text-center">
                Murni animasi visual tanpa takarir teks di dalam video.
              </div>
            </div>
          )}
        </div>
      ) : (
        /* EMPTY STATE: WHEN ALL STORIES ARE DELETED */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#06070a]">
          <div className="w-16 h-16 rounded-2xl bg-[#141824] border border-[#262c3c] flex items-center justify-center mb-4 text-amber-400 shadow-xl">
            <Film className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white font-serif-brand mb-1">
            Belum Ada Cerita Aktif
          </h2>
          <p className="text-xs text-neutral-400 max-w-md leading-relaxed mb-6">
            Cerita sebelumnya telah dihapus untuk menghemat memori. Kirimkan naskah baru kapan saja di chat ini, dan saya akan langsung membuatkan animasi shadow theater yang baru untukmu!
          </p>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && story && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-[#141722] border border-[#2c3346] rounded-xl w-full max-w-md p-5 shadow-2xl text-neutral-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Hapus Cerita Ini?</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  "{story.title}" akan dihapus dari daftar studio agar tidak memberatkan memori.
                </p>
              </div>
            </div>

            <div className="p-3 rounded bg-[#0d0f17] border border-[#222736] text-[11px] text-neutral-400">
              Pastikan kamu sudah mengeksport video ceritamu jika masih ingin menyimpannya di komputermu.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#202534] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteStory}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Cerita</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
