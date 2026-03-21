import { createTheme } from '@mui/material/styles';

import components from './components';
import { getPalette } from './palette';
import { defaultThemePresetId, type ThemePresetId } from './themePresets';
import { getTypography } from './typography.ts';

export const createAppTheme = (presetId: ThemePresetId = defaultThemePresetId) =>
  createTheme({
    components,
    palette: getPalette(presetId),
    typography: getTypography(presetId),
  });

const theme = createAppTheme();

export default theme;
