"use client";

export type RegionsDataType = {
  code: string;
  description: string;
  updatedAt: string;
};

export type NationalitiesDataType = {
  code: string;
  description: string;
  updatedAt: string;
};

export type DesignationsDataType = {
  code: string;
  description: string;
  updatedAt: string;
};

export type GradesDataType = {
  code: string;
  description: string;
  updatedAt: string;
  overtime_eligible: string;
  senior_employee: string;
};

export type OrganizationTypesDataType = {
  description: string;
  updatedAt: string;
};

export type DepartmentsDataType = {
  number: string;
  name: string;
  organization: any;
  from_date: string;
  to_date: string;
  active: any;
  created_by: string;
  updatedAt: string;
};

export type EmployeeMasterEmployeesDataType = {
  number: string;
  name: string;
  join_date: string;
  manager: string;
  punch: string;
  active: string;
  designation: string;
  organization: string;
  manager_name: string;
};

export type EmployeeMasterGroupsDataType = {
  code: string;
  description: string;
  schedule: string;
  from_date: string;
  to_date: string;
  reporting_group: string;
  employee: string;
  members: string;
  updatedAt: string;
};

export type EmployeeMasterGroupsMembersDataType = {
  number: string;
  name: string;
  designation: string;
  organization: string;
};

export type EmployeeMasterTypesDataType = {
  code: string;
  description: string;
  updatedAt: string;
};

// TA Master Page DataTypes

export type ReasonsDataType = {
  code: string;
  description: string;
  reason_mode: string;
  promt_message: string;
  deleteable: string;
  normal_in: string;
  normal_out: string;
  web_punch: string;
  geo_fence_required: string;
  updatedAt: string;
};

export type HolidaysDataType = {
  description: string;
  from_date: string;
  to_date: string;
  recurring: string;
  public_holiday: string;
  updatedAt: string;
};

export type SchedulesDataType = {
  code: string;
  color: string;
  organization: string;
  in_time: string;
  out_time: string;
  inactive_date: string;
  updatedAt: string;
};

export type RamadanDatesDataType = {
  description_en: string;
  description_ar: string;
  from_date: string;
  to_date: string;
  updatedAt: string;
  remarks: string;
};

// Scheduling Page DataTypes

export type WeeklyScheduleDataType = {
  from_date: string;
  to_date: string;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  attachment: string;
};

export type MonthlyRosterDataType = {
  name: string;
  number: number;
  version: string;
  status: string;
  work_hours: string;
};

export type EmployeeScheduleDataType = {};

// Self Services Page DataTypes

export type WorkflowsDataType = {
  code: string;
  category: string;
  steps: string;
};

//self services verification approval data type

export type VerificationApprovalDataType = {
number: string;
name: string;
type: string;
date : string;
time: string;
approved_by: string;
remarks: string;
};

//self services verification pending data type

export type VerificationPendingDataType = {
  number: string;
  employee: string;
  request_type: string;
  type: string;
  from_date: string;
  to_date: string;
  from_time: string;
  to_time: string;
  };

//self services movement applied data type

  export type MovementPendingDataType = {
    number: string;
    employee: string;
    date: string;
    time: string;
    reason: string;
    remarks: string;
    action_by: string;
    action_date: string;
  }

  //self services movement manual data type

  export type MovementManualDataType = {
    number: string;
    employee: string;
    date: string;
    from_date: string;
    to_date: string;
    from_time: string;
    to_time: string;
    status: string;
  }

  //self services movement approval manual data type

  export type MovementApprovalManualDataType = {
    number: string;
    employee: string;
    date: string;
    from_date: string;
    to_date: string;
    from_time: string;
    to_time: string;
    remarks: string;
  }

  //self-services permission application data type

  export type PermissionApplicationDataType = {
    number: string;
    employee: string;
    date: string;
    from_date: string;
    to_date: string;
    from_time: string;
    to_time: string;
    remarks: string;
  }

  //self-services permission types data type

  export type PermissionTypesDataType = {
    code: string;
    description: string;
    reason: string;
    max_no_of_permissions_per_day: number;
    min_per_day: number;
    max_no_of_permissions_per_month: number;
  }

// Devices Page DataTypes

export type DevicesStatusDataType = {
  code: string;
  name: string;
  buildings: string;
  active: string;
};

// Security Page DataTypes

export type RolesDataType = {
  code: string;
  privileges: string;
  assignRole: string;
  users: string;
};

export type PrivilegesDataType = {
  name: string;
  group: string;
  updatedAt: string;
};

// Settings Page DataTypes

export type AllSettingsDataType = {
  name: string;
  value: string;
  deletable: string;
  description: string;
  updated_by: string;
  updatedAt: string;
};

export type NotificationDataType = {
  description_en: string;
  description_ar: string;
  subject: string;
  updated_by: string;
  updatedAt: string;
};

// Alerts Page DataTypes

export type EmailDataType = {
  email: string;
  subject: string;
  email_body: string;
  status: string;
  cc_email: string;
  bcc_email: string;
  complete_violation: string;
  created_date: string;
  updatedAt: string;
};
export type SmsDataType = {
  mobile_number: string;
  employee_id: string;
  subject: string;
  sms_content: string;
  status: string;
  created_date: string;
  updatedAt: string;
};
