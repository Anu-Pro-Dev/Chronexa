"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { getTeamReportAttendance } from "@/src/lib/dashboardApiHandler";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Download, Loader2 } from "lucide-react";

// How many of yesterday's team records to pull for the random sample.
const TEAM_FETCH_LIMIT = 200;
// How many random records to show in the table.
const DISPLAY_COUNT = 10;

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

// Raw passthrough: show the API value as-is, or "—" when empty/null.
const raw = (val: unknown): string => {
  if (val === null || val === undefined) return "—";
  const s = String(val).trim();
  return s === "" ? "—" : s;
};

// Hours cell: "Xh Ym", or "—" when there's no data (empty or zero).
const hoursCell = (val: string | undefined | null): string => {
  const h = parseHHMMSStoHours(val);
  return h > 0 ? formatHoursToHM(h) : "—";
};

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

// CSV column order (header + record key).
const CSV_COLUMNS: { header: string; key: string }[] = [
  { header: "SAP ID", key: "sapId" },
  { header: "K ID", key: "kId" },
  { header: "Employee Name", key: "employeeName" },
  { header: "Date", key: "date" },
  { header: "Day", key: "day" },
  { header: "Check In Time", key: "checkIn" },
  { header: "Check Out Time", key: "checkOut" },
  { header: "Total Worked Hours", key: "totalWorked" },
  { header: "Missed Hours", key: "missedHours" },
  { header: "Extra Worked Hours", key: "extraWorked" },
  { header: "Attendance Status", key: "attendanceStatus" },
  { header: "Leave", key: "leave" },
  { header: "Leave Status", key: "leaveStatus" },
  { header: "Missed Hours Remark", key: "missedRemark" },
  { header: "Entity", key: "entity" },
  { header: "Location", key: "location" },
];

// Map one API record into a flat CSV row.
function buildExportRow(rec: any): Record<string, string> {
  const wd = rec?.WorkDate ? new Date(rec.WorkDate) : null;
  return {
    sapId: raw(rec?.EmployeeNo),
    kId: rec?.EmployeeID != null ? String(rec.EmployeeID) : "—",
    employeeName: raw(rec?.Name),
    date: wd ? wd.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—",
    day: wd ? wd.toLocaleDateString("en-US", { weekday: "short" }) : "—",
    checkIn: raw(rec?.PunchIn),
    checkOut: raw(rec?.PunchOut),
    totalWorked: hoursCell(rec?.DailyWorkedHrs),
    missedHours: hoursCell(rec?.DailyMissedHrs),
    extraWorked: hoursCell(rec?.DailyExtraWork),
    attendanceStatus: raw(rec?.AttendanceStatus),
    leave: rec?.PunchIn ? "No" : "Yes",
    leaveStatus: raw(rec?.IsAbsent),
    missedRemark: raw(rec?.Comment ?? rec?.Remarks),
    entity: raw(rec?.Organization),
    location: raw(rec?.Department),
  };
}

// Build a CSV string from columns + rows (RFC-4180 escaping).
function toCsv(columns: { header: string; key: string }[], rows: Record<string, string>[]): string {
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.map((c) => esc(c.header)).join(",");
  const body = rows.map((r) => columns.map((c) => esc(r[c.key])).join(","));
  return [head, ...body].join("\r\n");
}

function triggerDownload(content: string, filename: string) {
  // BOM so Excel reads UTF-8 (status glyphs etc.) correctly.
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function TeamReportCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const { employeeId } = useAuthGuard(); // manager views their own team → manager_id = employeeId

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const today = useMemo(() => new Date(), []);
  const yesterday = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d;
  }, [today]);

  const monthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );

  const yesterdayStr = toLocalDateStr(yesterday);
  const monthFromDate = toLocalDateStr(monthStart);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Fetch yesterday's team attendance.
  const fetchData = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getTeamReportAttendance({
        manager_id: employeeId,
        from_date: yesterdayStr,
        to_date: yesterdayStr,
        limit: TEAM_FETCH_LIMIT,
        offset: 0,
      });
      setRecords(res?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch team report attendance:", err);
      setError(err?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [employeeId, yesterdayStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Random sample of up to DISPLAY_COUNT records (reshuffled once per fetch).
  const displayRows = useMemo(() => {
    const shuffled = [...records];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, DISPLAY_COUNT);
  }, [records]);

  // Full-month CSV for the whole team (fetched on demand at click).
  const handleDownloadCsv = useCallback(async () => {
    if (!employeeId || downloading) return;
    setDownloading(true);
    try {
      const res = await getTeamReportAttendance({
        manager_id: employeeId,
        from_date: monthFromDate,
        to_date: yesterdayStr,
        limit: 100000, // pull the full month for every team member
        offset: 0,
      });
      const data: any[] = res?.data || [];
      const rows = data.map(buildExportRow);
      const csv = toCsv(CSV_COLUMNS, rows);
      const dd = String(yesterday.getDate()).padStart(2, "0");
      triggerDownload(csv, `Team_Attendance_${months[currentMonth - 1]}_${currentYear}_to_${dd}.csv`);
    } catch (err: any) {
      console.error("Failed to download team CSV:", err);
      setError(err?.message || "Failed to download report");
    } finally {
      setDownloading(false);
    }
  }, [employeeId, downloading, monthFromDate, yesterdayStr, yesterday, currentMonth, currentYear]);

  const yesterdayLabel = yesterday.toLocaleDateString("en-US", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4 flex flex-col gap-3 px-6">
      <div className="flex items-center justify-between gap-2">
        <h5 className="text-lg text-text-primary font-bold py-3 pb-5">
          {t?.team_report || "Team Report"}
          <span className="text-xs text-text-secondary hidden sm:inline font-normal ml-2">
            ({yesterdayLabel}
            {records.length > DISPLAY_COUNT ? ` · ${DISPLAY_COUNT} of ${records.length}` : ""})
          </span>
        </h5>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-text-secondary hidden sm:inline">
            Current Month CSV
          </span>
          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={downloading}
            title="Download full month (CSV)"
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-border-accent shadow-button text-text-secondary hover:text-primary hover:bg-backdrop transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
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
      ) : displayRows.length === 0 ? (
        <div className="flex justify-center items-center h-[220px]">
          <p className="text-text-secondary text-sm">No records for {yesterdayLabel}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "16%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr className="text-text-secondary border-b border-border">
                <th className="pb-2 text-left font-regular">Employee</th>
                <th className="pb-2 text-left font-regular">SAP ID</th>
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
              {displayRows.map((rec, idx) => {
                const status = rec?.AttendanceStatus;
                return (
                  <tr key={rec?.EmployeeID ?? idx} className="border-b border-border/50 last:border-0">
                    <td className="py-3 text-text-primary font-regular align-middle pr-3" title={rec?.Name ?? ""}>
                      <span className="line-clamp-2 leading-snug">{raw(rec?.Name)}</span>
                    </td>
                    <td className="py-3 text-text-secondary whitespace-nowrap tabular-nums">
                      {raw(rec?.EmployeeNo)}
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

export default TeamReportCard;