import type { Components, Theme } from '@mui/material/styles';

import card from './card';
import inputLabel from './inputlabel';
import inputBase from './inputBase';

const components: Components<Theme> = {
  MuiCard: card,
  MuiInputLabel: inputLabel,
  MuiInputBase: inputBase,
};

export default components;
