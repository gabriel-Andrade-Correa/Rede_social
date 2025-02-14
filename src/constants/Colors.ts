/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryPink = '#FF69B4';
const primaryGold = '#D4AF37';
const secondaryPink = '#FFC0CB';
const secondaryGold = '#B8860B';

const tintColorLight = '#FF69B4';
const tintColorDark = '#D4AF37';

export const Colors = {
  light: {
    text: '#000',
    textDim: '#666',
    background: '#fff',
    cardBackground: '#f8f8f8',
    tint: tintColorLight,
    icon: '#000',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: '#FF69B4',
    secondary: '#D4AF37',
  },
  dark: {
    text: '#fff',
    textDim: '#999',
    background: '#000',
    cardBackground: '#111',
    tint: tintColorDark,
    icon: '#fff',
    tabIconDefault: '#666',
    tabIconSelected: tintColorDark,
    primary: '#D4AF37',
    secondary: '#FF69B4',
  },
};
