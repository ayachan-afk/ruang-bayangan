import { StoryPackage } from '../types';

export function getIntroDuration(story: StoryPackage): number {
  return story.episode?.introDuration ?? 0;
}

export function getOutroDuration(story: StoryPackage): number {
  return story.episode?.outroDuration ?? 0;
}

export function getRenderDuration(story: StoryPackage): number {
  return story.totalDuration + getIntroDuration(story) + getOutroDuration(story);
}

export function getContentTime(story: StoryPackage, renderTime: number): number {
  const intro = getIntroDuration(story);
  return Math.max(0, Math.min(story.totalDuration, renderTime - intro));
}

export function getActAtContentTime(story: StoryPackage, contentTime: number) {
  let accumulated = 0;
  for (let index = 0; index < story.acts.length; index += 1) {
    const act = story.acts[index];
    if (contentTime < accumulated + act.duration || index === story.acts.length - 1) {
      return { act, index, localTime: Math.max(0, contentTime - accumulated) };
    }
    accumulated += act.duration;
  }
  return { act: null, index: 0, localTime: 0 };
}
