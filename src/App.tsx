/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoryPackage } from './types';
import { TORAJA_SHORT_STORY_PACKAGE } from './engine/shortTorajaEpisode';
import { RORO_KIDUL_STORY_PACKAGE } from './engine/roroKidulStoryPackage';
import { RORO_KIDUL_SHORT_STORY_PACKAGE } from './engine/shortRoroKidulEpisode';
import { ALAS_PURWO_STORY_PACKAGE } from './engine/alasPurwoStoryPackage';
import { ALAS_PURWO_SHORT_STORY_PACKAGE } from './engine/shortAlasPurwoEpisode';
import { PRESET_STORY_PACKAGES } from './engine/scriptSynthesizer';
import { CinemaStudioView } from './components/CinemaStudioView';

export default function App() {
  // Preset storytelling packages, initialized with "Rahasia di Balik Hutan Paling Angker di Tanah Jawa (Short 55s)"
  const [stories, setStories] = useState<StoryPackage[]>([
    ...PRESET_STORY_PACKAGES,
    TORAJA_SHORT_STORY_PACKAGE,
    RORO_KIDUL_SHORT_STORY_PACKAGE,
    ALAS_PURWO_STORY_PACKAGE,
    ALAS_PURWO_SHORT_STORY_PACKAGE,
  ]);
  const [currentStory, setCurrentStory] = useState<StoryPackage | null>(ALAS_PURWO_SHORT_STORY_PACKAGE);

  const handleSelectStory = (storyId: string) => {
    const selected = stories.find((s) => s.id === storyId);
    if (selected) {
      setCurrentStory(selected);
    }
  };

  // Delete exported / completed story to save memory
  const handleDeleteStory = (storyId: string) => {
    const remaining = stories.filter((s) => s.id !== storyId);
    setStories(remaining);
    if (currentStory?.id === storyId) {
      setCurrentStory(remaining.length > 0 ? remaining[0] : null);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#0a0b0e] text-neutral-100 overflow-hidden font-sans">
      {/* Pure Shadow Animation Cinema Studio View (Preview & Export Centric) */}
      <CinemaStudioView
        story={currentStory}
        presetStories={stories}
        onSelectPresetStory={handleSelectStory}
        onDeleteStory={handleDeleteStory}
      />
    </div>
  );
}
