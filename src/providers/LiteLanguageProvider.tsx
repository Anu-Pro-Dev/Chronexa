"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import enAuthData from "@/src/locales/auth/en.json";
import arAuthData from "@/src/locales/auth/ar.json";

type AuthLanguageData = {
  code: string;
  dir: string;
  language: string;
  translations: any;
};

const authTranslations: { [key: string]: AuthLanguageData } = {
  en: enAuthData,
  ar: arAuthData,
};

interface LiteLanguageContextType {
  t: (key: string) => string;
  language: string;
  dir: string;
  languageName: string;
  setLanguage: (lang: string) => void;
  translations: any;
}

const LiteLanguageContext = createContext<LiteLanguageContextType | null>(null);

export function LiteLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("language");
    if (saved === 'ar' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      const currentLangData = authTranslations[language];
      const dir = currentLangData.dir;
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.setAttribute("lang", currentLangData.code);
    }
  }, [language, mounted]);

  const setLanguage = (newLang: string) => {
    const validLang = newLang as 'en' | 'ar';
    setLanguageState(validLang);
    localStorage.setItem("language", validLang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = authTranslations[language].translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const currentLangData = authTranslations[language];

  return (
    <LiteLanguageContext.Provider 
      value={{ 
        t, 
        language: currentLangData.code, 
        dir: currentLangData.dir,
        languageName: currentLangData.language,
        setLanguage,
        translations: currentLangData.translations
      }}
    >
      {children}
    </LiteLanguageContext.Provider>
  );
}

export function useLiteLanguage() {
  const context = useContext(LiteLanguageContext);
  if (!context) {
    throw new Error('useLiteLanguage must be used within LiteLanguageProvider');
  }
  return context;
}
