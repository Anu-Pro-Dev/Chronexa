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
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  primary: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: DashboardIcon,
      isActive: true,
    },
    {
      title: "Company Master",
      url: "/company-master",
      icon: CompanyMasterIcon,
    },
    {
      title: "Organization",
      url: "/organization",
      icon: OrganizationIcon,
    },
    {
      title: "Employee Master",
      url: "/employee-master",
      icon: EmployeeMasterIcon,
    },
    {
      title: "TA Master",
      url: "/ta-master",
      icon: TAMasterIcon,
    },
    {
      title: "Scheduling",
      url: "/scheduling",
      icon: SchedulingIcon,
    },
    {
      title: "Self Services",
      url: "/self-services",
      icon: SelfServicesIcon,
    },
  ],
  secondary: [
    {
      title: "Devices",
      url: "/devices",
      icon: DevicesIcon,
      isActive: true,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: ReportsIcon,
    },
    {
      title: "Security",
      url: "/security",
      icon: SecurityIcon,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
    {
      title: "Alerts",
      url: "/alerts",
      icon: AlertsIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { dir } = useLanguage();
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
            {open && <h1>Chronologix</h1>}
          </div>
          {open && <SidebarTrigger />}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.primary} title={"Primary"} />
        <hr className="w-10/12 mx-auto"/>
        <NavMain items={data.secondary} title={"Secondary"} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
