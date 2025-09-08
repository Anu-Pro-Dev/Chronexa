"use client";
import React from 'react';
import { useLanguage } from "@/src/providers/LanguageProvider";
import { Toaster } from "react-hot-toast";
import ChatBotWidget from '@/src/components/custom/bot/ChatBotWidget';

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  const { language, translations } = useLanguage();

  const toasterPosition = language === 'ar' ? 'top-left' : 'top-right';
  
  return (
    <div className='flex flex-col min-h-screen bg-background'>
      <Toaster 
        position={toasterPosition}
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
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <footer>
        <ChatBotWidget/>
      </footer>
    </div>
  )
}
