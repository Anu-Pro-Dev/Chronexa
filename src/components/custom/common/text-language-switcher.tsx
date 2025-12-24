"use client";

import React from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";

export default function TextLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const isEnglish = language === "en";

  const handleToggle = () => {
    setLanguage(isEnglish ? "ar" : "en");
  };

  return (
    <button
      onClick={handleToggle}
      className="text-sm font-bold text-text-primary hover:text-primary cursor-pointer px-5"
    >
      {isEnglish ? "العربية" : "English"}
    </button>
  );
}
