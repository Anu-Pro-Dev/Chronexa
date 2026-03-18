import { apiRequest } from "@/src/lib/apiHandler";

// Analytics API

export interface SparkAnalyticsResponse {
  message: string;
  data: SparkAnalyticsData;
}

export interface SparkAnalyticsData {
  totals: {
    totalEmployees: number;
    employeesInUse: number;
    noAppLogin: number;
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

// Alerts API 

export interface SparkAlertsResponse {
  message: string;
  data: SparkAlertsData;
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

// Early Departure API

export interface SparkEarlyDespatchResponse {
  message: string;
  data: SparkEarlyDespatchData;
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

function buildDateParam(date?: string): string {
  return date ? `date=${date}` : "";
}

export const getUserInsightsData = async (date?: string): Promise<SparkAnalyticsData> => {
  const response = await apiRequest(
    `/dashboard/analytics?${buildDateParam(date)}`,
    "GET"
  );

  if (!response?.data) {
    throw new Error("No analytics data returned");
  }

  return response.data;
};

export const getUserAlertsData = async (date?: string): Promise<SparkAlertsData> => {
  const response = await apiRequest(
    `/dashboard/alerts?${buildDateParam(date)}`,
    "GET"
  );

  if (!response?.data) {
    throw new Error("No alerts data returned");
  }

  return response.data;
};

export const getEarlyDespatchData = async (date?: string): Promise<SparkEarlyDespatchData> => {
  const response = await apiRequest(
    `/dashboard/early-despatch?${buildDateParam(date)}`,
    "GET"
  );

  if (!response?.data) {
    throw new Error("No early despatch data returned");
  }

  return response.data;
};
