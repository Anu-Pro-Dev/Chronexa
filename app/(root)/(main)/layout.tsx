"use client";
import { AppSidebar } from "@/components/custom/app-sidebar";
import AutoPathMapper from "@/components/custom/auto-path-mapper";
import LanguageSwitcher from "@/components/custom/language-switcher";
import { NavUser } from "@/components/custom/nav-user";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { USER_TOKEN } from "@/lib/Instance";
import { useLanguage } from "@/providers/LanguageProvider";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: any }) {
  const [Loading, SetLoading] = useState<boolean>(false);
  const [Render, SetRender] = useState<boolean>(false);
  useEffect(() => {
    const token =
      localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);
    if (!token) {
      redirect("/"); // Redirect to home if not authenticated
    } else {
      SetRender(true);
    }
    SetLoading(false);
  }, []);
  return (
    <>
      {!Loading ? (
        <div className="">
          {Render && (
            <div color="relative">
              <SidebarProvider>
                <AppSidebar />

                <div className=" w-full ">
                  <header className=" absolute top-0 right-0 left-0 bg-sidebar-background sidebar-background  ">
                    <div className="flex items-center gap-2 justify-between w-full p-1 bg-sidebar">
                      <div></div>
                      <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <NavUser />
                      </div>
                    </div>
                  </header>
                  <div className=" pt-20 flex flex-1 flex-col gap-4 p-5 pl-7 bg-background min-h-dvh h-full">
                    {Render && children}
                  </div>
                </div>
              </SidebarProvider>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-dvh">
          <Spinner />
        </div>
      )}
    </>
  );
}
