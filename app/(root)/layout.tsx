import React from "react";
import LanguageProvider from "@/providers/LanguageProvider";
import { Toaster } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LanguageProvider>{children}</LanguageProvider>
      <Toaster position="top-right" richColors />
    </>
  );
}
