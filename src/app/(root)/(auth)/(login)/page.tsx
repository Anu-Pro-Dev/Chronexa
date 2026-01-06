'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import LoginForm from "@/src/components/custom/modules/auth/LoginForm";
import { useLiteLanguage } from "@/src/providers/LiteLanguageProvider";
import TextLanguageSwitcher from '@/src/components/custom/common/text-language-switcher';

export default function Login() {
  const { language } = useLiteLanguage(); // ✅ Changed from useLanguage
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      const isDark = htmlElement.classList.contains('dark') || htmlElement.classList.contains('night');
      setIsDarkMode(isDark);
    };

    checkTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const getMainLogo = () => {
    return isDarkMode ? "/FGIC_COLOR.png" : "/FGIC_COLOR.png";
  };

  return (
    <main className="relative h-screen">
      <div className={`absolute top-2 ${language === "ar" ? "left-2" : "right-2"} z-[100]`}>
        <TextLanguageSwitcher />
      </div>
      <div className="main-container h-full flex flex-col sm:flex-row">
        <div className="hidden sm:flex sm:flex-1 justify-center">
          <div className="relative w-[55%] h-auto aspect-square">
            <Image
              src="/uaelogo.png"
              alt="Time Management"
              fill
              priority
              unoptimized
              className="object-contain"
            />
          </div> 
        </div>
        <div className="flex flex-1 justify-center items-center flex-col bg-fullpage">
          <div className="flex flex-col justify-center items-center">
            <div className="transition-all flex gap-2 items-center">
              <Image
                width={275}
                height={111}
                alt="logo"
                src={getMainLogo()}
                className="pb-6"
              />
            </div>
            <div className="w-full min-w-[300px] lg:min-w-[320px] 3xl:min-w-[450px]">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}