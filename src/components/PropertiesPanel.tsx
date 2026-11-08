/**
 * Right Sidebar - Properties Panel Component
 * Multi-tab inspector for Element transform & character kinematics,
 * Background depth, Backlighting parameters, and Atmospheric effects.
 */

import React, { useState } from 'react';
import {
  Sliders,
  Sun,
  Image as ImageIcon,
  Wind,
  Layers,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  FlipHorizontal,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  SceneProject,
  SceneElement,
  CharacterPose,
  BackgroundTheme,
  LightingPreset,
  ParticleType,
} from '../types';
import { BACKGROUND_PRESETS, LIGHTING_PRESETS } from '../engine/assetLibrary';

interface PropertiesPanelProps {
  scene: SceneProject;
  selectedElementId: string | null;
  onUpdateElement: (id: string, updates: Partial<SceneElement>) => void;
  onDeleteElement: (id: string) => void;
  onUpdateBackground: (updates: Partial<SceneProject['background']>) => void;
  onUpdateLighting: (updates: Partial<SceneProject['lighting']>) => void;
  onUpdateAtmosphere: (updates: Partial<SceneProject['atmosphere']>) => void;
  onReorderElement: (id: string, direction: 'up' | 'down') => void;
}

type TabType = 'element' | 'background' | 'lighting' | 'atmosphere';

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  scene,
  selectedElementId,
  onUpdateElement,
  onDeleteElement,
  onUpdateBackground,
  onUpdateLighting,
  onUpdateAtmosphere,
  onReorderElement,
}) => {
  const selectedElement = scene.elements.find((el) => el.id === selectedElementId);
  const [activeTab, setActiveTab] = useState<TabType>(selectedElement ? 'element' : 'lighting');

  // Switch to element tab automatically when an element gets selected
  React.useEffect(() => {
    if (selectedElement) {
      setActiveTab('element');
    }
  }, [selectedElementId]);

  return (
    <aside className="w-80 bg-[#12141a] border-l border-[#222632] flex flex-col h-full select-none shrink-0 z-20">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#222632] bg-[#0e1015]">
        <button
          onClick={() => setActiveTab('element')}
          disabled={!selectedElement}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'element'
              ? 'text-amber-400 border-amber-500 bg-[#151922]'
              : selectedElement
              ? 'text-neutral-400 hover:text-neutral-200 border-transparent'
              : 'text-neutral-600 border-transparent cursor-not-allowed'
          }`}
          title={selectedElement ? selectedElement.name : 'Select an element on canvas'}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Object</span>
        </button>

        <button
          onClick={() => setActiveTab('lighting')}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'lighting'
              ? 'text-amber-400 border-amber-500 bg-[#151922]'
              : 'text-neutral-400 hover:text-neutral-200 border-transparent'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Lighting</span>
        </button>

        <button
          onClick={() => setActiveTab('background')}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'background'
              ? 'text-amber-400 border-amber-500 bg-[#151922]'
              : 'text-neutral-400 hover:text-neutral-200 border-transparent'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Backdrop</span>
        </button>

        <button
          onClick={() => setActiveTab('atmosphere')}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'atmosphere'
              ? 'text-amber-400 border-amber-500 bg-[#151922]'
              : 'text-neutral-400 hover:text-neutral-200 border-transparent'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Atmo</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ================================================================= */}
        {/* TAB 1: ELEMENT PROPERTIES */}
        {/* ================================================================= */}
        {activeTab === 'element' && selectedElement && (
          <div className="space-y-4">
            {/* Header / Name & Layer Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-[#232732]">
              <div className="truncate pr-2">
                <span className="text-[10px] text-amber-500 uppercase font-mono tracking-wider font-semibold block">
                  {selectedElement.type}
                </span>
                <input
                  type="text"
                  value={selectedElement.name}
                  onChange={(e) => onUpdateElement(selectedElement.id, { name: e.target.value })}
                  className="bg-transparent text-sm font-bold text-white outline-none border-b border-transparent focus:border-amber-500 w-full"
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onReorderElement(selectedElement.id, 'up')}
                  title="Bring Forward"
                  aria-label="Bring Forward"
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#1f2430]"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onReorderElement(selectedElement.id, 'down')}
                  title="Send Backward"
                  aria-label="Send Backward"
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#1f2430]"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onUpdateElement(selectedElement.id, { locked: !selectedElement.locked })}
                  title={selectedElement.locked ? 'Unlock element' : 'Lock element'}
                  aria-label={selectedElement.locked ? 'Unlock element' : 'Lock element'}
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#1f2430]"
                >
                  {selectedElement.locked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onUpdateElement(selectedElement.id, { visible: !selectedElement.visible })}
                  title="Toggle Visibility"
                  aria-label="Toggle Visibility"
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#1f2430]"
                >
                  {selectedElement.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-neutral-600" />}
                </button>
                <button
                  onClick={() => onDeleteElement(selectedElement.id)}
                  title="Delete element"
                  aria-label="Delete element"
                  className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Transform Properties */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Transform & Placement
              </span>

              {/* Position X & Y */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">X Position</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => onUpdateElement(selectedElement.id, { x: Number(e.target.value) })}
                    className="w-full bg-[#181b24] text-xs font-mono-numbers text-white px-2 py-1.5 rounded border border-[#262c3a] focus:border-amber-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Y Position</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => onUpdateElement(selectedElement.id, { y: Number(e.target.value) })}
                    className="w-full bg-[#181b24] text-xs font-mono-numbers text-white px-2 py-1.5 rounded border border-[#262c3a] focus:border-amber-500/50 outline-none"
                  />
                </div>
              </div>

              {/* Scale & Flip */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-neutral-400">Scale ({Math.abs(selectedElement.scaleX).toFixed(2)}x)</label>
                  <button
                    onClick={() => onUpdateElement(selectedElement.id, { scaleX: -selectedElement.scaleX })}
                    className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-medium"
                    title="Flip horizontally"
                  >
                    <FlipHorizontal className="w-3 h-3" />
                    <span>Flip Facing</span>
                  </button>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.05"
                  value={Math.abs(selectedElement.scaleX)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const sign = selectedElement.scaleX >= 0 ? 1 : -1;
                    onUpdateElement(selectedElement.id, { scaleX: val * sign, scaleY: val });
                  }}
                  className="w-full cursor-pointer"
                />
              </div>

              {/* Rotation */}
              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>Rotation</span>
                  <span className="font-mono-numbers">{Math.round(selectedElement.rotation)}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={Math.round(selectedElement.rotation)}
                  onChange={(e) => onUpdateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Silhouette & Shadow Softness */}
            <div className="space-y-3 pt-2 border-t border-[#232732]">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Shadow Theater Quality
              </span>

              {/* Opacity */}
              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>Silhouette Density (Opacity)</span>
                  <span className="font-mono-numbers">{Math.round(selectedElement.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={selectedElement.opacity}
                  onChange={(e) => onUpdateElement(selectedElement.id, { opacity: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>

              {/* Blur / Kelir Contact Softness */}
              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>Contact Softness (Kelir Proximity)</span>
                  <span className="font-mono-numbers">{selectedElement.blur.toFixed(1)} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={selectedElement.blur}
                  onChange={(e) => onUpdateElement(selectedElement.id, { blur: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Character Kinematics & Rigging (If Character) */}
            {selectedElement.type === 'character' && (
              <div className="space-y-3 pt-2 border-t border-[#232732]">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Articulated Movement Preset
                </span>

                {/* Preset Pose Selector */}
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Active Movement Pose</label>
                  <select
                    value={selectedElement.pose || 'idle'}
                    onChange={(e) => onUpdateElement(selectedElement.id, { pose: e.target.value as CharacterPose })}
                    className="w-full bg-[#181b24] text-xs font-semibold text-amber-300 px-2.5 py-1.5 rounded border border-[#262c3a] outline-none"
                  >
                    <option value="idle">Idle (Natural Breathing)</option>
                    <option value="walking">Walking (Full Stride)</option>
                    <option value="running">Running (Dynamic Sprint)</option>
                    <option value="standing">Standing (Firm Posture)</option>
                    <option value="looking_around">Looking Around (Scanning Horizon)</option>
                    <option value="raising_hands">Raising Hands (Praying / Awestruck)</option>
                    <option value="pointing">Pointing (Directing Forward)</option>
                    <option value="kneeling">Kneeling (Reverent Stance)</option>
                    <option value="falling">Falling (Dramatic Stumble)</option>
                    <option value="fighting">Fighting (Combat Thrust)</option>
                  </select>
                </div>

                {/* Movement Speed / Cycle Rate */}
                <div>
                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                    <span>Motion Speed Multiplier</span>
                    <span className="font-mono-numbers">{(selectedElement.poseSpeed ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="2.5"
                    step="0.1"
                    value={selectedElement.poseSpeed ?? 1.0}
                    onChange={(e) => onUpdateElement(selectedElement.id, { poseSpeed: Number(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: LIGHTING ENGINE */}
        {/* ================================================================= */}
        {activeTab === 'lighting' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Cinematic Lighting Preset
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(LIGHTING_PRESETS) as LightingPreset[]).map((presetKey) => {
                  const isActive = scene.lighting.preset === presetKey;
                  return (
                    <button
                      key={presetKey}
                      onClick={() => onUpdateLighting(LIGHTING_PRESETS[presetKey])}
                      className={`text-xs px-2 py-1.5 rounded text-left capitalize transition-all border ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold'
                          : 'bg-[#181b24] text-neutral-300 border-[#262c3a] hover:bg-[#202533]'
                      }`}
                    >
                      {presetKey.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Light Coordinates */}
            <div className="space-y-3 pt-2 border-t border-[#232732]">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Backlight Source Placement
              </span>
              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>Horizontal Position (X)</span>
                  <span className="font-mono-numbers">{Math.round(scene.lighting.x)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={scene.lighting.x}
                  onChange={(e) => onUpdateLighting({ x: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>Vertical Position (Y)</span>
                  <span className="font-mono-numbers">{Math.round(scene.lighting.y)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  value={scene.lighting.y}
                  onChange={(e) => onUpdateLighting({ y: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Light Color & Glow */}
            <div className="space-y-3 pt-2 border-t border-[#232732]">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Intensity & Color Grading
              </span>

              <div className="flex items-center justify-between">
                <label className="text-[10px] text-neutral-400">Light Tint Hex</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={scene.lighting.color}
                    onChange={(e) => onUpdateLighting({ color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono-numbers text-neutral-300 uppercase">
                    {scene.lighting.color}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>Illumination Intensity</span>
                  <span className="font-mono-numbers">{scene.lighting.intensity.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={scene.lighting.intensity}
                  onChange={(e) => onUpdateLighting({ intensity: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>Volumetric God-Ray Strength</span>
                  <span className="font-mono-numbers">{Math.round(scene.lighting.volumetric * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={scene.lighting.volumetric}
                  onChange={(e) => onUpdateLighting({ volumetric: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-neutral-300 font-medium">Torch Light Flutter</span>
                <input
                  type="checkbox"
                  checked={scene.lighting.flicker}
                  onChange={(e) => onUpdateLighting({ flicker: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: BACKDROP & PARALLAX */}
        {/* ================================================================= */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Backdrop Theme
              </span>
              <select
                value={scene.background.theme}
                onChange={(e) => {
                  const theme = e.target.value as BackgroundTheme;
                  onUpdateBackground(BACKGROUND_PRESETS[theme]);
                }}
                className="w-full bg-[#181b24] text-xs font-semibold text-white px-2.5 py-1.5 rounded border border-[#262c3a] outline-none capitalize"
              >
                {(Object.keys(BACKGROUND_PRESETS) as BackgroundTheme[]).map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#232732]">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Atmospheric Fog & Depth
              </span>

              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>Atmospheric Fog Density</span>
                  <span className="font-mono-numbers">{Math.round(scene.background.atmosphericFog)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={scene.background.atmosphericFog}
                  onChange={(e) => onUpdateBackground({ atmosphericFog: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>Color Temperature</span>
                  <span className="font-mono-numbers">{scene.background.temperature > 0 ? `+${scene.background.temperature}` : scene.background.temperature}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={scene.background.temperature}
                  onChange={(e) => onUpdateBackground({ temperature: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>Sky Brightness</span>
                  <span className="font-mono-numbers">{Math.round(scene.background.brightness)}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="160"
                  value={scene.background.brightness}
                  onChange={(e) => onUpdateBackground({ brightness: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: ATMOSPHERE & PARTICLES */}
        {/* ================================================================= */}
        {activeTab === 'atmosphere' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Airborne Particle Type
              </span>
              <div className="space-y-1.5">
                {(
                  [
                    { type: 'dust', label: 'Dust Motes (Backlit)' },
                    { type: 'embers', label: 'Fire Embers (Fiery Sparks)' },
                    { type: 'leaves', label: 'Wind Leaves (Falling)' },
                    { type: 'rain', label: 'Rain Streaks (Night)' },
                    { type: 'none', label: 'None' },
                  ] as { type: ParticleType; label: string }[]
                ).map((p) => (
                  <button
                    key={p.type}
                    onClick={() =>
                      onUpdateAtmosphere({
                        particles: {
                          ...scene.atmosphere.particles,
                          type: p.type,
                        },
                      })
                    }
                    className={`w-full text-xs px-2.5 py-1.5 rounded text-left transition-all border ${
                      scene.atmosphere.particles.type === p.type
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold'
                        : 'bg-[#181b24] text-neutral-300 border-[#262c3a] hover:bg-[#202533]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {scene.atmosphere.particles.type !== 'none' && (
              <div className="space-y-3 pt-2 border-t border-[#232732]">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Particle Density & Wind
                </span>

                <div>
                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                    <span>Particle Count</span>
                    <span className="font-mono-numbers">{scene.atmosphere.particles.count}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={scene.atmosphere.particles.count}
                    onChange={(e) =>
                      onUpdateAtmosphere({
                        particles: {
                          ...scene.atmosphere.particles,
                          count: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                    <span>Wind Drift Speed</span>
                    <span className="font-mono-numbers">{scene.atmosphere.particles.speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="3.0"
                    step="0.1"
                    value={scene.atmosphere.particles.speed}
                    onChange={(e) =>
                      onUpdateAtmosphere({
                        particles: {
                          ...scene.atmosphere.particles,
                          speed: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Kelir Screen Weave Texture Toggle */}
            <div className="pt-2 border-t border-[#232732]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-200 font-semibold block">Kelir Screen Texture</span>
                  <span className="text-[10px] text-neutral-400 block">Linen cloth grain & vignette</span>
                </div>
                <input
                  type="checkbox"
                  checked={scene.atmosphere.screenTexture}
                  onChange={(e) => onUpdateAtmosphere({ screenTexture: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
