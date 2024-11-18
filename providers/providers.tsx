"use client";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({
      offset: 100,
      delay: 30,
    });
    AOS.refresh();
  }, []);
  return (
    <ThemeProvider defaultTheme="light" attribute={"class"}>
      <NextTopLoader color="black" />
      {children}
      <Toaster richColors className="font_toaster" position="top-center" />
    </ThemeProvider>
  );
}
