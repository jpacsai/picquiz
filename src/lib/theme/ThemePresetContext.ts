import { createContext } from 'react';

import type { ThemePresetId } from './themePresets';

export type ThemePresetContextValue = {
  presetId: ThemePresetId;
  setPresetId: (presetId: ThemePresetId) => void;
};

export const ThemePresetContext = createContext<ThemePresetContextValue | null>(null);
