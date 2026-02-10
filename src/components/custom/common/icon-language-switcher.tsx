"use client";

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/src/providers/LanguageProvider';
import { useLiteLanguage } from '@/src/providers/LiteLanguageProvider';

export default function IconLanguageSwitcher() {
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
      className="flex items-center justify-center p-2"
      aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      title={language === 'en' ? 'العربية' : 'English'}
    >
      <Image
        src={language === 'en' ? '/en-to-ar.png' : '/ar-to-en.png'}
        alt={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
        width={28}
        height={28}
        className="w-7 h-7 object-contain"
      />
    </button>
  );
}