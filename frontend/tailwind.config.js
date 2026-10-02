/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        michelin: {
          bg: "#0A0A0A",          // Matte Obsidian
          card: "#141414",        // Graphite Glass
          surface: "#141414",
          elevated: "#1C1C1C",
          border: "#2A2A2A",      // Razor-thin subtle border
          borderHover: "#3A3A3A",
          gold: "#C5A059",        // Soft Champagne Gold (Primary Accent)
          goldLight: "#DFBE7A",
          goldMuted: "rgba(197, 160, 89, 0.15)",
          sage: "#78866B",        // Muted Sage Green (Secondary Health Highlights)
          sageLight: "#8E9E80",
          sageMuted: "rgba(120, 134, 107, 0.15)",
          taupe: "#B58A55",       // Warm Taupe / Amber Bronze (Fats)
          cream: "#F5F5F0",       // Soft Cream (Primary Text / Headers)
          ash: "#888888",         // Ash Gray (Secondary Text)
          charcoal: "#1A1A1A",
        },
        macro: {
          calories: "#C5A059",    // Soft Champagne Gold
          protein: "#C5A059",     // Soft Champagne Gold
          carbs: "#78866B",       // Muted Sage Green
          fats: "#B58A55",        // Warm Bronze / Taupe
        },
      },
      textColor: {
        primary: "#F5F5F0",       // Soft Cream
        secondary: "#888888",     // Ash Gray
        muted: "#888888",
        gold: "#C5A059",
        sage: "#78866B",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 4px 20px 0 rgba(0, 0, 0, 0.5)',
        'gold-glow': '0 0 15px -3px rgba(197, 160, 89, 0.25)',
      },
      animation: {
        'shutter': 'shutter 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shutter: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.92)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      }
    },
  },
  plugins: [],
}
