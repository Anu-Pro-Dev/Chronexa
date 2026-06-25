"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { getReportAttendance } from "@/src/lib/dashboardApiHandler";
import { ExportButton } from "../export/ExportButton";
import type { ExportColumn } from "../export/DashboardExcelExporter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";

// NOTE: Helpers below are used ONLY to build the downloadable Excel report.
// The on-screen table renders raw API values directly (no calculation).

const formatHoursToHM = (decimalHours: number) => {
  if (!decimalHours || decimalHours <= 0) return "0h 0m";
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

function toLocalDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatTime(val: string | undefined | null): string {
  if (!val) return "—";
  const parts = val.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return val;
}

function parseHHMMSStoHours(val: string | undefined | null): number {
  if (!val) return 0;
  const parts = val.split(":");
  if (parts.length === 3) {
    return (parseInt(parts[0]) || 0) + ((parseInt(parts[1]) || 0) / 60) + ((parseInt(parts[2]) || 0) / 3600);
  }
  if (parts.length === 2) {
    return (parseInt(parts[0]) || 0) + ((parseInt(parts[1]) || 0) / 60);
  }
  return parseFloat(val) || 0;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  "✔️": { label: "Perfect Login", color: "#22C55E" },
  "❌": { label: "No Show", color: "#EF4444" },
  "I": { label: "Incomplete", color: "#F59E0B" },
  "L": { label: "Late", color: "#3B82F6" },
  "L&I": { label: "Late & Incomplete", color: "#8B5CF6" },
  "L&M": { label: "Late & Missed", color: "#EC4899" },
  "MI": { label: "Missed In", color: "#F97316" },
  "MO": { label: "Missed Out", color: "#06B6D4" },
};

// Raw passthrough: show the API value as-is, or "—" when empty/null.
const raw = (val: unknown): string => {
  if (val === null || val === undefined) return "—";
  const s = String(val).trim();
  return s === "" ? "—" : s;
};

// Hours cell: format an HH:MM(:SS) value as "Xh Ym", or "—" when there's no
// data (empty or zero). No "0h 0m".
const hoursCell = (val: string | undefined | null): string => {
  const h = parseHHMMSStoHours(val);
  return h > 0 ? formatHoursToHM(h) : "—";
};

function WeeklyReportCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const { employeeId } = useAuthGuard();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const yesterday = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d;
  }, [today]);

  const monthStart = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    return d;
  }, [today]);

  const weekStart = useMemo(() => {
    const d = new Date(yesterday);
    d.setDate(d.getDate() - 9); // 10 days including yesterday
    return d;
  }, [yesterday]);

  const monthFromDate = toLocalDateStr(monthStart);
  const toDate = toLocalDateStr(yesterday);
  const displayFromDate = toLocalDateStr(weekStart);

  const fetchData = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getReportAttendance({
        employee_ids: employeeId,
        from_date: monthFromDate,
        to_date: toDate,
        limit: 50,
        offset: 0,
      });
      setRecords(res?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch report attendance:", err);
      setError(err?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [employeeId, monthFromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build a date-keyed lookup
  const recordByDate = useMemo(() => {
    const map = new Map<string, any>();
    records.forEach((rec: any) => {
      if (rec.WorkDate) {
        const d = new Date(rec.WorkDate);
        const key = toLocalDateStr(d);
        map.set(key, rec);
      }
    });
    return map;
  }, [records]);

  // 10-day rows
  const weekRows = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days.map((d) => {
      const key = toLocalDateStr(d);
      const rec = recordByDate.get(key);
      return {
        key,
        dateObj: d,
        dateLabel: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }),
        rec,
      };
    });
  }, [weekStart, recordByDate]);

  // Export: month-to-date
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const exportColumns: ExportColumn[] = [
    { header: "SAP ID", key: "sapId", width: 12 },
    { header: "K ID", key: "kId", width: 12 },
    { header: "Employee Name", key: "employeeName", width: 20 },
    { header: "Date", key: "date", width: 14 },
    { header: "Day", key: "day", width: 10 },
    { header: "Check In Time", key: "checkIn", width: 14 },
    { header: "Check Out Time", key: "checkOut", width: 14 },
    { header: "Total Worked Hours", key: "totalWorked", width: 16 },
    { header: "Missed Hours", key: "missedHours", width: 14 },
    { header: "Extra Worked Hours", key: "extraWorked", width: 16 },
    { header: "Attendance Status", key: "attendanceStatus", width: 16 },
    { header: "Leave", key: "leave", width: 10 },
    { header: "Leave Status", key: "leaveStatus", width: 14 },
    { header: "Missed Hours Remark", key: "missedRemark", width: 18 },
    { header: "Entity", key: "entity", width: 14 },
    // { header: "Location", key: "location", width: 14 },
  ];

  const exportData = useMemo(() => {
    const lastDay = yesterday.getMonth() + 1 === currentMonth ? yesterday.getDate() : 0;
    const rows: Record<string, string>[] = [];
    for (let day = 1; day <= lastDay; day++) {
      const d = new Date(currentYear, currentMonth - 1, day);
      const key = toLocalDateStr(d);
      const rec = recordByDate.get(key);
      const worked = parseHHMMSStoHours(rec?.DailyWorkedHrs);
      const missed = parseHHMMSStoHours(rec?.DailyMissedHrs);
      const extra = parseHHMMSStoHours(rec?.DailyExtraWork);
      rows.push({
        sapId: rec?.EmployeeNo ?? "—",
        kId: rec?.EmployeeID?.toString() ?? "—",
        employeeName: rec?.Name ?? "—",
        date: d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        checkIn: formatTime(rec?.PunchIn),
        checkOut: formatTime(rec?.PunchOut),
        totalWorked: formatHoursToHM(worked),
        missedHours: formatHoursToHM(missed),
        extraWorked: extra > 0 ? formatHoursToHM(extra) : "—",
        attendanceStatus: rec?.AttendanceStatus ?? "—",
        leave: rec?.PunchIn ? "No" : "Yes",
        leaveStatus: raw(rec?.IsAbsent),
        missedRemark: rec?.Comment ?? rec?.Remarks ?? "—",
        entity: rec?.Organization ?? "—",
        // location: rec?.Department ?? "—",
      });
    }
    return rows;
  }, [recordByDate, yesterday, currentMonth, currentYear]);

  const periodLabel =
    exportData.length > 0
      ? `01 – ${String(yesterday.getDate()).padStart(2, "0")} ${months[currentMonth - 1]} ${currentYear}`
      : "—";

  const currentYearStr = today.getFullYear().toString();

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4 flex flex-col gap-3 px-6">
      <div className="flex items-center justify-between gap-2">
        <h5 className="text-lg text-text-primary font-bold py-3 pb-5">
          {t?.weekly_report || "Last 10 Days Report"} 
          <span className="text-xs text-text-secondary hidden sm:inline font-normal ml-2">
            ({displayFromDate} – {toDate})
          </span>
        </h5>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-text-secondary hidden sm:inline">
            Current Month Report 
          </span>
          <ExportButton
            data={exportData}
            columns={exportColumns}
            meta={{
              title: "Monthly Attendance Report",
              description: `Attendance summary from the 1st of ${months[currentMonth - 1]} up to and including ${periodLabel === "—" ? "yesterday" : periodLabel}.`,
              filters: {
                Month: `${months[currentMonth - 1]} ${currentYearStr}`,
                Period: periodLabel,
              },
            }}
            filename={`Attendance_${months[currentMonth - 1]}_${currentYearStr}_to_${String(yesterday.getDate()).padStart(2, "0")}.xlsx`}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[220px]">
          <p className="text-text-secondary">
            {translations?.buttons?.loading || "Loading…"}
          </p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-[220px]">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "8%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr className="text-text-secondary border-b border-border">
                <th className="pb-2 text-left font-regular">Date</th>
                <th className="pb-2 text-left font-regular">Day</th>
                <th className="pb-2 text-left font-regular">Check In</th>
                <th className="pb-2 text-left font-regular">Check Out</th>
                <th className="pb-2 text-left font-regular">Worked</th>
                <th className="pb-2 text-left font-regular">Missed</th>
                <th className="pb-2 text-left font-regular">Extra</th>
                <th className="pb-2 text-left font-regular">Status</th>
                <th className="pb-2 text-left font-regular">Leave Status</th>
                <th className="pb-2 text-left font-regular">Entity</th>
              </tr>
            </thead>
            <tbody>
              {weekRows.map((row) => {
                const rec = row.rec;
                const status = rec?.AttendanceStatus;
                return (
                  <tr key={row.key} className="border-b border-border/50 last:border-0">
                    <td className="py-3 text-text-primary font-regular whitespace-nowrap tabular-nums">
                      {row.dateLabel}
                    </td>
                    <td className="py-3 text-text-secondary whitespace-nowrap">
                      {raw(rec?.WorkDay) !== "—" ? rec?.WorkDay : row.dayLabel}
                    </td>
                    <td className="py-3 text-text-secondary whitespace-nowrap tabular-nums">
                      {raw(rec?.PunchIn)}
                    </td>
                    <td className="py-3 text-text-secondary whitespace-nowrap tabular-nums">
                      {raw(rec?.PunchOut)}
                    </td>
                    <td className="py-3 text-text-primary whitespace-nowrap tabular-nums">
                      {hoursCell(rec?.DailyWorkedHrs)}
                    </td>
                    <td className="py-3 text-text-secondary whitespace-nowrap tabular-nums">
                      {hoursCell(rec?.DailyMissedHrs)}
                    </td>
                    <td className="py-3 text-text-secondary whitespace-nowrap tabular-nums">
                      {hoursCell(rec?.DailyExtraWork)}
                    </td>
                    <td className="py-3">
                      {!status ? (
                        <span className="text-text-secondary">—</span>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer">
                              {status}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-accent border border-border shadow-dropdown">
                            <div className="flex items-center gap-2 text-xs text-text-primary">
                              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_CONFIG[status]?.color || "#888" }} />
                              <span className="font-semibold">{status}</span>
                              <span>–</span>
                              <span>{STATUS_CONFIG[status]?.label || status}</span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </td>
                    <td className="py-3 text-text-secondary whitespace-nowrap">
                      {raw(rec?.IsAbsent)}
                    </td>
                    <td className="py-3 text-text-secondary whitespace-nowrap truncate" title={rec?.Organization ?? ""}>
                      {raw(rec?.Organization)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap justify-center py-2">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1 text-xs text-text-secondary">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
            {key} – {cfg.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default WeeklyReportCard;