import { create } from "zustand";
import {
  getUserInsightsData,
  getUserAlertsData,
  getEarlyDespatchData,
  OrganizationAnalyticsData,
  OrganizationAlertsData,
  OrganizationEarlyDespatchData,
  OrganizationInfo,
} from "@/src/lib/userInsightsApiHandler";

// ─── Cache type definitions ───────────────────────────────────────────────────

type DailySummary = {
  totalStaff: number;
  checkIns: number;
  checkOuts: number;
  presentCount: number;
  missedIn: number;
  withLicense: number;
  missedOut: number;
  onLeave: number;
  absentCount: number;
  noAppLogin: number;
  present: number;
  absent: number;
};

type HourlyEntry = {
  hour: number;
  checkins: number;
  checkouts: number;
};

type WeeklyEntry = {
  day: string;
  date: string;
  present: number;
  onLeave: number;
  absent: number;
  missedIn: number;
  missedOut: number;
  total: number;
};

type DeptEntry = {
  name: string;
  present: number;
  total: number;
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
};

type EarlyDespatchEntry = {
  targetDate: string;
  thresholdMinutes: number;
  summary: {
    earlyDepartureCount: number;
    avgEarlyMinutes: number;
    onTimePct: number;
  };
  topEarlyDepartures: OrganizationEarlyDespatchData["topEarlyDepartures"];
};

function toLocalDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function getWeekStartStr(fromDate?: string): string {
  const d = fromDate ? new Date(fromDate) : new Date();
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return toLocalDateStr(d);
}

function _mapAnalyticsToCache(data: OrganizationAnalyticsData, today: string, weekStart: string) {
  const totalEmployees = data.totals.totalEmployees;
  const requiredHours = data.overtime.requiredHours ?? 9;

  const dailySummary: DailySummary = {
    totalStaff: totalEmployees,
    checkIns: data.today.checkIns,
    checkOuts: data.today.checkOuts,
    presentCount: data.today.presentCount,
    withLicense: data.totals.licenseCounts.withLicense,
    missedIn: data.today.missedIn,
    missedOut: data.today.missedOut,
    onLeave: data.today.onLeave,
    absentCount: data.today.absentCount,
    noAppLogin: data.totals.noAppLogin,
    present: data.attendanceSplit.present,
    absent: data.attendanceSplit.absent,
  };

  const hourlyTrend: HourlyEntry[] = data.hourlyTrend.map((h) => ({
    hour: h.hour,
    checkins: h.checkIns,
    checkouts: h.checkOuts,
  }));

  const ALL_DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weeklyTrend: WeeklyEntry[] = data.weeklyTrend.map((w) => {
    // API sends "Today" instead of the actual day name — resolve it from the weekStart date
    let dayName = w.label;
    if (dayName === "Today") {
      const todayDate = new Date(today);
      dayName = ALL_DAYS_FULL[todayDate.getDay()];
    }
    const dayIndex = ALL_DAYS_FULL.indexOf(dayName);
    const dayDate = new Date(weekStart);
    if (dayIndex >= 0) dayDate.setDate(dayDate.getDate() + dayIndex);
    return {
      day: dayName,
      date: toLocalDateStr(dayDate),
      present: w.present,
      onLeave: w.onLeave,
      absent: w.absent,
      missedIn: w.missedIn,
      missedOut: w.missedOut,
      total: w.total,
    };
  });

  const deptAttendance: DeptEntry[] = data.departmentAttendance.map((d) => ({
    name: d.department,
    present: d.present,
    total: d.total,
  }));

  const overtimeData: OvertimeData = {
    avgHoursToday: data.overtime.avgHoursToday,
    overtimeStaff: data.overtime.overtimeCount,
    earlyDepartures: data.overtime.earlyDepartures,
    shiftCoverage: data.overtime.shiftCoverage,
    weekAttendanceRate: data.overtime.weekAttendanceRate,
    expectedHours: requiredHours,
    totalStaff: totalEmployees,
  };

  return {
    insightsDailySummaryCache: { [today]: dailySummary },
    insightsHourlyTrendCache: { [today]: hourlyTrend },
    insightsWeeklyTrendCache: { [weekStart]: weeklyTrend },
    insightsDeptAttendanceCache: { [today]: deptAttendance },
    insightsOvertimeCache: { [today]: overtimeData },
  };
}

export interface UserInsightsState {
  // Organization info
  currentOrganization: OrganizationInfo | null;
  
  data: OrganizationAnalyticsData | null;
  alertsData: OrganizationAlertsData | null;
  earlyDespatchData: OrganizationEarlyDespatchData | null;

  loading: boolean;
  loadingAlerts: boolean;
  loadingEarlyDespatch: boolean;
  loadingDate: string | null;
  error: string | null;
  alertsError: string | null;
  earlyDespatchError: string | null;

  // Fetch functions now require orgId
  fetchData: (orgId: number, date?: string) => Promise<void>;
  fetchAlertsData: (orgId: number, date?: string) => Promise<void>;
  fetchEarlyDespatchData: (orgId: number, date?: string) => Promise<void>;
  fetchAllData: (orgId: number, date?: string) => Promise<void>;
  clearData: () => void;

  loadingUserInsights: boolean;
  fetchUserInsightsData: (orgId: number, date?: string) => Promise<void>;

  insightsDailySummaryCache: Record<string, DailySummary>;
  insightsHourlyTrendCache: Record<string, HourlyEntry[]>;
  insightsWeeklyTrendCache: Record<string, WeeklyEntry[]>;
  insightsDeptAttendanceCache: Record<string, DeptEntry[]>;
  insightsOvertimeCache: Record<string, OvertimeData>;

  insightsAlertsCache: Record<string, AlertItem>;

  insightsEarlyDespatchCache: Record<string, EarlyDespatchEntry>;
}

export const useUserInsightsStore = create<UserInsightsState>((set, get) => ({
  currentOrganization: null,
  data: null,
  alertsData: null,
  earlyDespatchData: null,

  loading: false,
  loadingAlerts: false,
  loadingEarlyDespatch: false,
  loadingDate: null,
  loadingUserInsights: false,
  error: null,
  alertsError: null,
  earlyDespatchError: null,

  insightsDailySummaryCache: {},
  insightsHourlyTrendCache: {},
  insightsWeeklyTrendCache: {},
  insightsDeptAttendanceCache: {},
  insightsOvertimeCache: {},
  insightsAlertsCache: {},
  insightsEarlyDespatchCache: {},

  fetchData: async (orgId: number, date?: string) => {
    set({ loading: true, loadingUserInsights: true, error: null });
    try {
      const data = await getUserInsightsData(orgId, date);
      const today = date ?? toLocalDateStr(new Date());
      const weekStart = getWeekStartStr(date);
      const caches = _mapAnalyticsToCache(data, today, weekStart);
      set({ 
        data, 
        currentOrganization: data.organization,
        loading: false, 
        loadingUserInsights: false, 
        error: null, 
        ...caches 
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch analytics data";
      set({ error: errorMessage, loading: false, loadingUserInsights: false, data: null });
      console.error("UserInsightsStore fetchData error:", error);
    }
  },

  fetchAlertsData: async (orgId: number, date?: string) => {
    set({ loadingAlerts: true, alertsError: null });
    try {
      const alertsData = await getUserAlertsData(orgId, date);
      const cacheKey = alertsData.targetDate;
      const alertItem: AlertItem = { ...alertsData };
      set((state) => ({
        alertsData,
        loadingAlerts: false,
        alertsError: null,
        insightsAlertsCache: { ...state.insightsAlertsCache, [cacheKey]: alertItem },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch alerts data";
      set({ alertsError: errorMessage, loadingAlerts: false, alertsData: null });
      console.error("UserInsightsStore fetchAlertsData error:", error);
    }
  },

  fetchEarlyDespatchData: async (orgId: number, date?: string) => {
    set({ loadingEarlyDespatch: true, earlyDespatchError: null });
    try {
      const earlyDespatchData = await getEarlyDespatchData(orgId, date);
      const cacheKey = earlyDespatchData.targetDate;
      const entry: EarlyDespatchEntry = {
        targetDate: earlyDespatchData.targetDate,
        thresholdMinutes: earlyDespatchData.thresholdMinutes,
        summary: earlyDespatchData.summary,
        topEarlyDepartures: earlyDespatchData.topEarlyDepartures,
      };
      set((state) => ({
        earlyDespatchData,
        loadingEarlyDespatch: false,
        earlyDespatchError: null,
        insightsEarlyDespatchCache: {
          ...state.insightsEarlyDespatchCache,
          [cacheKey]: entry,
        },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch early despatch data";
      set({ earlyDespatchError: errorMessage, loadingEarlyDespatch: false, earlyDespatchData: null });
      console.error("UserInsightsStore fetchEarlyDespatchData error:", error);
    }
  },

  fetchAllData: async (orgId: number, date?: string) => {
    const resolvedDate = date ?? toLocalDateStr(new Date());
    const { loading, loadingDate } = get();
    if (loading && loadingDate === resolvedDate) return;

    set({ loadingDate: resolvedDate });
    const { fetchData, fetchAlertsData, fetchEarlyDespatchData } = get();
    await Promise.all([
      fetchData(orgId, date),
      fetchAlertsData(orgId, date),
      fetchEarlyDespatchData(orgId, date),
    ]);
    set({ loadingDate: null });
  },

  clearData: () => {
    set({
      currentOrganization: null,
      data: null,
      alertsData: null,
      earlyDespatchData: null,
      loading: false,
      loadingAlerts: false,
      loadingEarlyDespatch: false,
      loadingDate: null,
      loadingUserInsights: false,
      error: null,
      alertsError: null,
      earlyDespatchError: null,
      insightsDailySummaryCache: {},
      insightsHourlyTrendCache: {},
      insightsWeeklyTrendCache: {},
      insightsDeptAttendanceCache: {},
      insightsOvertimeCache: {},
      insightsAlertsCache: {},
      insightsEarlyDespatchCache: {},
    });
  },

  fetchUserInsightsData: (orgId: number, date?: string) => get().fetchData(orgId, date),
}));
