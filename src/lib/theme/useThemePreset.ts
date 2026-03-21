import { useContext } from 'react';

import { ThemePresetContext } from './ThemePresetContext';

export const useThemePreset = () => {
  const context = useContext(ThemePresetContext);

  if (!context) {
    throw new Error('useThemePreset must be used within ThemePresetProvider');
  }

  return context;
};
