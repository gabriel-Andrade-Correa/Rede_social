/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Tema rosa e dourado para o aplicativo
 */

// Cores principais
const primaryPink = '#FF69B4';    // Rosa vibrante
const primaryGold = '#D4AF37';    // Dourado principal
const secondaryPink = '#FFB6C1';  // Rosa suave
const secondaryGold = '#FFD700';  // Dourado mais claro
const accentGold = '#DAA520';     // Dourado mais escuro para acentos

const tintColorLight = primaryPink;
const tintColorDark = primaryGold;

export const Colors = {
  light: {
    text: '#000',
    textDim: '#666',
    background: '#fff',
    cardBackground: '#FFF9F9', // Fundo com leve tom rosado
    tint: tintColorLight,
    icon: primaryGold,
    tabIconDefault: '#ccc',
    tabIconSelected: primaryPink,
    primary: primaryPink,
    secondary: primaryGold,
    accent: accentGold,
    error: '#dc3545'
  },
  dark: {
    text: '#fff',
    textDim: '#999',
    background: '#000',
    cardBackground: '#1a1a1a',
    tint: tintColorDark,
    icon: primaryGold,
    tabIconDefault: secondaryGold,
    tabIconSelected: primaryGold,
    primary: primaryPink,
    secondary: primaryGold,
    accent: accentGold,
    error: '#ff4444'
  },
};
