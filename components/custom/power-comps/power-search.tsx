"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/icons/icons"

export default function PowerSearch({ props }: { props: any }) {
  return (
    <div className="bg-white border border-border-accent min-w-auto md:min-w-[300px] px-4 py-3 flex items-center shadow-searchbar rounded-full">
      <span className="text-secondary">{SearchIcon()}</span>
      <Input
        className="text-xs bg-transparent border-none outline-none font-medium text-text-primary w-full h-full placeholder-text-secondary"
        type="search"
        placeholder={"Search ..."}
        value={props?.SearchValue}
        onChange={(e: any) => {
          props?.SetSearchValue(e.target.value);
        }}
      />
    </div>
  );
}
