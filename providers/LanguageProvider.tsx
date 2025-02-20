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
    path: "/dashboard",
    items: [
      {
        label: currentLanguageData.translations?.modules?.dashboard?.selfStatistics || "Self Statistics",
        path: "/dashboard/self-statistics/",
        value: "self_statistics",
      },
      {
        label: currentLanguageData.translations?.modules?.dashboard?.teamStatistics || "Team Statistics",
        path: "/dashboard/team-statistics/",
        value: "team_statistics",
      },
    ],
  };

  const companyMaster = {
    route_name: "Company Master",
    path: "/company-master",
    items: [
      {
        label: currentLanguageData.translations?.modules?.companyMaster?.regions || "Regions",
        path: "/company-master/regions/",
        value: "regions",
      },
      {
        label: currentLanguageData.translations?.modules?.companyMaster?.nationalities || "Nationalities",
        path: "/company-master/nationalities/",
        value: "nationalities",
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
        label: currentLanguageData.translations?.modules?.organization?.departments || "Departments",
        path: "/organization/departments/",
        value: "departments",
      },
      {
        label: currentLanguageData.translations?.modules?.organization?.departments || "Departments",
        path: "/organization/departments/add/",
        value: "add-department",
        hide: true,
      },
      {
        label: currentLanguageData.translations?.modules?.organization?.organizationStructure || "Organization Structure",
        path: "/organization/structure/",
        value: "structure",
      },
      {
        label: currentLanguageData.translations?.modules?.organization?.organizationTypes || "Organization Types",
        path: "/organization/types/",
        value: "types",
      },
    ],
  };

  const employeeMaster = {
    route_name: "Employee Master",
    path: "/employee-master/",

    items: [
      {
        label: "Employees",
        path: "/employee-master/employees/",
        value: "employees",
      },
      {
        label: "Employees",
        path: "/employee-master/employees/add/",
        value: "add-employee",
        hide: true,
      },
      {
        label: "Employee Groups",
        path: "/employee-master/groups/",
        value: "groups",
      },
      {
        label: "Employee Groups",
        path: "/employee-master/groups/add/",
        value: "groups",
        hide: true,
      },
      {
        label: "Employee Types",
        path: "/employee-master/types/",
        value: "types",
      },
    ],
  };

  const taMaster = {
    route_name: "TA Master",
    path: "/TA-master/",
    items: [
      {
        label: "Reasons",
        path: "/TA-master/reasons/",
        value: "reasons",
      },
      {
        label: "Holidays",
        path: "/TA-master/holidays/",
        value: "holidays",
      },
      {
        label: "Ramadan Dates",
        path: "/TA-master/ramadan-dates/",
        value: "ramadan_dates",
      },
      {
        label: "Schedules",
        path: "/TA-master/schedules/",
        value: "schedules",
      },
      {
        label: "Schedules",
        path: "/TA-master/schedules/add/",
        value: "add-schedules",
        hide: true,
      },
    ],
  };

  const scheduling = {
    route_name: "Scheduling",
    path: "/scheduling/",
    items: [
      {
        label: "Weekly Schedule",
        path: "/scheduling/weekly-schedule/",
        value: "weekly_schedule",
      },
      {
        label: "Add Weekly Schedule",
        path: "/scheduling/weekly-schedule/add/",
        value: "add_weekly_schedule",
        hide: true,
      },
      {
        label: "Monthly Roaster",
        path: "/scheduling/monthly-roaster/",
        value: "monthly_roaster",
      },
      {
        label: "Employee Schedule",
        path: "/scheduling/employee-schedule/",
        value: "employee_schedule",
        hide: true,
      },
    ],
  };

  const selfServices = {
    route_name: "Self Services",
    path: "/self-services/",
    items: [
      {
        label: "Manage Permissions",
        path: "/self-services/manage-permissions/permission-types/",
        value: "manage-permissions",
      },
      {
        label: "Manage Permissions",
        path: "/self-services/manage-permissions/permission-types/add/",
        value: "manage-permissions",
        hide:true
      },
      {
        label: "Manage Permissions",
        path: "/self-services/manage-permissions/permission-application/",
        value: "permission application",
        hide:true,
      },
      {
        label: "Manage Permissions",
        path: "/self-services/manage-permissions/permission-approval/",
        value: "permission approval",
        hide:true,
      },
      {
        label: "Manage Leaves",
        path: "/self-services/manage-leaves/",
        value: "manage-leaves",
      },
      {
        label: "Manage Movements",
        path: "/self-services/manage-movements/applied/",
        value: "manage-movements",
      },
      {
        label: "Manage Movements",
        path: "/self-services/manage-movements/manual/",
        value: "manual",
        hide: true,
      },
      {
        label: "Manage Movements",
        path: "/self-services/manage-movements/approval-manual/",
        value: "approved_manual",
        hide: true,
      },
      {
        label: "Manage Movements",
        path: "/self-services/manage-movements/missing/",
        value: "manage-movements",
        hide: true,
      },
      {
        label: "Manage Movements",
        path: "/self-services/manage-movements/approve-missing/",
        value: "manage-movements",
        hide: true,
      },
      {
        label: "Approvals",
        path: "/self-services/approvals/",
        value: "approvals",
      },
      {
        label: "Approvals",
        path: "/self-services/approvals/verification/",
        value: "approvals",
        hide: true,
      },
      {
        label: "Approvals",
        path: "/self-services/approvals/pending/",
        value: "approvals",
        hide: true,
      },
      {
        label: "Workflow",
        path: "/self-services/workflow/",
        value: "workflow",
      },
      {
        label: "Workflow",
        path: "/self-services/workflow/add/",
        value: "add_workflow",
        hide: true,
      },
    ],
    manage_movements: {
      items: [
        {
          label: "Applied",
          url: "/self-services/manage-movements/applied/",
          value: "applied",
        },
        {
          label: "Manual",
          url: "/self-services/manage-movements/manual/",
          value: "manual",
        },
        {
          label: "Approval Manual",
          url: "/self-services/manage-movements/approval-manual/",
          value: "approval-manual",
        },
        {
          label: "Missing",
          url: "/self-services/manage-movements/missing/",
          value: "missing",
        },
        {
          label: "Approve Missing",
          url: "/self-services/manage-movements/approve-missing/",
          value: "approve-missing",
        },
      ],
    },
    manage_permissions: { 
      items: [
        {
          label: "Types",
          url: "/self-services/manage-permissions/permission-types/",
          value: "permission types",
        },
        {
          label: "Application",
          url: "/self-services/manage-permissions/permission-application/",
          value: "permission application",
        },
        {
          label: "Approval",
          url: "/self-services/manage-permissions/permission-approval/",
          value: "permission approval",
        },
      ],
    },
  };  

  const devices = {
    route_name: "Devices",
    path: "/devices/",
    items: [
      {
        label: "Devices Status",
        path: "/devices/devices-status/",
        value: "devices_status",
      },
      {
        label: "Devices Status",
        path: "/devices/devices-status/add/",
        value: "add_devices_status",
        hide: true,
      },
    ],
  };

  const reports = {
    route_name: "Reports",
    path: "/reports/",
    items: [
      {
        label: "Standard Reports",
        path: "/reports/standard-reports/",
        value: "standard_reports",
      },
      {
        label: "Reprocess Data",
        path: "/reports/reprocess-data/",
        value: "reprocess_data",
      },
    ],
  };

  const security = {
    route_name: "Security",
    path: "/security/",
    items: [
      {
        label: "Roles",
        path: "/security/roles/",
        value: "roles",
      },
      {
        label: "Privileges",
        path: "/security/privileges/",
        value: "privileges",
      },
    ],
  };

  const settings = {
    route_name: "Settings",
    path: "/settings/",
      items: [
        {
          label: "Application Settings",
          path: "/settings/application-settings/",
          value: "application_settings",
        },
        {
          label: "Application Settings",
          path: "/settings/application-settings/all/",
          value: "application_settings",
          hide:true,
        },
        {
          label: "Application Settings",
          path: "/settings/application-settings/notification/",
          value: "application_settings",
          hide:true,
        },
        {
          label: "Application Settings",
          path: "/settings/application-settings/server/",
          value: "application_settings",
          hide:true,
        },
        {
          label: "Application Settings",
          path: "/settings/application-settings/others/",
          value: "application_settings",
          hide:true,
        },
        {
          label: "Application Settings",
          path: "/settings/application-settings/module/",
          value: "application_settings",
          hide:true,
        },
        {
          label: "Application Settings",
          path: "/settings/application-settings/verification/",
          value: "application_settings",
          hide:true,
        },
        {
          label: "Add Announcement",
          path: "/settings/announcements/add/",
          value: "add_announcement",
          hide: true,
        },
        {
          label: "Announcements",
          path: "/settings/announcements/",
          value: "announcement",
        },
        {
          label: "Notifications ",
          path: "/settings/notifications/",
          value: "notifications",
        },
      ],
    manage_movements: {
      items: [
        {
          label: "All",
          url: "/settings/application-settings/all/",
          value: "all",
        },
        {
          label: "Notification",
          url: "/settings/application-settings/notification/",
          value: "notification",
        },
        {
          label: "Server",
          url: "/settings/application-settings/server/",
          value: "server",
        },
        {
          label: "Module",
          url: "/settings/application-settings/module/",
          value: "module",
        },
        {
          label: "Others",
          url: "/settings/application-settings/others/",
          value: "others",
        },
        {
          label: "Verification",
          url: "/settings/application-settings/verification/",
          value: "verification",
        },
      ],
    },

  };

  const alerts = {
    route_name: "Alerts",
    path: "/alerts/",
    items: [
      {
        label: "Email",
        path: "/alerts/email/",
        value: "email",
      },
      {
        label: "SMS",
        path: "/alerts/sms/",
        value: "sms",
      },
    ],
  };

  const modules = {
    dashboard,
    companyMaster,
    organization,
    employeeMaster,
    taMaster,
    scheduling,
    selfServices,
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

  useEffect(() => {
    // Update the <html> attributes for `dir` and `lang`
    document.documentElement.setAttribute("dir", currentLanguageData.dir || "ltr");
    document.documentElement.setAttribute("lang", currentLanguageData.code);
  }, [currentLanguageData]);

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
      {/* <div dir={currentLanguageData.dir} lang={currentLanguageData.code}> */}
        {children}
      {/* </div> */}
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
