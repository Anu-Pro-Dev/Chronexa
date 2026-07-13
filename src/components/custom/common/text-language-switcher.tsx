"use client";

import React from 'react';
import { LanguageContext } from '@/src/providers/LanguageProvider';
import { LiteLanguageContext } from '@/src/providers/LiteLanguageProvider';

export default function TextLanguageSwitcher() {
  const [languageContext, setLanguageContext] = React.useState<'full' | 'lite' | null>(null);

  const fullContext = React.useContext(LanguageContext);
  const liteContext = React.useContext(LiteLanguageContext);

  React.useEffect(() => {
    if (fullContext) {
      setLanguageContext('full');
    } else if (liteContext) {
      setLanguageContext('lite');
    }
  }, [fullContext, liteContext]);

  const { language, setLanguage } = languageContext === 'full'
    ? fullContext!
    : liteContext!;

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  if (!languageContext) {
    return null;
  }

  return (
    <button
      onClick={toggleLanguage}
      className="text-sm font-medium text-text-primary hover:text-primary cursor-pointer px-5"
      aria-label="Toggle Language"
    >
      {language === 'en' ? 'العربية' : 'English'}
    </button>
  );
}
