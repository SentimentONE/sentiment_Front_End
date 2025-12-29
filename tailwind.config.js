/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        neutral: '#6b7280',
        bg: {
          primary: {
            DEFAULT: '#0f172a',
            light: '#ffffff',
          },
          secondary: {
            DEFAULT: '#1e293b',
            light: '#f8fafc',
          },
          tertiary: {
            DEFAULT: '#334155',
            light: '#f1f5f9',
          },
        },
        text: {
          primary: {
            DEFAULT: '#f1f5f9',
            light: '#0f172a',
          },
          secondary: {
            DEFAULT: '#cbd5e1',
            light: '#475569',
          },
        },
        border: {
          DEFAULT: '#475569',
          light: '#cbd5e1',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'source-code-pro',
          'Menlo',
          'Monaco',
          'Consolas',
          'Courier New',
          'monospace',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-down': 'slideDown 0.3s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', maxHeight: '0' },
          '100%': { opacity: '1', maxHeight: '1000px' },
        },
      },
    },
  },
  plugins: [],
}

