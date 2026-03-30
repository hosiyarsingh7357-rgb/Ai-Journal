/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
        },
        // Standardized Design System
        theme: {
          bg: {
            light: '#f8fafc',
            dark: '#0b0f19',  // Deep dark background
          },
          surface: {
            light: '#ffffff',
            dark: '#161b26',  // Premium card surface
          },
          text: {
            primary: {
              light: '#0f172a',
              dark: '#f8fafc',
            },
            secondary: {
              light: '#475569',
              dark: '#94a3b8',
            }
          },
          border: {
            light: '#e2e8f0',
            dark: '#232936',  // Subtle border
          }
        },
        status: {
          success: '#10b981',
          'success-light': '#34d399',
          danger: '#ef4444',
          'danger-light': '#f87171',
          warning: '#f59e0b',
          info: '#3b82f6',
        }
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px -5px rgba(99, 102, 241, 0.5)',
      }
    },
  },
  plugins: [],
}
