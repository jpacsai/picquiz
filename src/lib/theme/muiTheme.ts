import { createTheme } from '@mui/material/styles';

import components from './components';
import palette from './palette';
import typography from './typography.ts';

const theme = createTheme({
  components,
  palette,
  typography,
});

export default theme;
