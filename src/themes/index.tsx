import { useMemo, ReactNode } from 'react';

// material-ui
import { createTheme, ThemeProvider, StyledEngineProvider, ThemeOptions, Direction, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// ==============================|| THEME EXTENSIONS ||============================== //

declare module '@mui/material/styles' {
  interface Theme {
    customShadows?: {
      [key: string]: string | string[];
    };
  }

  interface ThemeOptions {
    customShadows?: {
      [key: string]: string | string[];
    };
  }
}

// project imports
import { CSS_VAR_PREFIX, DEFAULT_THEME_MODE } from 'config';
import CustomShadows from './custom-shadows';
import useConfig from 'hooks/useConfig';
import { buildPalette } from './palette';
import Typography from './typography';
import componentsOverrides from './overrides';

// ==============================|| THEME TYPES ||============================== //

export interface ThemeCustomizationProps {
  children: ReactNode;
}

// ==============================|| DEFAULT THEME - MAIN ||============================== //

export default function ThemeCustomization({ children }: ThemeCustomizationProps) {
  const {
    state: { borderRadius, fontFamily, outlinedFilled, presetColor }
  } = useConfig();

  const palette = useMemo(() => buildPalette(presetColor), [presetColor]);

  const themeTypography = useMemo(() => Typography(fontFamily), [fontFamily]);

  const customShadows = useMemo(() => CustomShadows(palette.light as any, 'light'), [palette]);

  const themeOptions = useMemo(
    (): ThemeOptions => ({
      direction: 'ltr' as Direction,
      mixins: {
        toolbar: {
          minHeight: '48px',
          padding: '16px',
          '@media (min-width: 600px)': {
            minHeight: '48px'
          }
        }
      },
      typography: themeTypography,
      customShadows: customShadows,
      colorSchemes: {
        light: {
          palette: palette.light
        },
        dark: {
          palette: palette.dark
        }
      },
      cssVariables: {
        cssVarPrefix: CSS_VAR_PREFIX,
        colorSchemeSelector: 'data-color-scheme'
      }
    }),
    [themeTypography, palette]
  );

  const themes = createTheme(themeOptions);
  themes.components = useMemo(() => componentsOverrides(themes, borderRadius, outlinedFilled), [themes, borderRadius, outlinedFilled]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider disableTransitionOnChange theme={themes} modeStorageKey="theme-mode" defaultMode={DEFAULT_THEME_MODE}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
