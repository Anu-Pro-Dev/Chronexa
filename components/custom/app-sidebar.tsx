"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/custom/nav-main";
import { NavUser } from "@/components/custom/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  AlertsIcon,
  CompanyMasterIcon,
  DashboardIcon,
  DevicesIcon,
  EmployeeMasterIcon,
  OrganizationIcon,
  ReportsIcon,
  SchedulingIcon,
  SecurityIcon,
  SelfServicesIcon,
  SettingsIcon,
  TAMasterIcon,
} from "@/icons/icons";
import Image from "next/image";

// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { translations, dir, modules } = useLanguage();
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },

    primary: [
      {
        title: translations.navbar.primary.dashboard,
        url: modules.dashboard.items[0].path,
        path: modules.dashboard.path,
        icon: DashboardIcon,
        isActive: true,
      },
      {
        title: translations.navbar.primary.company_master,
        url: modules.company_master.items[0].path,
        path: modules.company_master.path,
        icon: CompanyMasterIcon,
      },
      {
        title: translations.navbar.primary.organization,
        url: modules.organization.items[0].path,
        path: modules.organization.path,
        icon: OrganizationIcon,
      },
      {
        title: translations.navbar.primary.employee_master,
        url: modules.employee_master.items[0].path,
        path: modules.employee_master,
        icon: EmployeeMasterIcon,
      },
      {
        title: translations.navbar.primary.ta_master,
        url: modules.ta_master.items[0].path,
        path: modules.ta_master.path,
        icon: TAMasterIcon,
      },
      {
        title: translations.navbar.primary.scheduling,
        url: modules.scheduling.items[0].path,
        path: modules.scheduling.path,
        icon: SchedulingIcon,
      },
      {
        title: translations.navbar.primary.self_services,
        url: modules.self_services.items[0].path,
        path: modules.self_services.path,
        icon: SelfServicesIcon,
      },
    ],
    secondary: [
      {
        title: translations.navbar.secondary.devices,
        url: modules.devices.items[0].path,
        path: modules.devices.path,
        icon: DevicesIcon,
        isActive: true,
      },
      {
        title: translations.navbar.secondary.reports,
        url: modules.reports.items[0].path,
        path: modules.reports.path,
        icon: ReportsIcon,
      },
      {
        title: translations.navbar.secondary.security,
        url: modules.security.items[0].path,
        path: modules.security.path,
        icon: SecurityIcon,
      },
      {
        title: translations.navbar.secondary.settings,
        url: modules.settings.items[0].path,
        path: modules.settings.path,
        icon: SettingsIcon,
      },
      {
        title: translations.navbar.secondary.alerts,
        url: modules.alerts.items[0].path,
        path: modules.alerts.path,
        icon: AlertsIcon,
      },
    ],
  };
  const { open, toggleSidebar, setOpen } = useSidebar();
  React.useEffect(() => {
    const savedState = localStorage.getItem("sidebar-chorno") === "true";
    if (open !== savedState) {
      setOpen(savedState);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("sidebar-chorno", open.toString());
  }, [open]);
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      variant="inset"
      side={dir === "rtl" ? "right" : "left"}
    >
      <SidebarHeader className="">
        <div
          className={`flex items-center py-5 ${
            open ? "justify-between" : "justify-center"
          }`}
        >
          <div className="flex items-center gap-2">
            <Image
              width={25}
              height={100}
              alt="logo"
              src={"/logo.svg"}
              onClick={() => {
                toggleSidebar();
              }}
            />
            {open && (
              <h1 className="font-bold text-xl cursor-pointer text-text-primary">
                {translations?.app_name}
              </h1>
            )}
          </div>
          {open && <SidebarTrigger />}
        </div>
      </SidebarHeader>
      <SidebarContent className="pb-4">
        <NavMain items={data.primary} title={"Primary"} />
        <hr className="w-10/12 mx-auto" />
        <NavMain items={data.secondary} title={"Secondary"} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
