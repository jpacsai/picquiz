import { ThemeProvider } from '@mui/material/styles';
import { type PropsWithChildren,useEffect, useMemo, useState } from 'react';

import { createAppTheme } from './muiTheme';
import { ThemePresetContext } from './ThemePresetContext';
import {
  defaultThemePresetId,
  type ThemePresetId,
  themePresetIds,
} from './themePresets';

const THEME_PRESET_STORAGE_KEY = 'picquiz-theme-preset';

const isThemePresetId = (value: string): value is ThemePresetId => {
  return themePresetIds.includes(value as ThemePresetId);
};

const getInitialPresetId = (): ThemePresetId => {
  if (typeof window === 'undefined') {
    return defaultThemePresetId;
  }

  const storedPresetId = window.localStorage.getItem(THEME_PRESET_STORAGE_KEY);

  return storedPresetId && isThemePresetId(storedPresetId) ? storedPresetId : defaultThemePresetId;
};

export const ThemePresetProvider = ({ children }: PropsWithChildren) => {
  const [presetId, setPresetId] = useState<ThemePresetId>(getInitialPresetId);

  useEffect(() => {
    window.localStorage.setItem(THEME_PRESET_STORAGE_KEY, presetId);
  }, [presetId]);

  const theme = useMemo(() => createAppTheme(presetId), [presetId]);
  const value = useMemo(() => ({ presetId, setPresetId }), [presetId]);

  return (
    <ThemePresetContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemePresetContext.Provider>
  );
};
