import { createContext } from "react";

interface ThemeContextType {
  isDark: boolean;
  setTheme: (mode: 'light' | 'dark') => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);