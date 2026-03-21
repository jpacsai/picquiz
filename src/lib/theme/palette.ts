import type { ThemeOptions } from '@mui/material/styles';

import {
  defaultThemePresetId,
  getThemePreset,
  type ThemeColorTokens,
  type ThemePresetId,
} from './themePresets';

export const createPalette = (colors: ThemeColorTokens): ThemeOptions['palette'] => ({
  mode: colors.mode,
  primary: {
    main: colors.brand.primary,
    light: colors.brand.primaryLight,
  },
  background: {
    default: colors.surface.page,
    paper: colors.surface.card,
  },
  text: {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
  },
});

export const getPalette = (presetId: ThemePresetId = defaultThemePresetId) => {
  return createPalette(getThemePreset(presetId).colors);
};

const palette = getPalette();

export default palette;
