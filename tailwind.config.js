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
        surface: {
          light: '#ffffff',
          dark: '#0f172a',
          glass: 'rgba(255, 255, 255, 0.03)',
        },
        status: {
          success: '#10b981',
          danger: '#ef4444',
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
