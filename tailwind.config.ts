import type { Config } from "tailwindcss";
import themeConfig from "./theme-config.json";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			primaryHover: 'themeConfig.colors.primaryHover',
  			primaryLight: 'themeConfig.colors.primaryLight',
  			primaryDark: 'themeConfig.colors.primaryDark',
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			secondaryHover: 'themeConfig.colors.secondaryHover',
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			accentHover: 'themeConfig.colors.accentHover',
  			earth: 'themeConfig.colors.earth',
  			background: 'hsl(var(--background))',
  			backgroundDark: 'themeConfig.colors.backgroundDark',
  			backgroundAlt: 'themeConfig.colors.backgroundAlt',
  			text: 'themeConfig.colors.text',
  			textLight: 'themeConfig.colors.textLight',
  			textInverse: 'themeConfig.colors.textInverse',
  			success: 'themeConfig.colors.success',
  			warning: 'themeConfig.colors.warning',
  			error: 'themeConfig.colors.error',
  			wood: 'themeConfig.colors.elementColors.wood',
  			fire: 'themeConfig.colors.elementColors.fire',
  			metal: 'themeConfig.colors.elementColors.metal',
  			water: 'themeConfig.colors.elementColors.water',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			heading: 'themeConfig.typography.fontFamily.heading.split(",")',
  			body: 'themeConfig.typography.fontFamily.body.split(",")',
  			accent: 'themeConfig.typography.fontFamily.accent.split(",")',
  			mono: 'themeConfig.typography.fontFamily.mono.split(",")'
  		},
  		fontSize: 'themeConfig.typography.fontSize',
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: 'themeConfig.shadows'
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
