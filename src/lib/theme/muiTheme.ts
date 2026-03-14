import { createTheme } from '@mui/material/styles';

import components from './components';
import typography from './typography.ts';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
  components,
  typography,
});

export default theme;
