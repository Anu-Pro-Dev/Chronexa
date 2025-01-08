"use client";
import { useLanguage } from "@/providers/LanguageProvider";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Image from "next/image";

export default function LanguageSwitcher() {
  const { language, setLanguage, dir } = useLanguage();

  const languageOptions = [
    { value: "en", label: "English", flag: "/us_flag.svg" },
    { value: "ar", label: "عربي", flag: "/ar_flag.svg" },
  ];

  return (
  <div>
      <Select
        // dir={dir}
        value={language}
        onValueChange={(value) => {
          console.log(value);
          setLanguage(value);
        }}
      >
        <SelectTrigger className="w-[140px] border-none shadow-none font-bold">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((item) => (
            <SelectItem value={item.value} key={item.value}>
              <div className="flex items-center gap-4 text-sm">
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
