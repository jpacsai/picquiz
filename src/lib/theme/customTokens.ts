import type { ThemeOptions } from '@mui/material/styles';

import {
  defaultThemePresetId,
  getThemePreset,
  type ThemeColorTokens,
  type ThemePresetId,
} from './themePresets';

export type AppThemeCustomTokens = {
  brand: {
    primaryHover: string;
    accent: string;
    accentDark: string;
  };
  surface: {
    alt: string;
  };
  text: {
    primaryHover: string;
    secondaryHover: string;
  };
  border: {
    main: string;
  };
};

declare module '@mui/material/styles' {
  interface Theme {
    customTokens: AppThemeCustomTokens;
  }

  interface ThemeOptions {
    customTokens?: AppThemeCustomTokens;
  }
}

export const createCustomTokens = (colors: ThemeColorTokens): AppThemeCustomTokens => ({
  brand: {
    primaryHover: colors.brand.primaryHover,
    accent: colors.brand.accent,
    accentDark: colors.brand.accentDark,
  },
  surface: {
    alt: colors.surface.alt,
  },
  text: {
    primaryHover: colors.text.primaryHover,
    secondaryHover: colors.text.secondaryHover,
  },
  border: {
    main: colors.border.main,
  },
});

export const getCustomTokens = (presetId: ThemePresetId = defaultThemePresetId) => {
  return createCustomTokens(getThemePreset(presetId).colors);
};

const customTokens: ThemeOptions['customTokens'] = getCustomTokens();

export default customTokens;
