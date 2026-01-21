import { apiRequest } from './apiHandler';

export const getAttendanceDetails = async () => {
  return apiRequest('/dashboard/attendance', 'GET');
};

export const getWorkSchedule = async () => {
  return apiRequest('/dashboard/work-schedule', 'GET');
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