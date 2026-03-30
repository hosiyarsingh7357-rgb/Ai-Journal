/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F46E5',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
        },
        // SaaS Design System
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#0B0F19',
        },
        surface: {
          DEFAULT: '#F9FAFB',
          dark: '#111827',
          muted: '#f1f5f9',
          'muted-dark': '#1e293b',
        },
        text: {
          primary: '#111827',
          'primary-dark': '#E5E7EB',
          secondary: '#475569',
          'secondary-dark': '#94a3b8',
          muted: '#64748b',
          'muted-dark': '#64748b',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#374151',
          strong: '#cbd5e1',
          'strong-dark': '#334155',
        },
        success: {
          DEFAULT: '#22C55E',
          dark: '#16a34a',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        info: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        }
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
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
