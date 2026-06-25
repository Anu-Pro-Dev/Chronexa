import { apiRequest } from './apiHandler';

export const getAttendanceDetails = async (date?: string) => {
  return apiRequest(`/dashboard/attendance${date ? `?date=${date}` : ''}`, 'GET');
};

export const getWorkSchedule = async (date?: string) => {
  return apiRequest(`/dashboard/work-schedule${date ? `?date=${date}` : ''}`, 'GET');
};

export const getLeaveAnalytics = async (year?: number) => {
  return apiRequest(
    `/dashboard/leave-analytics?year=${year || new Date().getFullYear()}`, 
    'GET'
  );
};

export const getWorkHourTrends = async (month?: string) => {
  return apiRequest(
    `/dashboard/work-hour-trends${month ? `?month=${month}` : ''}`, 
    'GET'
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

  const query = queryParams.toString();
  return apiRequest(
    `/dashboard/teamAttendance${query ? `?${query}` : ''}`, 
    'GET'
  );
};

export const getTeamLeaveAnalytics = async (year?: number) => {
  return apiRequest(
    `/dashboard/teamLeaveAnalytics?year=${year || new Date().getFullYear()}`, 
    'GET'
  );
};

export const getTeamViolationAnalytics = async (year?: number) => {
  return apiRequest(
    `/dashboard/teamViolationAnalytics?year=${year || new Date().getFullYear()}`, 
    'GET'
  );
};

export const getWeeklyViolationSummary = async (weekstart: string, weekend: string) => {
  return apiRequest(
    `/dashboard/weekly_violation_summary?weekstart=${weekstart}&weekend=${weekend}`,
    'GET'
  );
};

export const getWeeklyViolationDetail = async (summaryId: number, filter: string, limit: number = 10000) => {
  return apiRequest(
    `/dashboard/weekly_violation_summary/${summaryId}?filter=${filter}&limit=${limit}`,
    'GET'
  );
};