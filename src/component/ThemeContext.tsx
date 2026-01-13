import { useEffect } from "react";
import type { ReactNode } from "react";
import { ThemeContext } from "./ThemeContextObject";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // luôn dark, không cần state
  const isDark = true;

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("dark"); // luôn bật dark mode
    localStorage.setItem("theme", "dark"); // ghi đè theme cũ nếu có
  }, []);

  // hàm setTheme vẫn giữ để tránh lỗi, nhưng không cho đổi theme
  const setTheme = () => {};

  return (
    <ThemeContext.Provider value={{ isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};