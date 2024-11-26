export const dashboard = {
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

export const company_master = {
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

export const organization = {
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

export const employee_master = {
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

export const ta_master = {
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

export const scheduling = {
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

export const self_services = {
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

export const devices = {
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

export const reports = {
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

export const security = {
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

export const settings = {
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

export const alerts = {
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
