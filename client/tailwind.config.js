/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f2ff',
          100: '#e1e6ff',
          200: '#c8d1ff',
          300: '#a5b3ff',
          400: '#7d8fff',
          500: '#4a5cb8', // primary-light
          600: '#2c3690', // Main primary color (UCC-inspired)
          700: '#1e2561', // primary-dark
          800: '#15193d',
          900: '#0c0e1f',
          950: '#080a14',
        },
        // Consistent green colors (replacing inconsistent accent-green)
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2e7d32', // Main consistent green (was accent-green)
          600: '#1b5e20', // Dark green
          700: '#166534',
          800: '#15803d',
          900: '#14532d',
        },
        // UCC Accent Colors for specific use
        accent: {
          yellow: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#f5c542', // Main accent yellow
            600: '#e6b02a', // yellow-dark
            700: '#a16207',
            800: '#854d0e',
            900: '#713f12',
          },
          red: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef5350', // red-light
            600: '#e53935', // Main accent red
            700: '#c62828', // red-dark
            800: '#991b1b',
            900: '#7f1d1d',
          },
        },
        neutral: {
          light: '#d0d9e1',
          background: '#f8fafb',
          'background-alt': '#d9edf7',
        },
        // Status colors mapping to accents
        success: '#2e7d32',
        warning: '#f5c542',
        danger: '#e53935',
        info: '#2c3690',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'ucc': '0 4px 20px rgba(44, 54, 144, 0.1)',
        'ucc-lg': '0 10px 30px rgba(44, 54, 144, 0.15)',
        'accent-yellow': '0 4px 20px rgba(245, 197, 66, 0.3)',
        'accent-red': '0 4px 20px rgba(229, 57, 53, 0.3)',
        'accent-green': '0 4px 20px rgba(46, 125, 50, 0.3)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #2c3690 0%, #4a5cb8 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #f5c542 0%, #e53935 100%)',
        'nature-gradient': 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
      },
    },
  },
  plugins: [],
};
