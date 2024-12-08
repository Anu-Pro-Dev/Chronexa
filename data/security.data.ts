import { RolesDataType, PrivilegesDataType } from "./types/types";

export const roles_columns = [
  "select",
  "name",
  "privileges",
  "user",
  "users",
  "actions",
];

export const privileges_columns = [
  "select",
  "name",
  "group",
  "updatedAt",
  "actions",
];

export const roles_data: RolesDataType[] = [
  {
    code: "ADMIN",
    privileges: "View",
    user: "Users",
    users: "0",
  },
  {
    code: "DEPARTMENT_ADMIN",
    privileges: "View",
    user: "Users",
    users: "6",
  },
  {
    code: "dev",
    privileges: "View",
    user: "Users",
    users: "0",
  },
  {
    code: "EMPLOYEE",
    privileges: "View",
    user: "Users",
    users: "152",
  },
  {
    code: "HR_ADMIN",
    privileges: "View",
    user: "Users",
    users: "4",
  },
  {
    code: "MANAGER",
    privileges: "View",
    user: "Users",
    users: "21",
  },
];

export const privileges_data: PrivilegesDataType[] = [
  {
    name: "VIEW_WORKFLOWS",
    group: "HR Privileges",
    updatedAt: "28-07-2019",
  },
  {
    name: "VIEW_WEBPUNCH_EXCEPTION_LIST",
    group: "HR Privileges",
    updatedAt: "07-04-2014",
  },
  {
    name: "VIEW_VIOLATION",
    group: "AT Privileges",
    updatedAt: "16-09-2013",
  },
  {
    name: "VIEW_VERIFICATION_WIDGET",
    group: "HR Privileges",
    updatedAt: "21-03-2017",
  },
  {
    name: "VIEW_TEAM_STATISTICS",
    group: "HR Privileges",
    updatedAt: "31-12-2018",
  },
  {
    name: "VIEW_TEAM_EFFICIENCY",
    group: "HR Privileges",
    updatedAt: "06-11-2016",
  },
  {
    name: "VIEW_TEAM_DASHBOARD",
    group: "HR Privileges",
    updatedAt: "14-04-2019",
  },
  {
    name: "VIEW_TA_EVENT",
    group: "HR Privileges",
    updatedAt: "16-09-2013",
  },
  {
    name: "VIEW_SYSTEM_SUPPORT",
    group: "HR Privileges",
    updatedAt: "29-06-2017",
  },
  {
    name: "VIEW_SUPPORT_TICKET",
    group: "HR Privileges",
    updatedAt: "21-06-2020",
  },
];
