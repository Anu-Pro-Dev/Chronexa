import { AllSettingsDataType, NotificationDataType } from "./types/types";

export const settings_columns = [
  "select",
  "name",
  "value",
  "deletable",
  "description",
  "updated_by",
  "updatedAt",
  "actions",
];

export const notification_columns = [
  "select",
  "description",
  "description(العربية)",
  "subject",
  "updated_by",
  "updatedAt",
  "actions",
];

export const settings_data: AllSettingsDataType[] = [
  {
    name: "TIME_ZONE",
    value: "4",
    deletable: "🗴",
    description: "Test case scenario 1 will be displayed here ",
    updated_by: "ADMIN",
    updatedAt: "21-11-2013",
  },
  {
    name: "SHOW_ABSENT",
    value: "FALSE",
    deletable: "🗴",
    description:"If SHOW_ABSENT is false then system will not show ABSENT for OPEN SHIFT SCHEDULE.",
    updated_by: "ADMIN",
    updatedAt: "31-03-2014",
  },
  {
    name: "MIN_PUNCH_DURATION",
    value: "1",
    deletable: "🗴",
    description:"No.of minutes between consecutive punches for the same employee to count as duplicate",
    updated_by: "ADMIN",
    updatedAt: "21-11-2013",
  },
  {
    name: "MIN_PERM_HOURS_PER_DAY",
    value: "30",
    deletable: "🗴",
    description: "MAX_PERM_HOURS_PER_DAY",
    updated_by: "ADMIN",
    updatedAt: "12-03-2017",
  },
  {
    name: "MIN_OT_PER_DAY",
    value: "30",
    deletable: "🗴",
    description: "Minimum overtime work hours per day to get overtime",
    updated_by: "ADMIN",
    updatedAt: "12-03-2017",
  },
  {
    name: "MIN_OT_PER_WEEK",
    value: "50",
    deletable: "🗴",
    description: "Minimum overtime work hours per week to get overtime",
    updated_by: "ADMIN",
    updatedAt: "12-03-2017",
  },
];

export const notification_data: NotificationDataType[] = [
  {
    description_en:
      "Dear {EmployeeName},You were recorded in TIMECHECK attendance system as early out on {date} by {time} minutes, please Click here to take necessary action for the same.Regards,HC Department Note: This is an automated email notification generated from the system. Please do not respond to this email address. If further assistance is required, please contact HC Department",
    description_ar: "",
    subject: "TAMS - Early Violation Notification",
    updated_by: "ADMIN",
    updatedAt: "10-08-2022",
  },
  {
    description_en:
      "Dear {EmployeeName}, You were recorded in TIMECHECK attendance system as late in on {date} by {time} minutes, please Click here to take necessary action for the same. Regards, HC Department Note: This is an automated email notification generated from the system. Please do not respond to this email address. If further assistance is required, please contact HC Department .",
    description_ar: "",
    subject: "TAMS - Late Violation Notification",
    updated_by: "ADMIN",
    updatedAt: "10-08-2022",
  },
];
