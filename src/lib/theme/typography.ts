import type { TypographyVariantsOptions } from '@mui/material/styles';

import {
  defaultThemePresetId,
  getThemePreset,
  type ThemePresetId,
  type ThemeTypographyTokens,
} from './themePresets';

export const createTypography = (
  typographyTokens: ThemeTypographyTokens,
): TypographyVariantsOptions => ({
  fontFamily: typographyTokens.fontFamily,
  h1: typographyTokens.h1,
  h2: typographyTokens.h2,
  h3: typographyTokens.h3,
  h4: typographyTokens.h4,
  body1: typographyTokens.body1,
  body2: typographyTokens.body2,
});

export const getTypography = (presetId: ThemePresetId = defaultThemePresetId) => {
  return createTypography(getThemePreset(presetId).typography);
};

const typography = getTypography();

export default typography;
