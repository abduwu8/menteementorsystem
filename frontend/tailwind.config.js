/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      animation: {
        'pulse-fade': 'pulseFade 4s ease-in-out infinite',
        'border-glow': 'border-glow 8s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        pulseFade: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.08' },
        },
        'border-glow': {
          '0%, 100%': {
            'background-position': '0% 50%'
          },
          '25%': {
            'background-position': '100% 50%'
          },
          '50%': {
            'background-position': '100% 100%'
          },
          '75%': {
            'background-position': '0% 100%'
          }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundSize: {
        '400': '400% 400%'
      }
    },
  },
  plugins: [],
} 