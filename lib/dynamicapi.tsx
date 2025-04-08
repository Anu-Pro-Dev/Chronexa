import { email_data, sms_data } from "@/data/alerts.data";
import { locations_data, citizenship_data, designations_data, grades_data } from "@/data/cm.data"; // Import your datasets
import { devices_status_data } from "@/data/devices.data";
import {
  userManagement_employees_data,
  userManagement_groups_data,
  userManagement_types_data,
} from "@/data/em.data";
import { weeklyschedule_data } from "@/data/scheduling.data";
import { departments_data, organizationtypes_data } from "@/data/org.data";
import { privileges_data, roles_data } from "@/data/security.data";
import { workflows_data, approvals_verification_data, approvals_pending_data, movement_applied_data, movement_manual_data, movement_missing_data, movement_approve_manual_data, movement_approve_missing_data, permission_application_data, permission_types_data, leave_application_data, leave_types_data, leave_approval_data, movement_manual_data_add } from "@/data/selfservices.data";
import { notification_data, settings_data } from "@/data/settings.data";
import { holidays_data, ramadandates_data, reasons_data, schedules_data} from "@/data/tam.data";

export const DynamicApi = (api: any, params: any) => {
  try {
    const page = parseInt(params.page as string) || 1;
    const limit = parseInt(params.limit as string) || 10;
    const search = params.search ? params.search.toString() : "";
    const sortField = params.sortField as string;
    const sortType = (params.sortType as string) || "asc";

    let data: any = [];
    switch (api) {
      case "/company-master/locations":
        data = locations_data;
        break;
      case "/company-master/citizenship":
        data = citizenship_data;
        break;
      case "/company-master/designations":
        data = designations_data;
        break;
      case "/company-master/grades":
        data = grades_data;
        break;
      case "/organization/departments":
        data = departments_data;
        break;
      case "/organization/types":
        data = organizationtypes_data;
        break;
      case "/organization/types":
        data = organizationtypes_data;
        break;
      case "/employee-master/employees":
        data = userManagement_employees_data;
        break;
      case "/employee-master/employee-types":
        data = userManagement_types_data;
        break;
      case "/employee-master/employee-groups":
        data = userManagement_groups_data;
        break;
      case "/ta-master/ramadan-dates":
        data = ramadandates_data;
        break;
      // case "/ta-master/reasons":
      //   data = reasons_data;
      //   break;
      case "/ta-master/holidays":
        data = holidays_data;
        break;
      case "/ta-master/schedules":
        data = schedules_data;
        break;
      case "/scheduling/weekly-schedule":
        data = weeklyschedule_data;
        break;
      case "/self-services/approvals/verification":
        data = approvals_verification_data;
        break;
      case "/self-services/approvals/pending":
        data = approvals_pending_data;
        break;
      case "/self-services/workflow":
        data = workflows_data;
        break;
      case "/self-services/manage-movements/applied":
        data = movement_applied_data;
        break;
      case "/self-services/manage-movements/manual":
        data = movement_manual_data;
        break;
      case "/self-services/manage-movements/manual/add":
          data = movement_manual_data_add;
          break;
      case "/self-services/manage-movements/approve-manual":
        data = movement_approve_manual_data;
        break;
      case "/self-services/manage-movements/missing":
        data = movement_missing_data;
        break;
      case "/self-services/manage-movements/approve-missing":
          data = movement_approve_missing_data;
          break;
      case "/self-services/manage-permissions/types":
        data = permission_types_data;
        break;
      case "/self-services/manage-permissions/application":
        data = permission_application_data;
        break;
      case "/self-services/manage-leaves/leave-types":
        data = leave_types_data;
        break;
      case "/self-services/manage-leaves/leave-approval":
        data = leave_approval_data;
        break;
      case "/self-services/manage-leaves/leave-report":
          data = leave_approval_data;
          break;
      case "/self-services/manage-leaves/application":
        data = leave_application_data;
        break;
      case "/devices/devices-status":
        data = devices_status_data;
        break;
      case "/security/roles":
        data = roles_data;
        break;
      case "/security/privileges":
        data = privileges_data;
        break;
      case "/settings/notifications":
        data = notification_data;
        break;
      case "/settings/application-settings":
        data = settings_data;
        break;
      case "/alerts/email":
        data = email_data;
        break;
      case "/alerts/sms":
        data = sms_data;
        break;
      default:
        throw new Error("API endpoint not supported");
    }

    if (search) {
      data = data.filter((item: any) =>
        Object.values(item).some((value: any) =>
          value.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    data = data.sort((a: any, b: any) => {
      if (sortType === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = data.slice(startIndex, endIndex);

    const totalDataLength = data.length;
    const totalPages = Math.ceil(totalDataLength / limit);

    return {
      data: {
        message: "Data fetched successfully!",
        payload: paginatedData,
        pagination: {
          totalDataLength,
          currentPage: page,
          totalPages,
          rowsPerPage: limit,
        },
      },
    };
  } catch (error: any) {
    return {
      error: error.message,
      message: "An error occurred while processing the request",
    };
  }
};
