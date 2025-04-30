import React from "react";
import LanguageProvider from "@/providers/LanguageProvider";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LanguageProvider>{children}</LanguageProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#343434',
            color: '#fff',
            fontSize: '14px',
            padding: '8px 10px',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#22c55e',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
    </>
  );
}
