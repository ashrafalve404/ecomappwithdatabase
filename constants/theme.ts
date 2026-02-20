/**
 * Professional Minimalistic Color Palette
 * Clean, modern colors for a premium e-commerce experience
 */

import { Platform } from 'react-native';

// Primary brand color - sophisticated slate blue
const primaryLight = '#4A6FA5';
const primaryDark = '#6B8DD6';

// Neutral colors for backgrounds and surfaces
const neutral = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#EEEEEE',
  300: '#E0E0E0',
  400: '#BDBDBD',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

// Semantic colors
const success = '#2E7D32';
const warning = '#F57C00';
const error = '#D32F2F';
const info = '#1976D2';

export const Colors = {
  light: {
    // Primary
    primary: primaryLight,
    primaryLight: '#6B8DD6',
    primaryDark: '#3A5A8A',
    
    // Text
    text: neutral[900],
    textSecondary: neutral[600],
    textTertiary: neutral[500],
    textInverse: '#FFFFFF',
    
    // Backgrounds
    background: neutral[50],
    backgroundSecondary: '#FFFFFF',
    backgroundTertiary: neutral[100],
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    // Borders
    border: neutral[200],
    borderLight: neutral[100],
    
    // UI Elements
    tint: primaryLight,
    icon: neutral[600],
    iconSecondary: neutral[400],
    tabIconDefault: neutral[500],
    tabIconSelected: primaryLight,
    
    // Status
    success,
    warning,
    error,
    info,
    
    // Misc
    overlay: 'rgba(0, 0, 0, 0.5)',
    disabled: neutral[300],
    placeholder: neutral[400],
  },
  dark: {
    // Primary
    primary: primaryDark,
    primaryLight: '#8BA4E8',
    primaryDark: primaryLight,
    
    // Text
    text: '#FFFFFF',
    textSecondary: neutral[400],
    textTertiary: neutral[500],
    textInverse: neutral[900],
    
    // Backgrounds
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#2C2C2C',
    surface: '#1E1E1E',
    surfaceElevated: '#2C2C2C',
    
    // Borders
    border: '#3A3A3A',
    borderLight: '#2C2C2C',
    
    // UI Elements
    tint: primaryDark,
    icon: neutral[400],
    iconSecondary: neutral[600],
    tabIconDefault: neutral[500],
    tabIconSelected: primaryDark,
    
    // Status
    success: '#4CAF50',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#64B5F6',
    
    // Misc
    overlay: 'rgba(0, 0, 0, 0.7)',
    disabled: neutral[700],
    placeholder: neutral[600],
  },
};

// Spacing system (8pt grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius system
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Typography scale
export const Typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Font weights
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Shadow presets for iOS and Android
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
