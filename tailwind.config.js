/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0f1117',
        surface: '#1a1f2e',
        border: '#2a2f3e',
        accent: '#00d4ff',
        accentDark: '#0099bb',
        warn: '#ff6b35',
        success: '#00ff88',
        danger: '#ff3355',
        panel: '#12151f',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
