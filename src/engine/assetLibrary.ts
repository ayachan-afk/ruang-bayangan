/**
 * Asset Library & Path Geometry Definitions for Shadow Theater Studio
 * All assets render as rich, crisp black silhouettes with artistic detail.
 */

import { AssetDefinition, LightingConfig, BackgroundConfig, BackgroundTheme, LightingPreset } from '../types';

export const ASSET_LIBRARY: AssetDefinition[] = [
  // --- CHARACTERS ---
  {
    id: 'char_traveler',
    name: 'Lonely Traveler',
    category: 'characters',
    type: 'character',
    subtype: 'traveler',
    thumbnailSvg: '<circle cx="24" cy="14" r="5" fill="currentColor"/><path d="M12 40 L20 22 L28 22 L36 40 Z" fill="currentColor"/><line x1="33" y1="12" x2="35" y2="44" stroke="currentColor" stroke-width="2"/>',
    defaultScale: 1.0,
    defaultPose: 'walking',
    description: 'A solitary wanderer cloaked against the elements, carrying a wooden staff.',
  },
  {
    id: 'char_warrior',
    name: 'Spear Warrior',
    category: 'characters',
    type: 'character',
    subtype: 'warrior',
    thumbnailSvg: '<circle cx="24" cy="14" r="5" fill="currentColor"/><path d="M16 22 L32 22 L28 40 L20 40 Z" fill="currentColor"/><line x1="10" y1="36" x2="38" y2="10" stroke="currentColor" stroke-width="2"/>',
    defaultScale: 1.0,
    defaultPose: 'fighting',
    description: 'Disciplined warrior with combat armor, topknot, and a long battle spear.',
  },
  {
    id: 'char_elder',
    name: 'Ancient Sage',
    category: 'characters',
    type: 'character',
    subtype: 'elder',
    thumbnailSvg: '<circle cx="24" cy="15" r="5" fill="currentColor"/><path d="M14 42 L21 23 L27 23 L34 42 Z" fill="currentColor"/><path d="M26 18 Q30 25 25 30 Q22 25 24 18" fill="currentColor"/>',
    defaultScale: 0.95,
    defaultPose: 'idle',
    description: 'Wise village elder with flowing ceremonial robes and a long beard.',
  },
  {
    id: 'char_dancer',
    name: 'Silk Dancer',
    category: 'characters',
    type: 'character',
    subtype: 'dancer',
    thumbnailSvg: '<circle cx="24" cy="13" r="4.5" fill="currentColor"/><path d="M18 20 Q24 24 30 20 L28 40 L20 40 Z" fill="currentColor"/><path d="M8 26 Q18 16 32 18 Q40 22 42 32" stroke="currentColor" stroke-width="2" fill="none"/>',
    defaultScale: 0.95,
    defaultPose: 'raising_hands',
    description: 'Graceful dancer with sweeping sleeves and poised balance.',
  },
  {
    id: 'char_scout',
    name: 'Forest Scout',
    category: 'characters',
    type: 'character',
    subtype: 'scout',
    thumbnailSvg: '<circle cx="22" cy="16" r="4.5" fill="currentColor"/><path d="M14 24 L28 24 L26 40 L16 40 Z" fill="currentColor"/><path d="M30 18 Q36 28 32 38" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    defaultScale: 0.9,
    defaultPose: 'pointing',
    description: 'Agile scout tracking footsteps through underbrush with a hunting bow.',
  },

  // --- ANIMALS ---
  {
    id: 'animal_horse',
    name: 'Wild Stallion',
    category: 'animals',
    type: 'animal',
    subtype: 'horse',
    thumbnailSvg: '<ellipse cx="24" cy="26" rx="14" ry="7" fill="currentColor"/><path d="M32 24 L40 12 L38 22 Z" fill="currentColor"/><line x1="16" y1="32" x2="14" y2="44" stroke="currentColor" stroke-width="2.5"/><line x1="30" y1="32" x2="32" y2="44" stroke="currentColor" stroke-width="2.5"/>',
    defaultScale: 1.1,
    description: 'A powerful horse with wind-tossed mane in full motion.',
  },
  {
    id: 'animal_wolf',
    name: 'Prowling Wolf',
    category: 'animals',
    type: 'animal',
    subtype: 'wolf',
    thumbnailSvg: '<ellipse cx="24" cy="28" rx="12" ry="6" fill="currentColor"/><path d="M32 26 L42 22 L34 30 Z" fill="currentColor"/><path d="M14 26 Q8 32 6 38" stroke="currentColor" stroke-width="2" fill="none"/>',
    defaultScale: 0.85,
    description: 'A lean mountain wolf moving quietly through shadows.',
  },
  {
    id: 'animal_stag',
    name: 'Crowned Stag',
    category: 'animals',
    type: 'animal',
    subtype: 'stag',
    thumbnailSvg: '<ellipse cx="24" cy="28" rx="11" ry="6" fill="currentColor"/><path d="M30 26 L36 16 L38 20 Z" fill="currentColor"/><path d="M35 15 L32 8 M35 12 L40 7 M35 15 L38 9" stroke="currentColor" stroke-width="1.5"/>',
    defaultScale: 1.05,
    description: 'Majestic forest stag crowned with branching antlers.',
  },
  {
    id: 'animal_eagle',
    name: 'Soaring Eagle',
    category: 'animals',
    type: 'animal',
    subtype: 'eagle',
    thumbnailSvg: '<ellipse cx="24" cy="24" rx="7" ry="3.5" fill="currentColor"/><path d="M22 22 Q12 10 4 14 Q14 20 20 25 Z" fill="currentColor"/><path d="M26 22 Q36 10 44 14 Q34 20 28 25 Z" fill="currentColor"/>',
    defaultScale: 0.8,
    description: 'Raptor banking on thermal updrafts high above the horizon.',
  },

  // --- TREES & NATURE ---
  {
    id: 'nature_banyan',
    name: 'Ancient Banyan',
    category: 'nature',
    type: 'nature',
    subtype: 'banyan',
    thumbnailSvg: '<path d="M22 44 L22 26 Q12 20 8 10 Q24 6 40 10 Q36 20 26 26 L26 44 Z" fill="currentColor"/>',
    defaultScale: 1.4,
    description: 'Massive sacred tree with aerial roots and expansive canopy.',
  },
  {
    id: 'nature_pine',
    name: 'Misty Pine',
    category: 'nature',
    type: 'nature',
    subtype: 'pine_tree',
    thumbnailSvg: '<path d="M24 6 L14 18 L18 18 L10 30 L16 30 L8 40 L22 40 L22 46 L26 46 L26 40 L40 40 L32 30 L38 30 L30 18 L34 18 Z" fill="currentColor"/>',
    defaultScale: 1.2,
    description: 'Tall, fragrant mountain pine with tiered evergreen needles.',
  },
  {
    id: 'nature_dead_tree',
    name: 'Twisted Bare Tree',
    category: 'nature',
    type: 'nature',
    subtype: 'twisted_tree',
    thumbnailSvg: '<path d="M22 46 L24 24 Q18 18 12 12 M24 24 Q30 18 36 14 M24 20 L26 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>',
    defaultScale: 1.1,
    description: 'Gnarly weathered hardwood silhouetted against glowing backlighting.',
  },
  {
    id: 'nature_bamboo',
    name: 'Bamboo Cluster',
    category: 'nature',
    type: 'nature',
    subtype: 'bamboo',
    thumbnailSvg: '<line x1="16" y1="46" x2="18" y2="8" stroke="currentColor" stroke-width="2"/><line x1="24" y1="46" x2="23" y2="6" stroke="currentColor" stroke-width="2"/><line x1="32" y1="46" x2="30" y2="10" stroke="currentColor" stroke-width="2"/>',
    defaultScale: 1.0,
    description: 'Graceful bamboo stalks with fine leaves rustling in the breeze.',
  },
  {
    id: 'nature_reeds',
    name: 'Lakeside Reeds',
    category: 'nature',
    type: 'nature',
    subtype: 'reeds',
    thumbnailSvg: '<path d="M10 46 Q12 28 8 16 M18 46 Q20 22 16 12 M26 46 Q24 24 28 14 M34 46 Q36 28 40 18" stroke="currentColor" stroke-width="2" fill="none"/>',
    defaultScale: 0.9,
    description: 'Delicate wetland reeds and tall wind-blown grass clumps.',
  },

  // --- BUILDINGS ---
  {
    id: 'bld_pagoda',
    name: 'Tiered Pagoda',
    category: 'buildings',
    type: 'building',
    subtype: 'pagoda',
    thumbnailSvg: '<path d="M24 6 L16 14 L32 14 Z M24 16 L12 26 L36 26 Z M24 28 L8 40 L40 40 Z M20 40 L20 46 L28 46 L28 40 Z" fill="currentColor"/>',
    defaultScale: 1.3,
    description: 'Traditional multi-roof Asian pagoda standing tall against the horizon.',
  },
  {
    id: 'bld_cottage',
    name: 'Thatched Cottage',
    category: 'buildings',
    type: 'building',
    subtype: 'cottage',
    thumbnailSvg: '<path d="M10 24 L24 12 L38 24 L34 44 L14 44 Z" fill="currentColor"/><rect x="20" y="32" width="8" height="12" fill="#000"/>',
    defaultScale: 1.1,
    description: 'Cozy ancient dwelling with steep thatched roof and wooden beam framing.',
  },
  {
    id: 'bld_gate',
    name: 'Temple Archway',
    category: 'buildings',
    type: 'building',
    subtype: 'temple_gate',
    thumbnailSvg: '<path d="M6 14 Q24 10 42 14 L40 18 L8 18 Z M12 18 L12 44 L16 44 L16 18 Z M32 18 L32 44 L36 44 L36 18 Z" fill="currentColor"/>',
    defaultScale: 1.25,
    description: 'Sanctuary archway framing distant mountain summits.',
  },
  {
    id: 'bld_bridge',
    name: 'Arched Wooden Bridge',
    category: 'buildings',
    type: 'building',
    subtype: 'bridge',
    thumbnailSvg: '<path d="M4 38 Q24 20 44 38 L42 42 Q24 26 6 42 Z" fill="currentColor"/>',
    defaultScale: 1.3,
    description: 'Curved wooden footbridge spanning river reflections.',
  },
  {
    id: 'bld_watchtower',
    name: 'Fortress Watchtower',
    category: 'buildings',
    type: 'building',
    subtype: 'watchtower',
    thumbnailSvg: '<path d="M16 46 L18 16 L14 14 L34 14 L30 16 L32 46 Z M20 10 L28 10 L28 14 L20 14 Z" fill="currentColor"/>',
    defaultScale: 1.2,
    description: 'Stone bastion watchtower guarding the mountain pass.',
  },

  // --- PROPS & OBJECTS ---
  {
    id: 'prop_campfire',
    name: 'Glowing Campfire',
    category: 'props',
    type: 'prop',
    subtype: 'campfire',
    thumbnailSvg: '<path d="M14 42 L34 38 M14 38 L34 42" stroke="currentColor" stroke-width="3"/><path d="M20 38 Q24 18 24 26 Q28 20 28 38 Z" fill="currentColor"/>',
    defaultScale: 0.8,
    description: 'Cracking wood logs with dancing silhouette flames.',
  },
  {
    id: 'prop_torch_post',
    name: 'Lantern Post',
    category: 'props',
    type: 'prop',
    subtype: 'torch_post',
    thumbnailSvg: '<line x1="24" y1="46" x2="24" y2="16" stroke="currentColor" stroke-width="2.5"/><circle cx="24" cy="14" r="5" fill="currentColor"/>',
    defaultScale: 0.85,
    description: 'Rustic wooden post supporting a warm iron lantern.',
  },
  {
    id: 'prop_boat',
    name: 'River Sampan',
    category: 'props',
    type: 'prop',
    subtype: 'boat',
    thumbnailSvg: '<path d="M6 34 Q24 44 42 34 L38 30 Q24 38 10 30 Z" fill="currentColor"/><line x1="24" y1="34" x2="34" y2="14" stroke="currentColor" stroke-width="2"/>',
    defaultScale: 1.0,
    description: 'Slender wooden canoe with oar resting upon calm waters.',
  },
  {
    id: 'prop_wagon',
    name: 'Merchant Cart',
    category: 'props',
    type: 'prop',
    subtype: 'wagon',
    thumbnailSvg: '<rect x="12" y="24" width="24" height="12" fill="currentColor"/><circle cx="16" cy="40" r="5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="32" cy="40" r="5" stroke="currentColor" stroke-width="2" fill="none"/><line x1="12" y1="30" x2="4" y2="34" stroke="currentColor" stroke-width="2"/>',
    defaultScale: 1.0,
    description: 'Two-wheeled wooden transport cart loaded with sacks and supplies.',
  },
  {
    id: 'prop_altar',
    name: 'Stone Megalith',
    category: 'props',
    type: 'prop',
    subtype: 'altar',
    thumbnailSvg: '<path d="M12 44 L14 18 L20 18 L22 44 Z M26 44 L28 18 L34 18 L36 44 Z M8 14 L40 14 L38 18 L10 18 Z" fill="currentColor"/>',
    defaultScale: 1.1,
    description: 'Ancient weathered stone dolmen standing on sacred ground.',
  },
];

/**
 * Lighting presets defined with exact visual coordinates, warm color temperatures,
 * glow intensities, and volumetric ray attributes.
 */
export const LIGHTING_PRESETS: Record<LightingPreset, LightingConfig> = {
  warm_golden: {
    preset: 'warm_golden',
    x: 50,
    y: 38,
    color: '#ffb244',
    intensity: 1.5,
    radius: 750,
    glow: 1.2,
    volumetric: 0.65,
    rayAngle: -15,
    flicker: false,
  },
  sunset: {
    preset: 'sunset',
    x: 62,
    y: 52,
    color: '#ff5e28',
    intensity: 1.8,
    radius: 850,
    glow: 1.4,
    volumetric: 0.8,
    rayAngle: -25,
    flicker: false,
  },
  moonlight: {
    preset: 'moonlight',
    x: 70,
    y: 28,
    color: '#84b8ff',
    intensity: 1.3,
    radius: 650,
    glow: 1.1,
    volumetric: 0.5,
    rayAngle: 20,
    flicker: false,
  },
  torch: {
    preset: 'torch',
    x: 35,
    y: 65,
    color: '#ff801e',
    intensity: 2.1,
    radius: 500,
    glow: 1.6,
    volumetric: 0.4,
    rayAngle: 0,
    flicker: true,
  },
  dramatic_white: {
    preset: 'dramatic_white',
    x: 50,
    y: 25,
    color: '#f5f3e9',
    intensity: 1.6,
    radius: 900,
    glow: 1.3,
    volumetric: 0.85,
    rayAngle: 0,
    flicker: false,
  },
  deep_amber: {
    preset: 'deep_amber',
    x: 45,
    y: 42,
    color: '#ff981a',
    intensity: 1.9,
    radius: 800,
    glow: 1.5,
    volumetric: 0.75,
    rayAngle: -10,
    flicker: false,
  },
};

/**
 * 10 Multi-layer Background Themes for Parallax Shadow Theater Depth
 */
export const BACKGROUND_PRESETS: Record<BackgroundTheme, BackgroundConfig> = {
  forest: {
    theme: 'forest',
    brightness: 110,
    temperature: 25,
    contrast: 105,
    atmosphericFog: 40,
    fogColor: '#ffb366',
    lightIntensity: 130,
    skyGradient: {
      top: '#2b1b17',
      mid: '#944b1e',
      bottom: '#f39c38',
    },
  },
  mountains: {
    theme: 'mountains',
    brightness: 105,
    temperature: 15,
    contrast: 115,
    atmosphericFog: 35,
    fogColor: '#e0c090',
    lightIntensity: 125,
    skyGradient: {
      top: '#1b1b2f',
      mid: '#5c3d5e',
      bottom: '#e89f65',
    },
  },
  ancient_village: {
    theme: 'ancient_village',
    brightness: 100,
    temperature: 30,
    contrast: 100,
    atmosphericFog: 30,
    fogColor: '#f7ba72',
    lightIntensity: 120,
    skyGradient: {
      top: '#24141e',
      mid: '#70332f',
      bottom: '#df793a',
    },
  },
  desert: {
    theme: 'desert',
    brightness: 120,
    temperature: 45,
    contrast: 120,
    atmosphericFog: 20,
    fogColor: '#f3c270',
    lightIntensity: 140,
    skyGradient: {
      top: '#3a1f1d',
      mid: '#a35029',
      bottom: '#f8b042',
    },
  },
  ocean: {
    theme: 'ocean',
    brightness: 100,
    temperature: -20,
    contrast: 110,
    atmosphericFog: 45,
    fogColor: '#7cb5d8',
    lightIntensity: 115,
    skyGradient: {
      top: '#0d1b2a',
      mid: '#1b4965',
      bottom: '#62b6cb',
    },
  },
  hills: {
    theme: 'hills',
    brightness: 108,
    temperature: 20,
    contrast: 100,
    atmosphericFog: 35,
    fogColor: '#f0c68a',
    lightIntensity: 125,
    skyGradient: {
      top: '#261c14',
      mid: '#875122',
      bottom: '#ebb65c',
    },
  },
  battlefield: {
    theme: 'battlefield',
    brightness: 95,
    temperature: 40,
    contrast: 130,
    atmosphericFog: 50,
    fogColor: '#d65a29',
    lightIntensity: 135,
    skyGradient: {
      top: '#1f0d0d',
      mid: '#6e1d13',
      bottom: '#e24816',
    },
  },
  night_sky: {
    theme: 'night_sky',
    brightness: 85,
    temperature: -40,
    contrast: 120,
    atmosphericFog: 25,
    fogColor: '#4d7298',
    lightIntensity: 100,
    skyGradient: {
      top: '#060a14',
      mid: '#14213d',
      bottom: '#2a4365',
    },
  },
  cave: {
    theme: 'cave',
    brightness: 80,
    temperature: 35,
    contrast: 140,
    atmosphericFog: 60,
    fogColor: '#c96a24',
    lightIntensity: 110,
    skyGradient: {
      top: '#110a08',
      mid: '#3d1f11',
      bottom: '#964816',
    },
  },
  countryside: {
    theme: 'countryside',
    brightness: 110,
    temperature: 22,
    contrast: 95,
    atmosphericFog: 25,
    fogColor: '#e8c57b',
    lightIntensity: 120,
    skyGradient: {
      top: '#1f2421',
      mid: '#6b6038',
      bottom: '#d8b863',
    },
  },
};

/**
 * Draws non-character scene elements (Trees, Buildings, Props, Foliage).
 */
export function drawStaticSilhouette(
  ctx: CanvasRenderingContext2D,
  subtype: string,
  time = 0,
  color = '#09080b'
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (subtype) {
    case 'pine_tree': {
      // Mountain pine with swaying needles
      const sway = Math.sin(time * 1.5) * 2;
      ctx.beginPath();
      // Trunk
      ctx.moveTo(-7, 0);
      ctx.lineTo(-4, -180);
      ctx.lineTo(4, -180);
      ctx.lineTo(7, 0);
      ctx.fill();

      // Tiered needle tiers from top to bottom
      const tiers = [
        { y: -190, w: 25, h: 40 },
        { y: -160, w: 45, h: 50 },
        { y: -125, w: 70, h: 60 },
        { y: -85, w: 95, h: 70 },
        { y: -40, w: 120, h: 80 },
      ];

      for (const [idx, t] of tiers.entries()) {
        const tierSway = sway * (1 + (5 - idx) * 0.4);
        ctx.beginPath();
        ctx.moveTo(tierSway, t.y);
        ctx.lineTo(-t.w + tierSway * 0.5, t.y + t.h);
        // Jagged branch tips
        ctx.lineTo(-t.w * 0.6, t.y + t.h - 10);
        ctx.lineTo(-t.w * 0.3, t.y + t.h + 4);
        ctx.lineTo(0, t.y + t.h - 8);
        ctx.lineTo(t.w * 0.3, t.y + t.h + 4);
        ctx.lineTo(t.w * 0.6, t.y + t.h - 10);
        ctx.lineTo(t.w + tierSway * 0.5, t.y + t.h);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'banyan': {
      // Massive ancient banyan tree
      ctx.beginPath();
      // Thick trunk and roots
      ctx.moveTo(-35, 0);
      ctx.quadraticCurveTo(-15, -60, -20, -140);
      ctx.quadraticCurveTo(0, -130, 20, -140);
      ctx.quadraticCurveTo(15, -60, 35, 0);
      ctx.closePath();
      ctx.fill();

      // Massive leafy canopy clusters
      const clusters = [
        { x: 0, y: -200, rx: 90, ry: 50 },
        { x: -70, y: -170, rx: 70, ry: 45 },
        { x: 70, y: -175, rx: 75, ry: 45 },
        { x: -120, y: -140, rx: 55, ry: 40 },
        { x: 120, y: -145, rx: 60, ry: 40 },
      ];
      for (const c of clusters) {
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Aerial hanging roots
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-60, -130); ctx.lineTo(-65, 0);
      ctx.moveTo(-35, -120); ctx.lineTo(-40, 0);
      ctx.moveTo(40, -125); ctx.lineTo(45, 0);
      ctx.moveTo(65, -130); ctx.lineTo(60, 0);
      ctx.stroke();
      break;
    }

    case 'twisted_tree': {
      // Gnarled weathered bare branches
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-15, -70, 5, -130);
      ctx.stroke();

      // Branches
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, -90);
      ctx.quadraticCurveTo(-45, -120, -65, -170);
      ctx.moveTo(5, -130);
      ctx.quadraticCurveTo(35, -165, 55, -210);
      ctx.moveTo(5, -130);
      ctx.quadraticCurveTo(-20, -175, -25, -220);
      ctx.stroke();

      // Twigs
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-45, -140); ctx.lineTo(-75, -130);
      ctx.moveTo(30, -160); ctx.lineTo(60, -150);
      ctx.moveTo(-15, -180); ctx.lineTo(-40, -200);
      ctx.stroke();
      break;
    }

    case 'bamboo': {
      // Cluster of vertical bamboo stalks
      const stalks = [-18, -4, 10, 22];
      for (const sx of stalks) {
        const lean = Math.sin(time * 2 + sx) * 4;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.quadraticCurveTo(sx + lean * 0.5, -90, sx + lean, -180);
        ctx.stroke();

        // Stalk segment nodes
        for (let y = -30; y >= -160; y -= 35) {
          ctx.beginPath();
          ctx.ellipse(sx + lean * (-y / 180), y, 5, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          // Small leaf blades
          ctx.beginPath();
          ctx.ellipse(sx + lean * (-y / 180) + 12, y - 4, 10, 3, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'reeds': {
      // Wind-tossed reeds
      for (let i = -30; i <= 30; i += 8) {
        const wave = Math.sin(time * 2.5 + i * 0.3) * 8;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.quadraticCurveTo(i + wave * 0.4, -40, i + wave, -75);
        ctx.stroke();
        // Reed head
        ctx.beginPath();
        ctx.ellipse(i + wave, -72, 3, 8, wave * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'pagoda': {
      // Multi-tier pagoda architecture
      const roofLevels = [
        { y: -190, eavesW: 55, baseW: 24, h: 22 },
        { y: -150, eavesW: 80, baseW: 38, h: 28 },
        { y: -105, eavesW: 110, baseW: 54, h: 32 },
        { y: -55, eavesW: 140, baseW: 70, h: 36 },
      ];

      // Spire / Finial
      ctx.beginPath();
      ctx.moveTo(0, -230);
      ctx.lineTo(2, -190);
      ctx.lineTo(-2, -190);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -220, 5, 0, Math.PI * 2);
      ctx.arc(0, -210, 6, 0, Math.PI * 2);
      ctx.fill();

      for (const r of roofLevels) {
        // Curved roof eaves
        ctx.beginPath();
        ctx.moveTo(-r.eavesW, r.y + r.h * 0.5);
        // Upturned corners
        ctx.quadraticCurveTo(-r.eavesW * 0.8, r.y + r.h * 0.3, 0, r.y);
        ctx.quadraticCurveTo(r.eavesW * 0.8, r.y + r.h * 0.3, r.eavesW, r.y + r.h * 0.5);
        ctx.lineTo(r.eavesW * 0.9, r.y + r.h * 0.65);
        ctx.lineTo(-r.eavesW * 0.9, r.y + r.h * 0.65);
        ctx.closePath();
        ctx.fill();

        // Level chamber walls
        ctx.beginPath();
        ctx.rect(-r.baseW * 0.5, r.y + r.h * 0.6, r.baseW, r.h * 0.65);
        ctx.fill();
      }

      // Base foundation
      ctx.beginPath();
      ctx.rect(-50, -18, 100, 18);
      ctx.fill();
      break;
    }

    case 'cottage': {
      // Ancient thatched village cottage
      ctx.beginPath();
      // Thatched roof with overhang
      ctx.moveTo(0, -110);
      ctx.lineTo(-90, -45);
      ctx.lineTo(90, -45);
      ctx.closePath();
      ctx.fill();

      // Chimney with gentle smoke
      ctx.fillRect(45, -115, 14, 40);

      // House body
      ctx.beginPath();
      ctx.rect(-70, -45, 140, 45);
      ctx.fill();

      // Door cutout and window
      ctx.fillStyle = '#000000';
      ctx.fillRect(-15, -35, 30, 35);
      ctx.fillRect(-52, -32, 20, 16);
      ctx.fillRect(32, -32, 20, 16);
      break;
    }

    case 'temple_gate': {
      // Torii / Temple Gate
      ctx.lineWidth = 14;
      // Main top lintel with curve
      ctx.beginPath();
      ctx.moveTo(-110, -145);
      ctx.quadraticCurveTo(0, -155, 110, -145);
      ctx.stroke();

      // Secondary straight tie beam
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-95, -120);
      ctx.lineTo(95, -120);
      ctx.stroke();

      // Two massive pillars
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(-60, -140); ctx.lineTo(-65, 0);
      ctx.moveTo(60, -140); ctx.lineTo(65, 0);
      ctx.stroke();
      break;
    }

    case 'bridge': {
      // Arched wooden footbridge
      ctx.beginPath();
      ctx.arc(0, 70, 120, Math.PI * 1.15, Math.PI * 1.85);
      ctx.lineWidth = 16;
      ctx.stroke();

      // Railing posts
      for (let angle = Math.PI * 1.2; angle <= Math.PI * 1.8; angle += 0.12) {
        const x = Math.cos(angle) * 120;
        const y = 70 + Math.sin(angle) * 120;
        ctx.fillRect(x - 2, y - 20, 4, 20);
      }
      break;
    }

    case 'watchtower': {
      // Fortress watchtower
      ctx.beginPath();
      ctx.moveTo(-35, 0);
      ctx.lineTo(-24, -130);
      ctx.lineTo(24, -130);
      ctx.lineTo(35, 0);
      ctx.closePath();
      ctx.fill();

      // Tower platform with battlements
      ctx.fillRect(-38, -150, 76, 20);
      // Crenels
      ctx.fillRect(-38, -165, 16, 15);
      ctx.fillRect(-10, -165, 20, 15);
      ctx.fillRect(22, -165, 16, 15);
      break;
    }

    case 'campfire': {
      // Crackling campfire
      // Crossed logs
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-35, 0); ctx.lineTo(35, -10);
      ctx.moveTo(-35, -10); ctx.lineTo(35, 0);
      ctx.stroke();

      // Dancing silhouette flames
      const f1 = Math.sin(time * 8) * 6;
      const f2 = Math.cos(time * 10) * 8;
      ctx.beginPath();
      ctx.moveTo(-20, -5);
      ctx.quadraticCurveTo(-15 + f1, -35, 0 + f2, -65);
      ctx.quadraticCurveTo(15 - f1, -35, 20, -5);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'torch_post': {
      // Wooden pole with lantern
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -140);
      ctx.lineTo(25, -140);
      ctx.stroke();

      // Hanging lantern
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, -140);
      ctx.lineTo(20, -118);
      ctx.stroke();

      // Lantern cage
      ctx.beginPath();
      ctx.rect(10, -118, 20, 26);
      ctx.fill();
      break;
    }

    case 'boat': {
      // Wooden sampan hull; waterline at y = 0
      ctx.beginPath();
      ctx.moveTo(-78, -30);
      ctx.quadraticCurveTo(0, -16, 78, -30);
      ctx.lineTo(58, -4);
      ctx.quadraticCurveTo(0, 8, -58, -4);
      ctx.closePath();
      ctx.fill();

      // Oar dipping into the water
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, -44);
      ctx.lineTo(-30, 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(-32, 4, 6, 10, 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'wagon': {
      // Ancient transport wagon
      ctx.fillRect(-45, -35, 90, 30);
      // Wheels
      for (const wx of [-30, 30]) {
        ctx.beginPath();
        ctx.arc(wx, -5, 18, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(wx, -5, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      // Shaft
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(45, -20);
      ctx.lineTo(75, -10);
      ctx.stroke();
      break;
    }

    case 'altar': {
      // Stone megalith
      ctx.fillRect(-45, -80, 25, 80);
      ctx.fillRect(20, -80, 25, 80);
      ctx.fillRect(-65, -105, 130, 28);
      break;
    }

    case 'tongkonan': {
      // Toraja Tongkonan House (Iconic towering saddleback boat-shaped roof)
      // 1. Massive curved roof prows sweeping high to the left and right
      ctx.beginPath();
      // Outer upper curve
      ctx.moveTo(-165, -200);
      ctx.quadraticCurveTo(-70, -85, 0, -82);
      ctx.quadraticCurveTo(70, -85, 165, -200);
      // Prow tips thickness
      ctx.lineTo(152, -185);
      // Underside inner ceiling curve
      ctx.quadraticCurveTo(65, -72, 0, -70);
      ctx.quadraticCurveTo(-65, -72, -152, -185);
      ctx.closePath();
      ctx.fill();

      // Front & Rear Gable Boards (Lere)
      ctx.beginPath();
      ctx.moveTo(-120, -150);
      ctx.lineTo(-75, -55);
      ctx.lineTo(-60, -55);
      ctx.lineTo(-105, -140);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(120, -150);
      ctx.lineTo(75, -55);
      ctx.lineTo(60, -55);
      ctx.lineTo(105, -140);
      ctx.closePath();
      ctx.fill();

      // 2. House body / living chambers (Kale Banua)
      ctx.fillRect(-65, -58, 130, 36);

      // Windows and door carving outlines
      ctx.fillStyle = '#050406';
      ctx.fillRect(-42, -50, 16, 18);
      ctx.fillRect(26, -50, 16, 18);
      ctx.fillRect(-10, -52, 20, 30);
      ctx.fillStyle = color;

      // 3. Front vertical center post (Tulak Somba) with stacked buffalo horns
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(0, 0);
      ctx.stroke();

      // Stack of carved buffalo horns along the Tulak Somba post
      for (let hy = -62; hy <= -28; hy += 7) {
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-12, hy - 4);
        ctx.quadraticCurveTo(0, hy, 12, hy - 4);
        ctx.stroke();
      }

      // 4. Sturdy wooden stilts/piles underneath (Sulluk)
      ctx.lineWidth = 4.5;
      const stilts = [-56, -38, -20, 20, 38, 56];
      ctx.beginPath();
      for (const sx of stilts) {
        ctx.moveTo(sx, -22);
        ctx.lineTo(sx, 0);
      }
      ctx.stroke();

      // Wooden front ladder steps
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, -22); ctx.lineTo(16, 0);
      ctx.moveTo(14, -22); ctx.lineTo(22, 0);
      ctx.moveTo(8, -16); ctx.lineTo(16, -16);
      ctx.moveTo(11, -8); ctx.lineTo(19, -8);
      ctx.stroke();
      break;
    }

    case 'alang_rice_barn': {
      // Toraja Alang (Curved Roof Granary facing Tongkonan)
      // Saddleback roof
      ctx.beginPath();
      ctx.moveTo(-105, -140);
      ctx.quadraticCurveTo(-45, -65, 0, -62);
      ctx.quadraticCurveTo(45, -65, 105, -140);
      ctx.lineTo(95, -130);
      ctx.quadraticCurveTo(40, -55, 0, -53);
      ctx.quadraticCurveTo(-40, -55, -95, -130);
      ctx.closePath();
      ctx.fill();

      // Granary Chamber
      ctx.fillRect(-45, -45, 90, 26);

      // Smooth cylindrical palm-trunk pillars (Bangunan Alang)
      ctx.lineWidth = 4;
      for (const px of [-35, -12, 12, 35]) {
        ctx.beginPath();
        ctx.moveTo(px, -19);
        ctx.lineTo(px, 0);
        ctx.stroke();
      }
      break;
    }

    case 'toraja_cliff': {
      // Towering Limestone Cliff Face with Rock-Cut Tombs (Liang Batu) and Tau-Tau Balcony
      // High craggy cliff face
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -320);
      ctx.quadraticCurveTo(60, -310, 110, -290);
      ctx.quadraticCurveTo(80, -250, 140, -210);
      ctx.quadraticCurveTo(110, -170, 160, -120);
      ctx.quadraticCurveTo(120, -60, 180, 0);
      ctx.closePath();
      ctx.fill();

      // Rock tomb entrance niches (dark cutouts)
      ctx.fillStyle = '#040306';
      ctx.fillRect(25, -260, 28, 22);
      ctx.fillRect(70, -230, 24, 20);
      ctx.fillRect(45, -110, 32, 24);

      // Carved Balcony (Niche for Tau-Tau Ancestor Statues)
      ctx.fillRect(30, -175, 80, 26);

      // Wooden Balcony Railing
      ctx.strokeStyle = '#040306';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(28, -160); ctx.lineTo(112, -160);
      ctx.stroke();
      for (let rx = 34; rx <= 106; rx += 14) {
        ctx.beginPath();
        ctx.moveTo(rx, -175); ctx.lineTo(rx, -160);
        ctx.stroke();
      }

      // Miniature Tau-tau Effigy Silhouettes standing in balcony with arms extended
      ctx.fillStyle = color;
      for (let tx = 42; tx <= 98; tx += 18) {
        // Head
        ctx.beginPath();
        ctx.arc(tx, -190, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Torso
        ctx.fillRect(tx - 2.5, -186, 5, 12);
        // Extended welcoming arms
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tx - 6, -182); ctx.lineTo(tx + 6, -182);
        ctx.stroke();
      }

      // Hanging Coffin (Erong) on wooden cliff pegs
      ctx.fillStyle = color;
      ctx.fillRect(80, -85, 45, 14);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(85, -85); ctx.lineTo(80, -70);
      ctx.moveTo(120, -85); ctx.lineTo(125, -70);
      ctx.stroke();
      break;
    }

    case 'ceremonial_torch': {
      // Tall bamboo torch with animated flame
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -90);
      ctx.stroke();

      // Woven bamboo torch basket
      ctx.beginPath();
      ctx.moveTo(-6, -90);
      ctx.lineTo(6, -90);
      ctx.lineTo(9, -104);
      ctx.lineTo(-9, -104);
      ctx.closePath();
      ctx.fill();

      // Animated silhouette flickering flame
      const flk = Math.sin(time * 12) * 4;
      ctx.beginPath();
      ctx.moveTo(-8, -104);
      ctx.quadraticCurveTo(-10 + flk, -122, 0 + flk * 0.5, -138);
      ctx.quadraticCurveTo(10 - flk, -122, 8, -104);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'offering_dulang': {
      // Footed Toraja ceremonial offering tray with incense
      ctx.beginPath();
      // Bowl / tray
      ctx.moveTo(-22, -26);
      ctx.quadraticCurveTo(0, -18, 22, -26);
      ctx.lineTo(18, -32);
      ctx.lineTo(-18, -32);
      ctx.closePath();
      ctx.fill();
      // Stand & Base
      ctx.fillRect(-3, -22, 6, 16);
      ctx.fillRect(-12, -6, 24, 6);

      // Incense smoke wisps
      const sw = Math.sin(time * 3) * 6;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.quadraticCurveTo(sw, -44, -sw * 0.5, -56);
      ctx.stroke();
      break;
    }

    case 'sea_waves': {
      // Layered rolling wave crests; waterline at y = 0, water body fills downward.
      // Horizontal ends fade out so a partial-width sea band has no hard vertical seam.
      const waveFade = ctx.createLinearGradient(-460, 0, 460, 0);
      waveFade.addColorStop(0, `${color}00`);
      waveFade.addColorStop(0.18, color);
      waveFade.addColorStop(0.82, color);
      waveFade.addColorStop(1, `${color}00`);
      ctx.fillStyle = waveFade;
      const rows = [
        { y: -56, amp: 16, freq: 0.008, speed: 0.55, fill: 1 },
        { y: -30, amp: 12, freq: 0.011, speed: 0.85, fill: 1 },
        { y: -8, amp: 8, freq: 0.016, speed: 1.25, fill: 1 },
      ];
      for (const row of rows) {
        ctx.beginPath();
        ctx.moveTo(-460, 60);
        for (let x = -460; x <= 460; x += 16) {
          const y = row.y
            + Math.sin(x * row.freq + time * row.speed) * row.amp
            + Math.sin(x * row.freq * 2.3 - time * row.speed * 1.6) * row.amp * 0.35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(460, 60);
        ctx.closePath();
        ctx.fill();
      }
      // Foam flicks riding the front crest
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 7; i += 1) {
        const fx = -380 + i * 125 + Math.sin(time * 0.9 + i * 2.1) * 26;
        const fy = -12 + Math.sin(fx * 0.016 + time * 1.25) * 8;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(fx + 14, fy - 16, fx + 34, fy - 6);
        ctx.stroke();
      }
      break;
    }

    case 'sea_stack': {
      // Jagged coastal rock tower (karst sea stack) battered by surf
      ctx.beginPath();
      ctx.moveTo(-120, 0);
      ctx.lineTo(-96, -84);
      ctx.lineTo(-104, -128);
      ctx.lineTo(-62, -196);
      ctx.lineTo(-70, -248);
      ctx.lineTo(-28, -302);
      ctx.lineTo(-14, -340);
      ctx.lineTo(6, -312);
      ctx.lineTo(2, -258);
      ctx.lineTo(38, -214);
      ctx.lineTo(30, -150);
      ctx.lineTo(72, -96);
      ctx.lineTo(64, -40);
      ctx.lineTo(96, 0);
      ctx.closePath();
      ctx.fill();
      // Detached companion rock on the right
      ctx.beginPath();
      ctx.moveTo(128, 0);
      ctx.lineTo(142, -66);
      ctx.lineTo(168, -104);
      ctx.lineTo(190, -58);
      ctx.lineTo(206, 0);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'palm_tree': {
      // Wind-swaying coconut palm of the southern shore
      const sway = Math.sin(time * 1.1) * 6;
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-14 + sway * 0.4, -140, -34 + sway, -268);
      ctx.stroke();
      const crownX = -34 + sway;
      const crownY = -268;
      // Drooping fronds radiating from the crown
      const fronds = [
        { a: -0.35, len: 130 },
        { a: -1.05, len: 118 },
        { a: -1.9, len: 108 },
        { a: -2.7, len: 112 },
        { a: 0.35, len: 126 },
        { a: 1.05, len: 114 },
        { a: 1.85, len: 104 },
      ];
      for (const [i, f] of fronds.entries()) {
        const frondSway = Math.sin(time * 1.6 + i * 1.3) * 0.06;
        const angle = f.a + frondSway;
        const tipX = crownX + Math.cos(angle) * f.len;
        const tipY = crownY + Math.sin(angle) * f.len * 0.8 + f.len * 0.28;
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(crownX, crownY);
        ctx.quadraticCurveTo(
          crownX + Math.cos(angle) * f.len * 0.6,
          crownY + Math.sin(angle) * f.len * 0.45 - 18,
          tipX,
          tipY,
        );
        ctx.stroke();
        // Leaf blade thickness
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(crownX, crownY + 6);
        ctx.quadraticCurveTo(
          crownX + Math.cos(angle) * f.len * 0.6,
          crownY + Math.sin(angle) * f.len * 0.45 + 2,
          tipX,
          tipY + 8,
        );
        ctx.stroke();
      }
      // Coconut cluster
      ctx.beginPath();
      ctx.arc(crownX - 8, crownY + 12, 7, 0, Math.PI * 2);
      ctx.arc(crownX + 6, crownY + 16, 6, 0, Math.PI * 2);
      ctx.arc(crownX - 1, crownY + 24, 6.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'joglo_palace': {
      // Tiered Javanese royal pendopo (keraton) with sweeping roofs
      // Stone base platform
      ctx.beginPath();
      ctx.rect(-250, -26, 500, 26);
      ctx.fill();
      ctx.beginPath();
      ctx.rect(-216, -44, 432, 18);
      ctx.fill();
      // Pillars
      for (const px of [-190, -128, -64, 0, 64, 128, 190]) {
        ctx.fillRect(px - 7, -138, 14, 96);
      }
      // Lower wide roof tier
      ctx.beginPath();
      ctx.moveTo(-264, -132);
      ctx.quadraticCurveTo(-140, -168, 0, -176);
      ctx.quadraticCurveTo(140, -168, 264, -132);
      ctx.lineTo(252, -122);
      ctx.quadraticCurveTo(0, -160, -252, -122);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-264, -132);
      ctx.quadraticCurveTo(0, -200, 264, -132);
      ctx.lineTo(232, -150);
      ctx.quadraticCurveTo(0, -206, -232, -150);
      ctx.closePath();
      ctx.fill();
      // Middle roof tier
      ctx.beginPath();
      ctx.moveTo(-176, -172);
      ctx.quadraticCurveTo(0, -232, 176, -172);
      ctx.lineTo(150, -186);
      ctx.quadraticCurveTo(0, -236, -150, -186);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-176, -172);
      ctx.quadraticCurveTo(0, -256, 176, -172);
      ctx.lineTo(140, -196);
      ctx.quadraticCurveTo(0, -252, -140, -196);
      ctx.closePath();
      ctx.fill();
      // Central tajug peak
      ctx.beginPath();
      ctx.moveTo(-92, -224);
      ctx.quadraticCurveTo(0, -300, 92, -224);
      ctx.lineTo(64, -238);
      ctx.quadraticCurveTo(0, -296, -64, -238);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-92, -224);
      ctx.quadraticCurveTo(0, -330, 92, -224);
      ctx.lineTo(0, -290);
      ctx.closePath();
      ctx.fill();
      // Roof finial
      ctx.beginPath();
      ctx.moveTo(0, -356);
      ctx.lineTo(4, -322);
      ctx.lineTo(-4, -322);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -330, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'javan_banteng': {
      // Magnificent wild Javan banteng (Bos javanicus) with organic muscular contour
      ctx.beginPath();
      ctx.moveTo(-110, -50);
      ctx.quadraticCurveTo(-70, -78, 10, -74);
      ctx.quadraticCurveTo(60, -76, 85, -60);
      ctx.quadraticCurveTo(115, -45, 125, -20);
      ctx.quadraticCurveTo(140, -10, 155, -25);
      ctx.quadraticCurveTo(165, -20, 160, -5);
      ctx.quadraticCurveTo(145, 10, 120, 0);
      ctx.quadraticCurveTo(105, 30, 85, 25);
      ctx.quadraticCurveTo(65, 30, 45, 15);
      ctx.lineTo(45, 75);
      ctx.lineTo(35, 75);
      ctx.lineTo(32, 10);
      ctx.lineTo(15, 75);
      ctx.lineTo(5, 75);
      ctx.lineTo(8, -10);
      ctx.quadraticCurveTo(-30, 0, -65, -10);
      ctx.lineTo(-70, 75);
      ctx.lineTo(-80, 75);
      ctx.lineTo(-78, -15);
      ctx.lineTo(-95, 75);
      ctx.lineTo(-105, 75);
      ctx.quadraticCurveTo(-112, 10, -118, -25);
      ctx.closePath();
      ctx.fill();

      // Tail with tuft
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-115, -35);
      ctx.quadraticCurveTo(-135, 0, -128, 45);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(-128, 48, 6, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Iconic sweeping horns (curving outward, then up and inward at the tips)
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(135, -38);
      ctx.quadraticCurveTo(145, -75, 125, -95);
      ctx.quadraticCurveTo(115, -102, 105, -95);
      ctx.stroke();

      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(125, -34);
      ctx.quadraticCurveTo(132, -68, 115, -85);
      ctx.quadraticCurveTo(108, -90, 100, -84);
      ctx.stroke();
      break;
    }

    case 'sacred_cave': {
      // Natural limestone cliff overhang forming a sacred cave mouth (Gua Istana)
      ctx.beginPath();
      ctx.moveTo(-280, 0);
      ctx.lineTo(-280, -220);
      ctx.quadraticCurveTo(-260, -320, -160, -350);
      ctx.quadraticCurveTo(0, -365, 180, -340);
      ctx.quadraticCurveTo(280, -310, 280, -180);
      ctx.lineTo(280, 0);
      ctx.quadraticCurveTo(190, -40, 150, -180);
      ctx.quadraticCurveTo(90, -260, 0, -265);
      ctx.quadraticCurveTo(-110, -260, -170, -170);
      ctx.quadraticCurveTo(-200, -40, -280, 0);
      ctx.closePath();
      ctx.fill();

      // Hanging stalactites from the cave lip
      const stalactites = [-120, -75, -20, 35, 95, 140];
      for (const sx of stalactites) {
        ctx.beginPath();
        ctx.moveTo(sx - 10, -250);
        ctx.lineTo(sx, -210 - Math.abs(sx % 30));
        ctx.lineTo(sx + 10, -250);
        ctx.closePath();
        ctx.fill();
      }

      // Hanging moss/vine tendrils swaying in the draft
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 7; i++) {
        const vx = -140 + i * 45;
        const vlen = 50 + (i % 3) * 35;
        const vsway = Math.sin(time * 1.5 + i * 0.9) * 5;
        ctx.beginPath();
        ctx.moveTo(vx, -240);
        ctx.quadraticCurveTo(vx + vsway * 0.5, -240 + vlen * 0.6, vx + vsway, -240 + vlen);
        ctx.stroke();
      }
      break;
    }

    default:
      // Generic circular silhouette fallback
      ctx.beginPath();
      ctx.arc(0, -30, 30, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}
