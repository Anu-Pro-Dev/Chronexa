"use client"

import React from "react"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { useLanguage } from "@/src/providers/LanguageProvider"
import { useLiteLanguage } from "@/src/providers/LiteLanguageProvider"

export default function LanguageSwitcher() {
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

  if (!languageContext) {
    return null;
  }

  const { language, setLanguage, dir } = languageContext === 'full'
    ? fullContext!
    : liteContext!;

  const languageOptions = [
    { value: "en", label: "English", flag: "/EnglishFlag.svg" },
    { value: "ar", label: "عربي", flag: "/ArabicFlag.svg" },
  ];

  return (
    <div>
      <Select
        value={language}
        onValueChange={(value: string) => {
          setLanguage(value);
        }}
      >
        <SelectTrigger className="w-[128px] min-w-[128px] max-w-[128px] border-none shadow-none font-bold">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((item) => (
            <SelectItem value={item.value} key={item.value}>
              <div className="flex items-center gap-3 text-sm text-text-primary">
                <Image
                  width={20}
                  height={20}
                  alt={`${item.label} flag`}
                  src={item.flag}
                />
                {item.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}