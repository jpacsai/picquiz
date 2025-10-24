import { createTheme } from '@mui/material/styles';
import typography from './typography.ts';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
  typography,
});

export default theme;
