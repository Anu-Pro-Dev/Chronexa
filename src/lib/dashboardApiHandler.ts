import { apiRequest } from './apiHandler';

const requestCache = new Map<string, {
  promise: Promise<any>;
  timestamp: number;
}>();

const CACHE_DURATION = 2000; 
const REQUEST_DEBOUNCE = 500;

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      requestCache.delete(key);
    }
  }
}, 5000);

const deduplicatedRequest = async (key: string, requestFn: () => Promise<any>) => {
  const now = Date.now();
  const cached = requestCache.get(key);
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.promise;
  }
  
  const promise = requestFn().finally(() => {
    setTimeout(() => {
      const current = requestCache.get(key);
      if (current && current.promise === promise) {
        requestCache.delete(key);
      }
    }, CACHE_DURATION);
  });
  
  requestCache.set(key, { promise, timestamp: now });
  return promise;
};

export const getAttendanceDetails = async () => {
  return deduplicatedRequest('attendance', () => 
    apiRequest('/dashboard/attendance', "GET")
  );
};

export const getWorkSchedule = async () => {
  return deduplicatedRequest('work-schedule', () =>
    apiRequest('/dashboard/work-schedule', "GET")
  );
};

export const getLeaveAnalytics = async (year?: number) => {
  const queryParam = year ? `?year=${year}` : '';
  const cacheKey = `leave-analytics-${year || 'current'}`;
  return deduplicatedRequest(cacheKey, () =>
    apiRequest(`/dashboard/leave-analytics${queryParam}`, "GET")
  );
};

export const getWorkHourTrends = async (month?: string) => {
  const queryParam = month ? `?month=${month}` : '';
  const cacheKey = `work-hour-trends-${month || 'current'}`;
  return deduplicatedRequest(cacheKey, () =>
    apiRequest(`/dashboard/work-hour-trends${queryParam}`, "GET")
  );
};

export const getTeamAttendanceDetails = async (
  date?: string,
  month?: number,
  year?: number
) => {

  const queryParams = new URLSearchParams();

  if (date) queryParams.append("date", date);
  if (month) queryParams.append("month", String(month));
  if (year) queryParams.append("year", String(year));

  const finalQuery = queryParams.toString();
  const cacheKey = `team-attendance-${finalQuery || "default"}`;

  return deduplicatedRequest(cacheKey, () =>
    apiRequest(`/dashboard/teamAttendance${finalQuery ? `?${finalQuery}` : ''}`, "GET")
  );
};

export const getTeamLeaveAnalytics = async (year?: number) => {
  const queryParam = year ? `?year=${year}` : '';
  const cacheKey = `leave-analytics-${year || 'current'}`;
  return deduplicatedRequest(cacheKey, () =>
    apiRequest(`/dashboard/teamLeaveAnalytics${queryParam}`, "GET")
  );
};

let dashboardFetchPromise: Promise<any> | null = null;
let dashboardFetchTimestamp = 0;

export const getAllDashboardData = async () => {
  const now = Date.now();
  
  if (dashboardFetchPromise && (now - dashboardFetchTimestamp) < CACHE_DURATION) {
    return dashboardFetchPromise;
  }
  
  dashboardFetchTimestamp = now;
  
  dashboardFetchPromise = (async () => {
    try {    
      const [attendance, schedule] = await Promise.all([
        getAttendanceDetails(),
        getWorkSchedule()
      ]);
    
      return {
        success: true,
        data: {
          getMyAttnDetails: attendance?.success ? attendance.data : [],
          WorkSchedule: schedule?.success ? schedule.data : []
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to fetch dashboard data'
      };
    } finally {
      setTimeout(() => {
        dashboardFetchPromise = null;
      }, CACHE_DURATION);
    }
  })();
  
  return dashboardFetchPromise;
};

export const clearDashboardCache = () => {
  dashboardFetchPromise = null;
  dashboardFetchTimestamp = 0;
  requestCache.clear();
};