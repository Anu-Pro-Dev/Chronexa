'use client'

import * as React from "react";
import * as Tooltip from '@radix-ui/react-tooltip';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { useLanguage } from "@/src/providers/LanguageProvider";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { useRBAC } from "@/src/hooks/useRBAC";
import { cn } from "@/src/utils/utils";
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

// Map module name to icon
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

export default function Sidebar() {
  const { translations } = useLanguage();
  const { privilegeMap } = usePrivileges();
  const { allowedSubModules } = useRBAC();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Only show modules with at least one allowed submodule
  const accessibleModules = Object.keys(privilegeMap || {}).filter(
    key => privilegeMap[key].allowed && privilegeMap[key].subModules.some(sub => sub.allowed)
  );

  // Check dark mode
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

  // Auto-collapse on small screens
  React.useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleExpand = () => { if (window.innerWidth >= 1024) setIsOpen(true); }
  const getMainLogo = () => isDarkMode ? "/ChronexaLogoDark.png" : "/ChronexaLogo.png";
  const getMonoLogo = () => "/ChronexaMonoLogo.png";

  const normalizePath = (path: string) => path.replace(/\/+$/, '');
  const normalizePathSegment = (name: string) =>
    name.trim().replace(/\s+/g, "-").toLowerCase();

  // Function to check if a module is currently active
  const isModuleActive = (moduleKey: string) => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const currentModulePath = pathSegments[0] || "";
    
    // Check if current path matches this module
    const normalizedModuleKey = normalizePathSegment(moduleKey);
    
    return currentModulePath === normalizedModuleKey;
  };

  return (
    <aside className={cn("relative h-full shadow-sidebar transition-all duration-300 bg-accent flex flex-col", isOpen ? "lg:w-64" : "lg:w-16", "w-16")}>
      
      {/* Logo Section */}
      <div className="flex items-center justify-between px-4 py-4">
        {isOpen && <div className="flex items-center gap-2"><Image width={125} height={100} alt="logo" src={getMainLogo()} /></div>}
        {isOpen && <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="p-2.5 rounded-lg bg-backdrop hover:bg-backdrop transition hidden lg:flex" aria-label="Collapse sidebar"><MenuFold className='text-primary' /></Button>}
        {!isOpen && <div className="p-1 rounded-lg"><Image width={25} height={25} alt="logo" src={getMonoLogo()} className={cn(window?.innerWidth >= 1024 ? "cursor-pointer hover:opacity-80" : "cursor-default", "transition-opacity")} onClick={handleExpand} /></div>}
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 space-y-6 pb-3">
        <ul className="space-y-2">
          {accessibleModules.map((key) => {
            const module = privilegeMap[key];
            const Icon = getModuleIcon(key);

            // Get first allowed submodule for navigation
            const firstSub = module.subModules.find((s: any) => s.allowed);
            if (!firstSub?.sub_module_name) return null;

            // Determine the correct path based on whether submodule has allowed tabs
            let fullPath = `/${normalizePathSegment(key)}/${firstSub.path}`;
            
            // If submodule has tabs, find the first allowed tab and append it
            if (firstSub.tabs && firstSub.tabs.length > 0) {
              const firstAllowedTab = firstSub.tabs.find((tab: any) => tab.allowed);
              if (firstAllowedTab) {
                const normalizedTabName = firstAllowedTab.tab_name.toLowerCase().replace(/\s+/g, "-");
                fullPath += `/${normalizedTabName}`;
              }
            }
            
            // Check if this module is currently active (any of its submodules is selected)
            const isActive = isModuleActive(key);

            return (
              <li key={key}>
                <Tooltip.Root delayDuration={100}>
                  <Tooltip.Trigger asChild>
                    <Link
                      href={fullPath}
                      className={cn(
                        "group flex items-center w-full hover:bg-backdrop transition",
                        isOpen ? "justify-start gap-3 p-2 rounded-full" : "justify-center px-1 py-2 rounded-md",
                        isActive ? "bg-backdrop !text-primary font-semibold" : "hover:bg-backdrop text-text-secondary"
                      )}
                      aria-label={key}
                    >
                      <span className={cn("h-5 w-5 transition hover:text-primary", isActive ? "text-primary hover:text-primary" : "")}>{Icon("currentColor")}</span>
                      {isOpen && <span className="hidden lg:inline text-sm font-medium">{key}</span>}
                    </Link>
                  </Tooltip.Trigger>
                  {!isOpen && (
                    <Tooltip.Portal>
                      <Tooltip.Content side="right" className="z-50 px-3 py-1.5 text-sm text-white bg-primary rounded shadow-lg" sideOffset={6}>
                        {key}
                        <Tooltip.Arrow className="fill-primary" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  )}
                </Tooltip.Root>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  );
}