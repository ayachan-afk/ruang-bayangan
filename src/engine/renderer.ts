/**
 * Shadow Theater Studio - High-Performance Canvas Rendering Engine
 * Authentic Backlit Silhouette Theater (Kelir Bercahaya)
 */

import { SceneProject, SceneElement, Keyframe, LimbAngles, StoryPackage } from '../types';
import { getActAtContentTime, getContentTime, getIntroDuration, getRenderDuration } from './episodeTiming';
import { calculateLimbAngles, drawArticulatedCharacter, drawArticulatedAnimal } from './characterRig';
import { drawStaticSilhouette } from './assetLibrary';

/**
 * Interpolates numeric keyframe values with easing curves
 */
export function interpolateKeyframes(
  keyframes: Keyframe[],
  time: number,
  fallback: { x: number; y: number; scaleX: number; scaleY: number; rotation: number; opacity: number; pose?: string }
) {
  if (!keyframes || keyframes.length === 0) {
    return fallback;
  }

  // Sort keyframes by time
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  // Before first keyframe
  if (time <= sorted[0].time) {
    return {
      x: sorted[0].x,
      y: sorted[0].y,
      scaleX: sorted[0].scaleX,
      scaleY: sorted[0].scaleY,
      rotation: sorted[0].rotation,
      opacity: sorted[0].opacity,
      pose: sorted[0].pose || fallback.pose,
    };
  }

  // After last keyframe
  if (time >= sorted[sorted.length - 1].time) {
    const last = sorted[sorted.length - 1];
    return {
      x: last.x,
      y: last.y,
      scaleX: last.scaleX,
      scaleY: last.scaleY,
      rotation: last.rotation,
      opacity: last.opacity,
      pose: last.pose || fallback.pose,
    };
  }

  // Find bounding keyframes
  let prev = sorted[0];
  let next = sorted[1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i].time && time <= sorted[i + 1].time) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }

  const duration = next.time - prev.time;
  if (duration <= 0) {
    return prev;
  }

  let progress = (time - prev.time) / duration;

  // Apply easing
  const easing = prev.easing || 'easeInOut';
  if (easing === 'easeInOut') {
    progress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  } else if (easing === 'easeIn') {
    progress = progress * progress;
  } else if (easing === 'easeOut') {
    progress = 1 - (1 - progress) * (1 - progress);
  }

  return {
    x: prev.x + (next.x - prev.x) * progress,
    y: prev.y + (next.y - prev.y) * progress,
    scaleX: prev.scaleX + (next.scaleX - prev.scaleX) * progress,
    scaleY: prev.scaleY + (next.scaleY - prev.scaleY) * progress,
    rotation: prev.rotation + (next.rotation - prev.rotation) * progress,
    opacity: prev.opacity + (next.opacity - prev.opacity) * progress,
    pose: progress < 0.5 ? (prev.pose || fallback.pose) : (next.pose || prev.pose || fallback.pose),
  };
}

/**
 * Get state of an element at a given timestamp
 */
export function getElementStateAtTime(element: SceneElement, time: number) {
  return interpolateKeyframes(element.keyframes, time, {
    x: element.x,
    y: element.y,
    scaleX: element.scaleX,
    scaleY: element.scaleY,
    rotation: element.rotation,
    opacity: element.opacity,
    pose: element.pose,
  });
}

export interface RenderOptions {
  selectedElementId?: string | null;
  showGizmos?: boolean;
  scale?: number;
  viewportOffset?: { x: number; y: number };
  isDraftPreview?: boolean;
}

export interface EpisodeRenderOptions extends RenderOptions {
  showTitleCards?: boolean;
  logoImage?: CanvasImageSource;
}

/** Render a complete episode timeline, including lightweight title cards. */
export function renderStoryFrame(
  ctx: CanvasRenderingContext2D,
  story: StoryPackage,
  renderTime: number,
  options: EpisodeRenderOptions = {},
) {
  const safeTime = Math.max(0, Math.min(getRenderDuration(story), renderTime));
  const intro = getIntroDuration(story);
  const outroStart = intro + story.totalDuration;
  const showTitleCards = options.showTitleCards ?? true;

  if (showTitleCards && intro > 0 && safeTime < intro) {
    drawEpisodeCard(ctx, story, 'intro', safeTime / Math.max(intro, 0.001), options.logoImage);
    return;
  }

  if (showTitleCards && getRenderDuration(story) > outroStart && safeTime >= outroStart) {
    drawEpisodeCard(ctx, story, 'outro', (safeTime - outroStart) / Math.max(getRenderDuration(story) - outroStart, 0.001), options.logoImage);
    return;
  }

  const contentTime = getContentTime(story, safeTime);
  const active = getActAtContentTime(story, contentTime);
  if (active.act) {
    renderShadowScene(ctx, active.act.scene, active.localTime, options);
  }
}

/**
 * Portrait composition built specifically for short-form episodes.
 * This is intentionally independent from the landscape scene assets.
 */
export function renderPortraitStoryFrame(
  ctx: CanvasRenderingContext2D,
  story: StoryPackage,
  renderTime: number,
) {
  const contentTime = getContentTime(story, renderTime);
  const active = getActAtContentTime(story, contentTime);
  const actIndex = active.index;
  const time = active.localTime;

  if (story.episode?.episodeId === 'episode-002a' || story.id.includes('roro_kidul')) {
    renderPortraitRoroKidulStoryFrame(ctx, story, renderTime, actIndex, time);
    return;
  }

  if (story.episode?.episodeId === 'episode-003a' || story.id.includes('alas_purwo')) {
    renderPortraitAlasPurwoStoryFrame(ctx, story, renderTime, actIndex, time);
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, 1920);
  sky.addColorStop(0, actIndex === 2 ? '#080d22' : '#1d1732');
  sky.addColorStop(0.45, actIndex === 2 ? '#273d63' : '#8f4f61');
  sky.addColorStop(0.72, actIndex === 2 ? '#52647a' : '#e19a66');
  sky.addColorStop(1, '#0a0b16');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1080, 1920);

  drawPortraitClouds(ctx, time, actIndex);
  drawPortraitMoonOrSun(ctx, actIndex, time);

  if (actIndex === 0) drawPortraitWaitingHouse(ctx, time);
  if (actIndex === 1) drawPortraitFuneralCeremony(ctx, time);
  if (actIndex === 2) drawPortraitCliffJourney(ctx, time);

  drawPortraitVignette(ctx);
}

function drawPortraitClouds(ctx: CanvasRenderingContext2D, time: number, actIndex: number) {
  ctx.save();
  ctx.globalAlpha = actIndex === 2 ? 0.22 : 0.3;
  ctx.fillStyle = actIndex === 2 ? '#a8bad1' : '#f3b08b';
  for (let i = 0; i < 6; i += 1) {
    const x = ((i * 245 + time * (8 + i)) % 1320) - 120;
    const y = 260 + (i % 3) * 135;
    ctx.beginPath();
    ctx.ellipse(x, y, 190, 42, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 115, y - 20, 125, 52, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 105, y + 8, 115, 34, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPortraitMoonOrSun(ctx: CanvasRenderingContext2D, actIndex: number, time: number) {
  const x = 770 + Math.sin(time * 0.15) * 18;
  const y = actIndex === 2 ? 290 : 610;
  const radius = actIndex === 2 ? 54 : 78;
  const glow = ctx.createRadialGradient(x, y, 8, x, y, radius * 4);
  glow.addColorStop(0, actIndex === 2 ? 'rgba(176, 207, 255, 0.6)' : 'rgba(255, 215, 143, 0.65)');
  glow.addColorStop(1, 'rgba(255, 190, 130, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - radius * 4, y - radius * 4, radius * 8, radius * 8);
  ctx.fillStyle = actIndex === 2 ? '#dcecff' : '#ffe5a8';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawPortraitMountainLayers(ctx: CanvasRenderingContext2D, top: number) {
  const layers = [
    { color: 'rgba(67, 55, 85, 0.72)', rise: 180 },
    { color: 'rgba(43, 42, 67, 0.88)', rise: 120 },
    { color: '#111522', rise: 70 },
  ];
  layers.forEach((layer, index) => {
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(0, top + 210);
    ctx.lineTo(145, top + 70 - index * 20);
    ctx.lineTo(305, top + 150 - index * 5);
    ctx.lineTo(485, top - layer.rise);
    ctx.lineTo(650, top + 120);
    ctx.lineTo(820, top - layer.rise * 0.6);
    ctx.lineTo(1080, top + 90);
    ctx.lineTo(1080, 1920);
    ctx.lineTo(0, 1920);
    ctx.closePath();
    ctx.fill();
  });
}

function drawPortraitStaticAsset(
  ctx: CanvasRenderingContext2D,
  subtype: string,
  x: number,
  y: number,
  scale: number,
  time: number,
  color = '#09080b',
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawStaticSilhouette(ctx, subtype, time, color);
  ctx.restore();
}

function drawPortraitCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  pose: string,
  time: number,
  subtype = 'traveler',
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const limbs = calculateLimbAngles(pose as any, time, 0.65);
  drawArticulatedCharacter(ctx, subtype, limbs, { color: '#09080b' });
  ctx.restore();
}

function drawPortraitWaitingHouse(ctx: CanvasRenderingContext2D, time: number) {
  drawPortraitMountainLayers(ctx, 1180);
  drawPortraitStaticAsset(ctx, 'tongkonan', 540, 1580, 2.25, time);
  drawPortraitStaticAsset(ctx, 'alang_rice_barn', 260, 1630, 1.55, time);
  ctx.fillStyle = 'rgba(245, 173, 82, 0.85)';
  ctx.shadowColor = '#ffb85c';
  ctx.shadowBlur = 36;
  ctx.fillRect(470, 1350, 140, 160);
  ctx.shadowBlur = 0;
  drawPortraitStaticAsset(ctx, 'twisted_tree', 885, 1670, 1.25, time);
  ctx.fillStyle = '#090b13';
  ctx.beginPath();
  ctx.moveTo(0, 1590);
  ctx.quadraticCurveTo(300, 1500, 540, 1600);
  ctx.quadraticCurveTo(820, 1510, 1080, 1600);
  ctx.lineTo(1080, 1920); ctx.lineTo(0, 1920); ctx.closePath(); ctx.fill();
  drawPortraitEmbers(ctx, time, 8);
}

function drawPortraitFuneralCeremony(ctx: CanvasRenderingContext2D, time: number) {
  drawPortraitMountainLayers(ctx, 1060);
  drawPortraitStaticAsset(ctx, 'tongkonan', 540, 1430, 2.15, time);
  drawPortraitStaticAsset(ctx, 'alang_rice_barn', 180, 1510, 1.15, time);
  drawPortraitStaticAsset(ctx, 'alang_rice_barn', 900, 1510, 1.15, time);
  ctx.fillStyle = '#090a10';
  ctx.fillRect(185, 1450, 710, 40);
  ctx.fillStyle = '#b76842';
  ctx.fillRect(370, 1370, 340, 72);
  ctx.fillStyle = '#11121a';
  ctx.fillRect(395, 1345, 290, 30);
  drawPortraitCharacter(ctx, 150, 1770, 0.9, 'standing', time, 'elder');
  drawPortraitCharacter(ctx, 340, 1770, 0.92, 'raising_hands', time + 0.5, 'dancer');
  drawPortraitCharacter(ctx, 540, 1770, 0.92, 'standing', time + 1, 'traveler');
  drawPortraitCharacter(ctx, 740, 1770, 0.92, 'raising_hands', time + 1.5, 'dancer');
  drawPortraitCharacter(ctx, 930, 1770, 0.9, 'standing', time + 2, 'elder');
  drawPortraitStaticAsset(ctx, 'ceremonial_torch', 70, 1830, 1.2, time);
  drawPortraitStaticAsset(ctx, 'ceremonial_torch', 1010, 1830, 1.2, time + 1.5);
  drawPortraitEmbers(ctx, time, 14);
}

function drawPortraitCliffJourney(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#10182a';
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(370, 0); ctx.lineTo(520, 420); ctx.lineTo(410, 830); ctx.lineTo(600, 1200); ctx.lineTo(440, 1920); ctx.lineTo(0, 1920); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1c2a3e';
  ctx.beginPath();
  ctx.moveTo(1080, 500); ctx.lineTo(820, 620); ctx.lineTo(700, 1040); ctx.lineTo(880, 1410); ctx.lineTo(740, 1920); ctx.lineTo(1080, 1920); ctx.closePath(); ctx.fill();
  drawPortraitStaticAsset(ctx, 'toraja_cliff', 135, 1520, 2.35, time);
  drawPortraitStaticAsset(ctx, 'toraja_cliff', 755, 1290, 1.55, time);
  drawPortraitStaticAsset(ctx, 'twisted_tree', 900, 1780, 1.1, time);
  ctx.strokeStyle = '#0a0d17';
  ctx.lineWidth = 32;
  ctx.beginPath(); ctx.moveTo(830, 1920); ctx.quadraticCurveTo(690, 1510, 520, 1300); ctx.quadraticCurveTo(410, 1110, 350, 890); ctx.stroke();
  const processionX = 690 - Math.min(time * 18, 270);
  drawPortraitCharacter(ctx, processionX, 1640, 0.72, 'walking', time, 'scout');
  drawPortraitCharacter(ctx, processionX + 100, 1570, 0.72, 'walking', time + 0.4, 'traveler');
  drawPortraitCharacter(ctx, processionX + 200, 1510, 0.72, 'walking', time + 0.8, 'traveler');
  for (let i = 0; i < 26; i += 1) {
    const x = (i * 97) % 1060;
    const y = 130 + ((i * 71) % 800);
    ctx.fillStyle = `rgba(210, 226, 255, ${0.2 + (i % 4) * 0.12})`;
    ctx.fillRect(x, y, i % 3 === 0 ? 4 : 2, i % 3 === 0 ? 4 : 2);
  }
}

function drawPortraitTorch(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.strokeStyle = '#05060b'; ctx.lineWidth = 16;
  ctx.beginPath(); ctx.moveTo(x, y + 200); ctx.lineTo(x, y); ctx.stroke();
  const flame = 34 + Math.sin(time * 9) * 8;
  const glow = ctx.createRadialGradient(x, y - 25, 4, x, y - 25, 110);
  glow.addColorStop(0, 'rgba(255, 220, 120, 0.75)'); glow.addColorStop(1, 'rgba(255, 140, 60, 0)');
  ctx.fillStyle = glow; ctx.fillRect(x - 120, y - 145, 240, 240);
  ctx.fillStyle = '#ffd37b'; ctx.beginPath(); ctx.arc(x, y - 22, flame, 0, Math.PI * 2); ctx.fill();
}

function drawPortraitEmbers(ctx: CanvasRenderingContext2D, time: number, count: number) {
  for (let i = 0; i < count; i += 1) {
    const x = 80 + ((i * 137 + time * 18) % 920);
    const y = 1160 + ((i * 61 - time * 34) % 500);
    ctx.fillStyle = `rgba(255, 190, 100, ${0.16 + (i % 3) * 0.13})`;
    ctx.beginPath(); ctx.arc(x, y, i % 4 === 0 ? 4 : 2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPortraitVignette(ctx: CanvasRenderingContext2D) {
  const vignette = ctx.createRadialGradient(540, 920, 560, 540, 920, 1150);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1080, 1920);
}

// =========================================================================
// RORO KIDUL PORTRAIT SHORTS RENDER ENGINE (Episode 002A - 9:16)
// =========================================================================

function renderPortraitRoroKidulStoryFrame(
  ctx: CanvasRenderingContext2D,
  story: StoryPackage,
  renderTime: number,
  actIndex: number,
  time: number,
) {
  drawPortraitRoroSky(ctx, actIndex, time);
  drawPortraitRoroStars(ctx, actIndex, time);
  drawPortraitRoroMoon(ctx, actIndex, time);
  drawPortraitRoroClouds(ctx, time, actIndex);

  switch (actIndex) {
    case 0:
      drawPortraitRoroAct1_Pantangan(ctx, time);
      break;
    case 1:
      drawPortraitRoroAct2_WarnaRatu(ctx, time);
      break;
    case 2:
      drawPortraitRoroAct3_DitelanOmbak(ctx, time);
      break;
    case 3:
      drawPortraitRoroAct4_KabutMisteri(ctx, time);
      break;
    case 4:
      drawPortraitRoroAct5_ArusBalik(ctx, time);
      break;
    case 5:
      drawPortraitRoroAct6_KamuflaseSAR(ctx, time);
      break;
    case 6:
      drawPortraitRoroAct7_KearifanLeluhur(ctx, time);
      break;
    case 7:
    default:
      drawPortraitRoroAct8_DiHadapanAlam(ctx, time);
      break;
  }

  drawPortraitRoroSeaMist(ctx, time, actIndex);
  drawPortraitVignette(ctx);
}

function drawPortraitRoroSky(ctx: CanvasRenderingContext2D, actIndex: number, time: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, 1920);
  if (actIndex === 1) {
    // Act 2: Supernatural Jade Glow for the Queen
    sky.addColorStop(0, '#020b12');
    sky.addColorStop(0.38, '#063539');
    sky.addColorStop(0.68, '#136e65');
    sky.addColorStop(0.88, '#1d8f7e');
    sky.addColorStop(1, '#051817');
  } else if (actIndex === 2) {
    // Act 3: Dark turbulent storm
    sky.addColorStop(0, '#020509');
    sky.addColorStop(0.42, '#081c25');
    sky.addColorStop(0.75, '#10373d');
    sky.addColorStop(1, '#030c11');
  } else if (actIndex === 6) {
    // Act 7: Campfire night with warm lower tint
    sky.addColorStop(0, '#040713');
    sky.addColorStop(0.5, '#121626');
    sky.addColorStop(0.8, '#322325');
    sky.addColorStop(1, '#1b0e0c');
  } else if (actIndex === 7) {
    // Act 8: Sacred vast night
    sky.addColorStop(0, '#01050d');
    sky.addColorStop(0.4, '#071d2b');
    sky.addColorStop(0.72, '#124552');
    sky.addColorStop(1, '#041219');
  } else {
    // Default ocean teal night
    sky.addColorStop(0, '#030a15');
    sky.addColorStop(0.42, '#0c2e3d');
    sky.addColorStop(0.72, '#195f63');
    sky.addColorStop(1, '#06171d');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1080, 1920);
}

function drawPortraitRoroStars(ctx: CanvasRenderingContext2D, actIndex: number, time: number) {
  if (actIndex === 2) return; // Hidden by storm
  ctx.save();
  for (let i = 0; i < 48; i += 1) {
    const x = (i * 137 + 50) % 1080;
    const y = 40 + ((i * 73) % 750);
    const twinkle = 0.25 + Math.sin(time * 3 + i * 1.7) * 0.25;
    ctx.fillStyle = `rgba(215, 245, 255, ${twinkle})`;
    const size = i % 5 === 0 ? 3 : 1.8;
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();
}

function drawPortraitRoroMoon(ctx: CanvasRenderingContext2D, actIndex: number, time: number) {
  const x = actIndex === 1 ? 540 : 540 + Math.sin(time * 0.12) * 16;
  const y = actIndex === 1 ? 420 : (actIndex === 7 ? 400 : 360);
  const radius = actIndex === 1 ? 92 : (actIndex === 7 ? 84 : 68);

  const glow = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 4.5);
  const glowColor = actIndex === 1 ? 'rgba(110, 240, 215, ' : 'rgba(180, 240, 245, ';
  glow.addColorStop(0, `${glowColor}0.85)`);
  glow.addColorStop(0.35, `${glowColor}0.35)`);
  glow.addColorStop(1, `${glowColor}0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(x - radius * 4.5, y - radius * 4.5, radius * 9, radius * 9);

  ctx.fillStyle = actIndex === 1 ? '#d6fff7' : '#ebfbfb';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawPortraitRoroClouds(ctx: CanvasRenderingContext2D, time: number, actIndex: number) {
  ctx.save();
  ctx.globalAlpha = actIndex === 1 ? 0.22 : 0.28;
  ctx.fillStyle = actIndex === 1 ? '#0e4f4d' : '#0b2633';
  for (let i = 0; i < 5; i += 1) {
    const x = ((i * 260 + time * 12) % 1380) - 150;
    const y = 200 + (i % 3) * 140;
    ctx.beginPath();
    ctx.ellipse(x, y, 220, 48, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 130, y - 22, 140, 56, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 110, y + 10, 130, 38, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawQueenSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, time: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#05070a';

  // Royal Javanese bun (gelung kenthir)
  ctx.beginPath();
  ctx.ellipse(-14, -138, 12, 9, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(0, -135, 13, 0, Math.PI * 2);
  ctx.fill();

  // Royal Crown / Tiara
  ctx.beginPath();
  ctx.moveTo(-6, -148);
  ctx.lineTo(0, -164);
  ctx.lineTo(6, -148);
  ctx.closePath();
  ctx.fill();

  // Neck and shoulders
  ctx.beginPath();
  ctx.moveTo(-7, -122);
  ctx.lineTo(7, -122);
  ctx.lineTo(16, -100);
  ctx.lineTo(-16, -100);
  ctx.closePath();
  ctx.fill();

  // Slender torso and traditional kemben
  ctx.beginPath();
  ctx.moveTo(-15, -100);
  ctx.quadraticCurveTo(-11, -70, -13, -40);
  ctx.quadraticCurveTo(-16, 20, -28, 90);
  ctx.lineTo(28, 90);
  ctx.quadraticCurveTo(16, 20, 13, -40);
  ctx.quadraticCurveTo(11, -70, 15, -100);
  ctx.closePath();
  ctx.fill();

  // Flowing long royal train
  ctx.beginPath();
  ctx.moveTo(-28, 90);
  ctx.quadraticCurveTo(-45, 120, -55 + Math.sin(time * 1.5) * 8, 150);
  ctx.lineTo(40 + Math.sin(time * 1.5 + 1) * 6, 150);
  ctx.quadraticCurveTo(28, 120, 28, 90);
  ctx.closePath();
  ctx.fill();

  // Left arm at side
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#05070a';
  ctx.beginPath();
  ctx.moveTo(-15, -96);
  ctx.quadraticCurveTo(-26, -65, -18, -35);
  ctx.stroke();

  // Right arm raised holding selendang
  const armWave = Math.sin(time * 1.2) * 4;
  ctx.beginPath();
  ctx.moveTo(15, -96);
  ctx.quadraticCurveTo(34, -80 + armWave, 42, -50 + armWave);
  ctx.stroke();

  // Billowing selendang (shawl) in ocean wind
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  for (let s = 0; s < 2; s++) {
    const offset = s * 7;
    const speed = 2.0 + s * 0.4;
    ctx.beginPath();
    ctx.moveTo(35, -55 + offset);
    const cp1x = 75;
    const cp1y = -70 + Math.sin(time * speed) * 18 + offset;
    const cp2x = 135;
    const cp2y = -40 + Math.cos(time * speed * 0.9) * 24 + offset;
    const endx = 195 + Math.sin(time * 1.1) * 15;
    const endy = -85 + Math.sin(time * speed * 1.3) * 30 + offset;
    ctx.quadraticCurveTo(cp1x, cp1y, cp2x, cp2y);
    ctx.quadraticCurveTo(cp2x + 25, cp2y - 18, endx, endy);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPortraitRollingWaves(
  ctx: CanvasRenderingContext2D,
  yBase: number,
  time: number,
  amplitude = 18,
  speed = 1.0,
  fillColor = '#07131b',
) {
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.moveTo(0, 1920);
  ctx.lineTo(0, yBase);
  for (let x = 0; x <= 1080; x += 24) {
    const y = yBase
      + Math.sin(x * 0.012 + time * speed) * amplitude
      + Math.sin(x * 0.024 - time * speed * 1.4) * (amplitude * 0.35);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(1080, 1920);
  ctx.closePath();
  ctx.fill();

  // Foam crest
  ctx.strokeStyle = 'rgba(165, 230, 220, 0.45)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  for (let x = 0; x <= 1080; x += 32) {
    const y = yBase
      + Math.sin(x * 0.012 + time * speed) * amplitude
      + Math.sin(x * 0.024 - time * speed * 1.4) * (amplitude * 0.35);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawPortraitRoroSeaMist(ctx: CanvasRenderingContext2D, time: number, actIndex: number) {
  ctx.save();
  const count = actIndex === 2 ? 18 : 10;
  for (let i = 0; i < count; i += 1) {
    const x = ((i * 125 + time * 24) % 1280) - 100;
    const y = 1350 + ((i * 47 - time * 14) % 450);
    const alpha = 0.12 + (i % 3) * 0.06;
    ctx.fillStyle = `rgba(140, 230, 215, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 160, 36, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Bab 1: Pantangan Turun-Temurun (0s - 9s)
function drawPortraitRoroAct1_Pantangan(ctx: CanvasRenderingContext2D, time: number) {
  drawPortraitRollingWaves(ctx, 1260, time, 14, 0.8, '#06131c');
  drawPortraitRollingWaves(ctx, 1420, time + 1, 18, 1.1, '#081a26');

  // Shore dunes on right
  ctx.fillStyle = '#060a10';
  ctx.beginPath();
  ctx.moveTo(560, 1920);
  ctx.quadraticCurveTo(720, 1540, 1080, 1480);
  ctx.lineTo(1080, 1920);
  ctx.closePath();
  ctx.fill();

  drawPortraitStaticAsset(ctx, 'palm_tree', 910, 1560, 1.7, time);
  drawPortraitRollingWaves(ctx, 1590, time + 2, 22, 1.4, '#040d14');

  // Visitor on the beach gazing at the sea
  drawPortraitCharacter(ctx, 360, 1720, 1.25, 'standing', time, 'traveler');
}

// Bab 2: Warna Sang Ratu (9s - 16s)
function drawPortraitRoroAct2_WarnaRatu(ctx: CanvasRenderingContext2D, time: number) {
  // Distant Joglo keraton low on the sea horizon
  drawPortraitStaticAsset(ctx, 'joglo_palace', 260, 1140, 0.52, time, '#081c22');

  // Rolling waves behind crag
  drawPortraitRollingWaves(ctx, 1240, time, 16, 0.9, '#07181e');

  // Massive center-right sea stack
  drawPortraitStaticAsset(ctx, 'sea_stack', 540, 1720, 2.8, time, '#050c11');

  // Queen Nyai Roro Kidul standing on top of the sea stack
  drawQueenSilhouette(ctx, 510, 920, 1.35, time);

  // Violent crashing waves at base of sea stack
  drawPortraitRollingWaves(ctx, 1520, time + 1.2, 24, 1.5, '#040b0f');

  // Spray particles around the rock
  for (let i = 0; i < 14; i += 1) {
    const px = 420 + ((i * 37 + time * 18) % 260);
    const py = 1380 + Math.sin(time * 3 + i) * 35;
    ctx.fillStyle = 'rgba(160, 240, 225, 0.4)';
    ctx.beginPath();
    ctx.arc(px, py, i % 3 === 0 ? 3.5 : 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Bab 3: Ditelan Ombak Laut Kidul (16s - 23s)
function drawPortraitRoroAct3_DitelanOmbak(ctx: CanvasRenderingContext2D, time: number) {
  // Huge surging rogue wave curling from right to left
  const waveSurge = Math.sin(time * 2.2) * 25;
  ctx.fillStyle = '#060e17';
  ctx.beginPath();
  ctx.moveTo(0, 1920);
  ctx.lineTo(0, 1420);
  ctx.quadraticCurveTo(280, 1380, 480, 1150);
  ctx.quadraticCurveTo(700, 780 + waveSurge, 920, 720 + waveSurge);
  ctx.quadraticCurveTo(1060, 680, 1080, 750);
  ctx.lineTo(1080, 1920);
  ctx.closePath();
  ctx.fill();

  // Wave curling lip
  ctx.strokeStyle = 'rgba(170, 235, 225, 0.7)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(920, 720 + waveSurge);
  ctx.quadraticCurveTo(780, 760 + waveSurge, 680, 920);
  ctx.stroke();

  // Churning water in foreground
  drawPortraitRollingWaves(ctx, 1480, time * 1.5, 28, 2.0, '#040910');

  // Helpless victim struggling in the waves
  const victimBob = Math.sin(time * 3) * 14;
  ctx.save();
  ctx.translate(460, 1440 + victimBob);
  ctx.fillStyle = '#04080e';
  // Head
  ctx.beginPath();
  ctx.arc(0, -22, 12, 0, Math.PI * 2);
  ctx.fill();
  // Outstretched arm reaching upward
  ctx.strokeStyle = '#04080e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(4, -18);
  ctx.lineTo(18, -48);
  ctx.lineTo(26, -72);
  ctx.stroke();
  // Swirling water ring
  ctx.strokeStyle = 'rgba(150, 230, 220, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 2, 42, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Flying ocean foam droplets
  for (let i = 0; i < 28; i += 1) {
    const fx = (i * 41 + time * 65) % 1080;
    const fy = 850 + ((i * 39 - time * 45) % 800);
    ctx.fillStyle = `rgba(180, 245, 235, ${0.25 + (i % 4) * 0.15})`;
    ctx.beginPath();
    ctx.arc(fx, fy, i % 3 === 0 ? 3.5 : 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Bab 4: Di Balik Kabut Misteri (23s - 29s)
function drawPortraitRoroAct4_KabutMisteri(ctx: CanvasRenderingContext2D, time: number) {
  // Majestic coastal cliffs parting on left and right
  ctx.fillStyle = '#09151e';
  // Left cliff
  ctx.beginPath();
  ctx.moveTo(0, 780);
  ctx.quadraticCurveTo(240, 1120, 360, 1480);
  ctx.lineTo(0, 1720);
  ctx.closePath();
  ctx.fill();

  // Right cliff with palm tree
  ctx.fillStyle = '#071017';
  ctx.beginPath();
  ctx.moveTo(1080, 840);
  ctx.quadraticCurveTo(860, 1160, 720, 1540);
  ctx.lineTo(1080, 1760);
  ctx.closePath();
  ctx.fill();
  drawPortraitStaticAsset(ctx, 'palm_tree', 960, 1440, 1.45, time);

  // Sea channel in the center
  drawPortraitRollingWaves(ctx, 1360, time, 12, 0.7, '#071722');
  drawPortraitRollingWaves(ctx, 1540, time + 1, 16, 0.9, '#051119');

  // Lonely traditional outrigger boat sailing smoothly across the moonlit gap
  const boatX = 540 + Math.sin(time * 0.4) * 50;
  drawPortraitStaticAsset(ctx, 'boat', boatX, 1460, 1.15, time);
}

// Bab 5: Arus Balik Mematikan (29s - 34s)
function drawPortraitRoroAct5_ArusBalik(ctx: CanvasRenderingContext2D, time: number) {
  // High-angle view: surf breaking on left and right, dangerous rip current rushing center
  // Left breaking surf
  ctx.fillStyle = '#071822';
  ctx.beginPath();
  ctx.moveTo(0, 1100);
  ctx.lineTo(380, 1180);
  ctx.lineTo(360, 1720);
  ctx.lineTo(0, 1720);
  ctx.closePath();
  ctx.fill();

  // Right breaking surf
  ctx.fillStyle = '#071822';
  ctx.beginPath();
  ctx.moveTo(1080, 1100);
  ctx.lineTo(700, 1180);
  ctx.lineTo(720, 1720);
  ctx.lineTo(1080, 1720);
  ctx.closePath();
  ctx.fill();

  // White foam on surf bars
  ctx.strokeStyle = 'rgba(160, 235, 220, 0.6)';
  ctx.lineWidth = 4;
  for (let y = 1220; y <= 1640; y += 75) {
    ctx.beginPath();
    ctx.moveTo(20, y + Math.sin(y + time * 2) * 10);
    ctx.lineTo(350, y + Math.sin(y + time * 2) * 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(730, y + Math.cos(y + time * 2) * 10);
    ctx.lineTo(1060, y + Math.cos(y + time * 2) * 10);
    ctx.stroke();
  }

  // Deceptive central rip current trench rushing out toward sea (upwards)
  ctx.fillStyle = '#040e16';
  ctx.fillRect(360, 1050, 360, 720);

  // Fast foam streaks in the trench pointing toward the horizon
  ctx.strokeStyle = 'rgba(110, 220, 205, 0.55)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 9; i += 1) {
    const sx = 420 + (i * 32);
    const sy = 1680 - ((time * 85 + i * 55) % 600);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.sin(sy * 0.02) * 8, sy - 45);
    ctx.stroke();
  }

  // Shoreline in foreground
  ctx.fillStyle = '#03080e';
  ctx.fillRect(0, 1720, 1080, 200);

  // Warning danger marker on the beach
  ctx.fillRect(210, 1610, 12, 120);
  ctx.fillRect(175, 1610, 80, 45);
  ctx.fillStyle = 'rgba(230, 255, 245, 0.8)';
  ctx.fillRect(182, 1622, 66, 8);
  ctx.fillRect(182, 1636, 45, 8);
}

// Bab 6: Kamuflase Air Laut & Tim Penyelamat (34s - 45s)
function drawPortraitRoroAct6_KamuflaseSAR(ctx: CanvasRenderingContext2D, time: number) {
  // Turbulent ocean in background
  drawPortraitRollingWaves(ctx, 1180, time, 18, 1.0, '#06161c');
  drawPortraitRollingWaves(ctx, 1340, time + 1, 22, 1.2, '#041016');

  // Swimmer head barely visible in the water (camouflaged)
  const bob = Math.sin(time * 2.8) * 6;
  ctx.fillStyle = '#082522'; // Murky tone blending with sea
  ctx.beginPath();
  ctx.arc(540, 1260 + bob, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(80, 180, 160, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(540, 1265 + bob, 22, 6, 0, 0, Math.PI * 2);
  ctx.stroke();

  // High cliff promontory in the foreground
  ctx.fillStyle = '#050a10';
  ctx.beginPath();
  ctx.moveTo(0, 1480);
  ctx.quadraticCurveTo(380, 1420, 680, 1490);
  ctx.quadraticCurveTo(900, 1440, 1080, 1530);
  ctx.lineTo(1080, 1920);
  ctx.lineTo(0, 1920);
  ctx.closePath();
  ctx.fill();

  // SAR rescuer holding torch
  drawPortraitCharacter(ctx, 330, 1620, 1.05, 'standing', time, 'traveler');
  drawPortraitTorch(ctx, 305, 1510, time);
  drawPortraitEmbers(ctx, time, 16);

  // Second rescuer pointing toward the ocean
  drawPortraitCharacter(ctx, 470, 1620, 1.05, 'pointing', time, 'scout');
}

// Bab 7: Kearifan Leluhur (45s - 53s)
function drawPortraitRoroAct7_KearifanLeluhur(ctx: CanvasRenderingContext2D, time: number) {
  // Distant pendopo roofline in background
  drawPortraitStaticAsset(ctx, 'joglo_palace', 300, 1220, 0.45, time, '#0a101d');

  // Ground plane
  ctx.fillStyle = '#070912';
  ctx.fillRect(0, 1560, 1080, 360);

  // Banyan tree framing the right top
  drawPortraitStaticAsset(ctx, 'banyan', 920, 1340, 1.4, time);

  // Warm campfire in center
  drawPortraitStaticAsset(ctx, 'campfire', 540, 1710, 1.35, time);
  drawPortraitEmbers(ctx, time, 24);

  // Elder seated on left
  drawPortraitCharacter(ctx, 380, 1710, 1.05, 'idle', time, 'elder');

  // Younger person kneeling / listening on right
  drawPortraitCharacter(ctx, 700, 1710, 1.0, 'kneeling', time, 'traveler');
}

// Bab 8: Di Hadapan Alam (53s - 58.44s)
function drawPortraitRoroAct8_DiHadapanAlam(ctx: CanvasRenderingContext2D, time: number) {
  // Vast calm ocean meeting reflective tidal beach
  drawPortraitRollingWaves(ctx, 1360, time, 8, 0.4, '#051119');
  drawPortraitRollingWaves(ctx, 1480, time + 0.5, 10, 0.5, '#040d14');

  // Reflective wet beach flat
  ctx.fillStyle = '#03080e';
  ctx.fillRect(0, 1540, 1080, 380);

  // Shimmering vertical moonlight reflection column down to the shore
  ctx.save();
  const moonBeam = ctx.createLinearGradient(540, 400, 540, 1700);
  moonBeam.addColorStop(0, 'rgba(160, 240, 230, 0.28)');
  moonBeam.addColorStop(0.5, 'rgba(110, 220, 210, 0.16)');
  moonBeam.addColorStop(1, 'rgba(90, 200, 190, 0.04)');
  ctx.fillStyle = moonBeam;
  ctx.beginPath();
  ctx.moveTo(480, 420);
  ctx.lineTo(600, 420);
  ctx.lineTo(760, 1720);
  ctx.lineTo(320, 1720);
  ctx.closePath();
  ctx.fill();

  // Shimmer lines on the water
  ctx.strokeStyle = 'rgba(180, 245, 235, 0.35)';
  ctx.lineWidth = 2;
  for (let y = 1380; y <= 1680; y += 38) {
    const shimmerW = 120 + ((y - 1380) * 0.4) + Math.sin(y * 0.05 + time * 2) * 20;
    ctx.beginPath();
    ctx.moveTo(540 - shimmerW * 0.5, y);
    ctx.lineTo(540 + shimmerW * 0.5, y);
    ctx.stroke();
  }
  ctx.restore();

  // Solitary human silhouette standing in humble contemplation
  drawPortraitCharacter(ctx, 540, 1740, 0.78, 'standing', time, 'traveler');
}

// =========================================================================
// ALAS PURWO PORTRAIT SHORTS RENDER ENGINE (Episode 003A - 9:16)
// Memanfaatkan Panggung Vertikal Penuh, Pencahayaan Lokal Logis,
// Variasi Kamera (termasuk Close-up), dan Subtitle Terintegrasi
// =========================================================================

function renderPortraitAlasPurwoStoryFrame(
  ctx: CanvasRenderingContext2D,
  story: StoryPackage,
  renderTime: number,
  actIndex: number,
  time: number,
) {
  // 1. Sky & Celestial Backlight
  drawPortraitPurwoSky(ctx, actIndex, time);
  drawPortraitPurwoStars(ctx, actIndex, time);
  drawPortraitPurwoMoonOrSun(ctx, actIndex, time);

  // 2. Vertical Framing: Overhead Canopy of Banyan Branches & Hanging Vines
  drawPortraitOverheadCanopy(ctx, time);

  // 3. Act-Specific Composition with Grounded Lighting & Camera Scales
  switch (actIndex) {
    case 0:
      drawPortraitPurwoAct1_RimbaPertama(ctx, time);
      break;
    case 1:
      drawPortraitPurwoAct2_PantanganBisikan(ctx, time);
      break;
    case 2:
      drawPortraitPurwoAct3_RahasiaLeluhur(ctx, time);
      break;
    case 3:
      drawPortraitPurwoAct4_BentengPerlindungan(ctx, time); // Close-up Dramatic Shot
      break;
    case 4:
      drawPortraitPurwoAct5_SatwaLestari(ctx, time);
      break;
    case 5:
    default:
      drawPortraitPurwoAct6_KearifanBatasDiri(ctx, time);
      break;
  }

  // 4. Ground Creeping Mist & Vignette
  drawPortraitPurwoMist(ctx, time, actIndex);
  drawPortraitVignette(ctx);

  // 5. Integrated Header & Dynamic Subtitle
  drawPortraitHeaderAndSubtitles(ctx, story, renderTime, actIndex);
}

function drawPortraitPurwoSky(ctx: CanvasRenderingContext2D, actIndex: number, time: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, 1920);
  if (actIndex === 0) {
    // Fajar purba: mistis zamrud-keemasan
    sky.addColorStop(0, '#020610');
    sky.addColorStop(0.38, '#06262e');
    sky.addColorStop(0.7, '#145c58');
    sky.addColorStop(0.88, '#267f70');
    sky.addColorStop(1, '#05181b');
  } else if (actIndex === 1) {
    // Malam rimba berkabut pekat
    sky.addColorStop(0, '#010307');
    sky.addColorStop(0.42, '#04151b');
    sky.addColorStop(0.75, '#0b3537');
    sky.addColorStop(1, '#020d11');
  } else if (actIndex === 2 || actIndex === 3) {
    // Pertapaan Gua Istana: gelap pekat berpadu hangatnya dupa
    sky.addColorStop(0, '#03050c');
    sky.addColorStop(0.45, '#0b1320');
    sky.addColorStop(0.75, '#201b22');
    sky.addColorStop(1, '#110b0e');
  } else if (actIndex === 4) {
    // Fajar Savana Sadengan: keemasan hangat & hijau asri
    sky.addColorStop(0, '#040d17');
    sky.addColorStop(0.4, '#10373f');
    sky.addColorStop(0.75, '#3b705e');
    sky.addColorStop(1, '#16382b');
  } else {
    // Keheningan samudra & rimba penutup
    sky.addColorStop(0, '#020610');
    sky.addColorStop(0.4, '#092330');
    sky.addColorStop(0.72, '#185655');
    sky.addColorStop(1, '#04141a');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1080, 1920);
}

function drawPortraitPurwoStars(ctx: CanvasRenderingContext2D, actIndex: number, time: number) {
  if (actIndex === 1 || actIndex === 4) return; // Kabut pekat atau terang fajar
  ctx.save();
  for (let i = 0; i < 40; i += 1) {
    const x = (i * 149 + 40) % 1080;
    const y = 30 + ((i * 67) % 650);
    const twinkle = 0.2 + Math.sin(time * 2.8 + i * 1.5) * 0.25;
    ctx.fillStyle = `rgba(210, 245, 255, ${twinkle})`;
    const size = i % 4 === 0 ? 2.8 : 1.6;
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();
}

function drawPortraitPurwoMoonOrSun(ctx: CanvasRenderingContext2D, actIndex: number, time: number) {
  const x = actIndex === 4 ? 680 : 540 + Math.sin(time * 0.1) * 12;
  const y = actIndex === 4 ? 420 : 360;
  const radius = actIndex === 4 ? 82 : (actIndex === 3 ? 95 : 68);

  const glow = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 4.5);
  const glowColor = actIndex === 4 ? 'rgba(255, 225, 140, ' : 'rgba(150, 235, 220, ';
  glow.addColorStop(0, `${glowColor}0.8)`);
  glow.addColorStop(0.35, `${glowColor}0.3)`);
  glow.addColorStop(1, `${glowColor}0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(x - radius * 4.5, y - radius * 4.5, radius * 9, radius * 9);

  ctx.fillStyle = actIndex === 4 ? '#fff0c2' : '#e6fbf7';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawPortraitOverheadCanopy(ctx: CanvasRenderingContext2D, time: number) {
  ctx.save();
  ctx.fillStyle = '#050a0f';
  // Left arching branch
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(380, 0);
  ctx.quadraticCurveTo(340, 160, 260, 240);
  ctx.quadraticCurveTo(140, 310, 0, 330);
  ctx.closePath();
  ctx.fill();

  // Right arching branch
  ctx.beginPath();
  ctx.moveTo(1080, 0);
  ctx.lineTo(720, 0);
  ctx.quadraticCurveTo(760, 140, 840, 220);
  ctx.quadraticCurveTo(940, 290, 1080, 310);
  ctx.closePath();
  ctx.fill();

  // Hanging aerial lianas / vines swaying in wind
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#050a0f';
  for (let i = 0; i < 9; i += 1) {
    const vx = 120 + i * 95;
    const vlen = 160 + ((i * 47) % 180);
    const vsway = Math.sin(time * 1.4 + i * 0.8) * 6;
    ctx.beginPath();
    ctx.moveTo(vx, 0);
    ctx.quadraticCurveTo(vx + vsway * 0.5, vlen * 0.5, vx + vsway, vlen);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPortraitPurwoMist(ctx: CanvasRenderingContext2D, time: number, actIndex: number) {
  ctx.save();
  const count = actIndex === 1 ? 16 : 8;
  for (let i = 0; i < count; i += 1) {
    const x = ((i * 135 + time * 20) % 1320) - 120;
    const y = 1420 + ((i * 43 - time * 12) % 360);
    const alpha = actIndex === 1 ? 0.22 : 0.12;
    ctx.fillStyle = `rgba(130, 220, 205, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 180, 42, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Bab 1: Rimba Purba Pertama (0s - 12s)
function drawPortraitPurwoAct1_RimbaPertama(ctx: CanvasRenderingContext2D, time: number) {
  // Distant ocean waves at sea level
  drawPortraitRollingWaves(ctx, 1320, time, 12, 0.7, '#06151e');
  drawPortraitRollingWaves(ctx, 1460, time + 1, 16, 0.9, '#040f16');

  // Rocky coastal cliff rising on right
  ctx.fillStyle = '#050b10';
  ctx.beginPath();
  ctx.moveTo(480, 1920);
  ctx.quadraticCurveTo(680, 1580, 1080, 1480);
  ctx.lineTo(1080, 1920);
  ctx.closePath();
  ctx.fill();

  // Towering Banyan Tree rising from the cliff
  drawPortraitStaticAsset(ctx, 'banyan', 920, 1500, 2.2, time);

  // Sea stack rock in the ocean on left
  drawPortraitStaticAsset(ctx, 'sea_stack', 240, 1520, 1.8, time);

  // Solitary traveler gazing out at the emerging first land of Java
  drawPortraitCharacter(ctx, 380, 1680, 1.15, 'standing', time, 'traveler');
}

// Bab 2: Pantangan & Bisikan Gaib (12s - 24s)
function drawPortraitPurwoAct2_PantanganBisikan(ctx: CanvasRenderingContext2D, time: number) {
  // Dense forest path flanked by twisted ancient trees
  drawPortraitStaticAsset(ctx, 'twisted_tree', 160, 1520, 1.8, time);
  drawPortraitStaticAsset(ctx, 'twisted_tree', 960, 1520, 1.85, time);

  // Ground plane
  ctx.fillStyle = '#04070c';
  ctx.fillRect(0, 1560, 1080, 360);

  // Reeds along the dark pathway
  drawPortraitStaticAsset(ctx, 'reeds', 360, 1580, 1.4, time);
  drawPortraitStaticAsset(ctx, 'reeds', 820, 1580, 1.4, time);

  // Traveler walking on the path carrying a burning torch
  // At time >= 5s (when "jangan menoleh"), pauses and looks around
  const isTurning = time >= 4.5 && time <= 9.0;
  const pose = isTurning ? 'looking_around' : 'walking';
  const posX = isTurning ? 540 : 460 + Math.min(time * 16, 160);

  // Grounded Torch Light: Warm radial glow centered on the torch
  ctx.save();
  const torchX = posX - 25;
  const torchY = 1480;
  const torchGlow = ctx.createRadialGradient(torchX, torchY, 15, torchX, torchY, 260);
  torchGlow.addColorStop(0, 'rgba(255, 175, 70, 0.55)');
  torchGlow.addColorStop(0.4, 'rgba(255, 120, 40, 0.22)');
  torchGlow.addColorStop(1, 'rgba(255, 90, 20, 0)');
  ctx.fillStyle = torchGlow;
  ctx.beginPath();
  ctx.arc(torchX, torchY, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawPortraitCharacter(ctx, posX, 1590, 1.15, pose, time, 'traveler');
  drawPortraitTorch(ctx, torchX, torchY - 20, time);
  drawPortraitEmbers(ctx, time, 12);
}

// Bab 3: Rahasia Para Leluhur (24s - 30s)
function drawPortraitPurwoAct3_RahasiaLeluhur(ctx: CanvasRenderingContext2D, time: number) {
  // Sacred cave portal (Gua Istana)
  drawPortraitStaticAsset(ctx, 'sacred_cave', 540, 1560, 2.5, time);

  // Stone altar platform with warm incense hearth
  drawPortraitStaticAsset(ctx, 'campfire', 540, 1640, 1.25, time);
  drawPortraitEmbers(ctx, time, 18);

  // Grounded Altar Light: Warm radial glow illuminating the cave mouth
  ctx.save();
  const altarGlow = ctx.createRadialGradient(540, 1620, 20, 540, 1620, 320);
  altarGlow.addColorStop(0, 'rgba(255, 185, 90, 0.65)');
  altarGlow.addColorStop(0.45, 'rgba(220, 130, 60, 0.2)');
  altarGlow.addColorStop(1, 'rgba(180, 80, 30, 0)');
  ctx.fillStyle = altarGlow;
  ctx.fillRect(220, 1300, 640, 420);
  ctx.restore();

  // Meditating hermit sitting in peaceful reverence
  drawPortraitCharacter(ctx, 390, 1640, 1.05, 'kneeling', time, 'elder');

  // Pilgrim kneeling respectfully opposite
  drawPortraitCharacter(ctx, 690, 1640, 1.05, 'kneeling', time, 'traveler');
}

// Bab 4: Benteng Perlindungan - Close-up Dramatic Shot (30s - 33s)
function drawPortraitPurwoAct4_BentengPerlindungan(ctx: CanvasRenderingContext2D, time: number) {
  // Close-up Shot of Sacred Altar & Meditating Hermit Face
  // Dark textured cave rock in background
  ctx.fillStyle = '#060a10';
  ctx.fillRect(0, 600, 1080, 1320);

  // Volumetric beam of divine light shining from top-left onto altar
  ctx.save();
  const godRay = ctx.createLinearGradient(180, 400, 580, 1600);
  godRay.addColorStop(0, 'rgba(255, 230, 160, 0.45)');
  godRay.addColorStop(0.5, 'rgba(200, 240, 220, 0.22)');
  godRay.addColorStop(1, 'rgba(100, 180, 170, 0.02)');
  ctx.fillStyle = godRay;
  ctx.beginPath();
  ctx.moveTo(140, 400);
  ctx.lineTo(290, 400);
  ctx.lineTo(760, 1800);
  ctx.lineTo(380, 1800);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Altar Stone in midground
  ctx.fillStyle = '#04070b';
  ctx.fillRect(160, 1460, 760, 80);

  // Grounded Incense Coals with warm radial glow
  ctx.save();
  const fireGlow = ctx.createRadialGradient(380, 1450, 12, 380, 1450, 220);
  fireGlow.addColorStop(0, 'rgba(255, 170, 70, 0.85)');
  fireGlow.addColorStop(0.4, 'rgba(255, 110, 30, 0.35)');
  fireGlow.addColorStop(1, 'rgba(200, 60, 10, 0)');
  ctx.fillStyle = fireGlow;
  ctx.fillRect(160, 1250, 440, 300);

  // Incense bowl
  ctx.fillStyle = '#030508';
  ctx.beginPath();
  ctx.arc(380, 1460, 32, 0, Math.PI);
  ctx.fill();

  // Wisp of fragrant incense smoke rising upward
  ctx.strokeStyle = 'rgba(235, 245, 250, 0.5)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(380, 1445);
  for (let y = 1445; y >= 680; y -= 40) {
    const sw = Math.sin((1445 - y) * 0.02 + time * 2.2) * 28;
    ctx.lineTo(380 + sw, y);
  }
  ctx.stroke();
  ctx.restore();

  // Dramatic Close-Up Profile of Hermit / Elder (from chest to head)
  ctx.save();
  ctx.translate(720, 1420);
  ctx.scale(2.4, 2.4);
  ctx.fillStyle = '#030508';

  // Head with traditional Javanese blangkon knot
  ctx.beginPath();
  ctx.arc(0, -96, 25, 0, Math.PI * 2);
  ctx.fill();
  // Blangkon knot (mondholan) behind head
  ctx.beginPath();
  ctx.ellipse(24, -92, 13, 11, 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Neck, tranquil chin, and broad cloaked shoulders
  ctx.beginPath();
  ctx.moveTo(-18, -84);
  ctx.lineTo(-24, -64);
  ctx.lineTo(-58, -18);
  ctx.lineTo(-75, 60);
  ctx.lineTo(65, 60);
  ctx.lineTo(48, -18);
  ctx.lineTo(16, -74);
  ctx.closePath();
  ctx.fill();

  // Soft warm rim-light on the side facing the incense fire
  ctx.strokeStyle = 'rgba(255, 190, 100, 0.55)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-18, -84);
  ctx.lineTo(-24, -64);
  ctx.lineTo(-58, -18);
  ctx.stroke();

  ctx.restore();

  drawPortraitEmbers(ctx, time, 18);
}

// Bab 5: Pohon Raksasa & Satwa Lestari (33s - 44s)
function drawPortraitPurwoAct5_SatwaLestari(ctx: CanvasRenderingContext2D, time: number) {
  // Morning Savana Sadengan: golden sunlight streaming through towering trees
  drawPortraitStaticAsset(ctx, 'banyan', 180, 1480, 2.1, time);
  drawPortraitStaticAsset(ctx, 'twisted_tree', 940, 1490, 1.75, time);

  // Ground savanna ridge
  ctx.fillStyle = '#050a0d';
  ctx.beginPath();
  ctx.moveTo(0, 1540);
  ctx.quadraticCurveTo(540, 1480, 1080, 1530);
  ctx.lineTo(1080, 1920);
  ctx.lineTo(0, 1920);
  ctx.closePath();
  ctx.fill();

  // Reeds & tall savanna grasses
  drawPortraitStaticAsset(ctx, 'reeds', 280, 1540, 1.5, time);
  drawPortraitStaticAsset(ctx, 'reeds', 820, 1530, 1.5, time);

  // Majestic Wild Javan Banteng (Bos javanicus) with iconic curved horns
  drawPortraitStaticAsset(ctx, 'javan_banteng', 460, 1500, 1.45, time);

  // Horned stag standing peacefully beside
  drawPortraitStaticAsset(ctx, 'stag', 780, 1510, 1.25, time);
}

// Bab 6: Kearifan Batas Diri (44s - 54.99s)
function drawPortraitPurwoAct6_KearifanBatasDiri(ctx: CanvasRenderingContext2D, time: number) {
  // High coastal promontory meeting the open Indian Ocean
  drawPortraitRollingWaves(ctx, 1340, time, 10, 0.5, '#05121b');
  drawPortraitRollingWaves(ctx, 1480, time + 0.8, 14, 0.7, '#040e15');

  // Towering coastal cliff in foreground
  ctx.fillStyle = '#04070c';
  ctx.beginPath();
  ctx.moveTo(0, 1920);
  ctx.lineTo(0, 1460);
  ctx.quadraticCurveTo(420, 1420, 680, 1480);
  ctx.quadraticCurveTo(900, 1440, 1080, 1510);
  ctx.lineTo(1080, 1920);
  ctx.closePath();
  ctx.fill();

  // Ancient Banyan tree framing the left promontory
  drawPortraitStaticAsset(ctx, 'banyan', 220, 1460, 2.0, time);

  // Solitary human silhouette standing in contemplation at cliff edge
  drawPortraitCharacter(ctx, 580, 1520, 0.95, 'standing', time, 'traveler');
}

function drawPortraitHeaderAndSubtitles(
  ctx: CanvasRenderingContext2D,
  story: StoryPackage,
  renderTime: number,
  actIndex: number,
) {
  const activeAct = story.acts[actIndex];
  if (!activeAct) return;

  ctx.save();

  // 1. Subtle top header brand
  ctx.font = '600 24px serif';
  ctx.fillStyle = 'rgba(235, 215, 170, 0.75)';
  ctx.textAlign = 'center';
  ctx.fillText('RUANG BAYANGAN · ALAS PURWO', 540, 100);

  // 2. Subtitle text
  const text = activeAct.narration;
  if (text) {
    ctx.font = '500 32px serif';
    ctx.textAlign = 'center';

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const w of words) {
      const testLine = currentLine ? `${currentLine} ${w}` : w;
      if (ctx.measureText(testLine).width > 860) {
        lines.push(currentLine);
        currentLine = w;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = 44;
    const totalH = lines.length * lineHeight;
    const startY = 1760 - totalH * 0.5;

    // Dark translucent backdrop pill
    ctx.fillStyle = 'rgba(4, 7, 12, 0.65)';
    ctx.beginPath();
    // Round rect fallback for all environments
    const rx = 540 - 460;
    const ry = startY - 24;
    const rw = 920;
    const rh = totalH + 36;
    const radius = 18;
    ctx.moveTo(rx + radius, ry);
    ctx.lineTo(rx + rw - radius, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
    ctx.lineTo(rx + rw, ry + rh - radius);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
    ctx.lineTo(rx + radius, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
    ctx.lineTo(rx, ry + radius);
    ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
    ctx.closePath();
    ctx.fill();

    // Text rendering
    ctx.fillStyle = '#fffdf7';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 8;
    lines.forEach((line, i) => {
      ctx.fillText(line, 540, startY + i * lineHeight + 12);
    });
  }

  ctx.restore();
}

function drawEpisodeCard(
  ctx: CanvasRenderingContext2D,
  story: StoryPackage,
  kind: 'intro' | 'outro',
  progress: number,
  logoImage?: CanvasImageSource,
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
  gradient.addColorStop(0, kind === 'intro' ? '#161936' : '#0b1024');
  gradient.addColorStop(0.42, kind === 'intro' ? '#6b3656' : '#39284f');
  gradient.addColorStop(0.7, kind === 'intro' ? '#d47755' : '#8c4e5d');
  gradient.addColorStop(1, '#080914');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1920, 1080);

  const fade = Math.max(0, Math.min(1, Math.min(progress * 5, (1 - progress) * 5)));
  ctx.save();
  ctx.globalAlpha = fade || 0.2;
  const sunX = 960 + Math.sin(progress * Math.PI) * 80;
  const sunY = kind === 'intro' ? 530 + progress * 95 : 625 - progress * 95;
  const glow = ctx.createRadialGradient(sunX, sunY, 18, sunX, sunY, 430);
  glow.addColorStop(0, 'rgba(255, 226, 151, 0.98)');
  glow.addColorStop(0.18, 'rgba(255, 184, 102, 0.48)');
  glow.addColorStop(0.55, 'rgba(221, 113, 103, 0.16)');
  glow.addColorStop(1, 'rgba(221, 113, 103, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(360, 120, 1200, 900);
  ctx.fillStyle = '#ffe4a3';
  ctx.shadowColor = '#f8b66a';
  ctx.shadowBlur = 35;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 92 + Math.sin(progress * Math.PI) * 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  const mountain = (fill: string, baseY: number, peakY: number, offset: number) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= 1920; x += 120) {
      const y = baseY - Math.abs(Math.sin((x + offset) * 0.006)) * (baseY - peakY) - Math.sin((x + offset) * 0.017) * 24;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(1920, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();
  };
  mountain('rgba(54, 46, 76, 0.62)', 770, 520, 0);
  mountain('rgba(33, 32, 57, 0.82)', 870, 610, 270);
  mountain('#111322', 950, 720, 520);

  ctx.fillStyle = `rgba(255, 190, 137, ${0.08 + Math.sin(progress * Math.PI) * 0.05})`;
  ctx.beginPath();
  ctx.ellipse(960, 780, 780, 100, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(238, 173, 160, 0.08)';
  ctx.beginPath();
  ctx.ellipse(760, 870, 620, 75, 0, 0, Math.PI * 2);
  ctx.fill();

  const tree = (x: number, y: number, scale: number, flip = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * flip, scale);
    ctx.fillStyle = '#080a13';
    ctx.fillRect(-14, -310, 28, 390);
    ctx.strokeStyle = '#080a13';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -120); ctx.lineTo(-100, -270);
    ctx.moveTo(0, -180); ctx.lineTo(120, -350);
    ctx.moveTo(0, -235); ctx.lineTo(-50, -390);
    ctx.stroke();
    ctx.restore();
  };
  tree(170, 1010, 1.15);
  tree(1770, 1030, 1.35, -1);

  for (let i = 0; i < 18; i += 1) {
    const x = 270 + ((i * 173) % 1380) + Math.sin(progress * Math.PI * 2 + i) * 18;
    const y = 510 + ((i * 67) % 360) + Math.cos(progress * Math.PI * 2 + i) * 10;
    const alpha = 0.18 + (Math.sin(progress * Math.PI * 4 + i * 1.7) + 1) * 0.16;
    ctx.fillStyle = `rgba(255, 220, 150, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, i % 3 === 0 ? 3 : 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#070912';
  ctx.beginPath();
  ctx.moveTo(0, 965);
  ctx.quadraticCurveTo(460, 850, 920, 955);
  ctx.quadraticCurveTo(1430, 845, 1920, 960);
  ctx.lineTo(1920, 1080);
  ctx.lineTo(0, 1080);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#05070d';
  ctx.lineWidth = 7;
  for (let i = 0; i < 30; i += 1) {
    const x = 60 + i * 64;
    ctx.beginPath();
    ctx.moveTo(x, 1015 + (i % 4) * 10);
    ctx.quadraticCurveTo(x - 20, 940, x + Math.sin(i) * 24, 900 + (i % 5) * 12);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Main Scene Rendering Routine
 */
export function renderShadowScene(
  ctx: CanvasRenderingContext2D,
  scene: SceneProject,
  time: number,
  options: RenderOptions = {}
) {
  const { width, height, background, lighting, atmosphere, elements } = scene;
  const isEditing = options.showGizmos ?? false;
  const isDraft = options.isDraftPreview ?? false;

  ctx.save();

  // Clear canvas
  ctx.fillStyle = '#060608';
  ctx.fillRect(0, 0, width, height);

  // 1. Render Cinematic Sky Gradient & Atmosphere
  renderSky(ctx, width, height, background, lighting, time);

  // 2. Render Backlight Orb & Core Glow (behind silhouettes)
  renderBacklight(ctx, width, height, lighting, time);

  // 3. Render Volumetric God Rays (Reduced rays in draft preview for lightweight performance)
  if (lighting.volumetric > 0.05) {
    renderVolumetricGodRays(ctx, width, height, lighting, time, isDraft);
  }

  // 4. Render Background Depth Layers (Distant Mountains/Hills Parallax)
  renderBackgroundTerrain(ctx, width, height, background, time);

  // 5. Render Atmospheric Fog Layer 1 (Midground Fog)
  if (atmosphere.fog.enabled) {
    renderAtmosphericFog(ctx, width, height, background, atmosphere.fog, time, 0.4, isDraft);
  }

  // 6. Render Scene Elements (Pure Deep Silhouettes with Contact Diffusion)
  // Sort elements by zIndex
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sortedElements) {
    if (!el.visible) continue;
    renderSceneElement(ctx, el, time, lighting, isDraft);
  }

  // 7. Render Foreground Contact Ground Line & Foliage
  renderForegroundTerrain(ctx, width, height, background);

  // 8. Render Atmospheric Fog Layer 2 (Foreground Fog drift)
  if (atmosphere.fog.enabled) {
    renderAtmosphericFog(ctx, width, height, background, atmosphere.fog, time, 0.8, isDraft);
  }

  // 9. Render Floating Atmospheric Particles (Dust, Embers, Leaves, Rain)
  if (atmosphere.particles.type !== 'none') {
    renderAtmosphericParticles(ctx, width, height, atmosphere.particles, lighting, time, isDraft);
  }

  // 10. Render Kelir Screen Texture & Vignette
  if (atmosphere.screenTexture) {
    renderKelirScreenGrain(ctx, width, height);
  }

  // 11. Render Selection Bounding Box & Transform Handles (in Editor Mode only)
  if (isEditing && options.selectedElementId) {
    const selEl = elements.find((e) => e.id === options.selectedElementId);
    if (selEl && selEl.visible) {
      renderSelectionGizmo(ctx, selEl, time);
    }
  }

  ctx.restore();
}

/**
 * 1. Cinematic Sky Gradient
 */
function renderSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: any,
  lighting: any,
  time: number
) {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, bg.skyGradient.top);
  grad.addColorStop(0.55, bg.skyGradient.mid);
  grad.addColorStop(1, bg.skyGradient.bottom);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * 2. Backlight Orb & Diffusion
 */
function renderBacklight(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lighting: any,
  time: number
) {
  const lx = (lighting.x / 100) * width;
  const ly = (lighting.y / 100) * height;

  // Torch flicker effect
  let flickerMult = 1.0;
  if (lighting.flicker) {
    flickerMult = 0.85 + Math.sin(time * 18) * 0.08 + Math.cos(time * 26) * 0.07;
  }

  const radius = lighting.radius * flickerMult;
  const glow = lighting.glow * flickerMult;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Core brilliant light orb
  const orbGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
  orbGrad.addColorStop(0, '#ffffff');
  orbGrad.addColorStop(0.15, lighting.color);
  orbGrad.addColorStop(0.45, `${lighting.color}aa`);
  orbGrad.addColorStop(1, '#00000000');

  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(lx, ly, radius, 0, Math.PI * 2);
  ctx.fill();

  // Secondary soft bloom halo
  const bloomRadius = radius * 1.8 * glow;
  const bloomGrad = ctx.createRadialGradient(lx, ly, radius * 0.3, lx, ly, bloomRadius);
  bloomGrad.addColorStop(0, `${lighting.color}66`);
  bloomGrad.addColorStop(0.5, `${lighting.color}22`);
  bloomGrad.addColorStop(1, '#00000000');

  ctx.fillStyle = bloomGrad;
  ctx.beginPath();
  ctx.arc(lx, ly, bloomRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 3. Volumetric God Rays
 */
function renderVolumetricGodRays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lighting: any,
  time: number,
  isDraft: boolean = false
) {
  const lx = (lighting.x / 100) * width;
  const ly = (lighting.y / 100) * height;
  const count = isDraft ? 5 : 14;
  const baseAngle = (lighting.rayAngle || 0) * (Math.PI / 180);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = `${lighting.color}18`;

  for (let i = 0; i < count; i++) {
    // Subtle ray angle drift
    const rayDrift = Math.sin(time * 0.4 + i * 1.2) * 0.04;
    const angle = baseAngle + ((i - count / 2) * 0.14) + rayDrift;
    const rayWidth = 0.08 + Math.sin(time * 0.8 + i) * 0.02;
    const rayLength = height * 1.6;

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-Math.sin(rayWidth * 0.5) * rayLength, rayLength);
    ctx.lineTo(Math.sin(rayWidth * 0.5) * rayLength, rayLength);
    ctx.closePath();

    const rayGrad = ctx.createLinearGradient(0, 0, 0, rayLength);
    rayGrad.addColorStop(0, `${lighting.color}${Math.floor(lighting.volumetric * 50).toString(16).padStart(2, '0')}`);
    rayGrad.addColorStop(0.6, `${lighting.color}${Math.floor(lighting.volumetric * 25).toString(16).padStart(2, '0')}`);
    rayGrad.addColorStop(1, '#00000000');

    ctx.fillStyle = rayGrad;
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * 4. Multi-Layer Background Terrain Silhouettes (Mountains / Hills / Distance)
 */
function renderBackgroundTerrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: any,
  time: number
) {
  ctx.save();

  // Distant mountain layer (Subtle, slightly illuminated by backlight)
  ctx.fillStyle = `${bg.skyGradient.mid}bb`;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.62);
  ctx.lineTo(width * 0.2, height * 0.48);
  ctx.lineTo(width * 0.42, height * 0.60);
  ctx.lineTo(width * 0.65, height * 0.44);
  ctx.lineTo(width * 0.85, height * 0.58);
  ctx.lineTo(width, height * 0.50);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Midground mountain / ridge layer (Darker silhouette)
  ctx.fillStyle = '#100a0e';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.74);
  ctx.quadraticCurveTo(width * 0.18, height * 0.64, width * 0.38, height * 0.72);
  ctx.quadraticCurveTo(width * 0.58, height * 0.80, width * 0.78, height * 0.68);
  ctx.quadraticCurveTo(width * 0.9, height * 0.64, width, height * 0.70);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * 5. Atmospheric Fog Simulation
 */
function renderAtmosphericFog(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: any,
  fogConfig: any,
  time: number,
  layerFactor: number,
  isDraft: boolean = false
) {
  const fogY = height * 0.65 + layerFactor * 80;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  // Skip expensive GPU canvas filter blur in draft preview to guarantee high fps
  if (!isDraft) {
    ctx.filter = 'blur(16px)';
  }

  const fogGrad = ctx.createLinearGradient(0, fogY - 120, 0, fogY + 120);
  const alpha = Math.min(0.6, fogConfig.density * 0.45 * layerFactor);
  fogGrad.addColorStop(0, '#00000000');
  fogGrad.addColorStop(0.3, `${bg.fogColor}${Math.floor(alpha * 0.5 * 255).toString(16).padStart(2, '0')}`);
  fogGrad.addColorStop(0.5, `${bg.fogColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
  fogGrad.addColorStop(0.7, `${bg.fogColor}${Math.floor(alpha * 0.5 * 255).toString(16).padStart(2, '0')}`);
  fogGrad.addColorStop(1, '#00000000');

  ctx.fillStyle = fogGrad;
  ctx.fillRect(0, fogY - 120, width, 240);

  ctx.restore();
}

/**
 * 6. Scene Element Rendering (Pure Silhouettes with contact diffusion)
 */
function renderSceneElement(
  ctx: CanvasRenderingContext2D,
  element: SceneElement,
  time: number,
  lighting: any,
  isDraft: boolean = false
) {
  const state = getElementStateAtTime(element, time);
  if (state.opacity <= 0.01) return;

  ctx.save();
  ctx.translate(state.x, state.y);
  ctx.rotate((state.rotation || 0) * (Math.PI / 180));
  ctx.scale(state.scaleX, state.scaleY);
  ctx.globalAlpha = state.opacity;

  // Soft shadow contact blur simulating proximity to kelir screen (bypassed in draft preview)
  if (element.blur > 0 && !isDraft) {
    ctx.filter = `blur(${element.blur}px)`;
  }

  // Shadow theater silhouette color: deepest charcoal-black (#09080b)
  const silhouetteColor = '#09080b';

  if (element.type === 'character') {
    const pose = (state.pose || element.pose || 'idle') as any;
    const poseSpeed = element.poseSpeed ?? 1.0;
    const limbAngles = calculateLimbAngles(pose, time, poseSpeed, element.customLimbs);

    drawArticulatedCharacter(ctx, element.subtype, limbAngles, {
      color: silhouetteColor,
    });
  } else if (element.type === 'animal') {
    drawArticulatedAnimal(ctx, element.subtype, time, silhouetteColor);
  } else {
    // Trees, buildings, props, nature
    drawStaticSilhouette(ctx, element.subtype, time, silhouetteColor);
  }

  ctx.restore();
}

/**
 * 7. Foreground Ground Plane Silhouette
 */
function renderForegroundTerrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: any
) {
  ctx.save();
  ctx.fillStyle = '#070608';

  // Ground slope silhouette
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.82);
  ctx.quadraticCurveTo(width * 0.35, height * 0.80, width * 0.7, height * 0.83);
  ctx.quadraticCurveTo(width * 0.88, height * 0.84, width, height * 0.81);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Subtle foreground grass blades / contact silhouette
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#070608';
  for (let x = 10; x < width; x += 35) {
    ctx.beginPath();
    ctx.moveTo(x, height * 0.82);
    ctx.lineTo(x + 4, height * 0.82 - 8);
    ctx.moveTo(x + 12, height * 0.82);
    ctx.lineTo(x + 10, height * 0.82 - 12);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 8. Atmospheric Particles (Dust, Fire Embers, Leaves, Rain)
 */
function renderAtmosphericParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  particlesConfig: any,
  lighting: any,
  time: number,
  isDraft: boolean = false
) {
  const { type, speed } = particlesConfig;
  const count = isDraft ? Math.min(particlesConfig.count, 14) : particlesConfig.count;
  ctx.save();

  if (type === 'embers') {
    // Glowing fire sparks floating upwards
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < count; i++) {
      const seed = i * 137.5;
      const x = ((seed + time * speed * 45) % width);
      const y = height - (((seed * 3 + time * speed * 95) % height));
      const size = 1.5 + (i % 3);
      const alpha = 0.4 + Math.sin(time * 5 + i) * 0.3;

      ctx.fillStyle = `${lighting.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'leaves') {
    // Dark silhouette autumn leaves tumbling in the wind
    ctx.fillStyle = '#080608';
    for (let i = 0; i < count; i++) {
      const seed = i * 149.2;
      const x = (seed * 2 + time * speed * 75) % (width + 100) - 50;
      const y = (seed + time * speed * 40 + Math.sin(time * 3 + i) * 35) % height;
      const rot = time * 4 + i;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (type === 'dust') {
    // Drifting glowing dust motes illuminated by the backlight
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < count; i++) {
      const seed = i * 193.7;
      const x = (seed + Math.sin(time * 0.8 + i) * 45 + time * speed * 15) % width;
      const y = (seed * 1.5 + Math.cos(time * 0.6 + i) * 30) % (height * 0.85);
      const size = 1.2 + (i % 2);
      const alpha = 0.25 + Math.sin(time * 2 + i) * 0.2;

      ctx.fillStyle = `${lighting.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'rain') {
    // Slanted rain streaks
    ctx.strokeStyle = '#ffffff25';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < count * 2; i++) {
      const seed = i * 113.3;
      const x = (seed * 4 + time * speed * 180) % width;
      const y = (seed * 7 + time * speed * 600) % height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 12, y + 28);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * 9. Kelir Screen Weave Grain & Cinema Vignette
 */
function renderKelirScreenGrain(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();

  // Subtle warm cinematic theater vignette
  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    height * 0.45,
    width * 0.5,
    height * 0.5,
    width * 0.65
  );
  vignette.addColorStop(0, '#00000000');
  vignette.addColorStop(1, '#00000066');

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}

/**
 * 10. Selection Bounding Box & Transform Handles
 */
function renderSelectionGizmo(ctx: CanvasRenderingContext2D, element: SceneElement, time: number) {
  const state = getElementStateAtTime(element, time);
  const boxW = 90 * Math.abs(state.scaleX);
  const boxH = 140 * Math.abs(state.scaleY);

  ctx.save();
  ctx.translate(state.x, state.y);
  ctx.rotate((state.rotation || 0) * (Math.PI / 180));

  // Bounding rect
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(-boxW * 0.5, -boxH, boxW, boxH);
  ctx.setLineDash([]);

  // Corner handles
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  const handles = [
    [-boxW * 0.5, -boxH],
    [boxW * 0.5, -boxH],
    [boxW * 0.5, 0],
    [-boxW * 0.5, 0],
  ];

  for (const [hx, hy] of handles) {
    ctx.beginPath();
    ctx.rect(hx - 4, hy - 4, 8, 8);
    ctx.fill();
    ctx.stroke();
  }

  // Rotation handle at top
  ctx.beginPath();
  ctx.moveTo(0, -boxH);
  ctx.lineTo(0, -boxH - 24);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, -boxH - 24, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Label banner
  ctx.fillStyle = '#1e1b18ee';
  ctx.fillRect(-boxW * 0.5, -boxH - 22, boxW, 16);
  ctx.fillStyle = '#f59e0b';
  ctx.font = '10px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(element.name, 0, -boxH - 14);

  ctx.restore();
}
