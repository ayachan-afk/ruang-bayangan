/**
 * Top Toolbar Component for Shadow Theater Studio
 * Brand wordmark, project management, templates dropdown, undo/redo, preview, export.
 */

import React, { useRef } from 'react';
import {
  Film,
  Download,
  FolderOpen,
  RotateCcw,
  RotateCw,
  Play,
  Video,
  Sparkles,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { TEMPLATE_SCENES } from '../engine/templateScenes';

interface TopToolbarProps {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  onLoadTemplate: (templateKey: string) => void;
  onNewProject: () => void;
  onSaveJson: () => void;
  onLoadJson: (jsonData: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenPreview: () => void;
  onOpenExport: () => void;
  onOpenStoryPackage: () => void;
  fps: 24 | 30;
  onChangeFps: (fps: 24 | 30) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  projectName,
  onUpdateProjectName,
  onLoadTemplate,
  onNewProject,
  onSaveJson,
  onLoadJson,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenPreview,
  onOpenExport,
  onOpenStoryPackage,
  fps,
  onChangeFps,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onLoadJson(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="h-14 bg-[#111318] border-b border-[#232732] flex items-center justify-between px-4 z-30 select-none">
      {/* Zone 1: Brand & Project Name */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-md shadow-amber-950/40">
            <Film className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-amber-400 font-serif-brand uppercase flex items-center gap-1.5 leading-none">
              Shadow Theater
            </h1>
            <span className="text-[10px] text-neutral-400 tracking-wide font-sans">
              Silhouette Animation Studio
            </span>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-[#2a2f3d]" />

        {/* Project Name Input */}
        <input
          type="text"
          value={projectName}
          onChange={(e) => onUpdateProjectName(e.target.value)}
          aria-label="Project Title"
          className="bg-[#181b22] hover:bg-[#1f2430] focus:bg-[#222736] text-xs text-neutral-200 font-medium px-2.5 py-1 rounded border border-transparent focus:border-amber-500/50 outline-none w-44 transition-colors"
          title="Click to rename project"
        />
      </div>

      {/* Zone 2: Templates & Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Template Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#181b22] border border-[#272d3b] rounded px-2 py-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
            Preset:
          </span>
          <select
            aria-label="Scene Template Presets"
            onChange={(e) => {
              if (e.target.value) {
                onLoadTemplate(e.target.value);
              }
            }}
            defaultValue=""
            className="bg-transparent text-xs text-amber-300 font-medium outline-none cursor-pointer pr-1"
          >
            <option value="" disabled className="bg-[#181b22] text-neutral-400">
              Select Scene Story...
            </option>
            <optgroup label="Paket Cerita: Desa yang Terlupakan (28s)" className="bg-[#141720] text-amber-400 font-bold">
              <option value="desa_act_1" className="bg-[#181b22] text-neutral-200">
                Bab 1: Hutan yang Tersisa (9s)
              </option>
              <option value="desa_act_2" className="bg-[#181b22] text-neutral-200">
                Bab 2: Desa di Balik Kabut (9s)
              </option>
              <option value="desa_act_3" className="bg-[#181b22] text-neutral-200">
                Bab 3: Pagi di Desa Sederhana (10s)
              </option>
            </optgroup>
            <optgroup label="Template Lainnya" className="bg-[#141720] text-neutral-400 font-bold">
              <option value="lonely_traveler" className="bg-[#181b22] text-neutral-200">
                1. The Lonely Traveler
              </option>
              <option value="ancient_village" className="bg-[#181b22] text-neutral-200">
                2. Ancient Village
              </option>
              <option value="mountain_journey" className="bg-[#181b22] text-neutral-200">
                3. The Mountain Journey
              </option>
              <option value="ancient_battle" className="bg-[#181b22] text-neutral-200">
                4. The Ancient Battle
              </option>
              <option value="mysterious_forest" className="bg-[#181b22] text-neutral-200">
                5. The Mysterious Forest
              </option>
              <option value="last_sunset" className="bg-[#181b22] text-neutral-200">
                6. The Last Sunset
              </option>
            </optgroup>
          </select>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-[#181b22] border border-[#272d3b] rounded p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className={`p-1.5 rounded transition-colors ${
              canUndo ? 'text-neutral-300 hover:text-white hover:bg-[#252b38]' : 'text-neutral-600 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            className={`p-1.5 rounded transition-colors ${
              canRedo ? 'text-neutral-300 hover:text-white hover:bg-[#252b38]' : 'text-neutral-600 cursor-not-allowed'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* FPS Switcher */}
        <div className="flex items-center bg-[#181b22] border border-[#272d3b] rounded p-0.5 text-[11px]">
          <button
            onClick={() => onChangeFps(24)}
            className={`px-2 py-0.5 rounded font-mono-numbers transition-colors ${
              fps === 24 ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
            title="24 FPS - Cinematic film cadence"
          >
            24 FPS
          </button>
          <button
            onClick={() => onChangeFps(30)}
            className={`px-2 py-0.5 rounded font-mono-numbers transition-colors ${
              fps === 30 ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
            title="30 FPS - Smooth playback"
          >
            30 FPS
          </button>
        </div>
      </div>

      {/* Zone 3: Primary Actions (New, Save, Open, Preview, Export) */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        <button
          onClick={onNewProject}
          title="New Blank Project"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#181b22] hover:bg-[#222736] text-neutral-300 text-xs font-medium border border-[#272d3b] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Open Project JSON"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#181b22] hover:bg-[#222736] text-neutral-300 text-xs font-medium border border-[#272d3b] transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Load</span>
        </button>

        <button
          onClick={onSaveJson}
          title="Save & Download Project JSON"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#181b22] hover:bg-[#222736] text-neutral-300 text-xs font-medium border border-[#272d3b] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>

        <button
          onClick={onOpenStoryPackage}
          title="Buka Paket Siap Export 28 Detik: Desa yang Terlupakan"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 text-xs font-bold border border-amber-500/50 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Paket Cerita 28s</span>
        </button>

        <button
          onClick={onOpenPreview}
          title="Fullscreen Theater Presentation"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#202533] hover:bg-[#293042] text-amber-300 hover:text-amber-200 text-xs font-semibold border border-amber-500/30 transition-colors shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Preview</span>
        </button>

        <button
          onClick={onOpenExport}
          title="Export Video (WebM / MP4)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-md shadow-amber-950/40"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
};
