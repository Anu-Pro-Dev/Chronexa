"use client";
import React from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LiteLanguageProvider } from "@/src/providers/LiteLanguageProvider";

const queryClient = new QueryClient();

export default function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" attribute="class">
        <LiteLanguageProvider>
          {children}
        </LiteLanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}