/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        calm: {
          sage: '#6B7F6E',
          moss: '#A7B8A7',
          mist: '#D9E1D9',
          ivory: '#F4EFE8',
          sand: '#C9BDAF',
          canvas: '#F8F3ED',
          ink: '#1F2A23',
          body: '#2F3A33',
          muted: '#8A8F88',
          track: '#DDD9D3',
          online: '#4E8B5A',
        },
        purelis: {
          forest: '#1F4A12',
          'forest-deep': '#183A0E',
          leaf: '#5E7F4A',
          'sage-bg': '#DCE7D3',
          'sage-soft': '#EAF0E3',
          cream: '#F8F8F0',
          ink: '#1B2A16',
          muted: '#6B6F66',
          line: '#E3E5DC',
          blush: '#E8B7A8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        label: '0.2em',
        title: '0.25em',
        subtitle: '0.4em',
      },
      borderRadius: {
        card: '28px',
      },
      boxShadow: {
        card: '0 10px 30px rgba(107,127,110,0.10), 0 2px 6px rgba(0,0,0,0.04)',
        raised:
          '0 6px 18px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)',
        knob: '0 2px 6px rgba(0,0,0,0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(18px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.65s ease-out both',
        'fade-in': 'fade-in 0.45s ease-out both',
        'slide-in': 'slide-in 0.35s ease-out both',
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 1.5s linear infinite',
      },
    },
  },
  plugins: [],
};
