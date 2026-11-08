/**
 * Left Sidebar - Asset Library Component
 * Displays searchable categories of Characters, Animals, Nature, Buildings, Props,
 * Backgrounds, Lighting, and Atmospheric Effects with visual SVG thumbnails.
 */

import React, { useState } from 'react';
import {
  Users,
  Compass,
  TreePine,
  Landmark,
  Shield,
  Sun,
  CloudRain,
  Image as ImageIcon,
  Search,
  Plus,
  Sparkles,
} from 'lucide-react';
import { ASSET_LIBRARY, BACKGROUND_PRESETS, LIGHTING_PRESETS } from '../engine/assetLibrary';
import { AssetDefinition, BackgroundTheme, LightingPreset, ParticleType } from '../types';

interface AssetLibraryProps {
  onAddElement: (asset: AssetDefinition, dropX?: number, dropY?: number) => void;
  onApplyBackground: (theme: BackgroundTheme) => void;
  onApplyLighting: (preset: LightingPreset) => void;
  onApplyParticles: (type: ParticleType) => void;
}

type CategoryTab =
  | 'characters'
  | 'animals'
  | 'nature'
  | 'buildings'
  | 'props'
  | 'backgrounds'
  | 'lighting'
  | 'atmosphere';

export const AssetLibrary: React.FC<AssetLibraryProps> = ({
  onAddElement,
  onApplyBackground,
  onApplyLighting,
  onApplyParticles,
}) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('characters');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'animals', label: 'Animals', icon: Compass },
    { id: 'nature', label: 'Nature', icon: TreePine },
    { id: 'buildings', label: 'Buildings', icon: Landmark },
    { id: 'props', label: 'Props', icon: Shield },
    { id: 'backgrounds', label: 'Backdrops', icon: ImageIcon },
    { id: 'lighting', label: 'Lighting', icon: Sun },
    { id: 'atmosphere', label: 'Atmosphere', icon: CloudRain },
  ];

  // Filter elements by active category and search
  const filteredAssets = ASSET_LIBRARY.filter((item) => {
    if (item.category !== activeTab) return false;
    if (!searchQuery.trim()) return true;
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <aside className="w-72 bg-[#12141a] border-r border-[#222632] flex flex-col h-full select-none shrink-0 z-20">
      {/* Search Input */}
      <div className="p-3 border-b border-[#222632]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search shadow assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181b24] text-xs text-neutral-200 placeholder-neutral-500 rounded pl-8 pr-3 py-1.5 border border-[#272d3b] focus:border-amber-500/50 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#0e1015] border-b border-[#222632]">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as CategoryTab)}
              className={`flex flex-col items-center justify-center p-1.5 rounded transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181b22] border border-transparent'
              }`}
              title={cat.label}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] leading-none truncate max-w-full">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {activeTab === 'backgrounds' && (
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(BACKGROUND_PRESETS) as BackgroundTheme[]).map((theme) => {
              const bg = BACKGROUND_PRESETS[theme];
              return (
                <button
                  key={theme}
                  onClick={() => onApplyBackground(theme)}
                  className="group relative rounded-lg overflow-hidden border border-[#262c3a] hover:border-amber-500/60 p-2 text-left bg-[#161922] transition-all hover:shadow-lg flex flex-col justify-between h-24"
                >
                  <div
                    className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
                    style={{
                      background: `linear-gradient(to bottom, ${bg.skyGradient.top}, ${bg.skyGradient.bottom})`,
                    }}
                  />
                  <div className="relative z-10">
                    <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 block capitalize">
                      {theme.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      Fog {bg.atmosphericFog}%
                    </span>
                  </div>
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-amber-400 font-mono-numbers">
                      Apply Sky
                    </span>
                    <Sparkles className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'lighting' && (
          <div className="space-y-2">
            {(Object.keys(LIGHTING_PRESETS) as LightingPreset[]).map((presetKey) => {
              const light = LIGHTING_PRESETS[presetKey];
              return (
                <button
                  key={presetKey}
                  onClick={() => onApplyLighting(presetKey)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#161922] border border-[#262c3a] hover:border-amber-500/60 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center shrink-0 border border-white/20"
                      style={{ backgroundColor: light.color }}
                    >
                      <Sun className="w-4 h-4 text-black/75" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 block capitalize">
                        {presetKey.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Intensity {light.intensity}x · Rays {Math.round(light.volumetric * 100)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    Set
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'atmosphere' && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Atmospheric Particles
            </div>
            {(
              [
                { type: 'dust', label: 'Floating Dust Motes', desc: 'Warm illuminated air particles' },
                { type: 'embers', label: 'Fire Embers & Sparks', desc: 'Rising golden heat sparks' },
                { type: 'leaves', label: 'Falling Silhouette Leaves', desc: 'Tumbling autumn foliage' },
                { type: 'rain', label: 'Slanted Night Rain', desc: 'Silvery rain streaks' },
                { type: 'none', label: 'Clear Atmosphere', desc: 'No floating particles' },
              ] as { type: ParticleType; label: string; desc: string }[]
            ).map((item) => (
              <button
                key={item.type}
                onClick={() => onApplyParticles(item.type)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#161922] border border-[#262c3a] hover:border-amber-500/60 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 block">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-neutral-400">{item.desc}</span>
                </div>
                <CloudRain className="w-3.5 h-3.5 text-amber-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {/* Characters, Animals, Nature, Buildings, Props */}
        {activeTab !== 'backgrounds' && activeTab !== 'lighting' && activeTab !== 'atmosphere' && (
          <div className="grid grid-cols-2 gap-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify(asset));
                }}
                className="bg-[#161922] border border-[#262c3a] hover:border-amber-500/60 rounded-lg p-2.5 flex flex-col justify-between group cursor-grab active:cursor-grabbing transition-all hover:shadow-lg"
              >
                {/* SVG Silhouette Thumbnail */}
                <div className="h-20 w-full rounded bg-gradient-to-b from-[#241a18] to-[#603518] flex items-center justify-center p-2 text-black shadow-inner overflow-hidden mb-2 relative">
                  <svg
                    viewBox="0 0 48 48"
                    className="w-12 h-12 text-[#080608] fill-current drop-shadow-md"
                    dangerouslySetInnerHTML={{ __html: asset.thumbnailSvg }}
                  />
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] bg-black/70 text-amber-300 px-1 rounded">
                      Drag
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 truncate">
                    {asset.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5 leading-tight">
                    {asset.description}
                  </p>
                </div>

                <button
                  onClick={() => onAddElement(asset)}
                  className="mt-2.5 w-full flex items-center justify-center gap-1 py-1 rounded bg-[#202533] hover:bg-amber-500 text-neutral-300 hover:text-black text-[11px] font-semibold transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add to Scene</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
