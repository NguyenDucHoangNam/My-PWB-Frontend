/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "dark-bg": "#111217",
        "dark-surface": "#1E1F2B",
        accent: "#8B5CF6",
        "text-primary": "#E5E7EB",
        "text-secondary": "#9CA3AF",
        "border-color": "#374151",
        "neon-purple": "#a855f7",
        "neon-indigo": "#6366f1",
      },
      boxShadow: {
        "neon-sm":
          "0 1px 2px 0 rgba(168, 85, 247, 0.4), 0 1px 3px 0 rgba(168, 85, 247, 0.2)",
        "neon-md":
          "0 4px 6px -1px rgba(168, 85, 247, 0.5), 0 2px 4px -2px rgba(168, 85, 247, 0.3)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      keyframes: {
        'subtle-glow': {
          '0%': { filter: 'drop-shadow(0 0 1px rgba(199, 210, 254, 0.5))' }, // blue-200
          '100%': { filter: 'drop-shadow(0 0 3px rgba(168, 85, 247, 0.8))' }, // purple-500
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
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
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        glow: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out",
        float: "float 4s ease-in-out infinite",
        "slide-up": "slideUp 0.3s ease-in-out",
        "spin-slow": "spinSlow 90s linear infinite",
        slide: "slide 20s linear infinite",
        wave: "wave 1s ease-in-out infinite",
        glow: "glow 4s linear infinite",
        hyperdrive: "hyperdrive 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 1.5s ease-in-out infinite",
        "spin-fast": "spin-fast 0.8s linear infinite",
        shake: "shake 0.2s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "subtle-glow": "subtle-glow 3s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
