import { LoginMethod, ThemeColors } from '../types/loginTypes';

export const getThemeColors = (loginMethod: LoginMethod): ThemeColors => {
  if (loginMethod === 'whatsapp') {
    return {
      primary: 'from-green-500 to-green-600',
      primaryHover: 'hover:from-green-600 hover:to-green-700',
      accent: 'text-green-600',
      accentHover: 'hover:text-green-700',
      ring: 'focus:ring-green-500',
      border: 'border-green-500',
      bg: 'hover:bg-green-50'
    };
  } else {
    return {
      primary: 'from-orange-500 to-orange-600',
      primaryHover: 'hover:from-orange-600 hover:to-orange-700',
      accent: 'text-orange-600',
      accentHover: 'hover:text-orange-700',
      ring: 'focus:ring-orange-500',
      border: 'border-orange-500',
      bg: 'hover:bg-orange-50'
    };
  }
};