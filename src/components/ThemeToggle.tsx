"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="cursor-pointer transition-all duration-200 hover:scale-110"
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        color: "var(--text-muted)",
        padding: "0.5rem",
        borderRadius: "8px",
        fontSize: "1.1rem",
        lineHeight: 1,
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
