import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ThemeContext } from "./ThemeContextObject";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const setTheme = (mode: 'light' | 'dark') => {
    setIsDark(mode === 'dark');};

  return (
    <ThemeContext.Provider value={{ isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};