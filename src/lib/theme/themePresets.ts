export const themePresetIds = [
  'othello',
  'fleurs',
  'blume',
  'paper',
  'blue-botanique',
  'blush-sage',
  'jungle-ember',
  'sepia',
  'sepia-nocturne',
  'porcelaine',
  'eunoia-teal',
  'blue-porcelaine',
] as const;

export type ThemePresetId = (typeof themePresetIds)[number];

export type ThemeBrandTokens = {
  primary: string;
  primaryLight: string;
  primaryHover: string;
  accent: string;
  accentDark: string;
};

export type ThemeSurfaceTokens = {
  page: string;
  card: string;
  alt: string;
};

export type ThemeTextTokens = {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
};

export type ThemeBorderTokens = {
  main: string;
};

export type ThemeColorTokens = {
  mode: 'light' | 'dark';
  brand: ThemeBrandTokens;
  surface: ThemeSurfaceTokens;
  border: ThemeBorderTokens;
  text: ThemeTextTokens;
};

export type ThemeTypographyVariantTokens = {
  fontSize: string;
  fontWeight: number;
};

export type ThemeBodyTypographyVariantTokens = ThemeTypographyVariantTokens & {
  lineHeight: string;
};

export type ThemeTypographyTokens = {
  fontFamily: string;
  h1: ThemeTypographyVariantTokens;
  h2: ThemeTypographyVariantTokens;
  h3: ThemeTypographyVariantTokens;
  h4: ThemeTypographyVariantTokens;
  body1: ThemeBodyTypographyVariantTokens;
  body2: ThemeBodyTypographyVariantTokens;
};

export type ThemePresetMeta = {
  id: ThemePresetId;
  label: string;
};

export type ThemePresetOption = ThemePresetMeta;

export type ThemePresetDefinition = {
  meta: ThemePresetMeta;
  colors: ThemeColorTokens;
  typography: ThemeTypographyTokens;
};

export const defaultThemePresetId: ThemePresetId = 'othello';

export const themePresets: ReadonlyArray<ThemePresetDefinition> = [
  {
    meta: {
      id: 'othello',
      label: 'Othello',
    },
    colors: {
      mode: 'dark',
      brand: {
        primary: '#C59676',
        primaryLight: '#D2A487',
        primaryHover: '#D2A487',
        accent: '#9A6748',
        accentDark: '#6E472F',
      },
      surface: {
        page: '#0B1022',
        card: '#141A33',
        alt: '#20284A',
      },
      border: {
        main: '#31395F',
      },
      text: {
        primary: '#EEE4DE',
        primaryHover: '#F5ECE7',
        secondary: '#9C92A5',
        secondaryHover: '#B0A7B8',
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
    meta: {
      id: 'fleurs',
      label: 'Fleurs',
    },
    colors: {
      mode: 'dark',
      brand: {
        primary: '#D0AE96',
        primaryLight: '#E8E3DA',
        primaryHover: '#BC977E',
        accent: '#7A2E43',
        accentDark: '#4A2333',
      },
      surface: {
        page: '#0B171B',
        card: '#102B36',
        alt: '#1A3A46',
      },
      border: {
        main: '#24363D',
      },
      text: {
        primary: '#E8E3DA',
        primaryHover: '#D0AE96',
        secondary: '#8A9294',
        secondaryHover: '#A3AAAC',
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
    meta: {
      id: 'blume',
      label: 'Blume',
    },
    colors: {
      mode: 'dark',
      brand: {
        primary: '#20241F',
        primaryLight: '#C7C7BD',
        primaryHover: '#d8d8d0',
        accent: '#8d5a4f',
        accentDark: '#5f3a33',
      },
      surface: {
        page: '#343C31',
        card: '#B9A58A',
        alt: '#d2c2ab',
      },
      border: {
        main: '#8d816e',
      },
      text: {
        primary: '#343C31',
        primaryHover: '#20241F',
        secondary: '#343C31',
        secondaryHover: '#20241F',
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
    meta: {
      id: 'paper',
      label: 'Paper',
    },
    colors: {
      mode: 'light',
      brand: {
        primary: '#C8A36A',
        primaryLight: '#D8B57B',
        primaryHover: '#D8B57B',
        accent: '#7A6257',
        accentDark: '#56433C',
      },
      surface: {
        page: '#E7E0DA',
        card: '#B8A8A6',
        alt: '#D2C7C2',
      },
      border: {
        main: '#C9BDB7',
      },
      text: {
        primary: '#5E4A43',
        primaryHover: '#715A52',
        secondary: '#9C8E88',
        secondaryHover: '#8A7B75',
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
    meta: {
      id: 'blue-botanique',
      label: 'Blue botanique',
    },
    colors: {
      mode: 'light',
      brand: {
        primary: '#2F5E8E',
        primaryLight: '#3E73A8',
        primaryHover: '#3E73A8',
        accent: '#9B7A2F',
        accentDark: '#6F5620',
      },
      surface: {
        page: '#F3EFE5',
        card: '#DCE4DA',
        alt: '#BFD1C9',
      },
      border: {
        main: '#D5CBB8',
      },
      text: {
        primary: '#5A4B2F',
        primaryHover: '#6B5A39',
        secondary: '#8D846E',
        secondaryHover: '#7C745F',
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
    meta: {
      id: 'blush-sage',
      label: 'Blush Sage',
    },
    colors: {
      mode: 'light',
      brand: {
        primary: '#626A59',
        primaryLight: '#535B4B',
        primaryHover: '#535B4B',
        accent: '#DDC8C5',
        accentDark: '#A98276',
      },
      surface: {
        page: '#F5F2EF',
        card: '#EFE1DC',
        alt: '#9AA497',
      },
      border: {
        main: '#D9D3CE',
      },
      text: {
        primary: '#4F5447',
        primaryHover: '#3F4438',
        secondary: '#A98276',
        secondaryHover: '#967166',
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
    meta: {
      id: 'jungle-ember',
      label: 'Jungle Ember',
    },
    colors: {
      mode: 'dark',
      brand: {
        primary: '#BD6809',
        primaryLight: '#D4811F',
        primaryHover: '#D4811F',
        accent: '#9A3F4A',
        accentDark: '#3D1419',
      },
      surface: {
        page: '#121B13',
        card: '#2F4731',
        alt: '#3C5A3F',
      },
      border: {
        main: '#4A5B46',
      },
      text: {
        primary: '#F2E8D8',
        primaryHover: '#FBF1E1',
        secondary: '#B7A78D',
        secondaryHover: '#C8B89D',
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
    meta: {
      id: 'sepia',
      label: 'Sepia',
    },
    colors: {
      mode: 'light',
      brand: {
        primary: '#B38773',
        primaryLight: '#C69A85',
        primaryHover: '#C69A85',
        accent: '#6C432D',
        accentDark: '#24170F',
      },
      surface: {
        page: '#F0E1D0',
        card: '#0B0907',
        alt: '#D6BEA6',
      },
      border: {
        main: '#C7AF97',
      },
      text: {
        primary: '#3D2A20',
        primaryHover: '#52392C',
        secondary: '#9A7C68',
        secondaryHover: '#876A57',
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
    meta: {
      id: 'sepia-nocturne',
      label: 'Sepia Nocturne',
    },
    colors: {
      mode: 'dark',
      brand: {
        primary: '#C39A81',
        primaryLight: '#D2AA90',
        primaryHover: '#D2AA90',
        accent: '#8A5B43',
        accentDark: '#3A251A',
      },
      surface: {
        page: '#0A0807',
        card: '#17110E',
        alt: '#241A15',
      },
      border: {
        main: '#4B382E',
      },
      text: {
        primary: '#F1E1D0',
        primaryHover: '#F7E9D9',
        secondary: '#B89B86',
        secondaryHover: '#C9AD99',
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
    meta: {
      id: 'porcelaine',
      label: 'Porcelaine',
    },
    colors: {
      mode: 'light',
      brand: {
        primary: '#5E7468',
        primaryLight: '#6E8578',
        primaryHover: '#6E8578',
        accent: '#8FAEA3',
        accentDark: '#4A5F57',
      },
      surface: {
        page: '#F3F4F1',
        card: '#E7E9E4',
        alt: '#D7DCD4',
      },
      border: {
        main: '#D4D8D1',
      },
      text: {
        primary: '#2B2B29',
        primaryHover: '#3A3A37',
        secondary: '#8B9087',
        secondaryHover: '#7A7F77',
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
    meta: {
      id: 'eunoia-teal',
      label: 'Eunoia Teal',
    },
    colors: {
      mode: 'light',
      brand: {
        primary: '#1F6D78',
        primaryLight: '#2A8190',
        primaryHover: '#2A8190',
        accent: '#A45C8C',
        accentDark: '#5E3C54',
      },
      surface: {
        page: '#E7E1E3',
        card: '#B79AA9',
        alt: '#9EC2CC',
      },
      border: {
        main: '#D3C8CC',
      },
      text: {
        primary: '#3F3341',
        primaryHover: '#504252',
        secondary: '#8F7F8A',
        secondaryHover: '#7D6D78',
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
    meta: {
      id: 'blue-porcelaine',
      label: 'Blue Porcelaine',
    },
    colors: {
      mode: 'light',
      brand: {
        primary: '#6A87B5',
        primaryLight: '#5A78A7',
        primaryHover: '#5A78A7',
        accent: '#9BB4D2',
        accentDark: '#49658E',
      },
      surface: {
        page: '#F5F4F1',
        card: '#E6EBF1',
        alt: '#CDD9E6',
      },
      border: {
        main: '#D7DEE7',
      },
      text: {
        primary: '#37404F',
        primaryHover: '#2D3542',
        secondary: '#7F8D9E',
        secondaryHover: '#6E7C8D',
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
  ({ meta }) => ({
    id: meta.id,
    label: meta.label,
  }),
);

export const getThemePreset = (presetId: ThemePresetId): ThemePresetDefinition => {
  return themePresets.find((preset) => preset.meta.id === presetId) ?? themePresets[0];
};
