"use client";
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuthGuard } from "../hooks/useAuthGuard";
import LanguageLoader from "@/src/components/ui/language-loader";

type LanguageData = {
  code: string;
  dir: string | undefined;
  language: string;
  translations: any;
};

type LanguageContextType = {
  language: string;
  dir: string | undefined;
  languageName: string;
  translations: any;
  setLanguage: (language: string) => void;
  modules: any;
  isLoading: boolean;
};

type AuthGuardReturn = {
  isAuthenticated: boolean;
  isChecking: boolean;
  employeeId: number | null;
  userInfo: any;
  isGeofenceEnabled: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

import arData from "@/src/locales/full/ar.json";
import enData from "@/src/locales/full/en.json";

const allLanguages: { [key: string]: LanguageData } = {
  ar: arData,
  en: enData,
};

const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';

  try {
    const storedLanguage = localStorage.getItem("language");
    return storedLanguage && allLanguages[storedLanguage] ? storedLanguage : 'en';
  } catch {
    return 'en';
  }
};

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<string>(() => getInitialLanguage());
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const authData: AuthGuardReturn = useAuthGuard();

  const currentLanguageData = allLanguages[language] || allLanguages["en"];

  const modules = useMemo(() => {
    const getDashboardItems = () => {
      const baseItems = [
        {
          label: currentLanguageData.translations?.modules?.dashboard?.my_attendance || "My Attendance",
          path: "/dashboard/my-attendance/",
          value: "my_attendance",
        },
        {
          label: currentLanguageData.translations?.modules?.dashboard?.team_attendance || "Team Attendance",
          path: "/dashboard/team-attendance/",
          value: "team_attendance",
        },
      ];

      if (authData.isAuthenticated && authData.isGeofenceEnabled === true) {
        baseItems.push({
          label: currentLanguageData.translations?.modules?.dashboard?.geo_fence || "Geo Fence",
          path: "/dashboard/geo-fence/",
          value: "geo_fence",
        });
      }

      return baseItems;
    };

    const dashboard = {
      route_name: "Dashboard",
      path: "/dashboard",
      items: getDashboardItems(),
    };

    const companyMaster = {
      route_name: "Company Master",
      path: "/company-master",
      items: [
        {
          label: currentLanguageData.translations?.modules?.companyMaster?.locations || "Locations",
          path: "/company-master/locations/",
          value: "locations",
        },
        {
          label: currentLanguageData.translations?.modules?.companyMaster?.citizenship || "Citizenship",
          path: "/company-master/citizenship/",
          value: "citizenship",
        },
        {
          label: currentLanguageData.translations?.modules?.companyMaster?.designations || "Designations",
          path: "/company-master/designations/",
          value: "designations",
        },
        {
          label: currentLanguageData.translations?.modules?.companyMaster?.grades || "Grades",
          path: "/company-master/grades/",
          value: "grades"
        },
      ],
    };

    const organization = {
      route_name: "Organization",
      path: "/organization/",
      items: [
        {
          label: currentLanguageData.translations?.modules?.organization?.organization_types || "Organization Types",
          path: "/organization/organization-types/",
          value: "organization-types"
        },
        {
          label: currentLanguageData.translations?.modules?.organization?.organization || "Organization",
          path: "/organization/organization/",
          value: "organization"
        },
        {
          label: currentLanguageData.translations?.modules?.organization?.organization_structure || "Organization Structure",
          path: "/organization/organization-structure/",
          value: "organization-structure",
        },
        {
          label: "Delegation",
          path: "/organization/delegation/",
          value: "delegation",
        },
        {
          label: "Department",
          path: "/organization/department/",
          value: "department",
        },
      ],
    };

    const employeeMaster = {
      route_name: "Employee Master",
      path: "/employee-master/",
      items: [
        {
          label: currentLanguageData.translations?.modules?.employeeMaster?.employee_type || "Employee Type",
          path: "/employee-master/employee-type/",
          value: "employee_type",
        },
        {
          label: currentLanguageData.translations?.modules?.employeeMaster?.employee_group || "Employee Group",
          path: "/employee-master/employee-group/",
          value: "employee_group",
        },
        {
          label: currentLanguageData.translations?.modules?.employeeMaster?.employee_group || "Employee Group",
          path: `/employee-master/employee-group/group-members/`,
          value: "employee_group",
          hide: true,
        },
        {
          label: currentLanguageData.translations?.modules?.employeeMaster?.employee || "Employee",
          path: "/employee-master/employee/",
          value: "employee",
        },
        {
          label: currentLanguageData.translations?.modules?.employeeMaster?.employee || "Employee",
          path: "/employee-master/employee/add/",
          value: "add-employee",
          hide: true,
        },
      ],
    };

    const scheduling = {
      route_name: "Scheduling",
      path: "/scheduling/",
      items: [
        {
          label: currentLanguageData.translations?.modules?.scheduling?.schedules || "Schedules",
          path: "/scheduling/schedules/",
          value: "schedules",
        },
        {
          label: currentLanguageData.translations?.modules?.scheduling?.schedules || "Schedules",
          path: "/scheduling/schedules/add/",
          value: "add-schedules",
          hide: true,
        },
        {
          label: currentLanguageData.translations?.modules?.scheduling?.weekly_schedule || "Weekly Schedule",
          path: "/scheduling/weekly-schedule/",
          value: "weekly_schedule",
        },
        {
          label: currentLanguageData.translations?.modules?.scheduling?.weekly_schedule || "Weekly Schedule",
          path: "/scheduling/weekly-schedule/organization-schedule/add/",
          value: "add_organization_schedule",
          hide: true,
        },
        {
          label: currentLanguageData.translations?.modules?.scheduling?.weekly_schedule || "Weekly Schedule",
          path: "/scheduling/weekly-schedule/employee-schedule/add/",
          value: "add_employee_schedule",
          hide: true,
        },
        {
          label: currentLanguageData.translations?.modules?.scheduling?.monthly_schedule || "Monthly Schedule",
          path: "/scheduling/monthly-schedule/",
          value: "monthly_schedule",
        },
        {
          label: currentLanguageData.translations?.modules?.scheduling?.holidays || "Holidays",
          path: "/scheduling/holidays/",
          value: "holidays",
        },
        {
          label: currentLanguageData.translations?.modules?.scheduling?.set_ramadan_dates || "Set Ramadan Dates",
          path: "/scheduling/ramadan-dates/",
          value: "ramadan_dates",
        },
      ],
    };

    const selfServices = {
      route_name: "Self Services",
      path: "/self-services/",
      items: [
        {
          label: currentLanguageData.translations?.modules?.selfServices?.workflow || "Workflow",
          path: "/self-services/workflow/",
          value: "workflow",
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.workflow || "Workflow",
          path: "/self-services/workflow/add/",
          value: "add_workflow",
          hide: true,
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.permissions || "Permissions",
          path: "/self-services/permissions/",
          value: "permissions",
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.permissions || "Permissions",
          path: "/self-services/permissions/manage/add/",
          value: "permissions",
          hide: true
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.permissions || "Permissions",
          path: "/self-services/permissions/my-request/",
          value: "permissions",
          hide: true,
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.permissions || "Permissions",
          path: "/self-services/permissions/my-request/add/",
          value: "permissions",
          hide: true
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.leaves || "Leaves",
          path: "/self-services/leaves/manage/",
          value: "leaves",
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.leaves || "Leaves",
          path: "/self-services/leaves/manage/add/",
          value: "leaves",
          hide: true
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.leaves || "Leaves",
          path: "/self-services/leaves/my-request/",
          value: "leaves",
          hide: true,
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.leaves || "Leaves",
          path: "/self-services/leaves/my-request/add/",
          value: "leaves",
          hide: true
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.punches || "Punches",
          path: "/self-services/punches/my-punches/",
          value: "punches",
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.punches || "Punches",
          path: "/self-services/punches/my-punches/add/",
          value: "punches",
          hide: true
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.punches || "Punches",
          path: "/self-services/punches/my-request/",
          value: "punches",
          hide: true,
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.punches || "Punches",
          path: "/self-services/punches/my-request/add/",
          value: "punches",
          hide: true
        },
      ],
      permissions: {
        items: [
          {
            label: currentLanguageData.translations?.modules?.selfServices?.manage || "Manage",
            url: "/self-services/permissions/manage/",
            value: "permission manage",
          },
          {
            label: currentLanguageData.translations?.modules?.selfServices?.my_request || "My Request",
            url: "/self-services/permissions/my-request/",
            value: "permission requests",
          },
          {
            label: currentLanguageData.translations?.modules?.selfServices?.team_request || "Team Request",
            url: "/self-services/permissions/team-request/",
            value: "permission requests",
          },
        ],
      },
      leaves: {
        items: [
          {
            label: currentLanguageData.translations?.modules?.selfServices?.manage || "Manage",
            url: "/self-services/leaves/manage/",
            value: "leaves manage",
          },
          {
            label: currentLanguageData.translations?.modules?.selfServices?.my_request || "My Request",
            url: "/self-services/leaves/my-request/",
            value: "leaves requests",
          },
          {
            label: currentLanguageData.translations?.modules?.selfServices?.team_request || "Team Request",
            url: "/self-services/leaves/team-request/",
            value: "leaves requests",
          },
        ],
      },
      punches: {
        items: [
          {
            label: currentLanguageData.translations?.modules?.selfServices?.my_punches || "My Punches",
            url: "/self-services/punches/my-punches/",
            value: "punches manage",
          },
          {
            label: currentLanguageData.translations?.modules?.selfServices?.team_punches || "Team Punches",
            url: "/self-services/punches/team-punches/",
            value: "punches requests",
          },
        ],
      },
    };

    const manageApprovals = {
      route_name: "Manage Approvals",
      path: "/manage-approvals/",
      items: [
        {
          label: currentLanguageData.translations?.modules?.manageApprovals?.my_punches || "Team Requests",
          path: "/manage-approvals/team-request/",
        },
      ],
      teamrequests: {
        items: [
          {
            label: currentLanguageData.translations?.modules?.manageApprovals?.permissions || "Permissions",
            url: "/manage-approvals/team-request/permissions/",
            value: "permission approval",
          },
          {
            label: currentLanguageData.translations?.modules?.manageApprovals?.leaves || "Leaves",
            url: "/manage-approvals/team-request/leaves/",
            value: "leave approval",
          }
        ],
      },
    };

    const devices = {
      route_name: "Devices",
      path: "/devices/",
      items: [
        {
          label: currentLanguageData.translations?.modules?.devices?.device_status || "Device Status",
          path: "/devices/device-status/",
          value: "devices",
        },
      ],
    };

    const reports = {
      route_name: "Reports",
      path: "/reports/",
      items: [
        {
          label: currentLanguageData.translations?.modules?.reports?.employee_reports || "Employee Reports",
          path: "/reports/employee-reports/",
          value: "reports",
        },
      ],
    };

    const configuration = {
      route_name: "Configuration",
      path: "/configuration/",
      items: [
        {
          label: currentLanguageData.translations?.modules?.configuration?.roles || "Roles",
          path: "/configuration/roles/",
          value: "roles",
        },
        {
          label: currentLanguageData.translations?.modules?.configuration?.roles || "Roles",
          path: `/configuration/roles/assign-roles/`,
          value: "roles",
          hide: true,
        },
      ],
    };

    const settings = {
      route_name: "Settings",
      path: "/settings/",
      items: [
        {
          label: currentLanguageData.translations?.modules?.settings?.db_settings || "DB Settings",
          path: "/settings/db-settings/",
          value: "db_settings",
        },
        {
          label: currentLanguageData.translations?.modules?.settings?.email_settings || "Email Settings",
          path: "/settings/email-settings/",
          value: "email_settings",
        },
        {
          label: currentLanguageData.translations?.modules?.settings?.app_settings || "App Settings",
          path: "/settings/app-settings/",
          value: "app_settings",
        },
      ],
    };

    const alerts = {
      route_name: "Alerts",
      path: "/alerts/",
      items: [
        {
          label: currentLanguageData.translations?.modules?.alerts?.email || "Email",
          path: "/alerts/email/",
          value: "email",
        },
      ],
    };

    return {
      dashboard,
      companyMaster,
      organization,
      employeeMaster,
      scheduling,
      selfServices,
      manageApprovals,
      devices,
      reports,
      configuration,
      settings,
      alerts,
    };
  }, [authData.isAuthenticated, authData.isGeofenceEnabled, authData.isChecking, currentLanguageData]);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const storedLanguage = localStorage.getItem("language");
      if (storedLanguage && allLanguages[storedLanguage] && storedLanguage !== language) {
        setLanguage(storedLanguage);
      }
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [language]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const dir = currentLanguageData.dir || "ltr";
      const lang = currentLanguageData.code;

      requestAnimationFrame(() => {
        document.documentElement.setAttribute("dir", dir);
        document.documentElement.setAttribute("lang", lang);
      });
    }
  }, [currentLanguageData, isMounted]);

  const changeLanguage = (newLanguage: string) => {
    if (allLanguages[newLanguage]) {
      setLanguage(newLanguage);
      if (typeof window !== 'undefined') {
        localStorage.setItem("language", newLanguage);
      }
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language: currentLanguageData.code,
        dir: currentLanguageData.dir,
        languageName: currentLanguageData.language,
        translations: currentLanguageData.translations,
        setLanguage: changeLanguage,
        modules: modules,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};