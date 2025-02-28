import { RolesDataType, PrivilegesDataType } from "./types/types";

export const roles_columns = [
  "select",
  "name",
  "privileges",
  "assign_role",
  "users",
  "actions",
];

export const privileges_columns = [
  "select",
  "name",
  "group",
  "updated",
  "actions",
];

export const roles_data: RolesDataType[] = [
  {
    name_en: "ADMIN",
    name_ar: "مسؤل",
    privileges: "View",
    assign_role: "Users",
    users: "0",
  },
  {
    name_en: "DEPARTMENT ADMIN",
    name_ar: "مدير القسم",
    privileges: "View",
    assign_role: "Users",
    users: "6",
  },
  {
    name_en: "DEVELOPER",
    name_ar: "المطور",
    privileges: "View",
    assign_role: "Users",
    users: "0",
  },
  {
    name_en: "EMPLOYEE",
    name_ar: "موظف",
    privileges: "View",
    assign_role: "Users",
    users: "152",
  },
  {
    name_en: "HR ADMIN",
    name_ar: "HR مسؤل",
    privileges: "View",
    assign_role: "Users",
    users: "4",
  },
  {
    name_en: "MANAGER",
    name_ar: "مدير",
    privileges: "View",
    assign_role: "Users",
    users: "21",
  },
];

export const privileges_data: PrivilegesDataType[] = [
  {
    name: "VIEW_WORKFLOWS",
    group: "HR Privileges",
    updated: "28-07-2019",
  },
  {
    name: "VIEW_WEBPUNCH_EXCEPTION_LIST",
    group: "HR Privileges",
    updated: "07-04-2014",
  },
  {
    name: "VIEW_VIOLATION",
    group: "AT Privileges",
    updated: "16-09-2013",
  },
  {
    name: "VIEW_VERIFICATION_WIDGET",
    group: "HR Privileges",
    updated: "21-03-2017",
  },
  {
    name: "VIEW_TEAM_STATISTICS",
    group: "HR Privileges",
    updated: "31-12-2018",
  },
  {
    name: "VIEW_TEAM_EFFICIENCY",
    group: "HR Privileges",
    updated: "06-11-2016",
  },
  {
    name: "VIEW_TEAM_DASHBOARD",
    group: "HR Privileges",
    updated: "14-04-2019",
  },
  {
    name: "VIEW_TA_EVENT",
    group: "HR Privileges",
    updated: "16-09-2013",
  },
  {
    name: "VIEW_SYSTEM_SUPPORT",
    group: "HR Privileges",
    updated: "29-06-2017",
  },
  {
    name: "VIEW_SUPPORT_TICKET",
    group: "HR Privileges",
    updated: "21-06-2020",
  },
];
