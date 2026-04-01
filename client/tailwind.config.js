/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
        },
        primary: 'var(--brand-primary)',
        success: 'var(--status-success)',
        danger: 'var(--status-danger)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
        },
        secondary: 'var(--surface-muted)',
        'muted-foreground': 'var(--text-muted)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        status: {
          success: 'var(--status-success)',
          danger: 'var(--status-danger)',
          warning: 'var(--status-warning)',
          info: 'var(--status-info)',
        }
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px -5px rgba(99, 102, 241, 0.5)',
      }
    },
  },
  plugins: [],
}
