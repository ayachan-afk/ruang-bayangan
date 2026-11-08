/**
 * Procedural Audio Synthesizer for Ruang Bayangan
 * 100% royalty-free, copyright-free sound design generated entirely from mathematical formulas.
 * Synthesizes 16-bit PCM WAV audio for sacred bells, mystical wind whooshes, sub-drones, and ambient textures.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface AudioCue {
  time: number;
  word: string;
  sfxType: 'sacred_bell' | 'mystic_whoosh' | 'warm_hearth' | 'deep_sub_drone' | 'nature_shimmer' | 'ocean_wind_swell';
  volume?: number;
}

/**
 * Creates a standard 44.1kHz 16-bit Stereo PCM WAV buffer from float samples (-1.0 to 1.0)
 */
export function createWavBuffer(sampleRate: number, samplesL: Float32Array, samplesR: Float32Array): Buffer {
  const numSamples = samplesL.length;
  const buffer = Buffer.alloc(44 + numSamples * 4);

  // RIFF Chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 4, 4);
  buffer.write('WAVE', 8);

  // fmt Subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);          // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);           // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(2, 22);           // NumChannels (2 = Stereo)
  buffer.writeUInt32LE(sampleRate, 24);  // SampleRate
  buffer.writeUInt32LE(sampleRate * 4, 28); // ByteRate (SampleRate * 2 * 2)
  buffer.writeUInt16LE(4, 32);           // BlockAlign (NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(16, 34);          // BitsPerSample (16-bit)

  // data Subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 4, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i += 1) {
    const sL = Math.max(-1, Math.min(1, samplesL[i]));
    const sR = Math.max(-1, Math.min(1, samplesR[i]));
    buffer.writeInt16LE(Math.round(sL * 32767), offset);
    buffer.writeInt16LE(Math.round(sR * 32767), offset + 2);
    offset += 4;
  }

  return buffer;
}

/**
 * 1. Sacred Temple Bell / Singing Bowl (Denting Genta Keramat)
 * Rich fundamental frequency with harmonic resonance and slow exponential decay.
 */
export function generateSacredBell(durationSeconds = 4.5, sampleRate = 44100): Buffer {
  const totalSamples = Math.floor(durationSeconds * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const f0 = 216; // Sacred tuning A3 / low C# resonance
  const partials = [
    { freq: f0, amp: 0.55, decay: 2.2 },
    { freq: f0 * 2.01, amp: 0.28, decay: 1.8 },
    { freq: f0 * 3.02, amp: 0.16, decay: 1.2 },
    { freq: f0 * 4.18, amp: 0.08, decay: 0.8 },
    { freq: f0 * 5.43, amp: 0.04, decay: 0.5 },
  ];

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    let sample = 0;

    // Strike attack envelope (instant attack, slow decay)
    const attack = Math.min(1, t / 0.008);

    for (const p of partials) {
      // Subtle beating / chorus between stereo channels
      const beatL = Math.sin(2 * Math.PI * (p.freq - 0.5) * t);
      const beatR = Math.sin(2 * Math.PI * (p.freq + 0.5) * t);
      const env = Math.exp(-t / p.decay);

      left[i] += (beatL * p.amp * env * attack) * 0.7;
      right[i] += (beatR * p.amp * env * attack) * 0.7;
    }
  }

  return createWavBuffer(sampleRate, left, right);
}

/**
 * 2. Mystic Whoosh / Wind Transition (Hembusan Angin Gaib)
 * Filtered white noise with dynamic resonant sweep and smooth stereo panning.
 */
export function generateMysticWhoosh(durationSeconds = 3.5, sampleRate = 44100): Buffer {
  const totalSamples = Math.floor(durationSeconds * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  let noiseState = 0;
  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    // Bell curve amplitude envelope
    const env = Math.sin((t / durationSeconds) * Math.PI);

    // Simple pseudo-random noise generator with gentle low-pass smoothing
    const white = (Math.random() * 2 - 1);
    noiseState = noiseState * 0.94 + white * 0.06;

    // Resonant harmonic sweep (240Hz to 680Hz and down)
    const sweepFreq = 240 + Math.sin((t / durationSeconds) * Math.PI) * 440;
    const tone = Math.sin(2 * Math.PI * sweepFreq * t) * 0.18;

    const signal = (noiseState * 0.8 + tone) * env * 0.65;
    const pan = t / durationSeconds; // Left to right drift

    left[i] = signal * (1 - pan * 0.4);
    right[i] = signal * (0.6 + pan * 0.4);
  }

  return createWavBuffer(sampleRate, left, right);
}

/**
 * 3. Warm Hearth / Sacred Incense (Kehangatan Dupa & Perapian)
 * Warm pentatonic chord with subtle crackle bursts and soft drone.
 */
export function generateWarmHearth(durationSeconds = 4.0, sampleRate = 44100): Buffer {
  const totalSamples = Math.floor(durationSeconds * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const notes = [220, 277.18, 329.63]; // A major warm triad

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    // Swell envelope: fade in 0.8s, sustain, fade out 1.2s
    const env = Math.sin(Math.min(1, t / 0.8) * Math.PI * 0.5) *
                Math.sin(Math.min(1, (durationSeconds - t) / 1.2) * Math.PI * 0.5);

    let chord = 0;
    for (const [idx, freq] of notes.entries()) {
      chord += Math.sin(2 * Math.PI * (freq + idx * 0.3) * t) * 0.12;
    }

    // Occasional gentle crackle
    const crackle = Math.random() < 0.0008 ? (Math.random() * 0.3 - 0.15) : 0;

    left[i] = (chord + crackle) * env * 0.7;
    right[i] = (chord + crackle * 0.8) * env * 0.7;
  }

  return createWavBuffer(sampleRate, left, right);
}

/**
 * 4. Deep Sub Drone (Dengungan Mistis Frekuensi Rendah)
 * Heavy cinematic sub-bass rumble (55Hz - 65Hz) with subtle harmonic saturation.
 */
export function generateDeepSubDrone(durationSeconds = 4.5, sampleRate = 44100): Buffer {
  const totalSamples = Math.floor(durationSeconds * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const f0 = 55; // A1 low bass

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    const env = Math.sin((t / durationSeconds) * Math.PI);

    // Fundamental + subtle 2nd harmonic + vibrato
    const vibrato = Math.sin(2 * Math.PI * 0.8 * t) * 1.5;
    const fundamental = Math.sin(2 * Math.PI * (f0 + vibrato) * t);
    const harmonic = Math.sin(2 * Math.PI * (f0 * 2) * t) * 0.22;

    const bass = (fundamental + harmonic) * env * 0.75;
    left[i] = bass;
    right[i] = bass;
  }

  return createWavBuffer(sampleRate, left, right);
}

/**
 * 5. Nature Shimmer (Pendaran Embun & Angin Pagi)
 * Gentle high-frequency resonance evoking early morning stillness in the savanna.
 */
export function generateNatureShimmer(durationSeconds = 3.5, sampleRate = 44100): Buffer {
  const totalSamples = Math.floor(durationSeconds * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const frequencies = [528, 660, 792]; // Solfeggio 528Hz harmonious interval

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    const env = Math.sin((t / durationSeconds) * Math.PI);

    let shimmer = 0;
    for (const freq of frequencies) {
      shimmer += Math.sin(2 * Math.PI * freq * t) * 0.1;
    }

    left[i] = shimmer * env * 0.55;
    right[i] = shimmer * env * 0.55;
  }

  return createWavBuffer(sampleRate, left, right);
}

/**
 * 6. Ocean Wind Swell (Desau Angin Samudra Selatan)
 * Low rolling wave sound with fading soft chime tone.
 */
export function generateOceanWindSwell(durationSeconds = 5.0, sampleRate = 44100): Buffer {
  const totalSamples = Math.floor(durationSeconds * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  let noiseL = 0;
  let noiseR = 0;

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    const env = Math.sin((t / durationSeconds) * Math.PI);

    // Low-passed ocean surge noise
    noiseL = noiseL * 0.98 + (Math.random() * 2 - 1) * 0.02;
    noiseR = noiseR * 0.98 + (Math.random() * 2 - 1) * 0.02;

    // Distant bell harmonic in the swell
    const bell = Math.sin(2 * Math.PI * 329.63 * t) * Math.exp(-t / 2.0) * 0.12;

    left[i] = (noiseL * 2.8 + bell) * env * 0.65;
    right[i] = (noiseR * 2.8 + bell) * env * 0.65;
  }

  return createWavBuffer(sampleRate, left, right);
}

/**
 * Ensures all procedural SFX WAV files exist in public/sfx and dist/sfx
 */
export function ensureProceduralSfxFiles(baseDir = 'public/sfx'): Record<string, string> {
  const targetDir = path.resolve(baseDir);
  fs.mkdirSync(targetDir, { recursive: true });

  const sfxFiles: Record<string, () => Buffer> = {
    'sacred_bell.wav': () => generateSacredBell(4.5),
    'mystic_whoosh.wav': () => generateMysticWhoosh(3.5),
    'warm_hearth.wav': () => generateWarmHearth(4.0),
    'deep_sub_drone.wav': () => generateDeepSubDrone(4.5),
    'nature_shimmer.wav': () => generateNatureShimmer(3.5),
    'ocean_wind_swell.wav': () => generateOceanWindSwell(5.0),
  };

  const paths: Record<string, string> = {};
  for (const [filename, generator] of Object.entries(sfxFiles)) {
    const filePath = path.join(targetDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, generator());
    }
    paths[filename.replace('.wav', '')] = filePath;
  }

  // Also copy to dist/sfx if dist exists
  const distDir = path.resolve('dist', 'sfx');
  if (fs.existsSync(path.resolve('dist'))) {
    fs.mkdirSync(distDir, { recursive: true });
    for (const filename of Object.keys(sfxFiles)) {
      const src = path.join(targetDir, filename);
      const dst = path.join(distDir, filename);
      if (fs.existsSync(src) && !fs.existsSync(dst)) {
        fs.copyFileSync(src, dst);
      }
    }
  }

  return paths;
}
