"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

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
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Import language data
import arData from "@/locales/ar.json";
import enData from "@/locales/en.json";
import { dir } from "console";

// Map of all language data
const allLanguages: { [key: string]: LanguageData } = {
  ar: arData,
  en: enData,
};

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<string>("en");
  const [isMounted, setIsMounted] = useState(false);

  const currentLanguageData = allLanguages[language] || allLanguages["en"];

  const dashboard = {
    route_name: "Dashboard",
    route: "/dashboard",
    items: [
      {
        label: "Self Statistics",
        path: "/dashboard/self-statistics",
        value: "self_statistics",
      },
      {
        label: "Team Statistics",
        path: "/dashboard/team-statistics",
        value: "team_statistics",
      },
    ],
  };

  const company_master = {
    route_name: "Company Master",
    route: "/company-master",
    items: [
      {
        label: "Regions",
        path: "/company-master/regions",
        value: "regions",
      },
      { label: "Grades", path: "/company-master/grades", value: "grades" },
    ],
  };  

  const organization = {
    route_name: "Organization",
    route: "/organization",

    items: [
      {
        label: "Departments",
        path: "/organization/departments",
        value: "departments",
      },
      {
        label: "Add Department",
        path: "/organization/departments/add",
        value: "departments",
        hide: true,
      },
      {
        label: "Structure",
        path: "/organization/structures",
        value: "structure",
      },
      {
        label: "Types",
        path: "/organization/types",
        value: "types",
      },
    ],
  };

  const employee_master = {
    route_name: "Employee Master",
    route: "/employee-master",

    items: [
      {
        label: "Employees",
        path: "/employee-master/employees",
        value: "employees",
      },
      {
        label: "Groups",
        path: "/employee-master/groups",
        value: "groups",
      },
      {
        label: "Types",
        path: "/employee-master/types",
        value: "types",
      },
    ],
  };

  const ta_master = {
    route_name: "TA Master",
    route: "/TA-master",
    items: [
      {
        label: "Reasons",
        path: "/TA-master/reasons",
        value: "reasons",
      },
      {
        label: "Holidays",
        path: "/TA-master/holidays",
        value: "holidays",
      },
      {
        label: "Ramadan Dates",
        path: "/TA-master/ramadan-dates",
        value: "ramadan_dates",
      },
      {
        label: "Schedules",
        path: "/TA-master/schedules",
        value: "schedules",
      },
    ],
  };

  const scheduling = {
    route_name: "Scheduling",
    route: "/scheduling",
    items: [
      {
        label: "Weekly Schedule",
        path: "/scheduling/weekly-schedule",
        value: "weekly_schedule",
      },
      {
        label: "Monthly Roaster",
        path: "/scheduling/monthly-roaster",
        value: "monthly_roaster",
      },
      {
        label: "Employee Schedule",
        path: "/scheduling/employee-schedule",
        value: "employee_schedule",
      },
    ],
  };

  const self_services = {
    route_name: "Self Services",
    route: "/self-services",
    items: [
      {
        label: "Manage Permissions",
        path: "/self-services/manage-permissions",
        value: "manage-permissions",
      },
      {
        label: "Manage Leaves",
        path: "/self-services/manage-leaves",
        value: "manage-leaves",
      },
      {
        label: "Manage Movements",
        path: "/self-services/manage-movements",
        value: "manage-movements",
      },
      {
        label: "Approvals",
        path: "/self-services/approvals",
        value: "approvals",
      },
      {
        label: "Workflow",
        path: "/self-services/workflow",
        value: "workflow",
      },
    ],
  };

  const devices = {
    route_name: "Devices",
    route: "/devices",
    items: [
      {
        label: "Readers",
        path: "/devices/readers",
        value: "readers",
      },
    ],
  };

  const reports = {
    route_name: "Reports",
    route: "/reports",
    items: [
      {
        label: "Standard Reports",
        path: "/reports/standard-reports",
        value: "standard_reports",
      },
      {
        label: "Reprocess Data",
        path: "/reports/reprocess-data",
        value: "reprocess_data",
      },
    ],
  };

  const security = {
    route_name: "Security",
    route: "/security",
    items: [
      {
        label: "Roles",
        path: "/security/roles",
        value: "roles",
      },
      {
        label: "Privileges",
        path: "/security/privileges",
        value: "privileges",
      },
    ],
  };

  const settings = {
    route_name: "Settings",
    route: "/settings",
    items: [
      {
        label: "Application Settings",
        path: "/settings/application-settings",
        value: "application_settings",
      },
      {
        label: "Announcements",
        path: "/settings/announcements",
        value: "announcement",
      },
      {
        label: "Notifications ",
        path: "/settings/notifications",
        value: "notifications",
      },
      {
        label: "Licenses",
        path: "/settings/licenses",
        value: "licenses",
      },
    ],
  };

  const alerts = {
    route_name: "Devices",
    route: "/devices",
    items: [
      {
        label: "Email",
        path: "/alerts/email",
        value: "email",
      },
      {
        label: "SMS",
        path: "/alerts/SMS",
        value: "sms",
      },
    ],
  };
  const modules = {
    dashboard,
    company_master,
    organization,
    employee_master,
    ta_master,
    scheduling,
    self_services,
    devices,
    reports,
    security,
    settings,
    alerts,
  };
  useEffect(() => {
    setIsMounted(true);
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage && allLanguages[storedLanguage]) {
      setLanguage(storedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage: string) => {
    if (allLanguages[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem("language", newLanguage);
    } else {
      console.warn(`Unsupported language: ${newLanguage}`);
    }
  };

  if (!isMounted) return null;

  return (
    <LanguageContext.Provider
      value={{
        language: currentLanguageData.code,
        dir: currentLanguageData.dir,
        languageName: currentLanguageData.language,
        translations: currentLanguageData.translations,
        setLanguage: changeLanguage,
        modules: modules,
      }}
    >
      <div dir={currentLanguageData.dir} lang={currentLanguageData.code}>
        {children}
      </div>
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
