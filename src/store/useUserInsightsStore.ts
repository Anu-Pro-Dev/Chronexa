import { create } from "zustand";
import {
  fetchAttendanceSplit,
  fetchDepartmentAttendance,
  fetchHourlyTrend,
  fetchOvertime,
  fetchTotalsAndToday,
  fetchWeeklyTrend,
  getEarlyDespatchData,
  getUserAlertsData,
  OrganizationAlertsData,
  OrganizationAnalyticsData,
  OrganizationEarlyDespatchData,
} from "@/src/lib/userInsightsApiHandler";
import {
  buildInsightsRequestKey,
  getWeekStartStr,
  toLocalDateStr,
} from "@/src/lib/userInsightsUtils";

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

const ALL_DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function resolveDateKey(date?: string): string {
  return date ?? toLocalDateStr(new Date());
}

function setPendingRequest(
  set: (updater: (state: UserInsightsState) => Partial<UserInsightsState>) => void,
  requestKey: string,
) {
  set((state) => ({
    pendingRequests: {
      ...state.pendingRequests,
      [requestKey]: true,
    },
  }));
}

function clearPendingRequest(
  set: (updater: (state: UserInsightsState) => Partial<UserInsightsState>) => void,
  requestKey: string,
) {
  set((state) => {
    const pendingRequests = { ...state.pendingRequests };

    delete pendingRequests[requestKey];

    return { pendingRequests };
  });
}

function mapDailySummary(
  totalsAndToday: Pick<OrganizationAnalyticsData, "totals" | "today">,
  attendanceSplit: Pick<OrganizationAnalyticsData, "attendanceSplit">,
): DailySummary {
  return {
    totalStaff: totalsAndToday.totals.totalEmployees,
    checkIns: totalsAndToday.today.checkIns,
    checkOuts: totalsAndToday.today.checkOuts,
    presentCount: totalsAndToday.today.presentCount,
    withLicense: totalsAndToday.totals.licenseCounts.withLicense,
    missedIn: totalsAndToday.today.missedIn,
    missedOut: totalsAndToday.today.missedOut,
    onLeave: totalsAndToday.today.onLeave,
    absentCount: totalsAndToday.today.absentCount,
    noAppLogin: totalsAndToday.totals.noAppLogin,
    present: attendanceSplit.attendanceSplit.present,
    absent: attendanceSplit.attendanceSplit.absent,
  };
}

function mapWeeklyTrend(
  weeklyTrend: Pick<OrganizationAnalyticsData, "weeklyTrend">,
  selectedDate: string,
  weekStart: string,
): WeeklyEntry[] {
  return weeklyTrend.weeklyTrend.map((entry) => {
    let dayName = entry.label;

    if (dayName === "Today") {
      const todayDate = new Date(`${selectedDate}T00:00:00`);
      dayName = ALL_DAYS_FULL[todayDate.getDay()];
    }

    const dayIndex = ALL_DAYS_FULL.indexOf(dayName);
    const dayDate = new Date(`${weekStart}T00:00:00`);

    if (dayIndex >= 0) {
      dayDate.setDate(dayDate.getDate() + dayIndex);
    }

    return {
      day: dayName,
      date: toLocalDateStr(dayDate),
      present: entry.present,
      onLeave: entry.onLeave,
      absent: entry.absent,
      missedIn: entry.missedIn,
      missedOut: entry.missedOut,
      total: entry.total,
    };
  });
}

export interface UserInsightsState {
  alertsError: string | null;
  earlyDespatchError: string | null;
  weeklyTrendError: string | null;
  pendingRequests: Record<string, boolean>;
  fetchDailySummary: (orgId: number, date?: string) => Promise<void>;
  fetchHourlyTrendData: (orgId: number, date?: string) => Promise<void>;
  fetchDeptAttendanceData: (orgId: number, date?: string) => Promise<void>;
  fetchWeeklyTrendData: (orgId: number, date?: string) => Promise<void>;
  fetchOvertimeData: (orgId: number, date?: string) => Promise<void>;
  fetchAlertsData: (orgId: number, date?: string) => Promise<void>;
  fetchEarlyDespatchData: (orgId: number, date?: string) => Promise<void>;
  clearData: () => void;
  insightsDailySummaryCache: Record<string, DailySummary>;
  insightsHourlyTrendCache: Record<string, HourlyEntry[]>;
  insightsWeeklyTrendCache: Record<string, WeeklyEntry[]>;
  insightsDeptAttendanceCache: Record<string, DeptEntry[]>;
  insightsOvertimeCache: Record<string, OvertimeData>;
  insightsAlertsCache: Record<string, AlertItem>;
  insightsEarlyDespatchCache: Record<string, EarlyDespatchEntry>;
}

export const useUserInsightsStore = create<UserInsightsState>((set, get) => ({
  alertsError: null,
  earlyDespatchError: null,
  weeklyTrendError: null,
  pendingRequests: {},

  insightsDailySummaryCache: {},
  insightsHourlyTrendCache: {},
  insightsWeeklyTrendCache: {},
  insightsDeptAttendanceCache: {},
  insightsOvertimeCache: {},
  insightsAlertsCache: {},
  insightsEarlyDespatchCache: {},

  fetchDailySummary: async (orgId: number, date?: string) => {
    const cacheKey = resolveDateKey(date);
    const requestKey = buildInsightsRequestKey("dailySummary", orgId, cacheKey);
    const { insightsDailySummaryCache, pendingRequests } = get();

    if (insightsDailySummaryCache[cacheKey] || pendingRequests[requestKey]) {
      return;
    }

    setPendingRequest(set, requestKey);

    try {
      const [totalsAndToday, attendanceSplit] = await Promise.all([
        fetchTotalsAndToday(orgId, cacheKey),
        fetchAttendanceSplit(orgId, cacheKey),
      ]);

      const summary = mapDailySummary(totalsAndToday, attendanceSplit);

      set((state) => ({
        insightsDailySummaryCache: {
          ...state.insightsDailySummaryCache,
          [cacheKey]: summary,
        },
      }));
    } catch (error) {
      console.error("UserInsightsStore fetchDailySummary error:", error);
    } finally {
      clearPendingRequest(set, requestKey);
    }
  },

  fetchHourlyTrendData: async (orgId: number, date?: string) => {
    const cacheKey = resolveDateKey(date);
    const requestKey = buildInsightsRequestKey("hourlyTrend", orgId, cacheKey);
    const { insightsHourlyTrendCache, pendingRequests } = get();

    if (insightsHourlyTrendCache[cacheKey] || pendingRequests[requestKey]) {
      return;
    }

    setPendingRequest(set, requestKey);

    try {
      const response = await fetchHourlyTrend(orgId, cacheKey);
      const hourlyTrend: HourlyEntry[] = response.hourlyTrend.map((entry) => ({
        hour: entry.hour,
        checkins: entry.checkIns,
        checkouts: entry.checkOuts,
      }));

      set((state) => ({
        insightsHourlyTrendCache: {
          ...state.insightsHourlyTrendCache,
          [cacheKey]: hourlyTrend,
        },
      }));
    } catch (error) {
      console.error("UserInsightsStore fetchHourlyTrendData error:", error);
    } finally {
      clearPendingRequest(set, requestKey);
    }
  },

  fetchDeptAttendanceData: async (orgId: number, date?: string) => {
    const cacheKey = resolveDateKey(date);
    const requestKey = buildInsightsRequestKey("deptAttendance", orgId, cacheKey);
    const { insightsDeptAttendanceCache, pendingRequests } = get();

    if (insightsDeptAttendanceCache[cacheKey] || pendingRequests[requestKey]) {
      return;
    }

    setPendingRequest(set, requestKey);

    try {
      const response = await fetchDepartmentAttendance(orgId, cacheKey);
      const deptAttendance: DeptEntry[] = response.departmentAttendance.map((entry) => ({
        name: entry.department,
        present: entry.present,
        total: entry.total,
      }));

      set((state) => ({
        insightsDeptAttendanceCache: {
          ...state.insightsDeptAttendanceCache,
          [cacheKey]: deptAttendance,
        },
      }));
    } catch (error) {
      console.error("UserInsightsStore fetchDeptAttendanceData error:", error);
    } finally {
      clearPendingRequest(set, requestKey);
    }
  },

  fetchWeeklyTrendData: async (orgId: number, date?: string) => {
    const cacheKey = resolveDateKey(date);
    const weekStart = getWeekStartStr(cacheKey);
    const requestKey = buildInsightsRequestKey("weeklyTrend", orgId, weekStart);
    const { insightsWeeklyTrendCache, pendingRequests } = get();

    if (insightsWeeklyTrendCache[weekStart] || pendingRequests[requestKey]) {
      return;
    }

    set({ weeklyTrendError: null });
    setPendingRequest(set, requestKey);

    try {
      const response = await fetchWeeklyTrend(orgId, cacheKey);
      const weeklyTrend = mapWeeklyTrend(response, cacheKey, weekStart);

      set((state) => ({
        insightsWeeklyTrendCache: {
          ...state.insightsWeeklyTrendCache,
          [weekStart]: weeklyTrend,
        },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch weekly trend data";

      set({ weeklyTrendError: errorMessage });
      console.error("UserInsightsStore fetchWeeklyTrendData error:", error);
    } finally {
      clearPendingRequest(set, requestKey);
    }
  },

  fetchOvertimeData: async (orgId: number, date?: string) => {
    const cacheKey = resolveDateKey(date);
    const requestKey = buildInsightsRequestKey("overtime", orgId, cacheKey);
    const { insightsOvertimeCache, pendingRequests } = get();

    if (insightsOvertimeCache[cacheKey] || pendingRequests[requestKey]) {
      return;
    }

    setPendingRequest(set, requestKey);

    try {
      const [overtimeResponse, totalsAndToday] = await Promise.all([
        fetchOvertime(orgId, cacheKey),
        fetchTotalsAndToday(orgId, cacheKey),
      ]);

      const overtime: OvertimeData = {
        avgHoursToday: overtimeResponse.overtime.avgHoursToday,
        overtimeStaff: overtimeResponse.overtime.overtimeCount,
        earlyDepartures: overtimeResponse.overtime.earlyDepartures,
        shiftCoverage: overtimeResponse.overtime.shiftCoverage,
        weekAttendanceRate: overtimeResponse.overtime.weekAttendanceRate,
        expectedHours: overtimeResponse.overtime.requiredHours ?? 9,
        totalStaff: totalsAndToday.totals.totalEmployees,
      };

      set((state) => ({
        insightsOvertimeCache: {
          ...state.insightsOvertimeCache,
          [cacheKey]: overtime,
        },
      }));
    } catch (error) {
      console.error("UserInsightsStore fetchOvertimeData error:", error);
    } finally {
      clearPendingRequest(set, requestKey);
    }
  },

  fetchAlertsData: async (orgId: number, date?: string) => {
    const cacheKey = resolveDateKey(date);
    const requestKey = buildInsightsRequestKey("alerts", orgId, cacheKey);
    const { insightsAlertsCache, pendingRequests } = get();

    if (insightsAlertsCache[cacheKey] || pendingRequests[requestKey]) {
      return;
    }

    set({ alertsError: null });
    setPendingRequest(set, requestKey);

    try {
      const alertsData: OrganizationAlertsData = await getUserAlertsData(orgId, cacheKey);
      const alertItem: AlertItem = { ...alertsData };

      set((state) => ({
        alertsError: null,
        insightsAlertsCache: {
          ...state.insightsAlertsCache,
          [cacheKey]: alertItem,
        },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch alerts data";

      set({ alertsError: errorMessage });
      console.error("UserInsightsStore fetchAlertsData error:", error);
    } finally {
      clearPendingRequest(set, requestKey);
    }
  },

  fetchEarlyDespatchData: async (orgId: number, date?: string) => {
    const cacheKey = resolveDateKey(date);
    const requestKey = buildInsightsRequestKey("earlyDespatch", orgId, cacheKey);
    const { insightsEarlyDespatchCache, pendingRequests } = get();

    if (insightsEarlyDespatchCache[cacheKey] || pendingRequests[requestKey]) {
      return;
    }

    set({ earlyDespatchError: null });
    setPendingRequest(set, requestKey);

    try {
      const earlyDespatchData: OrganizationEarlyDespatchData = await getEarlyDespatchData(orgId, cacheKey);
      const entry: EarlyDespatchEntry = {
        targetDate: earlyDespatchData.targetDate,
        thresholdMinutes: earlyDespatchData.thresholdMinutes,
        summary: earlyDespatchData.summary,
        topEarlyDepartures: earlyDespatchData.topEarlyDepartures,
      };

      set((state) => ({
        earlyDespatchError: null,
        insightsEarlyDespatchCache: {
          ...state.insightsEarlyDespatchCache,
          [cacheKey]: entry,
        },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch early despatch data";

      set({ earlyDespatchError: errorMessage });
      console.error("UserInsightsStore fetchEarlyDespatchData error:", error);
    } finally {
      clearPendingRequest(set, requestKey);
    }
  },

  clearData: () => {
    set({
      alertsError: null,
      earlyDespatchError: null,
      weeklyTrendError: null,
      pendingRequests: {},
      insightsDailySummaryCache: {},
      insightsHourlyTrendCache: {},
      insightsWeeklyTrendCache: {},
      insightsDeptAttendanceCache: {},
      insightsOvertimeCache: {},
      insightsAlertsCache: {},
      insightsEarlyDespatchCache: {},
    });
  },
}));
