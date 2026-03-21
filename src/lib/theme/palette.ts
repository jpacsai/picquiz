import { blue, grey } from '@mui/material/colors';
import type { ThemeOptions } from '@mui/material/styles';

export const themeColors = {
  brand: {
    primary: blue[300],
    primaryLight: blue[200],
  },
  surface: {
    page: '#0f172a',
    card: '#1e293b',
  },
  text: {
    primary: '#f8fafc',
    secondary: grey[400],
  },
};

const palette: ThemeOptions['palette'] = {
  mode: 'dark',
  primary: {
    main: themeColors.brand.primary,
    light: themeColors.brand.primaryLight,
  },
  background: {
    default: themeColors.surface.page,
    paper: themeColors.surface.card,
  },
  text: {
    primary: themeColors.text.primary,
    secondary: themeColors.text.secondary,
  },
};

export default palette;
