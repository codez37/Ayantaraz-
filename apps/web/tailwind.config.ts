import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // DARK GOLD LUXURY Palette
        background: {
          primary: '#0B0C0E',
          secondary: '#121418',
          tertiary: '#1A1B20',
        },
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.03)',
          elevated: 'rgba(255, 255, 255, 0.05)',
        },
        gold: {
          50: '#FFF9E6',
          100: '#FFE8B3',
          200: '#FFD780',
          300: '#FFC64D',
          400: '#FFB71A',
          500: '#FFA000',
          600: '#E68A00',
          700: '#D4AF37',  // Primary Gold
          800: '#C5A059',  // Secondary Gold
          900: '#A0781E',
          950: '#7D5A15',
        },
        text: {
          primary: '#F5F5F7',
          secondary: '#9E9E9E',
          tertiary: '#6B7280',
          inverse: '#0B0C0E',
        },
        border: {
          gold: 'rgba(212, 175, 55, 0.2)',
          'gold-hover': 'rgba(212, 175, 55, 0.35)',
          subtle: 'rgba(255, 255, 255, 0.05)',
        },
      },
      fontFamily: {
        sans: ['IRANSansX', 'Anjoman', 'Vazirmatn', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 3rem)',
        'fluid-5xl': 'clamp(3rem, 2rem + 5vw, 4rem)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'gold-sm': '0 2px 8px 0 rgba(212, 175, 55, 0.25)',
        'gold-md': '0 4px 14px 0 rgba(212, 175, 55, 0.35)',
        'gold-lg': '0 8px 24px 0 rgba(212, 175, 55, 0.3)',
        'gold-xl': '0 12px 32px 0 rgba(212, 175, 55, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '18px',
      },
      backgroundImage: {
        'gradient-gold-primary': 'linear-gradient(135deg, #D4AF37 0%, #C5A059 100%)',
        'gradient-gold-light': 'linear-gradient(135deg, #FFB71A 0%, #FFA000 100%)',
        'gradient-gold-dark': 'linear-gradient(135deg, #C5A059 0%, #A0781E 100%)',
        'aurora-dark': 'radial-gradient(circle at 80% 10%, rgba(212, 175, 55, 0.11), transparent 28rem), radial-gradient(circle at 10% 70%, rgba(184, 134, 45, 0.10), transparent 24rem), linear-gradient(180deg, #0B0C0E 0%, #121418 48%, #0B0C0E 100%)',
      },
      animation: {
        'aurora-pan': 'aurora-pan 10s ease-in-out infinite',
        'reveal-up': 'reveal-up 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'gold-sheen': 'gold-sheen 5s linear infinite',
        'fade-in-up': 'fade-in-up 400ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'fade-in': 'fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'slide-in-right': 'slide-in-right 400ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'scale-in': 'scale-in 300ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        'aurora-pan': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)', opacity: '0.72' },
          '50%': { transform: 'translate3d(-2rem, 1rem, 0) scale(1.08)', opacity: '0.95' },
        },
        'reveal-up': {
          from: { opacity: '0', transform: 'translateY(24px)', filter: 'blur(8px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        'gold-sheen': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        'gold': '400ms',
        'spring': '500ms',
      },
      transitionTimingFunction: {
        'gold': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
