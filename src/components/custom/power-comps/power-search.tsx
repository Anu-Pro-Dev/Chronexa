"use client";
import React from "react";
import { Input } from "@/src/components/ui/input";
import { SearchIcon } from "@/src/icons/icons"
import { useLanguage } from "@/src/providers/LanguageProvider";

export default function PowerSearch({ props }: { props: any }) {
  const { translations } = useLanguage();

  return (
    <div className="bg-accent border border-border-accent min-w-auto md:min-w-[300px] px-4 py-3 flex items-center shadow-searchbar rounded-full">
      <SearchIcon className="text-secondary"/>
      <Input
        className="text-xs bg-transparent border-none outline-none font-medium text-text-primary w-full h-full placeholder-text-secondary"
        type="search"
        placeholder={`${translations?.search}...`}
        value={props?.SearchValue}
        onChange={(e: any) => {
          props?.SetSearchValue(e.target.value);
        }}
      />
    </div>
  );
}
