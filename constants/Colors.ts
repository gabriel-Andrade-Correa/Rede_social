/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryPink = '#FF69B4';
const primaryGold = '#FFD700';
const secondaryPink = '#FFC0CB';
const secondaryGold = '#DAA520';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFF5F7',
    tint: primaryPink,
    icon: primaryGold,
    tabIconDefault: secondaryGold,
    tabIconSelected: primaryPink,
    primary: primaryPink,
    secondary: primaryGold,
  },
  dark: {
    text: '#ECEDEE',
    background: '#1A0F14',
    tint: secondaryPink,
    icon: secondaryGold,
    tabIconDefault: secondaryGold,
    tabIconSelected: primaryPink,
    primary: primaryPink,
    secondary: primaryGold,
  },
};
