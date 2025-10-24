import { createTheme } from '@mui/material/styles';
import typography from './typography.ts';
import components from './components';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
  components,
  typography,
});

export default theme;
