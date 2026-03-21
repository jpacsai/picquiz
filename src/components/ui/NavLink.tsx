import * as React from 'react';

import { RouterLink } from './RouterLink';

type RLProps = React.ComponentProps<typeof RouterLink>;

export const NavLink: React.FC<RLProps> = (props) => (
  <RouterLink
    {...props}
    sx={[
      (theme) => ({
        px: 1,
        py: 0.5,
        borderRadius: 1,
        color: theme.palette.text.secondary,
        transition: 'color 150ms ease, background-color 150ms ease',
        '&:hover': {
          color: theme.customTokens.text.primaryHover,
          backgroundColor: theme.customTokens.surface.alt,
        },
      }),
      ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
    ]}
  />
);
