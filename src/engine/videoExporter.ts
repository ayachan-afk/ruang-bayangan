/**
 * Shadow Theater Studio - Video Export Engine
 * Encodes canvas animation to WebM or MP4 using MediaRecorder
 * Supports single scene rendering and full 28-second multi-act story package rendering.
 */

import { SceneProject, StoryPackage } from '../types';
import { renderShadowScene, renderStoryFrame } from './renderer';
import { getRenderDuration } from './episodeTiming';

export interface ExportOptions {
  resolution: '720p' | '1080p';
  fps: 24 | 30;
  duration?: number;
  format: 'webm' | 'mp4';
  onProgress?: (progress: number, currentFrame: number, totalFrames: number) => void;
}

export async function exportSceneToVideo(
  scene: SceneProject,
  options: ExportOptions
): Promise<Blob> {
  const targetW = options.resolution === '1080p' ? 1920 : 1280;
  const targetH = options.resolution === '1080p' ? 1080 : 720;
  const fps = options.fps;
  const duration = options.duration || scene.duration;
  const totalFrames = Math.floor(duration * fps);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Canvas 2D context creation failed.');
  }

  let mimeType = 'video/webm;codecs=vp9';
  if (options.format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
    mimeType = 'video/mp4;codecs=avc1';
  } else if (options.format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  } else if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: options.resolution === '1080p' ? 8000000 : 5000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.onerror = (err) => {
      reject(err);
    };

    recorder.start(100);

    let frame = 0;
    const frameInterval = 1000 / fps;

    function renderNextFrame() {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      const time = frame / fps;

      ctx!.save();
      if (targetW !== 1920) {
        const scaleFactor = targetW / 1920;
        ctx!.scale(scaleFactor, scaleFactor);
      }

      renderShadowScene(ctx!, scene, time, {
        showGizmos: false,
      });

      ctx!.restore();

      frame++;
      if (options.onProgress) {
        options.onProgress(frame / totalFrames, frame, totalFrames);
      }

      setTimeout(renderNextFrame, frameInterval);
    }

    renderNextFrame();
  });
}

/**
 * Encodes an entire 28-second multi-act Story Package into a unified video file
 * with seamless act sequencing and cinematic transitions.
 */
export async function exportStoryPackageToVideo(
  story: StoryPackage,
  options: ExportOptions
): Promise<Blob> {
  const targetW = options.resolution === '1080p' ? 1920 : 1280;
  const targetH = options.resolution === '1080p' ? 1080 : 720;
  const fps = options.fps;
  const totalDuration = getRenderDuration(story);
  const totalFrames = Math.floor(totalDuration * fps);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Canvas 2D context creation failed.');
  }

  let mimeType = 'video/webm;codecs=vp9';
  if (options.format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
    mimeType = 'video/mp4;codecs=avc1';
  } else if (options.format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  } else if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: options.resolution === '1080p' ? 8500000 : 5500000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.onerror = (err) => {
      reject(err);
    };

    recorder.start(100);

    let frame = 0;
    const frameInterval = 1000 / fps;

    function renderNextFrame() {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      const globalTime = frame / fps;

      ctx!.save();
      if (targetW !== 1920) {
        const scaleFactor = targetW / 1920;
        ctx!.scale(scaleFactor, scaleFactor);
      }

      // Render the active scene
      renderStoryFrame(ctx!, story, globalTime, {
        showGizmos: false,
      });

      // Subtle crossfade black dip at scene transition points
      const transitionWindow = 0.4; // 0.4s fade
      const currentActIndex = story.acts.findIndex((act) => {
        const start = story.acts.slice(0, story.acts.indexOf(act)).reduce((sum, item) => sum + item.duration, 0);
        return globalTime >= start && globalTime < start + act.duration;
      });
      if (currentActIndex > 0 && currentActIndex < story.acts.length) {
        ctx!.fillStyle = `rgba(0, 0, 0, ${transitionWindow * 0.1})`;
        ctx!.fillRect(0, 0, 1920, 1080);
      }

      ctx!.restore();

      frame++;
      if (options.onProgress) {
        options.onProgress(frame / totalFrames, frame, totalFrames);
      }

      setTimeout(renderNextFrame, frameInterval);
    }

    renderNextFrame();
  });
}

/**
 * Trigger immediate browser download of exported video blob
 */
export function downloadVideoBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
