/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#6366F1',
          violet: '#8B5CF6',
          'indigo-light': '#818CF8',
          'violet-light': '#A78BFA',
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
          200: '#EEF2FF',
          300: '#E2E8F0',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        'brand-gradient-subtle-light': 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
        'brand-gradient-subtle-dark': 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)',
        'glass-glow': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 70%)',
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 50px -10px rgba(139, 92, 246, 0.35)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
