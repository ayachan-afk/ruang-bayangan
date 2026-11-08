import { StoryPackage, SceneProject } from '../types';
import {
  SCENE_TORAJA_ACT_1,
  SCENE_TORAJA_ACT_5,
  SCENE_TORAJA_ACT_6,
} from './torajaStoryPackage';

const makeScene = (source: SceneProject, id: string, name: string, duration: number, narration: string): SceneProject => ({
  ...source,
  id,
  name,
  duration,
  narration: { actTitle: name, text: narration },
});

const ACT_1_NARRATION = 'Dalam sebagian tradisi Toraja, seseorang yang meninggal tidak selalu langsung dimakamkan. Jenazah dapat tetap berada di rumah selama berbulan-bulan, bahkan bertahun-tahun.';
const ACT_2_NARRATION = 'Keluarga tetap memperlakukannya dengan hormat, seolah-olah ia masih menjadi bagian dari rumah tangga. Mereka menunggu hingga siap mengadakan Rambu Solo\', upacara pemakaman besar dengan berbagai ritual adat.';
const ACT_3_NARRATION = 'Bagi masyarakat Toraja, kematian bukan sekadar akhir kehidupan. Pemakaman adalah perjalanan penghormatan untuk mengantarkan orang yang dicintai menuju alam berikutnya.';

export const TORAJA_SHORT_STORY_PACKAGE: StoryPackage = {
  id: 'package_toraja_episode_001a',
  title: 'Mengapa Orang Toraja Tidak Langsung Memakamkan Orang yang Meninggal?',
  description: 'Versi singkat kisah tradisi pemakaman Toraja untuk Ruang Bayangan.',
  totalDuration: 48.039125,
  episode: {
    episodeNumber: 1,
    episodeId: 'episode-001a',
    orientation: 'portrait',
    audioUrl: '/episodes/episode-001a.mp3',
    audioDuration: 48.039125,
    introDuration: 0,
    outroDuration: 0,
  },
  acts: [
    {
      id: 'toraja_short_act_1',
      actNumber: 1,
      title: 'Bab 1: Masa Menunggu',
      narration: ACT_1_NARRATION,
      duration: 15,
      scene: makeScene(SCENE_TORAJA_ACT_1, 'scene_toraja_short_1', 'Bab 1: Masa Menunggu', 15, ACT_1_NARRATION),
    },
    {
      id: 'toraja_short_act_2',
      actNumber: 2,
      title: "Bab 2: Menanti Rambu Solo'",
      narration: ACT_2_NARRATION,
      duration: 17,
      scene: makeScene(SCENE_TORAJA_ACT_5, 'scene_toraja_short_2', "Bab 2: Menanti Rambu Solo'", 17, ACT_2_NARRATION),
    },
    {
      id: 'toraja_short_act_3',
      actNumber: 3,
      title: 'Bab 3: Perjalanan Penghormatan',
      narration: ACT_3_NARRATION,
      duration: 16.039125,
      scene: makeScene(SCENE_TORAJA_ACT_6, 'scene_toraja_short_3', 'Bab 3: Perjalanan Penghormatan', 16.039125, ACT_3_NARRATION),
    },
  ],
};
