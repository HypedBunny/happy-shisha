/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'charcoal': '#0E0E0E',
        'amber': '#E38B29',
        'smoke': '#9A9A9A',
        'soft-white': '#F5F5F5',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'smoke-drift': 'smoke-drift 20s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(227, 139, 41, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(227, 139, 41, 0.6)' },
        },
        'smoke-drift': {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '0.1' },
          '50%': { transform: 'translate(100px, -100px) scale(1.5)', opacity: '0.2' },
          '100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.1' },
        },
      },
    },
  },
  plugins: [],
}
