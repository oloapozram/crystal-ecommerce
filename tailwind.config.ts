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
        primary: themeConfig.colors.primary,
        primaryHover: themeConfig.colors.primaryHover,
        primaryLight: themeConfig.colors.primaryLight,
        primaryDark: themeConfig.colors.primaryDark,
        secondary: themeConfig.colors.secondary,
        secondaryHover: themeConfig.colors.secondaryHover,
        accent: themeConfig.colors.accent,
        accentHover: themeConfig.colors.accentHover,
        earth: themeConfig.colors.earth,
        background: themeConfig.colors.background,
        backgroundDark: themeConfig.colors.backgroundDark,
        backgroundAlt: themeConfig.colors.backgroundAlt,
        text: themeConfig.colors.text,
        textLight: themeConfig.colors.textLight,
        textInverse: themeConfig.colors.textInverse,
        success: themeConfig.colors.success,
        warning: themeConfig.colors.warning,
        error: themeConfig.colors.error,
        wood: themeConfig.colors.elementColors.wood,
        fire: themeConfig.colors.elementColors.fire,
        metal: themeConfig.colors.elementColors.metal,
        water: themeConfig.colors.elementColors.water,
      },
      fontFamily: {
        heading: themeConfig.typography.fontFamily.heading.split(","),
        body: themeConfig.typography.fontFamily.body.split(","),
        accent: themeConfig.typography.fontFamily.accent.split(","),
        mono: themeConfig.typography.fontFamily.mono.split(","),
      },
      fontSize: themeConfig.typography.fontSize,
      borderRadius: themeConfig.borderRadius,
      boxShadow: themeConfig.shadows,
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
