/**
 * Shadow Theater Studio - Core Type Definitions
 */

export type CharacterPose =
  | 'idle'
  | 'walking'
  | 'running'
  | 'standing'
  | 'looking_around'
  | 'raising_hands'
  | 'pointing'
  | 'kneeling'
  | 'falling'
  | 'fighting'
  | 'custom';

export interface LimbAngles {
  head: number;        // Head tilt angle in degrees (-45 to 45)
  torso: number;       // Torso pitch (-30 to 30)
  leftUpperArm: number;
  leftForearm: number;
  rightUpperArm: number;
  rightForearm: number;
  leftThigh: number;
  leftCalf: number;
  rightThigh: number;
  rightCalf: number;
  hipsY: number;       // Vertical bounce during walk/run (-20 to 20)
}

export interface Keyframe {
  id: string;
  time: number;         // Time in seconds
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;     // In degrees
  opacity: number;      // 0 to 1
  pose?: CharacterPose;
  easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
}

export type ElementType =
  | 'character'
  | 'animal'
  | 'nature'
  | 'building'
  | 'prop'
  | 'effect';

export interface SceneElement {
  id: string;
  name: string;
  type: ElementType;
  subtype: string;     // e.g. 'traveler', 'warrior', 'horse', 'pine_tree', 'pagoda', 'torch'
  x: number;           // Coordinate on reference 1920x1080 canvas
  y: number;
  scaleX: number;      // Negative for horizontal flip
  scaleY: number;
  rotation: number;    // In degrees
  opacity: number;     // 0 to 1
  blur: number;        // Edge softness / depth blur (0 to 12 px)
  shadowSoftness: number; // Shadow diffusion (0 to 20 px)
  zIndex: number;
  locked: boolean;
  visible: boolean;

  // Character-specific rigging
  pose?: CharacterPose;
  poseSpeed?: number;  // Multiplier for cycle speed (default 1.0)
  customLimbs?: Partial<LimbAngles>;

  // Keyframes for timeline animation
  keyframes: Keyframe[];
}

export type LightingPreset =
  | 'warm_golden'
  | 'sunset'
  | 'moonlight'
  | 'torch'
  | 'dramatic_white'
  | 'deep_amber';

export interface LightingConfig {
  preset: LightingPreset;
  x: number;           // 0 to 100 (% of canvas width)
  y: number;           // 0 to 100 (% of canvas height)
  color: string;       // Hex or RGB
  intensity: number;   // 0.2 to 2.5
  radius: number;      // 200 to 1400 px
  glow: number;        // 0.2 to 2.0
  volumetric: number;  // 0 to 1.0 (god-ray strength)
  rayAngle: number;    // -60 to 60 degrees
  flicker: boolean;    // Dynamic light flutter for torch/fire
}

export type BackgroundTheme =
  | 'forest'
  | 'mountains'
  | 'ancient_village'
  | 'desert'
  | 'ocean'
  | 'hills'
  | 'battlefield'
  | 'night_sky'
  | 'cave'
  | 'countryside';

export interface BackgroundLayer {
  id: string;
  name: string;
  depth: number;       // 0 (distant) to 1 (near foreground)
  color: string;
  opacity: number;
  svgPath: string;     // SVG silhouette path
  parallaxFactor: number;
}

export interface BackgroundConfig {
  theme: BackgroundTheme;
  brightness: number;   // 50 to 180 (%)
  temperature: number;  // -50 (cool/blue) to 50 (warm/gold)
  contrast: number;     // 50 to 150 (%)
  atmosphericFog: number; // 0 to 100 (%)
  fogColor: string;
  lightIntensity: number; // 50 to 180 (%)
  skyGradient: {
    top: string;
    mid: string;
    bottom: string;
  };
}

export type ParticleType = 'dust' | 'embers' | 'leaves' | 'rain' | 'none';

export interface AtmosphereConfig {
  fog: {
    enabled: boolean;
    density: number;    // 0 to 1
    speed: number;      // Wind speed
  };
  particles: {
    type: ParticleType;
    count: number;
    speed: number;
  };
  screenTexture: boolean; // Subtle kelir fabric weave
}

export interface SceneProject {
  id: string;
  name: string;
  version: number;
  duration: number;     // In seconds (e.g. 8)
  fps: 24 | 30;
  width: number;        // 1920
  height: number;       // 1080
  narration?: {
    text: string;
    actTitle?: string;
  };
  background: BackgroundConfig;
  lighting: LightingConfig;
  atmosphere: AtmosphereConfig;
  elements: SceneElement[];
}

export interface StoryAct {
  id: string;
  actNumber: number;
  title: string;
  narration: string;
  duration: number;
  scene: SceneProject;
}

/**
 * Episode-level media and timing configuration.
 * The audio file is the timing source for the final offline render.
 */
export interface AudioCueConfig {
  time: number;
  word: string;
  sfxType: 'sacred_bell' | 'mystic_whoosh' | 'warm_hearth' | 'deep_sub_drone' | 'nature_shimmer' | 'ocean_wind_swell';
  volume?: number;
}

export interface EpisodeConfig {
  episodeNumber: number;
  episodeId?: string;
  orientation?: 'landscape' | 'portrait';
  audioUrl: string;
  logoUrl?: string;
  audioDuration: number;
  introDuration: number;
  outroDuration: number;
  audioCues?: AudioCueConfig[];
}

export interface StoryPackage {
  id: string;
  title: string;
  description: string;
  totalDuration: number; // 28
  episode?: EpisodeConfig;
  acts: StoryAct[];
}

export interface AssetDefinition {
  id: string;
  name: string;
  category: 'characters' | 'animals' | 'nature' | 'buildings' | 'props' | 'backgrounds' | 'lighting' | 'atmosphere';
  type: ElementType;
  subtype: string;
  thumbnailSvg: string;
  defaultScale: number;
  defaultPose?: CharacterPose;
  description: string;
}
