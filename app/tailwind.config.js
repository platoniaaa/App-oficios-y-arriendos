/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // slate grays for text + neutrals (named `ink` for compatibility)
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // whites + light surfaces (was `cream`)
        cream: {
          DEFAULT: '#FFFFFF',
          soft: '#F8FAFC',
          deep: '#F1F5F9',
        },
        // deep text / primary dark (was `navy` — now slate-900)
        navy: {
          DEFAULT: '#0F172A',
          500: '#0F172A',
          600: '#1E293B',
          700: '#334155',
          800: '#475569',
        },
        // accent blue (was `ember` orange — now electric blue)
        ember: {
          DEFAULT: '#2563EB',
          500: '#2563EB',
          600: '#1D4ED8',
          400: '#3B82F6',
          300: '#60A5FA',
          100: '#DBEAFE',
        },
        // success (was `moss` green — keep a modern emerald)
        moss: {
          DEFAULT: '#059669',
          500: '#059669',
          600: '#047857',
          400: '#10B981',
        },
        // error (was `rust`)
        rust: {
          DEFAULT: '#DC2626',
          500: '#DC2626',
        },
        paper: '#FFFFFF',
      },
      fontFamily: {
        display: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 8vw, 6.5rem)', { lineHeight: '1', letterSpacing: '-0.045em' }],
        'display-lg': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1', letterSpacing: '-0.035em' }],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        ticket: '0 1px 2px rgba(15,23,42,0.05), 0 8px 24px -12px rgba(15,23,42,0.15)',
        'ticket-sm': '0 1px 2px rgba(15,23,42,0.05), 0 4px 12px -6px rgba(15,23,42,0.12)',
        soft: '0 10px 30px -12px rgba(15,23,42,0.15)',
        card: '0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -20px rgba(15,23,42,0.18)',
      },
      backgroundImage: {
        grain: 'none',
        hatch: 'none',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%,100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
}
