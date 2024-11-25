import React from "react";
import LanguageProvider from "@/providers/LanguageProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
