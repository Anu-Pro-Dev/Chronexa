"use client";
import { AppSidebar } from "@/components/custom/app-sidebar";
import LanguageSwitcher from "@/components/custom/language-switcher";
import { NavUser } from "@/components/custom/nav-user";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { USER_TOKEN } from "@/lib/Instance";
import { useLanguage } from "@/providers/LanguageProvider";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: any }) {
  const [Loading, SetLoading] = useState<boolean>(false);
  const [Render, SetRender] = useState<boolean>(false);
  useEffect(() => {
    const token = localStorage.getItem(USER_TOKEN);
    const session_token = sessionStorage.getItem(USER_TOKEN);

    if (!token && !session_token) {
      redirect("/");
    }
    SetRender(true);
  }, []);
  return (
    <>
      {!Loading ? (
        <>
          {Render && (
            <SidebarProvider>
              <AppSidebar />

              <div className="w-full">
                <header className="flex items-center gap-2 justify-between w-full p-1 bg-sidebar">
                  <div></div>
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <NavUser />
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-5 pt-6 pl-7">
                  {Render && children}
                </div>
              </div>
            </SidebarProvider>
          )}
        </>
      ) : (
        <div className="flex flex-col justify-center items-center h-dvh">
          <Spinner />
        </div>
      )}
    </>
  );
}
