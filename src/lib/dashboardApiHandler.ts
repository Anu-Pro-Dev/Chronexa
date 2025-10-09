import { apiRequest } from './apiHandler';

// Request cache to prevent duplicate simultaneous requests
const requestCache = new Map<string, {
  promise: Promise<any>;
  timestamp: number;
}>();

const CACHE_DURATION = 2000; // 2 seconds cache
const REQUEST_DEBOUNCE = 500; // 500ms debounce

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      requestCache.delete(key);
    }
  }
}, 5000);

// Wrapper to deduplicate requests
const deduplicatedRequest = async (key: string, requestFn: () => Promise<any>) => {
  const now = Date.now();
  const cached = requestCache.get(key);
  
  // If there's a recent request in progress or completed, return it
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`🔒 Deduplicated request: ${key}`);
    return cached.promise;
  }
  
  // Create new request
  console.log(`🚀 New request: ${key}`);
  const promise = requestFn().finally(() => {
    // Keep in cache for a short time after completion
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

// Functions for dashboard - separate endpoints
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

// Global lock for getAllDashboardData
let dashboardFetchPromise: Promise<any> | null = null;
let dashboardFetchTimestamp = 0;

// Helper function to fetch all dashboard data
export const getAllDashboardData = async () => {
  const now = Date.now();
  
  // If there's a recent fetch in progress, return it
  if (dashboardFetchPromise && (now - dashboardFetchTimestamp) < CACHE_DURATION) {
    console.log('🔒 Dashboard fetch already in progress, returning existing promise');
    return dashboardFetchPromise;
  }
  
  console.log('🚀 Starting new dashboard fetch...');
  dashboardFetchTimestamp = now;
  
  dashboardFetchPromise = (async () => {
    try {    
      const [attendance, schedule, leaves, workHours] = await Promise.all([
        getAttendanceDetails(),
        getWorkSchedule(),
        getLeaveAnalytics(),
        getWorkHourTrends()
      ]);
      
      console.log('✅ Dashboard data fetched:', {
        attendance: attendance?.success,
        schedule: schedule?.success,
        leaves: leaves?.success,
        workHours: workHours?.success
      });
      
      return {
        success: true,
        data: {
          getMyAttnDetails: attendance?.success ? attendance.data : [],
          WorkSchedule: schedule?.success ? schedule.data : [],
          getLeaveAnalytics: leaves?.success ? leaves.data : [],
          WorkHourTrends: workHours?.success ? workHours.data : []
        }
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to fetch dashboard data'
      };
    } finally {
      // Clear the promise after a delay
      setTimeout(() => {
        dashboardFetchPromise = null;
      }, CACHE_DURATION);
    }
  })();
  
  return dashboardFetchPromise;
};

// Optional: Manual cache clearing function
export const clearDashboardCache = () => {
  console.log('🧹 Clearing dashboard cache');
  dashboardFetchPromise = null;
  dashboardFetchTimestamp = 0;
  requestCache.clear();
};