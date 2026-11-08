/**
 * Story Package: "Kenapa Dilarang Pakai Baju Hijau di Pantai Selatan?"
 * Episode 002A — Versi Short Portrait (9:16) untuk Ruang Bayangan
 *
 * Durasi Master Audio Aktual: 58.44 Detik
 * 8 Babak Sinematik Portrait 1080x1920
 */

import { StoryPackage, SceneProject } from '../types';
import { BACKGROUND_PRESETS, LIGHTING_PRESETS } from './assetLibrary';

const makePortraitScene = (
  id: string,
  name: string,
  duration: number,
  narration: string,
): SceneProject => ({
  id,
  name,
  version: 1,
  duration,
  fps: 24,
  width: 1080,
  height: 1920,
  narration: { actTitle: name, text: narration },
  background: {
    ...BACKGROUND_PRESETS.ocean,
    brightness: 90,
    atmosphericFog: 45,
    fogColor: '#2b8478',
    skyGradient: {
      top: '#030c16',
      mid: '#0c3543',
      bottom: '#1d6f64',
    },
  },
  lighting: {
    ...LIGHTING_PRESETS.moonlight,
    x: 50,
    y: 22,
    intensity: 1.25,
    color: '#8fe3d4',
  },
  atmosphere: {
    fog: { enabled: true, density: 0.4, speed: 0.35 },
    particles: { type: 'embers', count: 25, speed: 0.5 },
    screenTexture: false,
  },
  elements: [],
});

export const RORO_KIDUL_SHORT_STORY_PACKAGE: StoryPackage = {
  id: 'package_roro_kidul_episode_002a',
  title: 'Kenapa Dilarang Pakai Baju Hijau di Pantai Selatan?',
  description: 'Versi short portrait kisah legenda Nyai Roro Kidul dan misteri baju hijau di pantai selatan Jawa.',
  totalDuration: 58.44,
  episode: {
    episodeNumber: 2,
    episodeId: 'episode-002a',
    orientation: 'portrait',
    audioUrl: '/episodes/episode-002a.mp3',
    audioDuration: 58.44,
    introDuration: 0,
    outroDuration: 0,
  },
  acts: [
    {
      id: 'roro_short_act_1',
      actNumber: 1,
      title: 'Bab 1: Pantangan Turun-Temurun',
      narration: 'Di sepanjang pantai selatan Jawa, ada satu pantangan yang diwariskan turun-temurun: jangan pernah memakai pakaian berwarna hijau.',
      duration: 9.0,
      scene: makePortraitScene(
        'scene_roro_short_1',
        'Bab 1: Pantangan Turun-Temurun',
        9.0,
        'Di sepanjang pantai selatan Jawa, ada satu pantangan yang diwariskan turun-temurun: jangan pernah memakai pakaian berwarna hijau.',
      ),
    },
    {
      id: 'roro_short_act_2',
      actNumber: 2,
      title: 'Bab 2: Warna Sang Ratu',
      narration: 'Mitosnya, hijau adalah warna kesukaan Nyai Roro Kidul — sang Ratu penguasa laut selatan.',
      duration: 7.0,
      scene: makePortraitScene(
        'scene_roro_short_2',
        'Bab 2: Warna Sang Ratu',
        7.0,
        'Mitosnya, hijau adalah warna kesukaan Nyai Roro Kidul — sang Ratu penguasa laut selatan.',
      ),
    },
    {
      id: 'roro_short_act_3',
      actNumber: 3,
      title: 'Bab 3: Ditelan Ombak Laut Kidul',
      narration: 'Siapa pun yang melanggarnya dipercaya akan ditelan ombak untuk dijadikan abdi kerajaannya.',
      duration: 7.0,
      scene: makePortraitScene(
        'scene_roro_short_3',
        'Bab 3: Ditelan Ombak Laut Kidul',
        7.0,
        'Siapa pun yang melanggarnya dipercaya akan ditelan ombak untuk dijadikan abdi kerajaannya.',
      ),
    },
    {
      id: 'roro_short_act_4',
      actNumber: 4,
      title: 'Bab 4: Di Balik Kabut Misteri',
      narration: 'Namun di balik kabut misteri itu, tersimpan alasan penyelamat nyawa.',
      duration: 6.0,
      scene: makePortraitScene(
        'scene_roro_short_4',
        'Bab 4: Di Balik Kabut Misteri',
        6.0,
        'Namun di balik kabut misteri itu, tersimpan alasan penyelamat nyawa.',
      ),
    },
    {
      id: 'roro_short_act_5',
      actNumber: 5,
      title: 'Bab 5: Arus Balik Mematikan',
      narration: 'Ombak pantai selatan terkenal ganas dengan arus balik mematikan.',
      duration: 5.0,
      scene: makePortraitScene(
        'scene_roro_short_5',
        'Bab 5: Arus Balik Mematikan',
        5.0,
        'Ombak pantai selatan terkenal ganas dengan arus balik mematikan.',
      ),
    },
    {
      id: 'roro_short_act_6',
      actNumber: 6,
      title: 'Bab 6: Kamuflase Air Laut & Tim Penyelamat',
      narration: 'Di tengah keruhnya air laut dan buih ombak yang kehijauan, warna hijau membuat korban tenggelam nyaris mustahil terlihat oleh tim penyelamat.',
      duration: 11.0,
      scene: makePortraitScene(
        'scene_roro_short_6',
        'Bab 6: Kamuflase Air Laut & Tim Penyelamat',
        11.0,
        'Di tengah keruhnya air laut dan buih ombak yang kehijauan, warna hijau membuat korban tenggelam nyaris mustahil terlihat oleh tim penyelamat.',
      ),
    },
    {
      id: 'roro_short_act_7',
      actNumber: 7,
      title: 'Bab 7: Kearifan Leluhur',
      narration: 'Leluhur kita memilih membungkus pesan keselamatan ke dalam mitos, agar pantangan ini diingat selama ratusan tahun.',
      duration: 8.0,
      scene: makePortraitScene(
        'scene_roro_short_7',
        'Bab 7: Kearifan Leluhur',
        8.0,
        'Leluhur kita memilih membungkus pesan keselamatan ke dalam mitos, agar pantangan ini diingat selama ratusan tahun.',
      ),
    },
    {
      id: 'roro_short_act_8',
      actNumber: 8,
      title: 'Bab 8: Di Hadapan Alam',
      narration: 'Sebuah pengingat sederhana: di hadapan alam, manusia hanyalah tamu.',
      duration: 5.44,
      scene: makePortraitScene(
        'scene_roro_short_8',
        'Bab 8: Di Hadapan Alam',
        5.44,
        'Sebuah pengingat sederhana: di hadapan alam, manusia hanyalah tamu.',
      ),
    },
  ],
};
