import { PaletteMode } from '@mui/material/styles';

// project imports
import { extendPaletteWithChannels } from 'utils/colorUtils';

// assets
import defaultColor from './theme/default';

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export function buildPalette(presetColor: string) {
  let colors;
  switch (presetColor) {
    case 'default':
    default:
      colors = defaultColor;
  }

  const lightColors = {
    primary: {
      light: colors.primaryLight,
      main: colors.primaryMain,
      dark: colors.primaryDark,
      200: colors.primary200,
      800: colors.primary800
    },
    secondary: {
      light: colors.secondaryLight,
      main: colors.secondaryMain,
      dark: colors.secondaryDark,
      200: colors.secondary200,
      800: colors.secondary800
    },
    error: {
      light: colors.errorLight,
      main: colors.errorMain,
      dark: colors.errorDark
    },
    orange: {
      light: colors.orangeLight,
      main: colors.orangeMain,
      dark: colors.orangeDark
    },
    warning: {
      light: colors.warningLight,
      main: colors.warningMain,
      dark: colors.warningDark,
      contrastText: colors.grey700
    },
    success: {
      light: colors.successLight,
      200: colors.success200,
      main: colors.successMain,
      dark: colors.successDark
    },
    grey: {
      50: colors.grey50,
      100: colors.grey100,
      500: colors.grey500,
      600: colors.grey600,
      700: colors.grey700,
      900: colors.grey900
    },
    dark: {
      light: colors.darkTextPrimary,
      main: colors.darkLevel1,
      dark: colors.darkLevel2,
      800: colors.darkBackground,
      900: colors.darkPaper
    },
    text: {
      primary: colors.grey700,
      secondary: colors.grey500,
      dark: colors.grey900,
      hint: colors.grey100,
      heading: colors.grey900
    },
    divider: colors.grey200,
    background: {
      paper: colors.paper,
      default: '#f8f9fa'
    }
  };

  const darkColors = {
    primary: {
      light: colors.darkPrimaryLight,
      main: colors.darkPrimaryMain,
      dark: colors.darkPrimaryDark,
      200: colors.darkPrimary200,
      800: colors.darkPrimary800
    },
    secondary: {
      light: colors.darkSecondaryLight,
      main: colors.darkSecondaryMain,
      dark: colors.darkSecondaryDark,
      200: colors.darkSecondary200,
      800: colors.darkSecondary800
    },
    error: {
      light: '#ff7875',
      main: '#ff4d4f',
      dark: '#d9363e'
    },
    orange: {
      light: '#ffbb96',
      main: '#FFAB91',
      dark: '#ff9a76'
    },
    warning: {
      light: '#ffd666',
      main: '#faad14',
      dark: '#d48806',
      contrastText: '#1d1d1d'
    },
    success: {
      light: '#73d13d',
      200: '#95de64',
      main: '#52c41a',
      dark: '#389e0d'
    },
    info: {
      light: '#5cdbd3',
      main: '#03c9d7',
      dark: '#006d75'
    },
    grey: {
      50: '#fafafacc',
      100: '#f5f5f5',
      500: '#999999',
      600: '#787878',
      700: '#666666',
      900: '#333333'
    },
    dark: {
      light: '#333333',
      main: '#2a2a2a',
      dark: '#1f1f1f',
      800: '#1a1a1a',
      900: '#1d1d1d'
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffffffcc',
      dark: '#ffffff',
      hint: '#999999',
      heading: '#ffffff'
    },
    divider: '#333333ee',
    background: {
      paper: '#1f1f1f',
      default: '#1d1d1d'
    }
  };

  const commonColor = { common: { black: colors.darkPaper, white: '#fff' } };

  const extendedLight = extendPaletteWithChannels(lightColors);
  const extendedDark = extendPaletteWithChannels(darkColors);
  const extendedCommon = extendPaletteWithChannels(commonColor);

  return {
    light: {
      mode: 'light' as PaletteMode,
      ...extendedCommon,
      ...extendedLight
    },
    dark: {
      mode: 'dark' as PaletteMode,
      ...extendedCommon,
      ...extendedDark
    }
  };
}
