/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", 
  theme: {
    extend: {
      colors: {
        'dark-bg': '#111217',
        'dark-surface': '#1E1F2B',
        'accent': '#8B5CF6',
        'text-primary': '#E5E7EB',
        'text-secondary': '#9CA3AF',
        'border-color': '#374151',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        slide: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'slide-up': "slideUp 0.3s ease-in-out",
        'spin-slow': "spinSlow 5s linear infinite",
        'slide': 'slide 20s linear infinite',
      },
    },
  },
  plugins: [],
};
