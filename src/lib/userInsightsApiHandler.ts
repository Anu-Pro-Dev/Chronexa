import { apiRequest } from "@/src/lib/apiHandler";

function buildDateParam(date?: string): string {
  return date ? `date=${date}` : "";
}

export interface OrganizationInfo {
  id: number;
  name: string;
}

export interface OrganizationAnalyticsData {
  organization: OrganizationInfo;
  totals: {
    totalEmployees: number;
    employeesInUse: number;
    noAppLogin: number;
    licenseCounts: {
      withLicense: number;
      withoutLicense: number;
    };
  };
  today: {
    checkIns: number;
    checkOuts: number;
    presentCount: number;
    missedIn: number;
    missedOut: number;
    onLeave: number;
    absentCount: number;
  };
  hourlyTrend: Array<{
    hour: number;
    checkIns: number;
    checkOuts: number;
  }>;
  attendanceSplit: {
    checkedIn: number;
    checkedOut: number;
    present: number;
    missedIn: number;
    missedOut: number;
    onLeave: number;
    absent: number;
    noLogin: number;
  };
  departmentAttendance: Array<{
    department: string;
    present: number;
    absent: number;
    onLeave: number;
    missedIn: number;
    missedOut: number;
    checkin: number;
    checkout: number;
    total: number;
    rate: number;
  }>;
  weeklyTrend: Array<{
    label: string;
    present: number;
    onLeave: number;
    absent: number;
    missedIn: number;
    missedOut: number;
    total: number;
  }>;
  overtime: {
    avgHoursToday: number;
    overtimeCount: number;
    earlyDepartures: number;
    shiftCoverage: number;
    weekAttendanceRate: number;
    requiredHours: number;
  };
}

export interface OrganizationAlertsData {
  targetDate: string;
  no_checkin_today: number;
  missing_checkout_yesterday: number;
  depts_below_60pct: number;
  lowest_dept_name: string;
  lowest_dept_pct: number;
  leave_requests_today: number;
  overtime_count: number;
  geofence_violations: number;
  unapproved_wfh: number;
  consecutive_absent_3plus: number;
}

export interface OrganizationEarlyDespatchData {
  targetDate: string;
  thresholdMinutes: number;
  summary: {
    earlyDepartureCount: number;
    avgEarlyMinutes: number;
    onTimePct: number;
  };
  topEarlyDepartures: Array<{
    name: string;
    department: string;
    departureTime: string;
    dailyMissedHrs: string;
    earlyMinutes: number;
    earlyLabel: string;
    severity: "HIGH" | "MEDIUM" | "LOW" | "MINIMAL";
  }>;
}

export interface OrganizationListItem {
  id: number;
  name: string;
  employeeCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Organization List
// ─────────────────────────────────────────────────────────────────────────────

/** GET /dashboard/userinsights/org/list → list of all organizations */
export async function fetchOrganizationList(): Promise<OrganizationListItem[]> {
  const response = await apiRequest(
    `/dashboard/userinsights/org/list`,
    "GET"
  );
  if (!response?.data?.organizations) throw new Error("No organization list data returned");
  return response.data.organizations;
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual Endpoint Fetchers (with organization_id)
// ─────────────────────────────────────────────────────────────────────────────

/** GET /dashboard/userinsights/org/:orgId/totals-today → organization + totals + today */
export async function fetchTotalsAndToday(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "organization" | "totals" | "today">> {
  const response = await apiRequest(
    `/dashboard/userinsights/org/${orgId}/totals-today?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No totals-today data returned");
  return {
    organization: response.data.organization,
    totals: response.data.totals,
    today: response.data.today,
  };
}

/** GET /dashboard/userinsights/org/:orgId/hourly-trend → hourlyTrend */
export async function fetchHourlyTrend(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "hourlyTrend">> {
  const response = await apiRequest(
    `/dashboard/userinsights/org/${orgId}/hourly-trend?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No hourly-trend data returned");
  return { hourlyTrend: response.data.hourlyTrend };
}

/** GET /dashboard/userinsights/org/:orgId/attendance-split → attendanceSplit */
export async function fetchAttendanceSplit(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "attendanceSplit">> {
  const response = await apiRequest(
    `/dashboard/userinsights/org/${orgId}/attendance-split?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No attendance-split data returned");
  return { attendanceSplit: response.data.attendanceSplit };
}

/** GET /dashboard/userinsights/org/:orgId/department-attendance → departmentAttendance */
export async function fetchDepartmentAttendance(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "departmentAttendance">> {
  const response = await apiRequest(
    `/dashboard/userinsights/org/${orgId}/department-attendance?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No department-attendance data returned");
  return { departmentAttendance: response.data.departmentAttendance };
}

/** GET /dashboard/userinsights/org/:orgId/weekly-trend → weeklyTrend */
export async function fetchWeeklyTrend(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "weeklyTrend">> {
  const response = await apiRequest(
    `/dashboard/userinsights/org/${orgId}/weekly-trend?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No weekly-trend data returned");
  return { weeklyTrend: response.data.weeklyTrend };
}

/** GET /dashboard/userinsights/org/:orgId/overtime → overtime */
export async function fetchOvertime(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "overtime">> {
  const response = await apiRequest(
    `/dashboard/userinsights/org/${orgId}/overtime?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No overtime data returned");
  return { overtime: response.data.overtime };
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined Data Fetcher
// ─────────────────────────────────────────────────────────────────────────────

export const getUserInsightsData = async (
  orgId: number,
  date?: string
): Promise<OrganizationAnalyticsData> => {
  const [
    totalsAndToday,
    hourlyTrend,
    attendanceSplit,
    departmentAttendance,
    weeklyTrend,
    overtime,
  ] = await Promise.all([
    fetchTotalsAndToday(orgId, date),
    fetchHourlyTrend(orgId, date),
    fetchAttendanceSplit(orgId, date),
    fetchDepartmentAttendance(orgId, date),
    fetchWeeklyTrend(orgId, date),
    fetchOvertime(orgId, date),
  ]);

  return {
    organization: totalsAndToday.organization,
    totals: totalsAndToday.totals,
    today: totalsAndToday.today,
    hourlyTrend: hourlyTrend.hourlyTrend,
    attendanceSplit: attendanceSplit.attendanceSplit,
    departmentAttendance: departmentAttendance.departmentAttendance,
    weeklyTrend: weeklyTrend.weeklyTrend,
    overtime: overtime.overtime,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Alerts & Early Despatch
// ─────────────────────────────────────────────────────────────────────────────

export const getUserAlertsData = async (
  orgId: number,
  date?: string
): Promise<OrganizationAlertsData> => {
  const response = await apiRequest(
    `/dashboard/userinsights/org/${orgId}/alerts?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No alerts data returned");
  return response.data;
};

export const getEarlyDespatchData = async (
  orgId: number,
  date?: string
): Promise<OrganizationEarlyDespatchData> => {
  const response = await apiRequest(
    `/dashboard/userinsights/org/${orgId}/early-despatch?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No early despatch data returned");
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Priority Group Types
// ─────────────────────────────────────────────────────────────────────────────

export type GroupAResult = Pick<OrganizationAnalyticsData, "organization" | "totals" | "today" | "hourlyTrend">;
export type GroupBResult = Pick<OrganizationAnalyticsData, "attendanceSplit" | "departmentAttendance" | "overtime">;
export type GroupCResult = {
  weeklyTrend: OrganizationAnalyticsData["weeklyTrend"];
  alerts: OrganizationAlertsData;
  earlyDespatch: OrganizationEarlyDespatchData;
};

// ─────────────────────────────────────────────────────────────────────────────
// Priority Group Fetchers (A → B → C, sequential in store)
// ─────────────────────────────────────────────────────────────────────────────

/** Group A: lightest queries, above the fold — KpiGrid + HourlyTrendChart */
export async function fetchGroupA(orgId: number, date?: string): Promise<GroupAResult> {
  const [totalsAndToday, hourlyTrend] = await Promise.all([
    fetchTotalsAndToday(orgId, date),
    fetchHourlyTrend(orgId, date),
  ]);
  return {
    organization: totalsAndToday.organization,
    totals: totalsAndToday.totals,
    today: totalsAndToday.today,
    hourlyTrend: hourlyTrend.hourlyTrend,
  };
}

/** Group B: medium weight — AttendanceSplitChart + DeptTable + OvertimeCard */
export async function fetchGroupB(orgId: number, date?: string): Promise<GroupBResult> {
  const [attendanceSplit, departmentAttendance, overtime] = await Promise.all([
    fetchAttendanceSplit(orgId, date),
    fetchDepartmentAttendance(orgId, date),
    fetchOvertime(orgId, date),
  ]);
  return {
    attendanceSplit: attendanceSplit.attendanceSplit,
    departmentAttendance: departmentAttendance.departmentAttendance,
    overtime: overtime.overtime,
  };
}

/** Group C: below the fold — WeeklyTrendChart + AlertsCard + EarlyDespatch */
export async function fetchGroupC(orgId: number, date?: string): Promise<GroupCResult> {
  const [weeklyTrend, alerts, earlyDespatch] = await Promise.all([
    fetchWeeklyTrend(orgId, date),
    getUserAlertsData(orgId, date),
    getEarlyDespatchData(orgId, date),
  ]);
  return {
    weeklyTrend: weeklyTrend.weeklyTrend,
    alerts,
    earlyDespatch,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Exports (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

// Type aliases for backward compatibility
export type SparkAnalyticsData = OrganizationAnalyticsData;
export type SparkAlertsData = OrganizationAlertsData;
export type SparkEarlyDespatchData = OrganizationEarlyDespatchData;
