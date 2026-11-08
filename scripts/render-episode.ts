import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createCanvas } from '@napi-rs/canvas';
import ffmpegPath from 'ffmpeg-static';
import { TORAJA_STORY_PACKAGE } from '../src/engine/torajaStoryPackage';
import { TORAJA_SHORT_STORY_PACKAGE } from '../src/engine/shortTorajaEpisode';
import { RORO_KIDUL_STORY_PACKAGE } from '../src/engine/roroKidulStoryPackage';
import { RORO_KIDUL_SHORT_STORY_PACKAGE } from '../src/engine/shortRoroKidulEpisode';
import { ALAS_PURWO_STORY_PACKAGE } from '../src/engine/alasPurwoStoryPackage';
import { ALAS_PURWO_SHORT_STORY_PACKAGE } from '../src/engine/shortAlasPurwoEpisode';
import { ensureProceduralSfxFiles } from '../src/engine/proceduralAudio';
import { getRenderDuration } from '../src/engine/episodeTiming';
import { renderStoryFrame, renderPortraitStoryFrame } from '../src/engine/renderer';

const episodeId = process.argv[2] || 'episode-001';
const outputDir = path.resolve('renders');
const story = episodeId === 'episode-001'
  ? TORAJA_STORY_PACKAGE
  : episodeId === 'episode-001a'
    ? TORAJA_SHORT_STORY_PACKAGE
    : episodeId === 'episode-002'
      ? RORO_KIDUL_STORY_PACKAGE
      : episodeId === 'episode-002a'
        ? RORO_KIDUL_SHORT_STORY_PACKAGE
        : episodeId === 'episode-003'
          ? ALAS_PURWO_STORY_PACKAGE
          : episodeId === 'episode-003a'
            ? ALAS_PURWO_SHORT_STORY_PACKAGE
            : null;

if (!story?.episode) {
  throw new Error(`Episode tidak ditemukan: ${episodeId}`);
}

function readArchiveTitle(id: string, fallback: string): string {
  const metadataPath = path.resolve('episodes', id, '02-metadata-youtube.md');
  if (fs.existsSync(metadataPath)) {
    const metadata = fs.readFileSync(metadataPath, 'utf8');
    const titleMatch = metadata.match(/^\*\*Judul:\*\*\s*(.+)$/m);
    if (titleMatch?.[1]) return titleMatch[1].trim();
  }
  const episodeJsonPath = path.resolve('episodes', id, 'episode.json');
  if (fs.existsSync(episodeJsonPath)) {
    const data = JSON.parse(fs.readFileSync(episodeJsonPath, 'utf8')) as { title?: string };
    if (data.title) return data.title;
  }
  return fallback;
}

function safeFilename(title: string): string {
  return title
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '')
    .slice(0, 180);
}

const outputName = `${safeFilename(readArchiveTitle(episodeId, story.title))}.mp4`;
const outputPath = path.join(outputDir, outputName);

const isPortrait = story.episode.orientation === 'portrait';
const width = isPortrait ? 1080 : 1920;
const height = isPortrait ? 1920 : 1080;
const fps = 24;
const duration = getRenderDuration(story);
const testFrameLimit = Number(process.env.RENDER_MAX_FRAMES || 0);
const totalFrames = testFrameLimit > 0 ? Math.min(Math.ceil(duration * fps), testFrameLimit) : Math.ceil(duration * fps);
const outputDuration = totalFrames / fps;
const audioPath = path.resolve('public', story.episode.audioUrl.replace(/^\//, ''));

if (!fs.existsSync(audioPath)) {
  throw new Error(`File audio tidak ditemukan: ${audioPath}`);
}

fs.mkdirSync(outputDir, { recursive: true });
ensureProceduralSfxFiles();

const ffmpegArgs: string[] = [
  '-y',
  '-f', 'image2pipe',
  '-vcodec', 'png',
  '-framerate', String(fps),
  '-i', '-',
  '-itsoffset', String(story.episode.introDuration),
  '-i', audioPath,
];

const cues = story.episode.audioCues || [];
const validCues = cues.filter((c) => {
  const p = path.resolve('public', 'sfx', `${c.sfxType}.wav`);
  return fs.existsSync(p);
});

if (validCues.length > 0) {
  validCues.forEach((c) => {
    const sfxPath = path.resolve('public', 'sfx', `${c.sfxType}.wav`);
    ffmpegArgs.push('-i', sfxPath);
  });

  const filterParts: string[] = [];
  const mixInputs: string[] = ['[1:a]'];
  validCues.forEach((c, idx) => {
    const streamIdx = 2 + idx;
    const delayMs = Math.max(0, Math.round((c.time + story.episode!.introDuration) * 1000));
    const vol = c.volume ?? 0.3;
    filterParts.push(`[${streamIdx}:a]adelay=${delayMs}|${delayMs},volume=${vol}[sfx${idx}]`);
    mixInputs.push(`[sfx${idx}]`);
  });

  filterParts.push(`${mixInputs.join('')}amix=inputs=${mixInputs.length}:normalize=0[aout]`);
  ffmpegArgs.push(
    '-filter_complex', filterParts.join(';'),
    '-map', '0:v:0',
    '-map', '[aout]',
  );
} else {
  ffmpegArgs.push(
    '-map', '0:v:0',
    '-map', '1:a:0',
  );
}

ffmpegArgs.push(
  '-t', String(outputDuration),
  '-c:v', 'libx264',
  '-preset', 'veryfast',
  '-crf', '18',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-af', 'apad',
  '-movflags', '+faststart',
  outputPath,
);

const encoder = spawn(ffmpegPath || 'ffmpeg', ffmpegArgs, { stdio: ['pipe', 'ignore', 'pipe'] });

encoder.stderr.on('data', (chunk: Buffer) => {
  const message = chunk.toString();
  if (message.includes('Error') || message.includes('Invalid')) process.stderr.write(message);
});

// Reuse one native canvas for the entire sequence instead of allocating a
// new surface for every frame of a long episode.
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

for (let frame = 0; frame < totalFrames; frame += 1) {
  if (isPortrait) {
    renderPortraitStoryFrame(ctx as unknown as CanvasRenderingContext2D, story, frame / fps);
  } else {
    renderStoryFrame(ctx as unknown as CanvasRenderingContext2D, story, frame / fps, {
      showGizmos: false,
      showTitleCards: true,
    });
  }
  if (!encoder.stdin.write(canvas.toBuffer('image/png'))) {
    await new Promise<void>((resolve) => encoder.stdin.once('drain', resolve));
  }
  if (frame % fps === 0) {
    process.stdout.write(`PROGRESS ${((frame + 1) / totalFrames).toFixed(4)}\n`);
  }
}

encoder.stdin.end();
const exitCode = await new Promise<number>((resolve) => {
  encoder.on('close', (code) => resolve(code ?? 1));
});

if (exitCode !== 0) throw new Error(`FFmpeg gagal dengan kode ${exitCode}`);
process.stdout.write(`DONE ${outputPath}\n`);
