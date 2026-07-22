/**
 * Design Tokens - Ayantaraz Production UI System
 * Mobile-First, RTL, Black & Gold Theme
 * 
 * Color Palette:
 * - Primary Black: #0B0B0C
 * - Primary Gold: #C9A227
 * - Accent Blue: #2563EB
 * - Accent Purple: #8B5CF6
 */

// ============================================
// COLOR TOKENS
// ============================================
export const colors = {
  // Primary Colors
  black: {
    950: '#030303',
    900: '#0B0B0C',  // Primary Black
    800: '#121212',
    700: '#1A1A1A',
    600: '#252525',
    500: '#333333',
  },
  
  // Gold Colors
  gold: {
    50: '#FFF9E6',
    100: '#FFE8B3',
    200: '#FFD780',
    300: '#FFC64D',
    400: '#FFB71A',
    500: '#FFA000',
    600: '#E68A00',
    700: '#C9A227',  // Primary Gold
    800: '#A0781E',
    900: '#7D5A15',
  },
  
  // Accent Colors
  blue: {
    500: '#2563EB',  // Allowed accent
  },
  purple: {
    500: '#8B5CF6',  // Allowed accent
  },
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Neutral Colors
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

// ============================================
// TYPOGRAPHY TOKENS
// ============================================
export const typography = {
  fontFamily: {
    primary: '"Vazirmatn", "Roboto", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

// ============================================
// SPACING TOKENS
// ============================================
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
} as const;

// ============================================
// BORDER RADIUS TOKENS
// ============================================
export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',   // 24px
  '3xl': '2rem',     // 32px
  full: '9999px',
} as const;

// ============================================
// SHADOW TOKENS
// ============================================
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Gold Shadows
  gold: {
    sm: '0 2px 8px 0 rgba(201, 162, 39, 0.25)',
    md: '0 4px 14px 0 rgba(201, 162, 39, 0.39)',
    lg: '0 8px 24px 0 rgba(201, 162, 39, 0.35)',
  },
  
  // Inner Shadows
  inner: {
    sm: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },
} as const;

// ============================================
// TRANSITION TOKENS
// ============================================
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Custom transitions
  gold: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================
// Z-INDEX TOKENS
// ============================================
export const zIndex = {
  auto: 'auto',
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
} as const;

// ============================================
// BREAKPOINTS (Mobile-First)
// ============================================
export const breakpoints = {
  xs: '320px',    // Minimum mobile width
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================
// CONTAINER TOKENS
// ============================================
export const container = {
  mobile: {
    padding: '1rem',
    maxWidth: '100%',
  },
  sm: {
    padding: '2rem',
    maxWidth: '640px',
  },
  md: {
    padding: '2rem',
    maxWidth: '768px',
  },
  lg: {
    padding: '2rem',
    maxWidth: '1024px',
  },
  xl: {
    padding: '2rem',
    maxWidth: '1280px',
  },
} as const;

// ============================================
// EXPORT ALL TOKENS
// ============================================
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  container,
} as const;

export default tokens;
