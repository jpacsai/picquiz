import type { Components, Theme } from '@mui/material/styles';

import card from './card';
import inputLabel from './inputlabel';

const components: Components<Theme> = {
  MuiCard: card,
  MuiInputLabel: inputLabel,
};

export default components;
