"use client";
import LoginForm from "@/forms/LoginForm";
import { useLanguage } from "@/providers/LanguageProvider";
import React from "react";

export default function Home() {
  const { language, translations } = useLanguage();

  return (
    <div>
      <div className="flex flex-col justify-center h-dvh">
        <LoginForm />
      </div>
    </div>
  );
}
