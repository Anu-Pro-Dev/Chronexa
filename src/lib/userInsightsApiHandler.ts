import { apiRequest } from "@/src/lib/apiHandler";

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
    missedIn: number;
    missedOut: number;
    onLeave: number;
  };
  hourlyTrend: Array<{
    hour: number;
    checkIns: number;
    checkOuts: number;
  }>;
  attendanceSplit: {
    checkedIn: number;
    missedIn: number;
    onLeave: number;
    noLogin: number;
  };
  departmentAttendance: Array<{
    department: string;
    present: number;
    total: number;
    rate: number;
  }>;
  lateArrivals: Array<{
    name: string;
    time: string;
    delayMinutes: number;
  }>;
  weeklyTrend: Array<{
    label: string;
    present: number;
    onLeave: number;
    absent: number;
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

const ORGANIZATION_ID = 27;

export const getUserInsightsData = async (): Promise<SparkAnalyticsData> => {
  const response = await apiRequest(
    `/dashboard/analytics?organizationId=${ORGANIZATION_ID}`,
    "GET"
  );

  if (!response?.data) {
    throw new Error("No analytics data returned");
  }

  return response.data;
};
