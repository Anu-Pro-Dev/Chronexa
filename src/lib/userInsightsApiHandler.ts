import { apiRequest } from "@/src/lib/apiHandler";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");
}


// ─────────────────────────────────────────────────────────────────────────────
// Raw SP row shapes (what comes back from the snapshot JSON)
// ─────────────────────────────────────────────────────────────────────────────

interface TotalsRow {
  totalEmployees: number;
  checkIns: number;
  checkOuts: number;
  presentCount: number;
  yesterdayPresentCount: number;
  missedOut: number;
  yesterdayMissedOut: number;
  missedIn: number;
  yesterdayMissedIn: number;
  absentCount: number;
  onLeave: number;
  withLicense: number;
  withoutLicense: number;
  noAppLogin: number;
}

interface HourlyRow {
  hour: number;
  checkIns: number;
  checkOuts: number;
}

interface DeptRow {
  Department: string;
  total: number;
  present: number;
  checkIns: number;
  checkOuts: number;
  missedOut: number;
  missedIn: number;
  absent: number;
  onLeave: number;
  rate: number;
}

interface WeeklyRow {
  WorkDate: string;
  dayName: string;
  totalEmployees: number;
  present: number;
  absent: number;
  onLeave: number;
}

interface OvertimeRow {
  totalEmployees: number;
  checkIns: number;
  avgHoursToday: number;
  overtimeCount: number;
  earlyDepartures: number;
  shiftCoverage: number;
  weekAttendanceRate: number;
  requiredHours: number;
  noPunchToday: number;
  onTimeRate: number;
}

interface AlertsRow {
  targetDate: string;
  noCheckinToday: number;
  missingCheckoutYesterday: number;
  deptBelow60Pct: number;
  lowestDeptName: string;
  lowestDeptPct: number;
  leaveRequestsToday: number;
  overtimeCount: number;
  consecutiveAbsent3Plus: number;
}

interface DespatchRow {
  isSummary: number;
  empName: string | null;
  department: string | null;
  departureTime: string | null;
  workedHrs: string | null;
  earlyDepartureCount: number | null;
  avgEarlyMinutes: number | null;
  onTimePct: number | null;
  earlyMinutes: number | null;
  earlyLabel: string | null;
  severity: "HIGH" | "MEDIUM" | "LOW" | "MINIMAL" | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public interfaces
// ─────────────────────────────────────────────────────────────────────────────

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
    yesterdayPresentCount: number;
    missedIn: number;
    yesterdayMissedIn: number;
    missedOut: number;
    yesterdayMissedOut: number;
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
    totalEmployees: number;
    avgHoursToday: number;
    overtimeCount: number;
    earlyDepartures: number;
    shiftCoverage: number;
    weekAttendanceRate: number;
    requiredHours: number;
    noPunchToday: number;
    onTimeRate: number;
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
  // thresholdMinutes: number;
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

export interface VerticalOrganization {
  organization_id: number;
  organization_name: string;
  display_name: string;
  entity_name: string;
  employee_count: number;
}

export interface VerticalItem {
  vertical_id: number;
  vertical_name: string;
  display_name: string;
  entity_name: string;
  employee_count_total: number;
  organizations: VerticalOrganization[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Organization / Vertical list
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchVerticalsList(params?: {
  verticalIds?: string | number | number[];
  orgIds?: string | number | number[];
}): Promise<VerticalItem[]> {
  const query = buildQuery({
    verticalIds: Array.isArray(params?.verticalIds)
      ? params?.verticalIds.join(",")
      : params?.verticalIds,
    orgIds: Array.isArray(params?.orgIds)
      ? params?.orgIds.join(",")
      : params?.orgIds,
  });
  const endpoint = query ? `/insights/list?${query}` : `/insights/list`;
  const response = await apiRequest(endpoint, "GET");
  const list = response?.data;
  if (!list) return [];
  return Array.isArray(list) ? list : [];
}

/** Legacy alias */
export const fetchOrganizationList = fetchVerticalsList;

export interface InsightsScopeParams {
  verticalIds?: number[] | string | number;
  orgIds?: number[] | string | number;
  date?: string;
}

function resolveScopeParams(
  scope: number | InsightsScopeParams | undefined,
  date?: string
): { queryParams: Record<string, string | number | undefined>; pathSegment?: number } {
  if (typeof scope === "number") {
    return {
      pathSegment: scope,
      queryParams: { date },
    };
  }

  const vIds = Array.isArray(scope?.verticalIds)
    ? scope?.verticalIds.join(",")
    : scope?.verticalIds;
  const oIds = Array.isArray(scope?.orgIds)
    ? scope?.orgIds.join(",")
    : scope?.orgIds;

  return {
    queryParams: {
      verticalIds: vIds,
      orgIds: oIds,
      date: scope?.date ?? date,
    },
  };
}

/** Calls /insights or /insights/:orgId and returns the raw data array/object. */
async function fetchSnapshot<T>(
  scope: number | InsightsScopeParams | undefined,
  action: string,
  date?: string
): Promise<T> {
  const { pathSegment, queryParams } = resolveScopeParams(scope, date);
  const query = buildQuery({ action, ...queryParams });
  const url = pathSegment !== undefined ? `/insights/${pathSegment}?${query}` : `/insights?${query}`;
  const response = await apiRequest(url, "GET");
  if (!response?.data) throw new Error(`No data returned for action: ${action}`);
  return response.data as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual fetchers — backed by snapshot endpoint
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchTotalsAndToday(
  scope: number | InsightsScopeParams | undefined,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "organization" | "totals" | "today" | "attendanceSplit">> {
  const raw = await fetchSnapshot<TotalsRow | TotalsRow[]>(scope, "totals", date);
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row) throw new Error("Empty totals response");

  return {
    organization: { id: typeof scope === "number" ? scope : 0, name: "" },
    totals: {
      totalEmployees: row.totalEmployees,
      employeesInUse: row.presentCount,
      noAppLogin: row.noAppLogin,
      licenseCounts: {
        withLicense: row.withLicense,
        withoutLicense: row.withoutLicense,
      },
    },
    today: {
      checkIns: row.checkIns,
      checkOuts: row.checkOuts,
      presentCount: row.presentCount,
      yesterdayPresentCount: row.yesterdayPresentCount,
      missedIn: row.missedIn,
      yesterdayMissedIn: row.yesterdayMissedIn,
      missedOut: row.missedOut,
      yesterdayMissedOut: row.yesterdayMissedOut,
      onLeave: row.onLeave,
      absentCount: row.absentCount,
    },
    attendanceSplit: {
      checkedIn: row.checkIns,
      checkedOut: row.checkOuts,
      present: row.presentCount,
      missedIn: row.missedIn,
      missedOut: row.missedOut,
      onLeave: row.onLeave,
      absent: row.absentCount,
      noLogin: row.noAppLogin,
    },
  };
}

/** Derived from totals — no separate API call. Kept for store compatibility. */
export async function fetchAttendanceSplit(
  scope: number | InsightsScopeParams | undefined,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "attendanceSplit">> {
  const data = await fetchTotalsAndToday(scope, date);
  return { attendanceSplit: data.attendanceSplit };
}

export async function fetchHourlyTrend(
  scope: number | InsightsScopeParams | undefined,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "hourlyTrend">> {
  const rows = await fetchSnapshot<HourlyRow[]>(scope, "hourly", date);
  return {
    hourlyTrend: (Array.isArray(rows) ? rows : []).map((r) => ({
      hour: r.hour,
      checkIns: r.checkIns,
      checkOuts: r.checkOuts,
    })),
  };
}

export async function fetchDepartmentAttendance(
  scope: number | InsightsScopeParams | undefined,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "departmentAttendance">> {
  const rows = await fetchSnapshot<DeptRow[]>(scope, "departments", date);
  return {
    departmentAttendance: (Array.isArray(rows) ? rows : []).map((r) => ({
      department: r.Department,
      present: r.present,
      absent: r.absent,
      onLeave: r.onLeave,
      missedIn: r.missedIn,
      missedOut: r.missedOut,
      checkin: r.checkIns,
      checkout: r.checkOuts,
      total: r.total,
      rate: r.rate,
    })),
  };
}

export async function fetchWeeklyTrend(
  scope: number | InsightsScopeParams | undefined,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "weeklyTrend">> {
  const rows = await fetchSnapshot<WeeklyRow[]>(scope, "weekly", date);
  return {
    weeklyTrend: (Array.isArray(rows) ? rows : []).map((r) => ({
      label: r.dayName,
      present: r.present,
      onLeave: r.onLeave,
      absent: r.absent,
      missedIn: 0,
      missedOut: 0,
      total: r.totalEmployees,
    })),
  };
}

export async function fetchOvertime(
  scope: number | InsightsScopeParams | undefined,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "overtime">> {
  const raw = await fetchSnapshot<OvertimeRow | OvertimeRow[]>(scope, "overtime", date);
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row) throw new Error("Empty overtime response");
  return {
    overtime: {
      totalEmployees: row.totalEmployees,
      avgHoursToday: row.avgHoursToday,
      overtimeCount: row.overtimeCount,
      earlyDepartures: row.earlyDepartures,
      shiftCoverage: row.shiftCoverage,
      weekAttendanceRate: row.weekAttendanceRate,
      requiredHours: row.requiredHours,
      noPunchToday: row.noPunchToday,
      onTimeRate: row.onTimeRate,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined fetcher (unchanged interface, now uses snapshots)
// ─────────────────────────────────────────────────────────────────────────────

export const getUserInsightsData = async (
  scope: number | InsightsScopeParams | undefined,
  date?: string
): Promise<OrganizationAnalyticsData> => {
  const [totalsData, hourlyTrend, departmentAttendance, weeklyTrend, overtime] =
    await Promise.all([
      fetchTotalsAndToday(scope, date),
      fetchHourlyTrend(scope, date),
      fetchDepartmentAttendance(scope, date),
      fetchWeeklyTrend(scope, date),
      fetchOvertime(scope, date),
    ]);

  return {
    organization: totalsData.organization,
    totals: totalsData.totals,
    today: totalsData.today,
    attendanceSplit: totalsData.attendanceSplit,
    hourlyTrend: hourlyTrend.hourlyTrend,
    departmentAttendance: departmentAttendance.departmentAttendance,
    weeklyTrend: weeklyTrend.weeklyTrend,
    overtime: overtime.overtime,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Alerts
// ─────────────────────────────────────────────────────────────────────────────

export const getUserAlertsData = async (
  scope: number | InsightsScopeParams | undefined,
  date?: string
): Promise<OrganizationAlertsData> => {
  const raw = await fetchSnapshot<AlertsRow | AlertsRow[]>(scope, "alerts", date);
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row) throw new Error("Empty alerts response");

  return {
    targetDate: row.targetDate,
    no_checkin_today: row.noCheckinToday,
    missing_checkout_yesterday: row.missingCheckoutYesterday,
    depts_below_60pct: row.deptBelow60Pct,
    lowest_dept_name: row.lowestDeptName ?? "",
    lowest_dept_pct: row.lowestDeptPct ?? 0,
    leave_requests_today: row.leaveRequestsToday,
    overtime_count: row.overtimeCount,
    geofence_violations: 0,
    unapproved_wfh: 0,
    consecutive_absent_3plus: row.consecutiveAbsent3Plus,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Early despatch
// ─────────────────────────────────────────────────────────────────────────────

export const getEarlyDespatchData = async (
  scope: number | InsightsScopeParams | undefined,
  date?: string
): Promise<OrganizationEarlyDespatchData> => {
  const { pathSegment, queryParams } = resolveScopeParams(scope, date);
  const query = buildQuery({ action: "despatch", ...queryParams });
  const url = pathSegment !== undefined ? `/insights/${pathSegment}?${query}` : `/insights?${query}`;
  const response = await apiRequest(url, "GET");
  if (!response?.data) throw new Error("No despatch data returned");

  const rows = response.data as DespatchRow[];
  const summaryRow = rows.find((r) => r.isSummary === 1);
  const detailRows = rows.filter((r) => r.isSummary === 0);

  return {
    targetDate: date ?? new Date().toISOString().slice(0, 10),
    // thresholdMinutes: threshold,
    summary: {
      earlyDepartureCount: summaryRow?.earlyDepartureCount ?? 0,
      avgEarlyMinutes: summaryRow?.avgEarlyMinutes ?? 0,
      onTimePct: summaryRow?.onTimePct ?? 0,
    },
    topEarlyDepartures: detailRows.map((r) => ({
      name: r.empName ?? "",
      department: r.department ?? "",
      departureTime: r.departureTime ?? "",
      dailyMissedHrs: r.workedHrs ?? "00:00",
      earlyMinutes: r.earlyMinutes ?? 0,
      earlyLabel: r.earlyLabel ?? "",
      severity: r.severity ?? "MINIMAL",
    })),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy type aliases
// ─────────────────────────────────────────────────────────────────────────────

export type SparkAnalyticsData = OrganizationAnalyticsData;
export type SparkAlertsData = OrganizationAlertsData;
export type SparkEarlyDespatchData = OrganizationEarlyDespatchData;