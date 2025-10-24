import * as React from 'react';
import { RouterLink } from './RouterLink';

type RLProps = React.ComponentProps<typeof RouterLink>;

export const NavLink: React.FC<RLProps> = (props) => (
  <RouterLink
    {...props}
    sx={{
      px: 1,
      py: 0.5,
      borderRadius: 1,
      transition: 'color 150ms ease',
      ...props.sx,
    }}
  />
);
