import React from "react";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: any }) {
  return <ThemeProvider defaultTheme="light">{children}</ThemeProvider>;
}
