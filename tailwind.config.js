/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/*.html', './public/assets/js/main.js'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF0F8', 100: '#FFE1F1', 200: '#FFC3E3', 300: '#FF8DC8', 400: '#F94BA8',
          500: '#EC008C', 600: '#CC0079', 700: '#A30061', 800: '#7C064C', 900: '#4F0631', 950: '#2C021B',
        },
        ink: { DEFAULT: '#1A1517', soft: '#3D3539', mute: '#6E6468' },
        plum: { DEFAULT: '#1E0B16', 2: '#2A1020', 3: '#3A1730' },
        cream: { DEFAULT: '#FBF7F2', 2: '#F4ECE2', 3: '#EADFD1' },
        saffron: { DEFAULT: '#F7A823', soft: '#FDE9C4' },
        leaf: { DEFAULT: '#2F6B4F', soft: '#DCEBE2' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'mega': ['clamp(3.2rem, 9vw, 9.5rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        'hero': ['clamp(2.8rem, 7vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        'h1': ['clamp(2.4rem, 5.2vw, 5rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'h2': ['clamp(2rem, 4vw, 3.75rem)', { lineHeight: '1.04', letterSpacing: '-0.025em' }],
        'h3': ['clamp(1.4rem, 2.2vw, 2rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
      },
      maxWidth: { site: '88rem' },
      borderRadius: { '4xl': '2rem', '5xl': '2.75rem' },
      boxShadow: {
        soft: '0 20px 60px -20px rgba(30, 11, 22, 0.25)',
        glow: '0 20px 60px -15px rgba(236, 0, 140, 0.55)',
      },
      transitionTimingFunction: { expo: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  plugins: [],
};
