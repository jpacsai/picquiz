import { blue, grey } from '@mui/material/colors';
import type { ThemeOptions } from '@mui/material/styles';

export const themeColors = {
  brand: {
    primary: blue[600],
    primaryLight: blue.A100,
  },
  surface: {
    page: grey[50],
    card: blue.A100,
  },
  text: {
    primary: grey[900],
    secondary: grey[700],
  },
};

const palette: ThemeOptions['palette'] = {
  mode: 'light',
  primary: {
    main: themeColors.brand.primary,
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
