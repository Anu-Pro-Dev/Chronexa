import React from "react";
import LanguageProvider from "@/providers/LanguageProvider";
import { Toaster } from "react-hot-toast";
import ChatBotWidget from "@/components/custom/bot/ChatBotWidget";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LanguageProvider>{children}</LanguageProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#23272E',
            color: '#fff',
            fontSize: '14px',
            padding: '8px 10px',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#34c759',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ff3b30',
              color: '#fff',
            },
          },
        }}
      />
      <ChatBotWidget />
    </>
  );
}
