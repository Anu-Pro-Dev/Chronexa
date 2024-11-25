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
  const { translations, dir } = useLanguage();
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },

    primary: [
      {
        title: translations.navbar.primary.dashboard,
        url: "/dashboard",
        icon: DashboardIcon,
        isActive: true,
      },
      {
        title: translations.navbar.primary.company_master,
        url: "/company-master",
        icon: CompanyMasterIcon,
      },
      {
        title: translations.navbar.primary.organization,
        url: "/organization",
        icon: OrganizationIcon,
      },
      {
        title: translations.navbar.primary.employee_master,
        url: "/employee-master",
        icon: EmployeeMasterIcon,
      },
      {
        title: translations.navbar.primary.ta_master,
        url: "/ta-master",
        icon: TAMasterIcon,
      },
      {
        title: translations.navbar.primary.scheduling,
        url: "/scheduling",
        icon: SchedulingIcon,
      },
      {
        title: translations.navbar.primary.self_services,
        url: "/self-services",
        icon: SelfServicesIcon,
      },
    ],
    secondary: [
      {
        title: translations.navbar.secondary.devices,
        url: "/devices",
        icon: DevicesIcon,
        isActive: true,
      },
      {
        title: translations.navbar.secondary.reports,
        url: "/reports",
        icon: ReportsIcon,
      },
      {
        title: translations.navbar.secondary.security,
        url: "/security",
        icon: SecurityIcon,
      },
      {
        title: translations.navbar.secondary.settings,
        url: "/settings",
        icon: SettingsIcon,
      },
      {
        title: translations.navbar.secondary.alerts,
        url: "/alerts",
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
      variant="sidebar"
      side={dir === "rtl" ? "right" : "left"}
    >
      <SidebarHeader className="mx-[6px] mt-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              width={20}
              height={100}
              alt="logo"
              src={"/logo.svg"}
              onClick={() => {
                toggleSidebar();
              }}
            />
            {open && <h1>{translations?.app_name}</h1>}
          </div>
          {open && <SidebarTrigger />}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.primary} title={"Primary"} />
        <hr className="w-10/12 mx-auto" />
        <NavMain items={data.secondary} title={"Secondary"} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
