import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#f4f4f5',
        surface: '#ffffff',
        text: '#18181b',
        primary: '#000000',
        
        // Dark mode overrides
        dark_background: '#09090b',
        dark_surface: '#18181b',
        dark_text: '#e4e4e7',
        dark_primary: '#ffffff',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains-mono)'],
      },
    }
  },
  plugins: [],
};
export default config;