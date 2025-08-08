// "use client";
// import React, { createContext, useContext, useState, useEffect } from "react";
// import { useAuthGuard } from "@/hooks/useAuthGuard"; 

// type LanguageData = {
//   code: string;
//   dir: string | undefined;
//   language: string;
//   translations: any;
// };

// type LanguageContextType = {
//   language: string;
//   dir: string | undefined;
//   languageName: string;
//   translations: any;
//   setLanguage: (language: string) => void;
//   modules: any;
// };

// const LanguageContext = createContext<LanguageContextType | undefined>(
//   undefined
// );

// // Import language data
// import arData from "@/locales/ar.json";
// import enData from "@/locales/en.json";

// const allLanguages: { [key: string]: LanguageData } = {
//   ar: arData,
//   en: enData,
// };

// export default function LanguageProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [language, setLanguage] = useState<string>("en");
//   const [isMounted, setIsMounted] = useState(false);

//   const currentLanguageData = allLanguages[language] || allLanguages["en"];
  
//   // Get auth data with proper destructuring and debugging
//   const authData = useAuthGuard();
//   const isGeofenceEnabled = authData?.isGeofenceEnabled || false;
  
//   // Debug logging
//   useEffect(() => {
//     console.log("🔍 LanguageProvider - Auth data:", authData);
//     console.log("🔍 LanguageProvider - isGeofenceEnabled:", isGeofenceEnabled);
//   }, [authData, isGeofenceEnabled]);

//   // const currentLanguageData = allLanguages[language] || allLanguages["en"];

//   // Create dashboard items based on geofence access
//   const getDashboardItems = () => {
//     const baseItems = [
//       {
//         label: currentLanguageData.translations?.modules?.dashboard?.my_attendance || "My Attendance",
//         path: "/dashboard/my-attendance/",
//         value: "my_attendance",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.dashboard?.team_attendance || "Team Attendance",
//         path: "/dashboard/team-attendance/",
//         value: "team_attendance",
//       },
//     ];

//     // Only add Geo Fence if user has geofence access
//     if (isGeofenceEnabled) {
//       baseItems.push({
//         label: currentLanguageData.translations?.modules?.dashboard?.geo_fence || "Geo Fence",
//         path: "/dashboard/geo-fence/",
//         value: "geo_fence",
//       });
//     }

//     return baseItems;
//   };

//   const dashboard = {
//     route_name: "Dashboard",
//     path: "/dashboard",
//     items: getDashboardItems(),
//   };

//   // const dashboard = {
//   //   route_name: "Dashboard",
//   //   path: "/dashboard",
//   //   items: [
//   //     {
//   //       label: currentLanguageData.translations?.modules?.dashboard?.my_attendance || "My Attendance",
//   //       path: "/dashboard/my-attendance/",
//   //       value: "my_attendance",
//   //     },
//   //     {
//   //       label: currentLanguageData.translations?.modules?.dashboard?.team_attendance || "Team Attendance",
//   //       path: "/dashboard/team-attendance/",
//   //       value: "team_attendance",
//   //     },
//   //     {
//   //       label: currentLanguageData.translations?.modules?.dashboard?.geo_fence || "Geo Fence",
//   //       path: "/dashboard/geo-fence/",
//   //       value: "geo_fench",
//   //     },
//   //   ],
//   // };

//   const companyMaster = {
//     route_name: "Company Master",
//     path: "/company-master",
//     items: [
//       {
//         label: currentLanguageData.translations?.modules?.companyMaster?.locations || "Locations",
//         path: "/company-master/locations/",
//         value: "locations",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.companyMaster?.citizenship || "Citizenship",
//         path: "/company-master/citizenship/",
//         value: "citizenship",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.companyMaster?.designations || "Designations",
//         path: "/company-master/designations/",
//         value: "designations",
//       },
//       { 
//         label: currentLanguageData.translations?.modules?.companyMaster?.grades || "Grades",
//         path: "/company-master/grades/", 
//         value: "grades" 
//       },
//     ],
//   };

//   const organization = {
//     route_name: "Organization",
//     path: "/organization/",
//     items: [
//       { 
//         label: currentLanguageData.translations?.modules?.organization?.organization_types || "Organization Types",
//         path: "/organization/organization-types/", 
//         value: "organization-types" 
//       },
//       { 
//         label: currentLanguageData.translations?.modules?.organization?.organization || "Organization",
//         path: "/organization/organization/", 
//         value: "organization" 
//       },
//       {
//         label: currentLanguageData.translations?.modules?.organization?.organization_structure || "Organization Structure",
//         path: "/organization/organization-structure/",
//         value: "organization-structure",
//       },
//     ],
//   };

//   const employeeMaster = {
//     route_name: "Employee Master",
//     path: "/employee-master/",
//     items: [
//       {
//         label: currentLanguageData.translations?.modules?.employeeMaster?.employee_type || "Employee Type",
//         path: "/employee-master/employee-type/",
//         value: "employee_type",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.employeeMaster?.employee_group || "Employee Group",
//         path: "/employee-master/employee-group/",
//         value: "employee_group",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.employeeMaster?.employee_group || "Employee Group",
//         path: `/employee-master/employee-group/group-members/`,
//         value: "employee_group",
//         hide: true,
//       },
//       {
//         label: currentLanguageData.translations?.modules?.employeeMaster?.employee || "Employee",
//         path: "/employee-master/employee/",
//         value: "employee",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.employeeMaster?.employee || "Employee",
//         path: "/employee-master/employee/add/",
//         value: "add-employee",
//         hide: true,
//       },
//     ],
//   };

//   const scheduling = {
//     route_name: "Scheduling",
//     path: "/scheduling/",
//     items: [
//       {
//         label: currentLanguageData.translations?.modules?.scheduling?.schedules || "Schedules",
//         path: "/scheduling/schedules/",
//         value: "schedules",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.scheduling?.schedules || "Schedules",
//         path: "/scheduling/schedules/add/",
//         value: "add-schedules",
//         hide: true,
//       },
//       {
//         label: currentLanguageData.translations?.modules?.scheduling?.weekly_schedule || "Weekly Schedule",
//         path: "/scheduling/weekly-schedule/",
//         value: "weekly_schedule",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.scheduling?.weekly_schedule || "Weekly Schedule",
//         path: "/scheduling/weekly-schedule/add/",
//         value: "add_weekly_schedule",
//         hide: true,
//       },
//       {
//         label: currentLanguageData.translations?.modules?.scheduling?.monthly_schedule || "Monthly Schedule",
//         path: "/scheduling/monthly-schedule/",
//         value: "monthly_schedule",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.scheduling?.holidays || "Holidays",
//         path: "/scheduling/holidays/",
//         value: "holidays",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.scheduling?.set_ramadan_dates || "Set Ramadan Dates",
//         path: "/scheduling/set-ramadan-dates/",
//         value: "set_ramadan_dates",
//       },
//     ],
//   };

//   const selfServices = {
//     route_name: "Self Services",
//     path: "/self-services/",
//     items: [
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.workflow || "Workflow",
//         path: "/self-services/workflow/",
//         value: "workflow",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.workflow || "Workflow",
//         path: "/self-services/workflow/add/",
//         value: "add_workflow",
//         hide: true,
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.permissions || "Permissions",
//         path: "/self-services/permissions/",
//         value: "permissions",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.permissions || "Permissions",
//         path: "/self-services/permissions/manage/add/",
//         value: "permissions",
//         hide:true
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.permissions || "Permissions",
//         path: "/self-services/permissions/requests/",
//         value: "permissions",
//         hide:true,
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.permissions || "Permissions",
//         path: "/self-services/permissions/requests/add/",
//         value: "permissions",
//         hide:true
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.leaves || "Leaves",
//         path: "/self-services/leaves/manage/",
//         value: "leaves",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.leaves || "Leaves",
//         path: "/self-services/leaves/manage/add/",
//         value: "leaves",
//         hide:true
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.leaves || "Leaves",
//         path: "/self-services/leaves/requests/",
//         value: "leaves",
//         hide:true,
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.leaves || "Leaves",
//         path: "/self-services/leaves/requests/add/",
//         value: "leaves",
//         hide:true
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.punches || "Punches",
//         path: "/self-services/punches/my-punches/",
//         value: "punches",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.punches || "Punches",
//         path: "/self-services/punches/my-punches/add/",
//         value: "punches",
//         hide:true
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.punches || "Punches",
//         path: "/self-services/punches/my-requests/",
//         value: "punches",
//         hide:true,
//       },
//       {
//         label: currentLanguageData.translations?.modules?.selfServices?.punches || "Punches",
//         path: "/self-services/punches/my-requests/add/",
//         value: "punches",
//         hide:true
//       },
//     ],
//     permissions: { 
//       items: [
//         {
//           label: currentLanguageData.translations?.modules?.selfServices?.manage || "Manage",
//           url: "/self-services/permissions/manage/",
//           value: "permission manage",
//         },
//         {
//           label: currentLanguageData.translations?.modules?.selfServices?.requests || "Requests",
//           url: "/self-services/permissions/requests/",
//           value: "permission requests",
//         },
//       ],
//     },
//     leaves: { 
//       items: [
//         {
//           label: currentLanguageData.translations?.modules?.selfServices?.manage || "Manage",
//           url: "/self-services/leaves/manage/",
//           value: "leave manage",
//         },
//         {
//           label: currentLanguageData.translations?.modules?.selfServices?.requests || "Requests",
//           url: "/self-services/leaves/requests/",
//           value: "leave requests",
//         },
//       ],
//     },
//     punches: {
//       items: [
//         {
//           label: currentLanguageData.translations?.modules?.selfServices?.my_punches || "My Punches",
//           url: "/self-services/punches/my-punches/",
//           value: "punches manage",
//         },
//         {
//           label: currentLanguageData.translations?.modules?.selfServices?.team_punches || "Team Punches",
//           url: "/self-services/punches/team-punches/",
//           value: "punches requests",
//         },
//       ],
//     },
//   };

//   const manageApprovals = {
//     route_name: "Manage Approvals",
//     path: "/manage-approvals/",
//     items: [
//       {
//         label: currentLanguageData.translations?.modules?.manageApprovals?.my_punches || "Team Requests",
//         path: "/manage-approvals/team-requests/",
//       },
//     ],
//     teamrequests: { 
//       items: [
//         {
//           label: currentLanguageData.translations?.modules?.manageApprovals?.permissions || "Permissions",
//           url: "/manage-approvals/team-requests/permissions/",
//           value: "permission approval",
//         },
//         {
//           label: currentLanguageData.translations?.modules?.manageApprovals?.leaves || "Leaves",
//           url: "/manage-approvals/team-requests/leaves/",
//           value: "leave approval",
//         }
//       ],
//     },
//   };

//   const reports = {
//     route_name: "Reports",
//     path: "/reports/",
//     items: [
//       {
//         label: currentLanguageData.translations?.modules?.reports?.reports || "Reports",
//         path: "/reports/reports/",
//         value: "reports",
//       },
//     ],
//   };

//   const configuration = {
//     route_name: "Configuration",
//     path: "/configuration/",
//     items: [
//       {
//         label: currentLanguageData.translations?.modules?.configuration?.roles || "Roles",
//         path: "/configuration/roles/",
//         value: "roles",
//       },
//       {
//         label: currentLanguageData.translations?.modules?.configuration?.roles || "Roles",
//         path: `/configuration/roles/assign-roles/`,
//         value: "roles",
//         hide: true,
//       },
//     ],
//   };

//   const settings = {
//     route_name: "Settings",
//     path: "/settings/",
//       items: [
//         {
//           label: currentLanguageData.translations?.modules?.settings?.db_settings || "DB Settings",
//           path: "/settings/db-settings/",
//           value: "db_settings",
//         },
//         {
//           label: currentLanguageData.translations?.modules?.settings?.email_settings || "Email Settings",
//           path: "/settings/email-settings/",
//           value: "email_settings",
//         },
//         {
//           label: currentLanguageData.translations?.modules?.settings?.app_settings || "App Settings",
//           path: "/settings/app-settings/",
//           value: "app_settings",
//         },
//       ],
//   };

//   const alerts = {
//     route_name: "Alerts",
//     path: "/alerts/",
//     items: [
//       {
//         label: currentLanguageData.translations?.modules?.alerts?.email || "Email",
//         path: "/alerts/email/",
//         value: "email",
//       },
//     ],
//   };

//   const modules = {
//     dashboard,
//     companyMaster,
//     organization,
//     employeeMaster,
//     scheduling,
//     selfServices,
//     manageApprovals,
//     reports,
//     configuration,
//     settings,
//     alerts,
//   };

//   // Load language from localStorage after component mounts
//   useEffect(() => {
//     setIsMounted(true);
//     // Only access localStorage after component has mounted
//     if (typeof window !== 'undefined') {
//       const storedLanguage = localStorage.getItem("language");
//       if (storedLanguage && allLanguages[storedLanguage]) {
//         setLanguage(storedLanguage);
//       }
//     }
//   }, []);

//   // Update HTML attributes only after mounting
//   useEffect(() => {
//     if (isMounted && typeof window !== 'undefined') {
//       document.documentElement.setAttribute("dir", currentLanguageData.dir || "ltr");
//       document.documentElement.setAttribute("lang", currentLanguageData.code);
//     }
//   }, [currentLanguageData, isMounted]);

//   const changeLanguage = (newLanguage: string) => {
//     if (allLanguages[newLanguage]) {
//       setLanguage(newLanguage);
//       // Only save to localStorage if running in browser
//       if (typeof window !== 'undefined') {
//         localStorage.setItem("language", newLanguage);
//       }
//     } else {
//       console.warn(`Unsupported language: ${newLanguage}`);
//     }
//   };

//   // Always render the provider, but use default values until mounted
//   return (
//     <LanguageContext.Provider
//       value={{
//         language: currentLanguageData.code,
//         dir: currentLanguageData.dir,
//         languageName: currentLanguageData.language,
//         translations: currentLanguageData.translations,
//         setLanguage: changeLanguage,
//         modules: modules,
//       }}
//     >
//       {children}
//     </LanguageContext.Provider>
//   );
// }

// export const useLanguage = () => {
//   const context = useContext(LanguageContext);
//   if (!context) {
//     throw new Error("useLanguage must be used within a LanguageProvider");
//   }
//   return context;
// };
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthGuard } from "../hooks/useAuthGuard";

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

// Define the type for useAuthGuard return value
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

// Import language data
import arData from "@/locales/ar.json";
import enData from "@/locales/en.json";

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
  
  console.log("🚀 LanguageProvider - Component rendered");
  
  // Get auth data with proper typing and safety check
  const authData: AuthGuardReturn = useAuthGuard();
  console.log("✅ LanguageProvider - useAuthGuard result:", authData);
  
  const isGeofenceEnabled = authData?.isGeofenceEnabled ?? false;
  console.log("🔍 LanguageProvider - isGeofenceEnabled value:", isGeofenceEnabled, typeof isGeofenceEnabled);
  console.log("🔍 LanguageProvider - authData exists:", !!authData);
  
  // Debug logging
  useEffect(() => {
    console.log("🔍 LanguageProvider useEffect - Auth data:", authData);
    console.log("🔍 LanguageProvider useEffect - isGeofenceEnabled:", isGeofenceEnabled);
  }, [authData, isGeofenceEnabled]);

  const currentLanguageData = allLanguages[language] || allLanguages["en"];

  // Create dashboard items based on geofence access - make it reactive
  const getDashboardItems = () => {
    console.log("🔄 getDashboardItems called with:");
    console.log("   - authData:", authData);
    console.log("   - isGeofenceEnabled:", isGeofenceEnabled, typeof isGeofenceEnabled);
    console.log("   - authData.isGeofenceEnabled:", authData?.isGeofenceEnabled);
    
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

    // Only add Geo Fence if user has geofence access
    // Use strict comparison to ensure we're checking the right value
    if (isGeofenceEnabled === true) {
      console.log("✅ Adding Geo Fence to dashboard items");
      baseItems.push({
        label: currentLanguageData.translations?.modules?.dashboard?.geo_fence || "Geo Fence",
        path: "/dashboard/geo-fence/",
        value: "geo_fence",
      });
    } else {
      console.log("❌ Geo Fence not added - isGeofenceEnabled is:", isGeofenceEnabled);
    }

    console.log("📋 Final dashboard items count:", baseItems.length);
    console.log("📋 Final dashboard items:", baseItems.map(item => item.value));
    return baseItems;
  };

  // Create dashboard object - this will be recreated when isGeofenceEnabled changes
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
        path: "/scheduling/weekly-schedule/add/",
        value: "add_weekly_schedule",
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
        path: "/scheduling/set-ramadan-dates/",
        value: "set_ramadan_dates",
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
        hide:true
      },
      {
        label: currentLanguageData.translations?.modules?.selfServices?.permissions || "Permissions",
        path: "/self-services/permissions/requests/",
        value: "permissions",
        hide:true,
      },
      {
        label: currentLanguageData.translations?.modules?.selfServices?.permissions || "Permissions",
        path: "/self-services/permissions/requests/add/",
        value: "permissions",
        hide:true
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
        hide:true
      },
      {
        label: currentLanguageData.translations?.modules?.selfServices?.leaves || "Leaves",
        path: "/self-services/leaves/requests/",
        value: "leaves",
        hide:true,
      },
      {
        label: currentLanguageData.translations?.modules?.selfServices?.leaves || "Leaves",
        path: "/self-services/leaves/requests/add/",
        value: "leaves",
        hide:true
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
        hide:true
      },
      {
        label: currentLanguageData.translations?.modules?.selfServices?.punches || "Punches",
        path: "/self-services/punches/my-requests/",
        value: "punches",
        hide:true,
      },
      {
        label: currentLanguageData.translations?.modules?.selfServices?.punches || "Punches",
        path: "/self-services/punches/my-requests/add/",
        value: "punches",
        hide:true
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
          label: currentLanguageData.translations?.modules?.selfServices?.requests || "Requests",
          url: "/self-services/permissions/requests/",
          value: "permission requests",
        },
      ],
    },
    leaves: { 
      items: [
        {
          label: currentLanguageData.translations?.modules?.selfServices?.manage || "Manage",
          url: "/self-services/leaves/manage/",
          value: "leave manage",
        },
        {
          label: currentLanguageData.translations?.modules?.selfServices?.requests || "Requests",
          url: "/self-services/leaves/requests/",
          value: "leave requests",
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
        path: "/manage-approvals/team-requests/",
      },
    ],
    teamrequests: { 
      items: [
        {
          label: currentLanguageData.translations?.modules?.manageApprovals?.permissions || "Permissions",
          url: "/manage-approvals/team-requests/permissions/",
          value: "permission approval",
        },
        {
          label: currentLanguageData.translations?.modules?.manageApprovals?.leaves || "Leaves",
          url: "/manage-approvals/team-requests/leaves/",
          value: "leave approval",
        }
      ],
    },
  };

  const reports = {
    route_name: "Reports",
    path: "/reports/",
    items: [
      {
        label: currentLanguageData.translations?.modules?.reports?.reports || "Reports",
        path: "/reports/reports/",
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

  // Create modules object - this will be recreated when dashboard changes
  const modules = {
    dashboard,
    companyMaster,
    organization,
    employeeMaster,
    scheduling,
    selfServices,
    manageApprovals,
    reports,
    configuration,
    settings,
    alerts,
  };

  console.log("📊 Modules created with dashboard items:", modules.dashboard.items.length);

  // Load language from localStorage after component mounts
  useEffect(() => {
    setIsMounted(true);
    // Only access localStorage after component has mounted
    if (typeof window !== 'undefined') {
      const storedLanguage = localStorage.getItem("language");
      if (storedLanguage && allLanguages[storedLanguage]) {
        setLanguage(storedLanguage);
      }
    }
  }, []);

  // Update HTML attributes only after mounting
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      document.documentElement.setAttribute("dir", currentLanguageData.dir || "ltr");
      document.documentElement.setAttribute("lang", currentLanguageData.code);
    }
  }, [currentLanguageData, isMounted]);

  const changeLanguage = (newLanguage: string) => {
    if (allLanguages[newLanguage]) {
      setLanguage(newLanguage);
      // Only save to localStorage if running in browser
      if (typeof window !== 'undefined') {
        localStorage.setItem("language", newLanguage);
      }
    } else {
      console.warn(`Unsupported language: ${newLanguage}`);
    }
  };

  // Always render the provider, but use default values until mounted
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