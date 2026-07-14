// ============================================
// DESIGN SYSTEM - MATTE BLACK & GOLD THEME
// Ayantaraz Project - Production Ready
// ============================================

export const colors = {
  black: {
    950: '#050505',
    900: '#0a0a0a',
    800: '#1a1a1a',
    700: '#2a2a2a',
    600: '#3a3a3a',
    500: '#4a4a4a',
    400: '#5a5a5a',
    300: '#6a6a6a',
    200: '#7a7a7a',
    100: '#8a8a8a',
    50: '#9a9a9a',
  },
  gold: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  semantic: {
    primary: '#FFD700',
    secondary: '#FFC700',
    background: '#0a0a0a',
    surface: '#1a1a1a',
    onPrimary: '#0a0a0a',
    onBackground: '#ffffff',
    onSurface: '#b0b0b0',
    error: '#FF5252',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
    dark: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
  },
};

export const typography = {
  fontFamily: {
    primary: '"Vazirmatn", "Roboto", sans-serif',
    code: '"JetBrains Mono", monospace',
  },
  fontWeight: {
    light: 300, regular: 400, medium: 500, semiBold: 600, bold: 700,
  },
  fontSize: {
    xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
    xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem',
  },
};

export const spacing = {
  0: '0', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem',
  5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem',
};

export const borderRadius = {
  none: '0', sm: '0.125rem', default: '0.25rem', md: '0.375rem',
  lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  gold: '0 4px 14px 0 rgba(255, 215, 0, 0.39)',
};

export const theme = { colors, typography, spacing, borderRadius, shadows };

export default theme;
