import { amber, blue, blueGrey, deepOrange, grey } from '@mui/material/colors';

export const themePresetIds = ['midnight', 'ocean', 'sunset', 'paper'] as const;

export type ThemePresetId = (typeof themePresetIds)[number];

export type ThemeColorTokens = {
  mode: 'light' | 'dark';
  brand: {
    primary: string;
    primaryLight: string;
  };
  surface: {
    page: string;
    card: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
};

export type ThemeTypographyTokens = {
  fontFamily: string;
  h1: {
    fontSize: string;
    fontWeight: number;
  };
  h2: {
    fontSize: string;
    fontWeight: number;
  };
  h3: {
    fontSize: string;
    fontWeight: number;
  };
  h4: {
    fontSize: string;
    fontWeight: number;
  };
  body1: {
    fontSize: string;
    lineHeight: string;
    fontWeight: number;
  };
  body2: {
    fontSize: string;
    lineHeight: string;
    fontWeight: number;
  };
};

export type ThemePresetOption = {
  id: ThemePresetId;
  label: string;
  description: string;
};

export type ThemePresetDefinition = ThemePresetOption & {
  colors: ThemeColorTokens;
  typography: ThemeTypographyTokens;
};

export const defaultThemePresetId: ThemePresetId = 'midnight';

export const themePresets: ReadonlyArray<ThemePresetDefinition> = [
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Kontrasztos, ejszakai hangulatu alap stilus kek hangsullyal.',
    colors: {
      mode: 'dark',
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
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '1.875rem',
        fontWeight: 700,
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 700,
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 700,
      },
      h4: {
        fontSize: '1.125rem',
        fontWeight: 700,
      },
      body1: {
        fontSize: '.875rem',
        lineHeight: '1.375rem',
        fontWeight: 400,
      },
      body2: {
        fontSize: '.75rem',
        lineHeight: '1.25rem',
        fontWeight: 400,
      },
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    description: 'Hideg, melykek es szurkeskek design preset.',
    colors: {
      mode: 'dark',
      brand: {
        primary: blue[200],
        primaryLight: blue[100],
      },
      surface: {
        page: '#08131f',
        card: blueGrey[900],
      },
      text: {
        primary: '#eff6ff',
        secondary: blueGrey[200],
      },
    },
    typography: {
      fontFamily: '"Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif',
      h1: {
        fontSize: '1.95rem',
        fontWeight: 700,
      },
      h2: {
        fontSize: '1.55rem',
        fontWeight: 700,
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.125rem',
        fontWeight: 600,
      },
      body1: {
        fontSize: '.9rem',
        lineHeight: '1.45rem',
        fontWeight: 400,
      },
      body2: {
        fontSize: '.78rem',
        lineHeight: '1.3rem',
        fontWeight: 400,
      },
    },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    description: 'Meleg, narancsos-accentes design preset.',
    colors: {
      mode: 'dark',
      brand: {
        primary: deepOrange[300],
        primaryLight: amber[300],
      },
      surface: {
        page: '#1c1917',
        card: '#292524',
      },
      text: {
        primary: '#fff7ed',
        secondary: '#fdba74',
      },
    },
    typography: {
      fontFamily: '"Gill Sans", "Trebuchet MS", "Segoe UI", sans-serif',
      h1: {
        fontSize: '1.9rem',
        fontWeight: 800,
      },
      h2: {
        fontSize: '1.55rem',
        fontWeight: 700,
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 700,
      },
      h4: {
        fontSize: '1.125rem',
        fontWeight: 700,
      },
      body1: {
        fontSize: '.875rem',
        lineHeight: '1.45rem',
        fontWeight: 400,
      },
      body2: {
        fontSize: '.75rem',
        lineHeight: '1.3rem',
        fontWeight: 400,
      },
    },
  },
  {
    id: 'paper',
    label: 'Paper',
    description: 'Letisztult, vilagos feluletekre epulo design preset.',
    colors: {
      mode: 'light',
      brand: {
        primary: blue[700],
        primaryLight: blue[500],
      },
      surface: {
        page: grey[50],
        card: '#ffffff',
      },
      text: {
        primary: grey[900],
        secondary: grey[700],
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '1.875rem',
        fontWeight: 700,
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 700,
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 700,
      },
      h4: {
        fontSize: '1.125rem',
        fontWeight: 700,
      },
      body1: {
        fontSize: '.875rem',
        lineHeight: '1.375rem',
        fontWeight: 400,
      },
      body2: {
        fontSize: '.75rem',
        lineHeight: '1.25rem',
        fontWeight: 400,
      },
    },
  },
];

export const themePresetOptions: ReadonlyArray<ThemePresetOption> = themePresets.map(
  ({ id, label, description }) => ({
    id,
    label,
    description,
  }),
);

export const getThemePreset = (presetId: ThemePresetId): ThemePresetDefinition => {
  return themePresets.find((preset) => preset.id === presetId) ?? themePresets[0];
};
