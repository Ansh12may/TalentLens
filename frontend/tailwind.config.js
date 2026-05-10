/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0d0d1a',
        surface: '#13131f',
        elevated: '#1a1a2e',
        border: '#2a2a3e',
        accent: '#818cf8',
        'accent-dim': '#4f46e5',
        muted: '#6b7280',
        subtle: '#374151',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      }
    }
  },
  plugins: []
}
