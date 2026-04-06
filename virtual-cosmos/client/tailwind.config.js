/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        // Warm wood-toned office palette matching cosmos.video
        floor: {
          light: '#e8d5b0',   // light wood
          mid:   '#d4b896',   // medium wood
          dark:  '#b8956a',   // dark wood grain
        },
        wall: {
          DEFAULT: '#c8a882',
          light:   '#dfc4a0',
          dark:    '#a8845c',
        },
        room: {
          bg:     '#f0dfc0',
          border: '#a8845c',
          label:  '#7a5c38',
        },
        panel: {
          bg:      '#ffffff',
          border:  '#e5e7eb',
          header:  '#f9fafb',
        },
        cosmos: {
          blue:    '#3b82f6',
          green:   '#22c55e',
          red:     '#ef4444',
          orange:  '#f97316',
          purple:  '#8b5cf6',
          text:    '#111827',
          muted:   '#6b7280',
          subtle:  '#9ca3af',
        },
        topbar: {
          bg:     '#ffffff',
          border: '#e5e7eb',
        },
      },
      boxShadow: {
        avatar: '0 2px 8px rgba(0,0,0,0.18)',
        panel:  '0 4px 24px rgba(0,0,0,0.10)',
        bubble: '0 2px 12px rgba(0,0,0,0.12)',
        toast:  '0 8px 32px rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
};
