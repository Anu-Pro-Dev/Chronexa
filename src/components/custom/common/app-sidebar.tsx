'use client'

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { useLanguage } from "@/src/providers/LanguageProvider";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { useRBAC } from "@/src/hooks/useRBAC";
import { cn } from "@/src/lib/utils";
import {
  AlertsIcon,
  CompanyMasterIcon,
  DashboardIcon,
  DevicesIcon,
  EmployeeMasterIcon,
  OrganizationIcon,
  ReportsIcon,
  SchedulingIcon,
  ConfigurationIcon,
  SelfServicesIcon,
  SettingsIcon,
  TAMasterIcon,
  MenuFold,
} from "@/src/icons/icons";
import { Button } from "@/src/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/src/components/ui/sidebar";

const getModuleIcon = (moduleKey: string) => {
  const iconMap: Record<string, any> = {
    "Dashboard": DashboardIcon,
    "Company Master": CompanyMasterIcon,
    "Organization": OrganizationIcon,
    "Employee Master": EmployeeMasterIcon,
    "Scheduling": SchedulingIcon,
    "Self Services": SelfServicesIcon,
    "Manage Approvals": TAMasterIcon,
    "Devices": DevicesIcon,
    "Reports": ReportsIcon,
    "Configuration": ConfigurationIcon,
    "Settings": SettingsIcon,
    "Alerts": AlertsIcon,
  };
  return iconMap[moduleKey] || DashboardIcon;
};

export default function AppSidebar() {
  const { translations, dir } = useLanguage();
  const { privilegeMap } = usePrivileges();
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(false);

  const getModuleTranslation = (moduleKey: string) => {
    const normalizedKey = moduleKey.toLowerCase().replace(/\s+/g, "_");
    return translations?.modules?.items?.[normalizedKey] || moduleKey;
  };

  const accessibleModules = Object.keys(privilegeMap || {}).filter(
    key => privilegeMap[key].hasView && privilegeMap[key].subModules.some(sub => sub.hasView)
  );

  React.useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      setIsDarkMode(htmlElement.classList.contains('dark') || htmlElement.classList.contains('night'));
    };
    checkTheme();
    const observer = new MutationObserver(() => checkTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const desktop = width >= 1024;
      const mobile = width < 768;
      
      setIsDesktop(desktop);
      setIsMobile(mobile);
      
      if (!desktop && open) {
        setOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [setOpen, open]);

  const handleExpand = () => { 
    if (!isMobile) {
      setOpen(true); 
    }
  };
  
  const getMainLogo = () => isDarkMode ? "/FGIC_COLOR.png" : "/FGIC_COLOR.png";
  const getMonoLogo = () => "/MonoLogo.png";

  const normalizePathSegment = (name: string) =>
    name.trim().replace(/\s+/g, "-").toLowerCase();

  const isModuleActive = (moduleKey: string) => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const currentModulePath = pathSegments[0] || "";
    const normalizedModuleKey = normalizePathSegment(moduleKey);
    return currentModulePath === normalizedModuleKey;
  };

  return (
    <Sidebar collapsible="icon" className="shadow-sidebar bg-accent" side={dir === "rtl" ? "right" : "left"}>
      <SidebarHeader className="flex items-center justify-between px-4 py-4">
        {open && (
          <div className="flex items-center gap-2">
            <Image width={175} height={71} alt="logo" src={getMainLogo()} />
          </div>
        )}
        {open && isDesktop && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setOpen(!open)} 
            className="p-2.5 rounded-lg bg-backdrop hover:bg-backdrop transition" 
            aria-label="Collapse sidebar"
          >
            <MenuFold className='text-primary' />
          </Button>
        )}
        {!open && (
          <div 
            className={cn(
              "p-1 rounded-lg",
              !isMobile && "cursor-pointer hover:opacity-80"
            )} 
            onClick={handleExpand}
          >
            <Image 
              width={25} 
              height={25} 
              alt="logo" 
              src={getMonoLogo()} 
              className="transition-opacity"
              priority
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {accessibleModules.map((key) => {
                const module = privilegeMap[key];
                const Icon = getModuleIcon(key);

                const firstSub = module.subModules.find((s: any) => s.hasView);
                if (!firstSub?.sub_module_name) return null;

                let fullPath = `/${normalizePathSegment(key)}/${firstSub.path}`;
                
                if (firstSub.tabs && firstSub.tabs.length > 0) {
                  const firstAllowedTab = firstSub.tabs.find((tab: any) => tab.hasView);
                  if (firstAllowedTab) {
                    const normalizedTabName = firstAllowedTab.tab_name.toLowerCase().replace(/\s+/g, "-");
                    fullPath += `/${normalizedTabName}`;
                  }
                }
                
                const isActive = isModuleActive(key);
                const translatedName = getModuleTranslation(key);

                return (
                  <SidebarMenuItem key={key}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      tooltip={translatedName}
                      className={cn(
                        "transition",
                        open ? "gap-3 rounded-full" : "rounded-md justify-center",
                        isActive 
                          ? "bg-backdrop !text-primary font-semibold hover:bg-backdrop" 
                          : "hover:bg-backdrop text-text-secondary"
                      )}
                    >
                      <Link href={fullPath}>
                        <span className={cn(
                          "h-5 w-5 transition flex-shrink-0",
                          isActive ? "text-primary" : "hover:text-primary"
                        )}>
                          {Icon("currentColor")}
                        </span>
                        {open && <span className="text-sm font-medium">{translatedName}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}