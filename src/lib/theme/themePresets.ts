export const themePresetIds = [
  'othello',
  'fleurs',
  'paper',
  'blue-botanique',
  'blue-porcelaine',
  'blush-sage',
  'jungle-ember',
  'sepia-nocturne',
  'porcelaine',
  'eunoia-teal',
  'waterlily',
  'venus',
  'sunset',
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

export type ThemeOnSurfaceTokens = {
  pagePrimary: string;
  pageSecondary: string;
  cardPrimary: string;
  cardSecondary: string;
  altPrimary: string;
  altSecondary: string;
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
  onSurface?: ThemeOnSurfaceTokens;
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

export const resolveOnSurfaceTokens = (colors: ThemeColorTokens): ThemeOnSurfaceTokens => {
  if (colors.onSurface) {
    return colors.onSurface;
  }

  return {
    pagePrimary: colors.text.primary,
    pageSecondary: colors.text.secondary,
    cardPrimary: colors.text.primary,
    cardSecondary: colors.text.secondary,
    altPrimary: colors.text.primary,
    altSecondary: colors.text.secondary,
  };
};

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
  onSurface: {
    pagePrimary: '#F2E9E3',
    pageSecondary: '#B8AFBF',
    cardPrimary: '#F4ECE6',
    cardSecondary: '#C0B6C4',
    altPrimary: '#F6EEE8',
    altSecondary: '#C8BFCC',
  },
  border: {
    main: '#68739D',
  },
  text: {
    primary: '#F2E9E3',
    primaryHover: '#FBF3EE',
    secondary: '#B8AFBF',
    secondaryHover: '#C8BFCC',
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
    primaryLight: '#E0C0AA',
    primaryHover: '#DEBBA4',
    accent: '#8A2F4D',
    accentDark: '#5C2036',
  },
  surface: {
    page: '#0B171B',
    card: '#102B36',
    alt: '#1A3A46',
  },
  onSurface: {
    pagePrimary: '#F0E7DE',
    pageSecondary: '#C1B4B0',
    cardPrimary: '#F5ECE4',
    cardSecondary: '#CABDB8',
    altPrimary: '#FAF0E8',
    altSecondary: '#D0C3BE',
  },
  border: {
    main: '#34505A',
  },
  text: {
    primary: '#F0E7DE',
    primaryHover: '#FBF2EA',
    secondary: '#C1B4B0',
    secondaryHover: '#D0C3BE',
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
      id: 'paper',
      label: 'Paper',
    },
    colors: {
  mode: 'light',
  brand: {
    primary: '#6F5B54',
    primaryLight: '#8A736B',
    primaryHover: '#5E4C46',
    accent: '#B3905C',
    accentDark: '#876A3D',
  },
  surface: {
    page: '#F5F1EC',
    card: '#E7DDD7',
    alt: '#D8CDCA',
  },
  onSurface: {
    pagePrimary: '#342B28',
    pageSecondary: '#625654',
    cardPrimary: '#312825',
    cardSecondary: '#5C514E',
    altPrimary: '#2E2623',
    altSecondary: '#564C48',
  },
  border: {
    main: '#CEC2BC',
  },
  text: {
    primary: '#342B28',
    primaryHover: '#281F1D',
    secondary: '#625654',
    secondaryHover: '#564C48',
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
    primaryLight: '#4C7AA9',
    primaryHover: '#264E75',
    accent: '#9B7A2F',
    accentDark: '#6F5620',
  },
  surface: {
    page: '#F4EFE6',
    card: '#E4ECE6',
    alt: '#D3E0DA',
  },
  onSurface: {
    pagePrimary: '#2E382F',
    pageSecondary: '#5E675A',
    cardPrimary: '#29342E',
    cardSecondary: '#566156',
    altPrimary: '#243731',
    altSecondary: '#4E635C',
  },
  border: {
    main: '#CDD6CC',
  },
  text: {
    primary: '#2E382F',
    primaryHover: '#232B25',
    secondary: '#5E675A',
    secondaryHover: '#4F584C',
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
        primary: '#4F6F9E',
        primaryLight: '#6A87B5',
        primaryHover: '#3F5F8D',
        accent: '#8FA9C8',
        accentDark: '#355277',
      },
      surface: {
        page: '#F5F4F1',
        card: '#E8EDF3',
        alt: '#D6E0EB',
      },
      onSurface: {
        pagePrimary: '#243246',
        pageSecondary: '#5B697D',
        cardPrimary: '#223045',
        cardSecondary: '#556479',
        altPrimary: '#1F2C40',
        altSecondary: '#4F5E73',
      },
      border: {
        main: '#C9D2DD',
      },
      text: {
        primary: '#243246',
        primaryHover: '#1E2A3C',
        secondary: '#5B697D',
        secondaryHover: '#4F5E73',
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
    primary: '#D08A1F',
    primaryLight: '#E2A23A',
    primaryHover: '#E2A23A',
    accent: '#A7355A',
    accentDark: '#671833',
  },
  surface: {
    page: '#0A120E',
    card: '#102017',
    alt: '#1A3023',
  },
  onSurface: {
    pagePrimary: '#F4EBDD',
    pageSecondary: '#C6B89F',
    cardPrimary: '#F7EEE1',
    cardSecondary: '#CDBFA8',
    altPrimary: '#FAF1E4',
    altSecondary: '#D3C5AE',
  },
  border: {
    main: '#395142',
  },
  text: {
    primary: '#F4EBDD',
    primaryHover: '#FFF7EC',
    secondary: '#C6B89F',
    secondaryHover: '#D3C5AE',
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
    primary: '#C79B84',
    primaryLight: '#D7AF9B',
    primaryHover: '#D7AF9B',
    accent: '#8A5A47',
    accentDark: '#5A372A',
  },
  surface: {
    page: '#0A0908',
    card: '#14110F',
    alt: '#211A16',
  },
  onSurface: {
    pagePrimary: '#F3E7DE',
    pageSecondary: '#C5AEA0',
    cardPrimary: '#F6EBE3',
    cardSecondary: '#CBB7AB',
    altPrimary: '#F8EDE5',
    altSecondary: '#D2BEB2',
  },
  border: {
    main: '#4A392F',
  },
  text: {
    primary: '#F3E7DE',
    primaryHover: '#FFF6F0',
    secondary: '#C5AEA0',
    secondaryHover: '#D2BEB2',
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
    primaryLight: '#73897D',
    primaryHover: '#4E6258',
    accent: '#8FAEA3',
    accentDark: '#5F7A71',
  },
  surface: {
    page: '#F4F5F2',
    card: '#E8EBE5',
    alt: '#D9DED6',
  },
  onSurface: {
    pagePrimary: '#2A2E2B',
    pageSecondary: '#5E6660',
    cardPrimary: '#252A27',
    cardSecondary: '#57605A',
    altPrimary: '#222826',
    altSecondary: '#505A54',
  },
  border: {
    main: '#D0D6CE',
  },
  text: {
    primary: '#2A2E2B',
    primaryHover: '#1F2321',
    secondary: '#5E6660',
    secondaryHover: '#505A54',
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
      id: 'waterlily',
      label: 'Waterlily',
    },
    colors: {
      mode: 'light',
      brand: {
        primary: '#2C6370',
        primaryLight: '#4C8591',
        primaryHover: '#255460',
        accent: '#A86F9B',
        accentDark: '#744D70',
      },
      surface: {
        page: '#F6FAF9',
        card: '#EAF2F0',
        alt: '#DDECE8',
      },
      onSurface: {
        pagePrimary: '#23373E',
        pageSecondary: '#50686F',
        cardPrimary: '#20343B',
        cardSecondary: '#4B636A',
        altPrimary: '#1F3940',
        altSecondary: '#466168',
      },
      border: {
        main: '#C6D8D5',
      },
      text: {
        primary: '#23373E',
        primaryHover: '#1B2C32',
        secondary: '#50686F',
        secondaryHover: '#43595F',
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
      id: 'venus',
      label: 'Venus',
    },
    colors: {
      mode: 'light',
      brand: {
        primary: '#3F6F73',
        primaryLight: '#5D8A8D',
        primaryHover: '#345C5F',
        accent: '#A86E6C',
        accentDark: '#7A4E4C',
      },
      surface: {
        page: '#F7F5EF',
        card: '#EDF2EE',
        alt: '#DEE7E0',
      },
      onSurface: {
        pagePrimary: '#253433',
        pageSecondary: '#526360',
        cardPrimary: '#223230',
        cardSecondary: '#4D5E5B',
        altPrimary: '#203432',
        altSecondary: '#49605C',
      },
      border: {
        main: '#CCD7D0',
      },
      text: {
        primary: '#253433',
        primaryHover: '#1E2A29',
        secondary: '#526360',
        secondaryHover: '#445552',
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
      id: 'sunset',
      label: 'Sunset',
    },
    colors: {
      mode: 'dark',
      brand: {
        primary: '#E08A5C',
        primaryLight: '#F0A176',
        primaryHover: '#F0A176',
        accent: '#A5658D',
        accentDark: '#6E4766',
      },
      surface: {
        page: '#141625',
        card: '#1B1E31',
        alt: '#262347',
      },
      onSurface: {
        pagePrimary: '#F7EEE8',
        pageSecondary: '#C8BAC6',
        cardPrimary: '#F8F0EA',
        cardSecondary: '#CEC1CC',
        altPrimary: '#FAF2ED',
        altSecondary: '#D4C7D0',
      },
      border: {
        main: '#434369',
      },
      text: {
        primary: '#F7EEE8',
        primaryHover: '#FFF7F2',
        secondary: '#C8BAC6',
        secondaryHover: '#D4C7D0',
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
  ({ colors, meta }) => ({
    id: meta.id,
    label: colors.mode === 'dark' ? `${meta.label} - dark` : meta.label,
  }),
);

export const getThemePreset = (presetId: ThemePresetId): ThemePresetDefinition => {
  return themePresets.find((preset) => preset.meta.id === presetId) ?? themePresets[0];
};
