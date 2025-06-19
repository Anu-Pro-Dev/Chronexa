"use client";

import * as React from "react";
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
  ConfigurationIcon,
  SelfServicesIcon,
  SettingsIcon,
  TAMasterIcon,
} from "@/icons/icons";
import Image from "next/image";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { translations, dir, modules } = useLanguage();
  const { open, toggleSidebar, setOpen } = useSidebar();

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
        title: translations.navbar.primary.companyMaster,
        url: modules.companyMaster.items[0].path,
        path: modules.companyMaster.path,
        icon: CompanyMasterIcon,
      },
      {
        title: translations.navbar.primary.organization,
        url: modules.organization.items[0].path,
        path: modules.organization.path,
        icon: OrganizationIcon,
      },
      {
        title: translations.navbar.primary.employeeMaster,
        url: modules.employeeMaster.items[0].path,
        path: modules.employeeMaster.path,
        icon: EmployeeMasterIcon,
      },
      {
        title: translations.navbar.primary.scheduling,
        url: modules.scheduling.items[0].path,
        path: modules.scheduling.path,
        icon: SchedulingIcon,
      },
      {
        title: translations.navbar.primary.selfServices,
        url: modules.selfServices.items[0].path,
        path: modules.selfServices.path,
        icon: SelfServicesIcon,
      },
      {
        title: translations.navbar.primary.manageApprovals,
        url: modules.manageApprovals.items[0].path,
        path: modules.manageApprovals.path,
        icon: TAMasterIcon,
      },
    ],
    secondary: [
      // {
      //   title: translations.navbar.secondary.devices,
      //   url: modules.devices.items[0].path,
      //   path: modules.devices.path,
      //   icon: DevicesIcon,
      //   isActive: true,
      // },
      {
        title: translations.navbar.secondary.reports,
        url: modules.reports.items[0].path,
        path: modules.reports.path,
        icon: ReportsIcon,
      },
      {
        title: translations.navbar.secondary.configuration,
        url: modules.configuration.items[0].path,
        path: modules.configuration.path,
        icon: ConfigurationIcon,
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
                {translations?.productName}
              </h1>
            )}
          </div>
          {open && <SidebarTrigger />}
        </div>
      </SidebarHeader>
      <SidebarContent className="pb-4">
        <NavMain items={data.primary} title={translations?.primary} />
        <hr className="w-10/12 mx-auto" />
        <NavMain items={data.secondary} title={translations?.secondary} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
