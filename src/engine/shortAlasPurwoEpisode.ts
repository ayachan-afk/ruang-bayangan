/**
 * Story Package: "Rahasia di Balik Hutan Paling Angker di Tanah Jawa"
 * Episode 003A — Versi Short Portrait (9:16) untuk Ruang Bayangan
 *
 * Master Audio Aktual: 54.99 Detik
 * 6 Babak Sinematik Portrait 1080x1920
 * Dilengkapi Panggung Vertikal, Pencahayaan Lokal Logis, dan Spot SFX Prosedural
 */

import { StoryPackage, SceneProject } from '../types';
import { BACKGROUND_PRESETS, LIGHTING_PRESETS } from './assetLibrary';

const makePortraitPurwoScene = (
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
    ...BACKGROUND_PRESETS.forest,
    brightness: 88,
    atmosphericFog: 55,
    fogColor: '#1a524e',
    skyGradient: {
      top: '#01050b',
      mid: '#061c22',
      bottom: '#114a44',
    },
  },
  lighting: {
    ...LIGHTING_PRESETS.moonlight,
    x: 50,
    y: 20,
    intensity: 1.35,
    color: '#8fe0d2',
  },
  atmosphere: {
    fog: { enabled: true, density: 0.45, speed: 0.3 },
    particles: { type: 'dust', count: 30, speed: 0.4 },
    screenTexture: false,
  },
  elements: [],
});

export const ALAS_PURWO_SHORT_STORY_PACKAGE: StoryPackage = {
  id: 'package_alas_purwo_episode_003a',
  title: 'Rahasia di Balik Hutan Paling Angker di Tanah Jawa',
  description: 'Versi short portrait kisah legenda hutan purba tertua tanah Jawa dan kearifan konservasi leluhur.',
  totalDuration: 54.99,
  episode: {
    episodeNumber: 3,
    episodeId: 'episode-003a',
    orientation: 'portrait',
    audioUrl: '/episodes/episode-003a.mp3',
    audioDuration: 54.99,
    introDuration: 0,
    outroDuration: 0,
    audioCues: [
      { time: 10.0, word: 'Alas Purwo', sfxType: 'sacred_bell', volume: 0.35 },
      { time: 18.0, word: 'bisikan namamu di antara kabut tebal', sfxType: 'mystic_whoosh', volume: 0.3 },
      { time: 27.0, word: 'rahasia agung para leluhur', sfxType: 'warm_hearth', volume: 0.28 },
      { time: 31.0, word: 'benteng perlindungan', sfxType: 'deep_sub_drone', volume: 0.35 },
      { time: 38.0, word: 'satwa liar tetap lestari', sfxType: 'nature_shimmer', volume: 0.25 },
      { time: 49.0, word: 'mengetahui batas diri', sfxType: 'ocean_wind_swell', volume: 0.32 },
    ],
  },
  acts: [
    {
      id: 'purwo_short_act_1',
      actNumber: 1,
      title: 'Bab 1: Rimba Purba Pertama',
      narration: 'Di ujung timur Pulau Jawa, ada hutan purba yang dipercaya sebagai tanah pertama yang tercipta saat Jawa bangkit dari samudra: Alas Purwo.',
      duration: 12.0,
      scene: makePortraitPurwoScene(
        'scene_purwo_short_1',
        'Bab 1: Rimba Purba Pertama',
        12.0,
        'Di ujung timur Pulau Jawa, ada hutan purba yang dipercaya sebagai tanah pertama yang tercipta saat Jawa bangkit dari samudra: Alas Purwo.',
      ),
    },
    {
      id: 'purwo_short_act_2',
      actNumber: 2,
      title: 'Bab 2: Pantangan & Bisikan Gaib',
      narration: 'Dikenal sebagai pusat kerajaan gaib terbesar, ada satu pantangan keras: jangan bersikap sombong, dan jangan menoleh jika mendengar bisikan namamu di antara kabut tebal.',
      duration: 12.0,
      scene: makePortraitPurwoScene(
        'scene_purwo_short_2',
        'Bab 2: Pantangan & Bisikan Gaib',
        12.0,
        'Dikenal sebagai pusat kerajaan gaib terbesar, ada satu pantangan keras: jangan bersikap sombong, dan jangan menoleh jika mendengar bisikan namamu di antara kabut tebal.',
      ),
    },
    {
      id: 'purwo_short_act_3',
      actNumber: 3,
      title: 'Bab 3: Rahasia Para Leluhur',
      narration: 'Namun di balik kisah mistis itu, tersimpan rahasia agung para leluhur.',
      duration: 6.0,
      scene: makePortraitPurwoScene(
        'scene_purwo_short_3',
        'Bab 3: Rahasia Para Leluhur',
        6.0,
        'Namun di balik kisah mistis itu, tersimpan rahasia agung para leluhur.',
      ),
    },
    {
      id: 'purwo_short_act_4',
      actNumber: 4,
      title: 'Bab 4: Benteng Perlindungan',
      narration: 'Mitos ini adalah benteng perlindungan.',
      duration: 3.0,
      scene: makePortraitPurwoScene(
        'scene_purwo_short_4',
        'Bab 4: Benteng Perlindungan',
        3.0,
        'Mitos ini adalah benteng perlindungan.',
      ),
    },
    {
      id: 'purwo_short_act_5',
      actNumber: 5,
      title: 'Bab 5: Pohon Raksasa & Satwa Lestari',
      narration: 'Rasa takut dan hormat inilah yang menjaga pohon-pohon raksasa tetap tegak, dan satwa liar tetap lestari dari keserakahan manusia selama ratusan tahun.',
      duration: 11.0,
      scene: makePortraitPurwoScene(
        'scene_purwo_short_5',
        'Bab 5: Pohon Raksasa & Satwa Lestari',
        11.0,
        'Rasa takut dan hormat inilah yang menjaga pohon-pohon raksasa tetap tegak, dan satwa liar tetap lestari dari keserakahan manusia selama ratusan tahun.',
      ),
    },
    {
      id: 'purwo_short_act_6',
      actNumber: 6,
      title: 'Bab 6: Kearifan Batas Diri',
      narration: 'Sebuah pelajaran kuno dari rimba pertama: kekuatan terbesar bukanlah menaklukkan alam, melainkan mengetahui batas diri saat melangkah di dalamnya.',
      duration: 10.99,
      scene: makePortraitPurwoScene(
        'scene_purwo_short_6',
        'Bab 6: Kearifan Batas Diri',
        10.99,
        'Sebuah pelajaran kuno dari rimba pertama: kekuatan terbesar bukanlah menaklukkan alam, melainkan mengetahui batas diri saat melangkah di dalamnya.',
      ),
    },
  ],
};
