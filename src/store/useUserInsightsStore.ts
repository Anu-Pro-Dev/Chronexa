import { create } from "zustand";
import {
  getUserInsightsData,
  SparkAnalyticsData,
} from "@/src/lib/userInsightsApiHandler";

// ─── Cache type definitions ───────────────────────────────────────────────────

type DailySummary = {
  totalStaff: number;
  checkIns: number;
  checkOuts: number;
  missedIn: number;
  missedOut: number;
  onLeave: number;
  noAppLogin: number;
  present: number;
  absent: number;
};

type HourlyEntry = {
  hour: number;
  checkins: number;
  checkouts: number;
  missedIn: number;
};

type WeeklyEntry = {
  day: string;
  present: number;
  onLeave: number;
  absent: number;
};

type DeptEntry = {
  name: string;
  present: number;
  total: number;
};

type LateArrivalsData = {
  employees: Array<{ name: string; time: string; delayMinutes: number }>;
  onTimePct: number;
};

type OvertimeData = {
  avgHoursToday: number;
  overtimeStaff: number;
  earlyDepartures: number;
  shiftCoverage: number;
  weekAttendanceRate: number;
  expectedHours: number;
  totalStaff: number;
};

type AlertItem = {
  id: number;
  type: "danger" | "warning" | "info" | "neutral";
  text: string;
  subtext: string;
};

// ─── Helper: get Monday of current week ──────────────────────────────────────

function getMondayStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

// ─── Helper: map raw API data → cache entries ─────────────────────────────────

function _mapToCache(data: SparkAnalyticsData, today: string, weekStart: string) {
  const totalEmployees = data.totals.totalEmployees;

  const dailySummary: DailySummary = {
    totalStaff: totalEmployees,
    checkIns: data.today.checkIns,
    checkOuts: data.today.checkOuts,
    missedIn: data.today.missedIn,
    missedOut: data.today.missedOut,
    onLeave: data.today.onLeave,
    noAppLogin: data.totals.noAppLogin,
    present: data.attendanceSplit.checkedIn,
    absent: data.attendanceSplit.missedIn,
  };

  const hourlyTrend: HourlyEntry[] = data.hourlyTrend.map((h) => ({
    hour: h.hour,
    checkins: h.checkIns,
    checkouts: h.checkOuts,
    missedIn: 0,
  }));

  const weeklyTrend: WeeklyEntry[] = data.weeklyTrend.map((w) => ({
    day: w.label,
    present: w.present,
    onLeave: w.onLeave,
    absent: w.absent,
  }));

  const deptAttendance: DeptEntry[] = data.departmentAttendance.map((d) => ({
    name: d.department,
    present: d.present,
    total: d.total,
  }));

  const lateCount = data.lateArrivals.length;
  const onTimePct =
    totalEmployees > 0
      ? Math.round(((totalEmployees - lateCount) / totalEmployees) * 100)
      : 0;

  const lateArrivals: LateArrivalsData = {
    employees: data.lateArrivals,
    onTimePct,
  };

  const overtimeData: OvertimeData = {
    avgHoursToday: data.overtime.avgHoursToday,
    overtimeStaff: data.overtime.overtimeCount,
    earlyDepartures: data.overtime.earlyDepartures,
    shiftCoverage: data.overtime.shiftCoverage,
    weekAttendanceRate: data.overtime.weekAttendanceRate,
    expectedHours: 8,
    totalStaff: totalEmployees,
  };

  return {
    insightsDailySummaryCache: { [today]: dailySummary },
    insightsHourlyTrendCache: { [today]: hourlyTrend },
    insightsWeeklyTrendCache: { [weekStart]: weeklyTrend },
    insightsDeptAttendanceCache: { [today]: deptAttendance },
    insightsLateArrivalsCache: { [today]: lateArrivals },
    insightsOvertimeCache: { [today]: overtimeData },
    insightsAlertsCache: [] as AlertItem[],
  };
}

// ─── Store interface ──────────────────────────────────────────────────────────

export interface UserInsightsState {
  data: SparkAnalyticsData | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  clearData: () => void;

  // aliases expected by Mass-repo components
  loadingUserInsights: boolean;
  fetchUserInsightsData: () => Promise<void>;

  // cache fields
  insightsDailySummaryCache: Record<string, DailySummary>;
  insightsHourlyTrendCache: Record<string, HourlyEntry[]>;
  insightsWeeklyTrendCache: Record<string, WeeklyEntry[]>;
  insightsDeptAttendanceCache: Record<string, DeptEntry[]>;
  insightsLateArrivalsCache: Record<string, LateArrivalsData>;
  insightsOvertimeCache: Record<string, OvertimeData>;
  insightsAlertsCache: AlertItem[] | null;
}

export const useUserInsightsStore = create<UserInsightsState>((set, get) => ({
  data: null,
  loading: false,
  error: null,

  // cache fields – empty until fetchData resolves
  loadingUserInsights: false,
  insightsDailySummaryCache: {},
  insightsHourlyTrendCache: {},
  insightsWeeklyTrendCache: {},
  insightsDeptAttendanceCache: {},
  insightsLateArrivalsCache: {},
  insightsOvertimeCache: {},
  insightsAlertsCache: null,

  fetchData: async () => {
    set({ loading: true, loadingUserInsights: true, error: null });
    try {
      const data = await getUserInsightsData();
      const today = new Date().toISOString().split("T")[0];
      const weekStart = getMondayStr();
      const caches = _mapToCache(data, today, weekStart);
      set({ data, loading: false, loadingUserInsights: false, error: null, ...caches });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch analytics data";
      set({ error: errorMessage, loading: false, loadingUserInsights: false, data: null });
      console.error("UserInsightsStore error:", error);
    }
  },

  clearData: () => {
    set({
      data: null,
      loading: false,
      loadingUserInsights: false,
      error: null,
      insightsDailySummaryCache: {},
      insightsHourlyTrendCache: {},
      insightsWeeklyTrendCache: {},
      insightsDeptAttendanceCache: {},
      insightsLateArrivalsCache: {},
      insightsOvertimeCache: {},
      insightsAlertsCache: null,
    });
  },

  // alias – delegates to fetchData
  fetchUserInsightsData: () => get().fetchData(),
}));
