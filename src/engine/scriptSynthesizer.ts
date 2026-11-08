/**
 * Script-to-Shadow-Animation Synthesizer
 * Automatically constructs full 2D silhouette shadow theater animations,
 * lighting setups, backgrounds, and kinematic character keyframes from script text.
 */

import { StoryPackage, StoryAct, SceneProject, BackgroundTheme, LightingPreset, ParticleType, CharacterPose } from '../types';
import { BACKGROUND_PRESETS, LIGHTING_PRESETS } from './assetLibrary';
import { FORGOTTEN_VILLAGE_PACKAGE } from './storyPackage';
import { TORAJA_STORY_PACKAGE } from './torajaStoryPackage';
import { RORO_KIDUL_STORY_PACKAGE } from './roroKidulStoryPackage';

export interface ScriptActInput {
  title: string;
  narration: string;
  duration: number; // in seconds
}

export function synthesizeStoryFromScript(
  title: string,
  actsInput: ScriptActInput[]
): StoryPackage {
  let totalDuration = 0;
  const acts: StoryAct[] = [];

  actsInput.forEach((input, idx) => {
    const actNumber = idx + 1;
    const duration = Math.max(5, input.duration || 8);
    totalDuration += duration;

    const scene = synthesizeSceneFromText(
      `scene_${Date.now()}_${idx}`,
      input.title,
      input.narration,
      duration
    );

    acts.push({
      id: `act_${idx + 1}`,
      actNumber,
      title: input.title,
      narration: input.narration,
      duration,
      scene,
    });
  });

  return {
    id: `story_${Date.now()}`,
    title,
    description: `Animasi storytelling shadow theater sinematik berdurasi ${totalDuration} detik.`,
    totalDuration,
    acts,
  };
}

/**
 * Intelligent analyzer that converts text prompt/narration into complete shadow theater scene
 */
function synthesizeSceneFromText(
  id: string,
  title: string,
  narration: string,
  duration: number
): SceneProject {
  const lower = narration.toLowerCase();

  // 1. Determine Background Theme
  let theme: BackgroundTheme = 'forest';
  let lightingPreset: LightingPreset = 'warm_golden';
  let particleType: ParticleType = 'dust';

  if (lower.includes('gunung') || lower.includes('bukit') || lower.includes('puncak') || lower.includes('mountain')) {
    theme = 'mountains';
    lightingPreset = 'warm_golden';
    particleType = 'dust';
  } else if (lower.includes('desa') || lower.includes('kampung') || lower.includes('rumah') || lower.includes('village')) {
    theme = 'countryside';
    lightingPreset = 'sunset';
    particleType = 'dust';
  } else if (lower.includes('hutan') || lower.includes('pohon') || lower.includes('rimba') || lower.includes('forest')) {
    theme = 'forest';
    lightingPreset = lower.includes('malam') || lower.includes('gelap') ? 'moonlight' : 'sunset';
    particleType = 'leaves';
  } else if (lower.includes('perang') || lower.includes('tarung') || lower.includes('api') || lower.includes('battle')) {
    theme = 'battlefield';
    lightingPreset = 'deep_amber';
    particleType = 'embers';
  } else if (lower.includes('malam') || lower.includes('bintang') || lower.includes('bulan') || lower.includes('night')) {
    theme = 'night_sky';
    lightingPreset = 'moonlight';
    particleType = 'dust';
  }

  // 2. Synthesize elements according to keywords
  const elements: SceneProject['elements'] = [];
  let zIndex = 1;

  // Add terrain flora / architecture based on theme
  if (theme === 'forest') {
    elements.push({
      id: `${id}_banyan`,
      name: 'Beringin Rimba',
      type: 'nature',
      subtype: 'banyan',
      x: 1400,
      y: 860,
      scaleX: 1.8,
      scaleY: 1.8,
      rotation: 0,
      opacity: 1,
      blur: 0.5,
      shadowSoftness: 5,
      zIndex: zIndex++,
      locked: false,
      visible: true,
      keyframes: [],
    });
    elements.push({
      id: `${id}_twisted`,
      name: 'Ranting Lapuk',
      type: 'nature',
      subtype: 'twisted_tree',
      x: 220,
      y: 870,
      scaleX: 1.6,
      scaleY: 1.6,
      rotation: 6,
      opacity: 1,
      blur: 0,
      shadowSoftness: 4,
      zIndex: zIndex++,
      locked: false,
      visible: true,
      keyframes: [],
    });
    elements.push({
      id: `${id}_reeds`,
      name: 'Semak Belukar',
      type: 'nature',
      subtype: 'reeds',
      x: 820,
      y: 875,
      scaleX: 1.5,
      scaleY: 1.3,
      rotation: 0,
      opacity: 1,
      blur: 0,
      shadowSoftness: 3,
      zIndex: zIndex++,
      locked: false,
      visible: true,
      keyframes: [],
    });
  } else if (theme === 'mountains') {
    elements.push({
      id: `${id}_pagoda`,
      name: 'Pagoda Bukit',
      type: 'building',
      subtype: 'pagoda',
      x: 1520,
      y: 720,
      scaleX: 1.4,
      scaleY: 1.4,
      rotation: 0,
      opacity: 0.95,
      blur: 1.0,
      shadowSoftness: 7,
      zIndex: zIndex++,
      locked: false,
      visible: true,
      keyframes: [],
    });
    elements.push({
      id: `${id}_bridge`,
      name: 'Jembatan Lembah',
      type: 'building',
      subtype: 'bridge',
      x: 960,
      y: 860,
      scaleX: 1.3,
      scaleY: 1.3,
      rotation: 0,
      opacity: 1,
      blur: 0,
      shadowSoftness: 5,
      zIndex: zIndex++,
      locked: false,
      visible: true,
      keyframes: [],
    });
    elements.push({
      id: `${id}_eagle`,
      name: 'Elang Langit',
      type: 'animal',
      subtype: 'eagle',
      x: 1100,
      y: 280,
      scaleX: 1.15,
      scaleY: 1.15,
      rotation: -5,
      opacity: 1,
      blur: 0.4,
      shadowSoftness: 4,
      zIndex: 15,
      locked: false,
      visible: true,
      keyframes: [
        { id: `kf_e1_${id}`, time: 0, x: 1350, y: 320, scaleX: 1.15, scaleY: 1.15, rotation: -8, opacity: 0.9, easing: 'easeInOut' },
        { id: `kf_e2_${id}`, time: duration * 0.5, x: 920, y: 240, scaleX: 1.05, scaleY: 1.05, rotation: 3, opacity: 1.0, easing: 'easeInOut' },
        { id: `kf_e3_${id}`, time: duration, x: 500, y: 290, scaleX: 0.95, scaleY: 0.95, rotation: -6, opacity: 0.85, easing: 'easeInOut' },
      ],
    });
  } else {
    // Countryside / Village
    elements.push({
      id: `${id}_cottage1`,
      name: 'Pondok Sederhana',
      type: 'building',
      subtype: 'cottage',
      x: 350,
      y: 845,
      scaleX: 1.3,
      scaleY: 1.3,
      rotation: 0,
      opacity: 1,
      blur: 0,
      shadowSoftness: 4,
      zIndex: zIndex++,
      locked: false,
      visible: true,
      keyframes: [],
    });
    elements.push({
      id: `${id}_bamboo`,
      name: 'Bambu Desa',
      type: 'nature',
      subtype: 'bamboo',
      x: 580,
      y: 865,
      scaleX: 1.2,
      scaleY: 1.2,
      rotation: 0,
      opacity: 0.95,
      blur: 0.5,
      shadowSoftness: 5,
      zIndex: zIndex++,
      locked: false,
      visible: true,
      keyframes: [],
    });
    elements.push({
      id: `${id}_hearth`,
      name: 'Perapian',
      type: 'prop',
      subtype: 'campfire',
      x: 520,
      y: 865,
      scaleX: 0.9,
      scaleY: 0.9,
      rotation: 0,
      opacity: 1,
      blur: 0,
      shadowSoftness: 2,
      zIndex: zIndex++,
      locked: false,
      visible: true,
      keyframes: [],
    });
  }

  // Add animated characters matching narrative
  if (lower.includes('anak') || lower.includes('berlarian') || lower.includes('lari')) {
    // Running children
    elements.push({
      id: `${id}_runner1`,
      name: 'Anak Berlarian',
      type: 'character',
      subtype: 'scout',
      x: 480,
      y: 855,
      scaleX: 0.85,
      scaleY: 0.85,
      rotation: 0,
      opacity: 1,
      blur: 0,
      shadowSoftness: 3,
      zIndex: 12,
      locked: false,
      visible: true,
      pose: 'running',
      poseSpeed: 1.6,
      keyframes: [
        { id: `kf_r1_${id}`, time: 0, x: 420, y: 855, scaleX: 0.85, scaleY: 0.85, rotation: 0, opacity: 1, pose: 'running', easing: 'linear' },
        { id: `kf_r2_${id}`, time: duration, x: 1450, y: 855, scaleX: 0.85, scaleY: 0.85, rotation: 0, opacity: 1, pose: 'running', easing: 'linear' },
      ],
    });
  }

  if (lower.includes('penduduk') || lower.includes('ladang') || lower.includes('petani') || lower.includes('kayu')) {
    // Villagers walking
    elements.push({
      id: `${id}_farmer`,
      name: 'Warga Berjalan',
      type: 'character',
      subtype: 'traveler',
      x: 350,
      y: 855,
      scaleX: 1.2,
      scaleY: 1.2,
      rotation: 0,
      opacity: 1,
      blur: 0,
      shadowSoftness: 3,
      zIndex: 10,
      locked: false,
      visible: true,
      pose: 'walking',
      poseSpeed: 0.9,
      keyframes: [
        { id: `kf_f1_${id}`, time: 0, x: 260, y: 855, scaleX: 1.2, scaleY: 1.2, rotation: 0, opacity: 1, pose: 'walking', easing: 'linear' },
        { id: `kf_f2_${id}`, time: duration, x: 880, y: 855, scaleX: 1.2, scaleY: 1.2, rotation: 0, opacity: 1, pose: 'walking', easing: 'linear' },
      ],
    });
  } else if (!elements.some((e) => e.type === 'character')) {
    // Solitary wanderer default
    elements.push({
      id: `${id}_traveler`,
      name: 'Pengelana Siluet',
      type: 'character',
      subtype: 'traveler',
      x: 240,
      y: 860,
      scaleX: 1.25,
      scaleY: 1.25,
      rotation: 0,
      opacity: 1,
      blur: 0,
      shadowSoftness: 4,
      zIndex: 10,
      locked: false,
      visible: true,
      pose: 'walking',
      poseSpeed: 0.8,
      keyframes: [
        { id: `kf_t1_${id}`, time: 0, x: 180, y: 860, scaleX: 1.25, scaleY: 1.25, rotation: 0, opacity: 1, pose: 'walking', easing: 'linear' },
        { id: `kf_t2_${id}`, time: duration * 0.6, x: 620, y: 860, scaleX: 1.25, scaleY: 1.25, rotation: 0, opacity: 1, pose: 'looking_around', easing: 'easeInOut' },
        { id: `kf_t3_${id}`, time: duration, x: 860, y: 860, scaleX: 1.25, scaleY: 1.25, rotation: 0, opacity: 1, pose: 'standing', easing: 'easeInOut' },
      ],
    });
  }

  // Animals if mentioned or forest setting
  if (lower.includes('kuda') || lower.includes('horse')) {
    elements.push({
      id: `${id}_horse`,
      name: 'Kuda Desa',
      type: 'animal',
      subtype: 'horse',
      x: 200,
      y: 860,
      scaleX: 0.95,
      scaleY: 0.95,
      rotation: 0,
      opacity: 0.95,
      blur: 0.4,
      shadowSoftness: 4,
      zIndex: 6,
      locked: false,
      visible: true,
      keyframes: [],
    });
  } else if (lower.includes('rusa') || theme === 'forest') {
    elements.push({
      id: `${id}_stag`,
      name: 'Rusa Hutan',
      type: 'animal',
      subtype: 'stag',
      x: 520,
      y: 860,
      scaleX: 1.1,
      scaleY: 1.1,
      rotation: 0,
      opacity: 0.95,
      blur: 0.6,
      shadowSoftness: 5,
      zIndex: 5,
      locked: false,
      visible: true,
      keyframes: [
        { id: `kf_s1_${id}`, time: 0, x: 420, y: 860, scaleX: 1.1, scaleY: 1.1, rotation: 0, opacity: 0.9, easing: 'easeInOut' },
        { id: `kf_s2_${id}`, time: duration, x: 750, y: 860, scaleX: 1.1, scaleY: 1.1, rotation: 0, opacity: 0.95, easing: 'easeInOut' },
      ],
    });
  }

  return {
    id,
    name: title,
    version: 1,
    duration,
    fps: 24,
    width: 1920,
    height: 1080,
    background: {
      ...BACKGROUND_PRESETS[theme],
      brightness: 105,
      atmosphericFog: 40,
    },
    lighting: {
      ...LIGHTING_PRESETS[lightingPreset],
      intensity: 1.8,
      volumetric: 0.85,
    },
    atmosphere: {
      fog: { enabled: true, density: 0.45, speed: 0.8 },
      particles: { type: particleType, count: 40, speed: 1.0 },
      screenTexture: true,
    },
    elements,
  };
}

/**
 * Pre-crafted curated storytelling collections
 */
export const PRESET_STORY_PACKAGES: StoryPackage[] = [
  RORO_KIDUL_STORY_PACKAGE,
  TORAJA_STORY_PACKAGE,
  FORGOTTEN_VILLAGE_PACKAGE,
  {
    id: 'package_perjalanan_pegunungan',
    title: 'Perjalanan Menembus Puncak Kabut (24 Detik)',
    description: 'Kisah pendakian sunyi menuju puncak semesta melintasi jembatan kuno dan lembah berkabut fajar.',
    totalDuration: 24,
    acts: [
      {
        id: 'mtn_act_1',
        actNumber: 1,
        title: 'Bab 1: Lembah Berselimut Fajar (8s)',
        narration: 'Di kaki pegunungan sunyi, cahaya pertama membelah keheningan lembah purba.',
        duration: 8,
        scene: synthesizeSceneFromText('m_scene_1', 'Bab 1: Lembah Fajar', 'pegunungan berkabut di waktu fajar melintasi jembatan', 8),
      },
      {
        id: 'mtn_act_2',
        actNumber: 2,
        title: 'Bab 2: Jejak Sang Pendaki (8s)',
        narration: 'Langkah demi langkah di atas lereng bebatuan, ditemani elang yang melayang di angkasa luas.',
        duration: 8,
        scene: synthesizeSceneFromText('m_scene_2', 'Bab 2: Lereng Puncak', 'pendaki mendaki lereng gunung dan elang melayang tinggi', 8),
      },
      {
        id: 'mtn_act_3',
        actNumber: 3,
        title: 'Bab 3: Menatap Mentari Emas (8s)',
        narration: 'Hingga di puncak tertinggi, sang pengelana berdiri menatap semesta yang bermandikan cahaya.',
        duration: 8,
        scene: synthesizeSceneFromText('m_scene_3', 'Bab 3: Puncak Semesta', 'berdiri di puncak gunung menghadap mentari emas', 8),
      },
    ],
  },
  {
    id: 'package_hutan_misterius',
    title: 'Misteri Hutan Rimba Malam (20 Detik)',
    description: 'Penjelajahan malam hari di antara pohon beringin purba di bawah pancaran cahaya bulan perak.',
    totalDuration: 20,
    acts: [
      {
        id: 'for_act_1',
        actNumber: 1,
        title: 'Bab 1: Langkah Masuk ke Rimba Gelap (10s)',
        narration: 'Kala malam turun, bayangan pepohonan raksasa menyapa mereka yang berani melangkah masuk.',
        duration: 10,
        scene: synthesizeSceneFromText('f_scene_1', 'Bab 1: Pintu Rimba', 'hutan gelap malam hari pohon beringin cahaya bulan rusa berjalan', 10),
      },
      {
        id: 'for_act_2',
        actNumber: 2,
        title: 'Bab 2: Cahaya Menembus Daun (10s)',
        narration: 'Cahaya bulan perak menari di antara ranting dan semak belukar yang tak tersentuh waktu.',
        duration: 10,
        scene: synthesizeSceneFromText('f_scene_2', 'Bab 2: Altar Cahaya', 'pengelana di hutan malam melihat cahaya bulan dan rusa', 10),
      },
    ],
  },
];
