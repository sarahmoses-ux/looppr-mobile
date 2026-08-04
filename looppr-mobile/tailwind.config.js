const { colors, radius, spacing } = require('./src/theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      borderRadius: {
        xs: `${radius.xs}px`,
        sm: `${radius.sm}px`,
        stop: `${radius.stopCard}px`,
        md: `${radius.md}px`,
        lg: `${radius.lg}px`,
        xl: `${radius.xl}px`,
        hero: `${radius.hero}px`,
        pill: `${radius.pill}px`,
        shell: `${radius.shell}px`,
        frame: `${radius.frame}px`,
      },
      spacing: {
        xs: `${spacing.xs}px`,
        sm: `${spacing.sm}px`,
        md: `${spacing.md}px`,
        lg: `${spacing.lg}px`,
        xl: `${spacing.xl}px`,
        '2xl': `${spacing['2xl']}px`,
        '3xl': `${spacing['3xl']}px`,
      },
      fontFamily: {
        display: ['BricolageGrotesque_700Bold'],
        'display-semibold': ['BricolageGrotesque_600SemiBold'],
        'display-medium': ['BricolageGrotesque_500Medium'],
        body: ['HankenGrotesk_400Regular'],
        'body-medium': ['HankenGrotesk_500Medium'],
        'body-semibold': ['HankenGrotesk_600SemiBold'],
        'body-bold': ['HankenGrotesk_700Bold'],
      },
    },
  },
  plugins: [],
};
