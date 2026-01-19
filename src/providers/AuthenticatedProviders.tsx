"use client";
import React from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import LanguageProvider from "@/src/providers/LanguageProvider";
import { PunchProvider } from "@/src/providers/PunchProvider";
import { PrivilegeProvider } from "@/src/providers/PrivilegeProvider";

export default function AuthenticatedProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PunchProvider>
        <PrivilegeProvider>
          <TooltipProvider delayDuration={100}>
            {children}
          </TooltipProvider>
        </PrivilegeProvider>
      </PunchProvider>
    </LanguageProvider>
  );
}