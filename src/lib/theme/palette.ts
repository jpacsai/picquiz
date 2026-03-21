import type { ThemeOptions } from '@mui/material/styles';

import {
  defaultThemePresetId,
  getThemePreset,
  resolveOnSurfaceTokens,
  type ThemeColorTokens,
  type ThemePresetId,
} from './themePresets';

export const createPalette = (colors: ThemeColorTokens): ThemeOptions['palette'] => {
  const onSurface = resolveOnSurfaceTokens(colors);

  return {
    mode: colors.mode,
    primary: {
      main: colors.brand.primary,
      light: colors.brand.primaryLight,
    },
    secondary: {
      main: colors.brand.accent,
      dark: colors.brand.accentDark,
    },
    background: {
      default: colors.surface.page,
      paper: colors.surface.card,
    },
    divider: colors.border.main,
    text: {
      primary: onSurface.pagePrimary,
      secondary: onSurface.pageSecondary,
    },
    action: {
      hover: colors.surface.alt,
    },
  };
};

export const getPalette = (presetId: ThemePresetId = defaultThemePresetId) => {
  return createPalette(getThemePreset(presetId).colors);
};

const palette = getPalette();

export default palette;
