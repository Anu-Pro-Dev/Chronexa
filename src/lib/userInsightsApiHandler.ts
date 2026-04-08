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

/** Calls the unified snapshot endpoint and returns the raw data array/object. */
async function fetchSnapshot<T>(
  orgId: number,
  action: string,
  date?: string
): Promise<T> {
  const query = buildQuery({ action, date });
  const response = await apiRequest(
    `/insights/${orgId}?${query}`,
    "GET"
  );
  if (!response?.data) throw new Error(`No data returned for action: ${action}`);
  return response.data as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw SP row shapes (what comes back from the snapshot JSON)
// ─────────────────────────────────────────────────────────────────────────────

interface TotalsRow {
  totalEmployees: number;
  checkIns: number;
  checkOuts: number;
  presentCount: number;
  missedOut: number;
  missedIn: number;
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
    totalEmployees: number;
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
// Organization list
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchOrganizationList(): Promise<OrganizationListItem[]> {
  const response = await apiRequest(`/insights/list`, "GET");
  // Backend returns { success: true, data: [...] } — plain array, not { organizations: [...] }
  const list = response?.data;
  if (!list) throw new Error("No organization list data returned");
  return Array.isArray(list) ? list : (list.organizations ?? []);
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual fetchers — all backed by snapshot endpoint
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchTotalsAndToday(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "organization" | "totals" | "today" | "attendanceSplit">> {
  // Single snapshot call covers totals + today + attendanceSplit (derived)
  const rows = await fetchSnapshot<TotalsRow[]>(orgId, "totals", date);
  const row = rows[0];
  if (!row) throw new Error("Empty totals response");

  return {
    organization: { id: orgId, name: "" },
    totals: {
      totalEmployees:  row.totalEmployees,
      employeesInUse:  row.presentCount,
      noAppLogin:      row.noAppLogin,
      licenseCounts: {
        withLicense:    row.withLicense,
        withoutLicense: row.withoutLicense,
      },
    },
    today: {
      checkIns:     row.checkIns,
      checkOuts:    row.checkOuts,
      presentCount: row.presentCount,
      missedIn:     row.missedIn,
      missedOut:    row.missedOut,
      onLeave:      row.onLeave,
      absentCount:  row.absentCount,
    },
    // Derived from same row — no extra API call needed
    attendanceSplit: {
      checkedIn:  row.checkIns,
      checkedOut: row.checkOuts,
      present:    row.presentCount,
      missedIn:   row.missedIn,
      missedOut:  row.missedOut,
      onLeave:    row.onLeave,
      absent:     row.absentCount,
      noLogin:    row.noAppLogin,
    },
  };
}

/** Derived from totals — no separate API call. Kept for store compatibility. */
export async function fetchAttendanceSplit(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "attendanceSplit">> {
  const data = await fetchTotalsAndToday(orgId, date);
  return { attendanceSplit: data.attendanceSplit };
}

export async function fetchHourlyTrend(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "hourlyTrend">> {
  const rows = await fetchSnapshot<HourlyRow[]>(orgId, "hourly", date);
  return {
    hourlyTrend: rows.map((r) => ({
      hour:      r.hour,
      checkIns:  r.checkIns,
      checkOuts: r.checkOuts,
    })),
  };
}

export async function fetchDepartmentAttendance(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "departmentAttendance">> {
  const rows = await fetchSnapshot<DeptRow[]>(orgId, "departments", date);
  return {
    departmentAttendance: rows.map((r) => ({
      department: r.Department,
      present:    r.present,
      absent:     r.absent,
      onLeave:    r.onLeave,
      missedIn:   r.missedIn,
      missedOut:  r.missedOut,
      checkin:    r.checkIns,
      checkout:   r.checkOuts,
      total:      r.total,
      rate:       r.rate,
    })),
  };
}

export async function fetchWeeklyTrend(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "weeklyTrend">> {
  const rows = await fetchSnapshot<WeeklyRow[]>(orgId, "weekly", date);
  return {
    weeklyTrend: rows.map((r) => ({
      label:    r.dayName,
      present:  r.present,
      onLeave:  r.onLeave,
      absent:   r.absent,
      missedIn:  0,
      missedOut: 0,
      total:    r.totalEmployees,
    })),
  };
}

export async function fetchOvertime(
  orgId: number,
  date?: string
): Promise<Pick<OrganizationAnalyticsData, "overtime">> {
  const rows = await fetchSnapshot<OvertimeRow[]>(orgId, "overtime", date);
  const row = rows[0];
  if (!row) throw new Error("Empty overtime response");
  return {
    overtime: {
      totalEmployees:     row.totalEmployees,
      avgHoursToday:      row.avgHoursToday,
      overtimeCount:      row.overtimeCount,
      earlyDepartures:    row.earlyDepartures,
      shiftCoverage:      row.shiftCoverage,
      weekAttendanceRate: row.weekAttendanceRate,
      requiredHours:      row.requiredHours,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined fetcher (unchanged interface, now uses snapshots)
// ─────────────────────────────────────────────────────────────────────────────

export const getUserInsightsData = async (
  orgId: number,
  date?: string
): Promise<OrganizationAnalyticsData> => {
  const [totalsData, hourlyTrend, departmentAttendance, weeklyTrend, overtime] =
    await Promise.all([
      fetchTotalsAndToday(orgId, date),
      fetchHourlyTrend(orgId, date),
      fetchDepartmentAttendance(orgId, date),
      fetchWeeklyTrend(orgId, date),
      fetchOvertime(orgId, date),
    ]);

  return {
    organization:         totalsData.organization,
    totals:               totalsData.totals,
    today:                totalsData.today,
    attendanceSplit:      totalsData.attendanceSplit,
    hourlyTrend:          hourlyTrend.hourlyTrend,
    departmentAttendance: departmentAttendance.departmentAttendance,
    weeklyTrend:          weeklyTrend.weeklyTrend,
    overtime:             overtime.overtime,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Alerts
// ─────────────────────────────────────────────────────────────────────────────

export const getUserAlertsData = async (
  orgId: number,
  date?: string
): Promise<OrganizationAlertsData> => {
  const rows = await fetchSnapshot<AlertsRow[]>(orgId, "alerts", date);
  const row = rows[0];
  if (!row) throw new Error("Empty alerts response");

  return {
    targetDate:                  row.targetDate,
    no_checkin_today:            row.noCheckinToday,
    missing_checkout_yesterday:  row.missingCheckoutYesterday,
    depts_below_60pct:           row.deptBelow60Pct,
    lowest_dept_name:            row.lowestDeptName ?? "",
    lowest_dept_pct:             row.lowestDeptPct ?? 0,
    leave_requests_today:        row.leaveRequestsToday,
    overtime_count:              row.overtimeCount,
    geofence_violations:         0,   // not in SP — reserved for future
    unapproved_wfh:              0,   // not in SP — reserved for future
    consecutive_absent_3plus:    row.consecutiveAbsent3Plus,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Early despatch
// ─────────────────────────────────────────────────────────────────────────────

export const getEarlyDespatchData = async (
  orgId: number,
  date?: string,
  threshold = 30,
  topN = 10
): Promise<OrganizationEarlyDespatchData> => {
  const query = buildQuery({ action: "despatch", date, threshold, topN });
  const response = await apiRequest(
    `/insights/${orgId}?${query}`,
    "GET"
  );
  if (!response?.data) throw new Error("No despatch data returned");

  const rows = response.data as DespatchRow[];
  const summaryRow  = rows.find((r) => r.isSummary === 1);
  const detailRows  = rows.filter((r) => r.isSummary === 0);

  return {
    targetDate:       date ?? new Date().toISOString().slice(0, 10),
    thresholdMinutes: threshold,
    summary: {
      earlyDepartureCount: summaryRow?.earlyDepartureCount ?? 0,
      avgEarlyMinutes:     summaryRow?.avgEarlyMinutes     ?? 0,
      onTimePct:           summaryRow?.onTimePct           ?? 0,
    },
    topEarlyDepartures: detailRows.map((r) => ({
      name:           r.empName        ?? "",
      department:     r.department     ?? "",
      departureTime:  r.departureTime  ?? "",
      dailyMissedHrs: r.workedHrs      ?? "00:00",
      earlyMinutes:   r.earlyMinutes   ?? 0,
      earlyLabel:     r.earlyLabel     ?? "",
      severity:       r.severity       ?? "MINIMAL",
    })),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy type aliases
// ─────────────────────────────────────────────────────────────────────────────

export type SparkAnalyticsData    = OrganizationAnalyticsData;
export type SparkAlertsData       = OrganizationAlertsData;
export type SparkEarlyDespatchData = OrganizationEarlyDespatchData;