import { apiRequest } from './apiHandler';

// Team-wide aggregations and large result sets are far heavier than per-user
// calls and can exceed the default 30s timeout. Give them more headroom.
// (Real fix belongs on the backend query; this just avoids premature aborts.)
const HEAVY_TIMEOUT = 90000;

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
    'GET',
    undefined,
    HEAVY_TIMEOUT
  );
};

export const getTeamLeaveAnalytics = async (year?: number) => {
  return apiRequest(
    `/dashboard/teamLeaveAnalytics?year=${year || new Date().getFullYear()}`, 
    'GET',
    undefined,
    HEAVY_TIMEOUT
  );
};

export const getTeamViolationAnalytics = async (year?: number) => {
  return apiRequest(
    `/dashboard/teamViolationAnalytics?year=${year || new Date().getFullYear()}`, 
    'GET',
    undefined,
    HEAVY_TIMEOUT
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
    'GET',
    undefined,
    HEAVY_TIMEOUT
  );
};

export const getReportAttendance = async (params: {
  employee_ids: number;
  from_date: string;
  to_date: string;
  limit?: number;
  offset?: number;
}) => {
  const query = new URLSearchParams({
    employee_ids: String(params.employee_ids),
    from_date: params.from_date,
    to_date: params.to_date,
    limit: String(params.limit ?? 50),
    offset: String(params.offset ?? 0),
  });
  return apiRequest(`/report/attendance?${query}`, 'GET');
};

export const getTeamReportAttendance = async (params: {
  manager_id: number;
  from_date: string;
  to_date: string;
  limit?: number;
  offset?: number;
}) => {
  const query = new URLSearchParams({
    manager_id: String(params.manager_id),
    from_date: params.from_date,
    to_date: params.to_date,
    limit: String(params.limit ?? 50),
    offset: String(params.offset ?? 0),
  });
  return apiRequest(`/report/attendance?${query}`, 'GET');
};