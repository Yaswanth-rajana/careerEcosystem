/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#2563EB',
          violet: '#1D4ED8',
          'indigo-light': '#3B82F6',
          'violet-light': '#60A5FA',
        },
        obsidian: {
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
        },
        pearl: {
          50: '#FAFAFC',
          100: '#F8FAFC',
          200: '#EFF6FF',
          300: '#E2E8F0',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
        'brand-gradient-subtle-light': '#EFF6FF',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 25px -5px rgba(37, 99, 235, 0.2)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
