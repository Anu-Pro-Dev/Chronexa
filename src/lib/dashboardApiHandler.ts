import { apiRequest } from './apiHandler';

// In-memory cache with timestamps
const memoryCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const REQUEST_DEBOUNCE = 500;

// Cleanup interval for expired cache
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      memoryCache.delete(key);
    }
  }
}, 60000); // Check every minute

// Generic cache handler
const getCachedData = async (
  key: string,
  fetchFn: () => Promise<any>,
  duration: number = CACHE_DURATION
): Promise<any> => {
  const now = Date.now();
  const cached = memoryCache.get(key);
  
  if (cached && (now - cached.timestamp) < duration) {
    return cached.data;
  }
  
  try {
    const data = await fetchFn();
    memoryCache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    console.error(`Error fetching data for key ${key}:`, error);
    // Return stale cache if available
    return cached?.data || null;
  }
};

// Dashboard individual endpoints
export const getAttendanceDetails = async () => {
  return getCachedData('attendance', () => 
    apiRequest('/dashboard/attendance', 'GET')
  );
};

export const getWorkSchedule = async () => {
  return getCachedData('work-schedule', () =>
    apiRequest('/dashboard/work-schedule', 'GET')
  );
};

export const getLeaveAnalytics = async (year?: number) => {
  const cacheKey = `leave-analytics-${year || 'current'}`;
  return getCachedData(cacheKey, () =>
    apiRequest(`/dashboard/leave-analytics?year=${year || new Date().getFullYear()}`, 'GET')
  );
};

export const getWorkHourTrends = async (month?: string) => {
  const cacheKey = `work-hour-trends-${month || 'current'}`;
  return getCachedData(cacheKey, () =>
    apiRequest(`/dashboard/work-hour-trends${month ? `?month=${month}` : ''}`, 'GET')
  );
};

export const getTeamAttendanceDetails = async (
  date?: string,
  month?: number,
  year?: number
) => {
  const queryParams = new URLSearchParams();
  if (date) queryParams.append('date', date);
  if (month) queryParams.append('month', String(month));
  if (year) queryParams.append('year', String(year));

  const cacheKey = `team-attendance-${date || month || year || 'current'}`;
  const query = queryParams.toString();

  return getCachedData(cacheKey, () =>
    apiRequest(`/dashboard/teamAttendance${query ? `?${query}` : ''}`, 'GET')
  );
};

export const getTeamLeaveAnalytics = async (year?: number) => {
  const cacheKey = `team-leave-analytics-${year || 'current'}`;
  return getCachedData(cacheKey, () =>
    apiRequest(`/dashboard/teamLeaveAnalytics?year=${year || new Date().getFullYear()}`, 'GET')
  );
};

export const getTeamViolationAnalytics = async (year?: number) => {
  const cacheKey = `team-violation-analytics-${year || 'current'}`;
  return getCachedData(cacheKey, () =>
    apiRequest(`/dashboard/teamViolationAnalytics?year=${year || new Date().getFullYear()}`, 'GET')
  );
};

// Comprehensive dashboard data - single API call or aggregated
export const getAllDashboardData = async () => {
  const cacheKey = 'all-dashboard-data';
  
  return getCachedData(cacheKey, async () => {
    try {
      // Option 1: If backend supports single endpoint, use this:
      // const response = await apiRequest('/dashboard/all', 'GET');
      
      // Option 2: Parallel requests for individual endpoints (current approach)
      const [attendance, schedule, leaveAnalytics, workHours, teamAttendance] = 
        await Promise.all([
          getAttendanceDetails(),
          getWorkSchedule(),
          getLeaveAnalytics(),
          getWorkHourTrends(),
          getTeamAttendanceDetails()
        ]);
      
      return {
        success: true,
        data: {
          getMyAttnDetails: attendance?.data || [],
          workSchedule: schedule?.data || [],
          leaveAnalytics: leaveAnalytics?.data || [],
          workHourTrends: workHours?.data || [],
          teamAttendance: teamAttendance?.data || []
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to fetch dashboard data'
      };
    }
  });
};

// Store specific dashboard section
export const updateDashboardSection = (section: string, data: any) => {
  memoryCache.set(section, { data, timestamp: Date.now() });
};

// Get cache info for debugging
export const getCacheInfo = () => {
  return {
    cacheSize: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
    cacheDuration: `${CACHE_DURATION / 1000}s`
  };
};

// Clear specific cache
export const clearCacheSection = (key: string) => {
  memoryCache.delete(key);
};

// Clear all dashboard cache
export const clearDashboardCache = () => {
  memoryCache.clear();
};

// Preload dashboard on app init
export const preloadDashboardData = async () => {
  return getAllDashboardData();
};