"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type LanguageData = {
  code: string;
  dir: string | undefined;
  language: string;
  translations: any;
};

type LanguageContextType = {
  language: string;
  dir: string | undefined;
  languageName: string;
  translations: any;
  setLanguage: (language: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Import language data
import arData from "@/locales/ar.json";
import enData from "@/locales/en.json";

// Map of all language data
const allLanguages: { [key: string]: LanguageData } = {
  ar: arData,
  en: enData,
};

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<string>("en");
  const [isMounted, setIsMounted] = useState(false);

  const currentLanguageData = allLanguages[language] || allLanguages["en"];

  useEffect(() => {
    setIsMounted(true);
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage && allLanguages[storedLanguage]) {
      setLanguage(storedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage: string) => {
    if (allLanguages[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem("language", newLanguage);
    } else {
      console.warn(`Unsupported language: ${newLanguage}`);
    }
  };

  if (!isMounted) return null;

  return (
    <LanguageContext.Provider
      value={{
        language: currentLanguageData.code,
        dir: currentLanguageData.dir,
        languageName: currentLanguageData.language,
        translations: currentLanguageData.translations,
        setLanguage: changeLanguage,
      }}
    >
      <div dir={currentLanguageData.dir} lang={currentLanguageData.code}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
