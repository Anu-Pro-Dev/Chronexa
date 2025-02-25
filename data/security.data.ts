import { RolesDataType, PrivilegesDataType } from "./types/types";

export const roles_columns = [
  "select",
  "name",
  "privileges",
  "assignRole",
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
    code: "ADMIN",
    privileges: "View",
    assignRole: "Users",
    users: "0",
  },
  {
    code: "DEPARTMENT_ADMIN",
    privileges: "View",
    assignRole: "Users",
    users: "6",
  },
  {
    code: "dev",
    privileges: "View",
    assignRole: "Users",
    users: "0",
  },
  {
    code: "EMPLOYEE",
    privileges: "View",
    assignRole: "Users",
    users: "152",
  },
  {
    code: "HR_ADMIN",
    privileges: "View",
    assignRole: "Users",
    users: "4",
  },
  {
    code: "MANAGER",
    privileges: "View",
    assignRole: "Users",
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
