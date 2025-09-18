'use client'

import * as React from "react";
import * as Tooltip from '@radix-ui/react-tooltip';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useIsMobile } from "@/src/hooks/useMobile";
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

export default function Sidebar() {
  const { translations, modules } = useLanguage();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(true)
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  React.useEffect(() => {
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

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsOpen(false)
      else setIsOpen(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleExpand = () => {
    if (window.innerWidth >= 1024) {
      setIsOpen(true)
    }
  }

  const data = {
    primary: [
      { title: translations?.navbar?.primary?.dashboard, url: modules?.dashboard?.items?.[0]?.path, icon: DashboardIcon },
      { title: translations?.navbar?.primary?.company_master, url: modules?.companyMaster?.items?.[0]?.path, icon: CompanyMasterIcon },
      { title: translations?.navbar?.primary?.organization, url: modules?.organization?.items?.[0]?.path, icon: OrganizationIcon },
      { title: translations?.navbar?.primary?.employee_master, url: modules?.employeeMaster?.items?.[0]?.path, icon: EmployeeMasterIcon },
      { title: translations?.navbar?.primary?.scheduling, url: modules?.scheduling?.items?.[0]?.path, icon: SchedulingIcon },
      { title: translations?.navbar?.primary?.self_services, url: modules?.selfServices?.items?.[0]?.path, icon: SelfServicesIcon },
      { title: translations?.navbar?.primary?.manage_approvals, url: modules?.manageApprovals?.items?.[0]?.path, icon: TAMasterIcon },
    ],
    secondary: [
      { title: translations?.navbar?.secondary?.devices, url: modules?.devices?.items?.[0]?.path, icon: DevicesIcon },
      { title: translations?.navbar?.secondary?.reports, url: modules?.reports?.items?.[0]?.path, icon: ReportsIcon },
      { title: translations?.navbar?.secondary?.configuration, url: modules?.configuration?.items?.[0]?.path, icon: ConfigurationIcon },
      { title: translations?.navbar?.secondary?.settings, url: modules?.settings?.items?.[0]?.path, icon: SettingsIcon },
      { title: translations?.navbar?.secondary?.alerts, url: modules?.alerts?.items?.[0]?.path, icon: AlertsIcon },
    ],
  }

  const getMainLogo = () => {
    return isDarkMode ? "/ChronexaLogoDark.png" : "/ChronexaLogo.png";
  };

  const getMonoLogo = () => {
    return isDarkMode ? "/ChronexaMonoLogo.png" : "/ChronexaMonoLogo.png";
  };

  return (
    <aside
      className={cn(
        "relative h-full shadow-sidebar transition-all duration-300 bg-accent flex flex-col",
        isOpen ? "lg:w-64" : "lg:w-16",
        "w-16"
      )}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {isOpen && (
          <div className="flex items-center gap-2">
            <Image
              width={125}
              height={100}
              alt="logo"
              src={getMainLogo()}
            />
          </div>
        )}

        {isOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 rounded-lg bg-backdrop hover:bg-backdrop transition hidden lg:flex"
            aria-label="Collapse sidebar"
          >
            <MenuFold className='text-primary' />
          </Button>
        )}

        {!isOpen && (
          <div className="p-1 rounded-lg">
            <Image
              width={25}
              height={25}
              alt="logo"
              src={getMonoLogo()}
              className={cn(
                window?.innerWidth >= 1024 ? "cursor-pointer hover:opacity-80" : "cursor-default",
                "transition-opacity"
              )}
              onClick={handleExpand}
            />
          </div>
        )}
      </div>

      <div key={isOpen ? 'open' : 'closed'} className="flex-1 overflow-y-auto scrollbar-hide px-2 space-y-6 pb-3">
        {[
          { title: translations.navbar.primary.title || "Primary", items: data.primary },
          { title: translations.navbar.secondary.title || "Secondary", items: data.secondary },
        ].map((section, i) => (
          <div key={i} className="my-3">
            <h2
              className={cn(
                "px-3 mb-2 text-xs font-semibold uppercase text-secondary select-none",
                isOpen ? "lg:block" : "hidden"
              )}
            >
              {section.title}
            </h2>

            <ul className="space-y-2">
              {section.items
                .filter((item) => !!item.url)
                .map((item) => {
                  const Icon = item.icon;
                  const normalizePath = (path: string) => path.replace(/\/+$/, '');
                  const isActive =
                    normalizePath(pathname) === normalizePath(item.url) ||
                    normalizePath(pathname).startsWith(normalizePath(item.url) + '/');
                  console.log({ pathname, itemUrl: item.url, isActive });
                  return (
                    <li key={item.title}>
                      <Tooltip.Root delayDuration={100}>
                        <Tooltip.Trigger asChild className="text-text-secondary hover:text-primary">
                          <Link
                            href={item.url}
                            className={cn(
                              "group flex items-center w-full  hover:bg-backdrop transition",
                              isOpen ? "justify-start gap-3 p-2 rounded-full" : "justify-center px-1 py-2 rounded-md",
                              isActive
                                ? "bg-backdrop !text-primary font-semibold"
                                : "hover:bg-backdrop text-text-secondary"
                            )}
                            aria-label={item.title}
                          >
                            <span
                              className={cn(
                                "h-5 w-5 transition hover:text-primary",
                                isActive ? "text-primary hover:text-primary" : ""
                              )}
                            >
                              {Icon("currentColor")}
                            </span>
                            {isOpen && (
                              <span className="hidden lg:inline text-sm font-medium">
                                {item.title}
                              </span>
                            )}
                          </Link>
                        </Tooltip.Trigger>

                        {!isOpen && (
                          <Tooltip.Portal>
                            <Tooltip.Content
                              side="right"
                              className="z-50 px-3 py-1.5 text-sm text-white bg-primary rounded shadow-lg"
                              sideOffset={6}
                            >
                              {item.title}
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
        ))}
      </div>
    </aside>
  )
}