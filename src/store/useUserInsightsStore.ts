import { create } from "zustand";
import {
  fetchDepartmentAttendance,
  fetchHourlyTrend,
  fetchOvertime,
  fetchTotalsAndToday,
  fetchWeeklyTrend,
  OrganizationAnalyticsData,
} from "@/src/lib/userInsightsApiHandler";
import {
  buildInsightsRequestKey,
  getWeekStartStr,
  toLocalDateStr,
} from "@/src/lib/userInsightsUtils";
import { apiRequest } from "@/src/lib/apiHandler";

// ─────────────────────────────────────────────────────────────────────────────
// Internal types
// ─────────────────────────────────────────────────────────────────────────────

type DailySummary = {
  totalStaff: number;
  checkIns: number;
  checkOuts: number;
  presentCount: number;
  missedIn: number;
  withLicense: number;
  withoutLicense: number;
  missedOut: number;
  onLeave: number;
  absentCount: number;
  noAppLogin: number;
  present: number;
  absent: number;
  yesterdayPresentCount?: number;
  yesterdayMissedIn?: number;
  yesterdayMissedOut?: number;
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
  checkIns: number;
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
  noPunchToday: number;
  onTimeRate: number;
};

// Exported so KpiGrid and DrillDownModal can reference it
export type AttendancePctData = {
  totalEmployees: number;
  onLeave: number;
  eligibleEmployees: number;
  presentCount: number;
  overallPct: number;
  adjustedPct: number;
  displayLabel: string;
  status: "GOOD" | "WARNING" | "CRITICAL" | "N/A";
  asOfDate: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ALL_DAYS_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function resolveDateKey(date?: string): string {
  return date ?? toLocalDateStr(new Date());
}

function setPendingRequest(
  set: (updater: (state: UserInsightsState) => Partial<UserInsightsState>) => void,
  requestKey: string
) {
  set((state) => ({
    pendingRequests: { ...state.pendingRequests, [requestKey]: true },
  }));
}

function clearPendingRequest(
  set: (updater: (state: UserInsightsState) => Partial<UserInsightsState>) => void,
  requestKey: string
) {
  set((state) => {
    const pendingRequests = { ...state.pendingRequests };
    delete pendingRequests[requestKey];
    return { pendingRequests };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────────────────────

function mapDailySummary(
  data: Pick<OrganizationAnalyticsData, "totals" | "today" | "attendanceSplit">
): DailySummary {
  const today = data.today as typeof data.today & {
    yesterdayPresentCount?: number;
    yesterdayMissedIn?: number;
    yesterdayMissedOut?: number;
  };
  return {
    totalStaff: data.totals.totalEmployees,
    checkIns: data.today.checkIns,
    checkOuts: data.today.checkOuts,
    presentCount: data.today.presentCount,
    withLicense: data.totals.licenseCounts.withLicense,
    withoutLicense: data.totals.licenseCounts.withoutLicense,
    missedIn: data.today.missedIn,
    missedOut: data.today.missedOut,
    onLeave: data.today.onLeave,
    absentCount: data.today.absentCount,
    noAppLogin: data.totals.noAppLogin,
    present: data.attendanceSplit.present,
    absent: data.attendanceSplit.absent,
    yesterdayPresentCount: today.yesterdayPresentCount,
    yesterdayMissedIn: today.yesterdayMissedIn,
    yesterdayMissedOut: today.yesterdayMissedOut,
  };
}

function mapWeeklyTrend(
  weeklyTrend: OrganizationAnalyticsData["weeklyTrend"],
  weekStart: string
): WeeklyEntry[] {
  return weeklyTrend.map((entry, i) => {
    let dayName = entry.label;
    if (dayName === "Today") {
      dayName = ALL_DAYS_FULL[new Date().getDay()];
    }
    const dayIndex = ALL_DAYS_FULL.indexOf(dayName);
    const dayDate = new Date(`${weekStart}T00:00:00`);
    dayDate.setDate(dayDate.getDate() + (dayIndex >= 0 ? dayIndex : i));
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

// ─────────────────────────────────────────────────────────────────────────────
// State interface
// ─────────────────────────────────────────────────────────────────────────────

export interface UserInsightsState {
  weeklyTrendError: string | null;
  pendingRequests: Record<string, boolean>;
  insightsDailySummaryCache: Record<string, DailySummary>;
  insightsHourlyTrendCache: Record<string, HourlyEntry[]>;
  insightsWeeklyTrendCache: Record<string, WeeklyEntry[]>;
  insightsDeptAttendanceCache: Record<string, DeptEntry[]>;
  insightsOvertimeCache: Record<string, OvertimeData>;
  attendancePctCache: Record<string, AttendancePctData>;   // ← properly typed & initialized

  fetchDailySummary: (orgId: number, date?: string) => Promise<void>;
  fetchHourlyTrendData: (orgId: number, date?: string) => Promise<void>;
  fetchDeptAttendanceData: (orgId: number, date?: string) => Promise<void>;
  fetchWeeklyTrendData: (orgId: number, date?: string) => Promise<void>;
  fetchOvertimeData: (orgId: number, date?: string) => Promise<void>;
  fetchAttendancePct: (orgId: number, date?: string) => Promise<void>;  // ← new action
  clearData: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useUserInsightsStore = create<UserInsightsState>((set, get) => ({
  weeklyTrendError: null,
  pendingRequests: {},
  insightsDailySummaryCache: {},
  insightsHourlyTrendCache: {},
  insightsWeeklyTrendCache: {},
  insightsDeptAttendanceCache: {},
  insightsOvertimeCache: {},
  attendancePctCache: {},   // ← initialized as empty object (was missing)

  // ── Daily summary ───────────────────────────────────────────────────────────
  fetchDailySummary: async (orgId, date) => {
    const cacheKey = resolveDateKey(date);
    const requestKey = buildInsightsRequestKey("dailySummary", orgId, cacheKey);
    const { insightsDailySummaryCache, pendingRequests } = get();
    if (insightsDailySummaryCache[cacheKey] || pendingRequests[requestKey]) return;
    setPendingRequest(set, requestKey);
    try {
      const data = await fetchTotalsAndToday(orgId, cacheKey);
      const summary = mapDailySummary(data);
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

  // ── Hourly trend ────────────────────────────────────────────────────────────
  fetchHourlyTrendData: async (orgId, date) => {
    const cacheKey = resolveDateKey(date);
    const requestKey = buildInsightsRequestKey("hourlyTrend", orgId, cacheKey);
    const { insightsHourlyTrendCache, pendingRequests } = get();
    if (insightsHourlyTrendCache[cacheKey] || pendingRequests[requestKey]) return;
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

  // ── Department attendance ───────────────────────────────────────────────────
  fetchDeptAttendanceData: async (orgId, date) => {
    const cacheKey = resolveDateKey(date);
    const requestKey = buildInsightsRequestKey("deptAttendance", orgId, cacheKey);
    const { insightsDeptAttendanceCache, pendingRequests } = get();
    if (insightsDeptAttendanceCache[cacheKey] || pendingRequests[requestKey]) return;
    setPendingRequest(set, requestKey);
    try {
      const response = await fetchDepartmentAttendance(orgId, cacheKey);
      const deptAttendance: DeptEntry[] = response.departmentAttendance.map((entry) => ({
        name: entry.department,
        present: entry.present,
        checkIns: entry.checkin,
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

  // ── Weekly trend ────────────────────────────────────────────────────────────
  fetchWeeklyTrendData: async (orgId, date) => {
    const cacheKey = resolveDateKey(date);
    const weekStart = getWeekStartStr(cacheKey);
    const requestKey = buildInsightsRequestKey("weeklyTrend", orgId, weekStart);
    const { insightsWeeklyTrendCache, pendingRequests } = get();
    if (insightsWeeklyTrendCache[weekStart] || pendingRequests[requestKey]) return;
    set({ weeklyTrendError: null });
    setPendingRequest(set, requestKey);
    try {
      const response = await fetchWeeklyTrend(orgId, cacheKey);
      const weeklyTrend = mapWeeklyTrend(response.weeklyTrend, weekStart);
      set((state) => ({
        insightsWeeklyTrendCache: {
          ...state.insightsWeeklyTrendCache,
          [weekStart]: weeklyTrend,
        },
      }));
    } catch (error) {
      set({
        weeklyTrendError:
          error instanceof Error ? error.message : "Failed to fetch weekly trend",
      });
      console.error("UserInsightsStore fetchWeeklyTrendData error:", error);
    } finally {
      clearPendingRequest(set, requestKey);
    }
  },

  // ── Overtime ────────────────────────────────────────────────────────────────
  fetchOvertimeData: async (orgId, date) => {
    const cacheKey = resolveDateKey(date);
    const requestKey = buildInsightsRequestKey("overtime", orgId, cacheKey);
    const { insightsOvertimeCache, pendingRequests } = get();
    if (insightsOvertimeCache[cacheKey] || pendingRequests[requestKey]) return;
    setPendingRequest(set, requestKey);
    try {
      const overtimeResponse = await fetchOvertime(orgId, cacheKey);
      const overtime: OvertimeData = {
        avgHoursToday: overtimeResponse.overtime.avgHoursToday,
        overtimeStaff: overtimeResponse.overtime.overtimeCount,
        earlyDepartures: overtimeResponse.overtime.earlyDepartures,
        shiftCoverage: overtimeResponse.overtime.shiftCoverage,
        weekAttendanceRate: overtimeResponse.overtime.weekAttendanceRate,
        expectedHours: overtimeResponse.overtime.requiredHours ?? 9,
        totalStaff: overtimeResponse.overtime.totalEmployees ?? 0,
        noPunchToday: overtimeResponse.overtime.noPunchToday ?? 0,
        onTimeRate: overtimeResponse.overtime.onTimeRate ?? 0,
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

  // ── Attendance % ─────────────────────────────────────────────────────────────
  // Calls GET /insights/:orgId?action=attendancePct&date=YYYY-MM-DD
  // Stores result in attendancePctCache[date] so KpiGrid can read it.
  // In fetchAttendancePct:
  fetchAttendancePct: async (orgId, date) => {
    const cacheKey = resolveDateKey(date);
    const orgDateKey = `${orgId}_${cacheKey}`;
    const requestKey = buildInsightsRequestKey("attendancePct", orgId, cacheKey);
    const { attendancePctCache, pendingRequests } = get();
    if (attendancePctCache[orgDateKey] || pendingRequests[requestKey]) return;
    setPendingRequest(set, requestKey);
    try {
      const response = await apiRequest(
        `/insights/${orgId}?action=attendancePct&date=${cacheKey}`,
        "GET"
      );
      const pct = response?.data as AttendancePctData;
      if (!pct || pct.presentCount == null || pct.eligibleEmployees == null) return;
      set((state) => ({
        attendancePctCache: {
          ...state.attendancePctCache,
          [orgDateKey]: pct,
        },
      }));
    } catch (error) {
      console.error("UserInsightsStore fetchAttendancePct error:", error);
    } finally {
      clearPendingRequest(set, requestKey);
    }
  },

  // ── Clear ───────────────────────────────────────────────────────────────────
  clearData: () => {
    set({
      weeklyTrendError: null,
      pendingRequests: {},
      insightsDailySummaryCache: {},
      insightsHourlyTrendCache: {},
      insightsWeeklyTrendCache: {},
      insightsDeptAttendanceCache: {},
      insightsOvertimeCache: {},
      attendancePctCache: {},  // ← cleared too
    });
  },
}));