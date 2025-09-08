"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LightIcon, DarkIcon } from "@/src/icons/icons";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 transition-colors ${
        theme === "light" ? "text-primary" : "text-primary"
      }`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <LightIcon /> : <DarkIcon />}
    </button>
  );
}