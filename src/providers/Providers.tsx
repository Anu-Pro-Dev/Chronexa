"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import LanguageProvider from "@/src/providers/LanguageProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PunchProvider } from "@/src/providers/PunchProvider";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" attribute="class">
        <LanguageProvider>
          <PunchProvider> 
            <TooltipProvider delayDuration={100}>
              {children}
            </TooltipProvider>
          </PunchProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
