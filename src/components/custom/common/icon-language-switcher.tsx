"use client";

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/src/providers/LanguageProvider';
import { useLiteLanguage } from '@/src/providers/LiteLanguageProvider';

// Safe wrapper that uses the full LanguageProvider context (authenticated pages)
function FullContextSwitcher() {
  const { language, setLanguage } = useLanguage();
  const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');

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

// Safe wrapper that uses the lite LiteLanguageProvider context (public/auth pages)
function LiteContextSwitcher() {
  const { language, setLanguage } = useLiteLanguage();
  const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');

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

export default function IconLanguageSwitcher({ lite = false }: { lite?: boolean }) {
  if (lite) {
    return <LiteContextSwitcher />;
  }
  return <FullContextSwitcher />;
}