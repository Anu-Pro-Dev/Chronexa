import { apiRequest } from "@/src/lib/apiHandler";

function buildDateParam(date?: string): string {
  return date ? `date=${date}` : "";
}

export interface SparkAnalyticsData {
  totals: {
    totalEmployees: number;
    employeesInUse: number;
    noAppLogin: number;
    licenseCounts:{
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
  };
}

export interface SparkAlertsData {
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

export interface SparkEarlyDespatchData {
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
    severity: "HIGH" | "MEDIUM" | "LOW";
  }>;
}

/** GET /dashboard/sparkTodayandTotal → totals + today */
async function fetchTodayAndTotal(date?: string): Promise<Pick<SparkAnalyticsData, "totals" | "today">> {
  const response = await apiRequest(
    `/dashboard/sparkTodayandTotal?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No sparkTodayandTotal data returned");
  return {
    totals: response.data.totals,
    today: response.data.today,
  };
}

/** GET /dashboard/sparkHourlyTrend → hourlyTrend */
async function fetchHourlyTrend(date?: string): Promise<Pick<SparkAnalyticsData, "hourlyTrend">> {
  const response = await apiRequest(
    `/dashboard/sparkHourlyTrend?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No sparkHourlyTrend data returned");
  return { hourlyTrend: response.data.hourlyTrend };
}

/** GET /dashboard/sparkAttendanceSplit → attendanceSplit */
async function fetchAttendanceSplit(date?: string): Promise<Pick<SparkAnalyticsData, "attendanceSplit">> {
  const response = await apiRequest(
    `/dashboard/sparkAttendanceSplit?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No sparkAttendanceSplit data returned");
  return { attendanceSplit: response.data.attendanceSplit };
}

/** GET /dashboard/sparkDepartmentAttendance → departmentAttendance */
async function fetchDepartmentAttendance(date?: string): Promise<Pick<SparkAnalyticsData, "departmentAttendance">> {
  const response = await apiRequest(
    `/dashboard/sparkDepartmentAttendance?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No sparkDepartmentAttendance data returned");
  return { departmentAttendance: response.data.departmentAttendance };
}

/** GET /dashboard/sparkWeeklyTrend → weeklyTrend */
async function fetchWeeklyTrend(date?: string): Promise<Pick<SparkAnalyticsData, "weeklyTrend">> {
  const response = await apiRequest(
    `/dashboard/sparkWeeklyTrend?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No sparkWeeklyTrend data returned");
  return { weeklyTrend: response.data.weeklyTrend };
}

/** GET /dashboard/sparkOvertime → overtime */
async function fetchOvertime(date?: string): Promise<Pick<SparkAnalyticsData, "overtime">> {
  const response = await apiRequest(
    `/dashboard/sparkOvertime?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No sparkOvertime data returned");
  return { overtime: response.data.overtime };
}

export const getUserInsightsData = async (date?: string): Promise<SparkAnalyticsData> => {
  const [
    todayAndTotal,
    hourlyTrend,
    attendanceSplit,
    departmentAttendance,
    weeklyTrend,
    overtime,
  ] = await Promise.all([
    fetchTodayAndTotal(date),
    fetchHourlyTrend(date),
    fetchAttendanceSplit(date),
    fetchDepartmentAttendance(date),
    fetchWeeklyTrend(date),
    fetchOvertime(date),
  ]);

  return {
    totals: todayAndTotal.totals,
    today: todayAndTotal.today,
    hourlyTrend: hourlyTrend.hourlyTrend,
    attendanceSplit: attendanceSplit.attendanceSplit,
    departmentAttendance: departmentAttendance.departmentAttendance,
    weeklyTrend: weeklyTrend.weeklyTrend,
    overtime: overtime.overtime,
  };
};

export const getUserAlertsData = async (date?: string): Promise<SparkAlertsData> => {
  const response = await apiRequest(
    `/dashboard/alerts?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No alerts data returned");
  return response.data;
};

export const getEarlyDespatchData = async (date?: string): Promise<SparkEarlyDespatchData> => {
  const response = await apiRequest(
    `/dashboard/early-despatch?${buildDateParam(date)}`,
    "GET"
  );
  if (!response?.data) throw new Error("No early despatch data returned");
  return response.data;
};