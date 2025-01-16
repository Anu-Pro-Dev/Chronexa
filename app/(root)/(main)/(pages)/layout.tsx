"use client";
import { AppSidebar } from "@/components/custom/app-sidebar";

import LanguageSwitcher from "@/components/custom/language-switcher";
import { NavUser } from "@/components/custom/nav-user";

import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: any }) {
  return (
    <>
      {/* <div className="">
        <div className=""> */}
          <SidebarProvider>
            <AppSidebar />
            <div className="w-full bg-background">
              <header className="bg-white">
                <div className="flex items-center gap-2 justify-between w-full py-4 px-2">
                  <div></div>
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <NavUser />
                  </div>
                </div>
              </header>
              <div className=" flex flex-1 flex-col gap-4 p-5 pl-7 bg-background">
                {children}
              </div>
            </div>
          </SidebarProvider>
        {/* </div>
      </div> */}
    </>
  );
}
