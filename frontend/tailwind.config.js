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
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
        'brand-gradient-subtle-light': '#EFF6FF',
        'glass-glow': 'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.15), transparent 70%)',
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(37, 99, 235, 0.3)',
        'glow-lg': '0 0 50px -10px rgba(29, 78, 216, 0.35)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
