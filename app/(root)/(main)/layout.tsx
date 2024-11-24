import { AppSidebar } from "@/components/custom/app-sidebar";
import LanguageSwitcher from "@/components/custom/language-switcher";
import { NavUser } from "@/components/custom/nav-user";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Layout({ children }: { children: any }) {
  return (
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
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
