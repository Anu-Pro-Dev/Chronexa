"use client";

import React from 'react';
import { useLanguage } from '@/src/providers/LanguageProvider';
import { useLiteLanguage } from '@/src/providers/LiteLanguageProvider';

export default function TextLanguageSwitcher() {
  const [languageContext, setLanguageContext] = React.useState<'full' | 'lite' | null>(null);

  let fullContext = null;
  let liteContext = null;

  try {
    fullContext = useLanguage();
  } catch (e) {
  }

  try {
    liteContext = useLiteLanguage();
  } catch (e) {
  }

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
      className="text-sm font-bold text-text-primary hover:text-primary cursor-pointer px-5"
      aria-label="Toggle Language"
    >
      {language === 'en' ? 'العربية' : 'English'}
    </button>
  );
}
