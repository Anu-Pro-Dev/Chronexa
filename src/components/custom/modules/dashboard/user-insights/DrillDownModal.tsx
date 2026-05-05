"use client";
/** * DrillDownModal * -------------- * Themed to match the project's ResponsiveModal + Input + Button + Badge system. * Uses ResponsiveModal (Radix Dialog) with bg-accent, shadow-popup, rounded-[20px]. * For filter="attendancePct" renders a stat breakdown panel instead of a table. * * attendancePct fetch:  GET /insights/:orgId?action=attendancePct&date=YYYY-MM-DD * all other filters:    GET /insights/:orgId/drilldown?filter=<filter>&date=YYYY-MM-DD * * Column rules per filter: *  checkInList    → Name | Department | Employee Type | Check-In Time *  checkOutList   → Name | Department | Employee Type | Check-Out Time *  absentList     → Name | Department | Employee Type | Status (Absent badge) *  leaveList      → Name | Department | Employee Type | Leave Type | Leave Days *  licensedList   → Name | Department | Employee Type | App Username *  noAppLoginList → Name | Department | Employee Type | Last Login (date only) */
import * as React from "react";
import {
  ResponsiveModal,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/ui/responsive-modal";
import { apiRequest } from "@/src/lib/apiHandler";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  UserIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type DrillDownFilter =
  | "checkInList"
  | "checkOutList"
  | "absentList"
  | "leaveList"
  | "licensedList"
  | "noAppLoginList"
  | "missedIn"
  | "missedOut"
  | "attendancePct";

export interface DrillDownEmployee {
  employeeId:      number | string;
  employeeNumber?: string | null;
  employeeName:    string;
  department?:     string | null;
  employeeType?:   string | null;
  checkInTime?:    string | null;
  checkOutTime?:   string | null;
  workedHours?:    string | null;
  leaveType?:      string | null;
  leaveFrom?:      string | null;
  leaveTo?:        string | null;
  leaveDays?:      number | null;
  hasLicense?:     number | null;
  lastLogin?:      string | null;
  appUsername?:    string | null;
  isOnLeave?:      number | null;
  status?:         string;
}

interface AttendancePctData {
  totalEmployees:    number;
  onLeave:           number;
  eligibleEmployees: number;
  presentCount:      number;
  overallPct:        number;
  adjustedPct:       number;
  displayLabel:      string;
  status:            "GOOD" | "WARNING" | "CRITICAL" | "N/A";
  asOfDate:          string;
}

interface DrillDownResponse {
  employees:  DrillDownEmployee[];
  total:      number;
  aggregate?: AttendancePctData;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatTime(raw?: string | null): string {
  if (!raw) return "—";
  if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateOnly(raw?: string | null): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function hasWorkedHours(employees: DrillDownEmployee[]): boolean {
  return employees.some((e) => !!e.workedHours);
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-filter column config
// ─────────────────────────────────────────────────────────────────────────────
type ColConfig = {
  headers: string[];
  // returns array of cell contents matching headers (after Name + Dept + Type)
  cells: (emp: DrillDownEmployee) => React.ReactNode[];
};

function getColConfig(filter: DrillDownFilter): ColConfig {
  switch (filter) {
    case "checkInList":
      return {
        headers: ["Check-In"],
        cells:   (emp) => [
          <span className="tabular-nums">{formatTime(emp.checkInTime)}</span>,
        ],
      };
    case "checkOutList":
      return {
        headers: ["Check-Out"],
        cells:   (emp) => [
          <span className="tabular-nums">{formatTime(emp.checkOutTime)}</span>,
        ],
      };
    case "absentList":
    case "missedIn":
    case "missedOut":
      return {
        headers: ["Status"],
        cells:   (_emp) => [
          <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-md border bg-[#FDEAEA] text-destructive border-[#F5BABA]">
            {filter === "absentList" ? "Absent" : filter === "missedIn" ? "Missed Check-In" : "Missed Check-Out"}
          </span>,
        ],
      };
    case "leaveList":
      return {
        headers: ["Leave Type", "Days"],
        cells:   (emp) => [
          <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-md border bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] truncate max-w-[168px]">
            {emp.leaveType ?? "—"}
          </span>,
          <span className="tabular-nums font-semibold text-text-primary">
            {emp.leaveDays != null ? `${emp.leaveDays}d` : "—"}
          </span>,
        ],
      };
    case "licensedList":
      return {
        headers: ["App Username"],
        cells:   (emp) => [
          <span className="text-text-secondary tabular-nums truncate max-w-[160px]">
            {emp.appUsername ?? "—"}
          </span>,
        ],
      };
    case "noAppLoginList":
      return {
        headers: ["Last Login"],
        cells:   (emp) => [
          <span className="tabular-nums text-text-secondary">
            {formatDateOnly(emp.lastLogin)}
          </span>,
        ],
      };
    default:
      return { headers: [], cells: () => [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch
// attendancePct  → GET /insights/:orgId?action=attendancePct&date=…  (snapshot)
// all others     → GET /insights/:orgId/drilldown?filter=…&date=…
// ─────────────────────────────────────────────────────────────────────────────
async function fetchDrillDown(
  orgId: number,
  filter: DrillDownFilter,
  date: string
): Promise<DrillDownResponse> {
  if (filter === "attendancePct") {
    const response = await apiRequest(
      `/insights/${orgId}?action=attendancePct&date=${date}`,
      "GET"
    );
    const agg: AttendancePctData =
      response?.data?.totalEmployees !== undefined
        ? response.data
        : response?.data?.data ?? response;
    return { employees: [], total: 0, aggregate: agg };
  }
  const query    = new URLSearchParams({ filter, date }).toString();
  const response = await apiRequest(
    `/insights/${orgId}/drilldown?${query}`,
    "GET"
  );
  const raw = response?.data;
  if (Array.isArray(raw)) {
    return { employees: raw as DrillDownEmployee[], total: raw.length };
  }
  if (raw && Array.isArray(raw.employees)) {
    return {
      employees: raw.employees as DrillDownEmployee[],
      total:     raw.total ?? raw.employees.length,
    };
  }
  return { employees: [], total: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// AttendancePctPanel
// ─────────────────────────────────────────────────────────────────────────────
function AttendancePctPanel({ data }: { data: AttendancePctData }) {
  const absentCount = data.eligibleEmployees - data.presentCount;
  const statusConfig: Record<string, { bar: string; pill: string; bg: string }> = {
    GOOD:     { bar: "#1DAA61", pill: "bg-[#EAFAF1] text-success border border-[#A7F3D0]",         bg: "#EAFAF1" },
    WARNING:  { bar: "#FFBF00", pill: "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]",      bg: "#FFFBEB" },
    CRITICAL: { bar: "#DA153E", pill: "bg-[#FDEAEA] text-destructive border border-[#F5BABA]",     bg: "#FDEAEA" },
    "N/A":    { bar: "#9CA3AF", pill: "bg-background text-text-secondary border border-border",    bg: "#F9F9F9" },
  };
  const cfg      = statusConfig[data.status] ?? statusConfig["N/A"];
  const barColor = cfg.bar;
  const statCards = [
    { label: "Total Employees",   value: data.totalEmployees,    icon: <UsersIcon className="w-4 h-4" />,        color: "#0078D4", bg: "#EBF5FB" },
    { label: "On Approved Leave", value: data.onLeave,           icon: <CalendarDaysIcon className="w-4 h-4" />, color: "#B45309", bg: "#FFFBEB" },
    { label: "Eligible",          value: data.eligibleEmployees, icon: <UsersIcon className="w-4 h-4" />,        color: "#7D3FFF", bg: "#F3EEFF" },
    { label: "Present",           value: data.presentCount,      icon: <CheckCircleIcon className="w-4 h-4" />,  color: "#1DAA61", bg: "#EAFAF1" },
    { label: "Absent",            value: absentCount,            icon: <XCircleIcon className="w-4 h-4" />,      color: "#DA153E", bg: "#FDEAEA" },
  ];
  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <div
        className="rounded-[14px] border border-border-accent p-5 flex flex-col items-center gap-3"
        style={{ backgroundColor: cfg.bg }}
      >
        <p className="text-6xl font-bold tabular-nums leading-none" style={{ color: barColor }}>
          {data.displayLabel}
        </p>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Adjusted Attendance Rate
        </p>
        <span className={`text-[11px] font-semibold px-3 py-1 rounded-md border ${cfg.pill}`}>
          {data.status}
        </span>
        <div className="w-full flex flex-col gap-2 mt-1">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-text-secondary">
              <span>Adjusted ({data.adjustedPct}%)</span>
              <span className="font-semibold" style={{ color: barColor }}>
                {data.presentCount} / {data.eligibleEmployees}
              </span>
            </div>
            <div className="h-2.5 w-full bg-white/60 rounded-full overflow-hidden border border-white/40">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${data.adjustedPct}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-text-secondary">
              <span>Overall ({data.overallPct}%)</span>
              <span className="font-semibold text-text-primary">
                {data.presentCount} / {data.totalEmployees}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden border border-white/40">
              <div
                className="h-full rounded-full transition-all duration-700 opacity-60"
                style={{ width: `${data.overallPct}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-background rounded-[12px] border border-border-accent p-3.5 flex items-center gap-3"
          >
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: s.bg, color: s.color }}
            >
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary truncate">
                {s.label}
              </p>
              <p className="text-xl font-bold tabular-nums leading-tight" style={{ color: s.color }}>
                {s.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar cell
// ─────────────────────────────────────────────────────────────────────────────
function AvatarCell({ name, color }: { name?: string | null; color: string }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
      style={{ backgroundColor: color }}
    >
      {getInitials(name)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
interface DrillDownModalProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  orgId:        number;
  date:         string;
  filter:       DrillDownFilter;
  title:        string;
  color:        string;
  count?:       number;
}

export default function DrillDownModal({
  open,
  onOpenChange,
  orgId,
  date,
  filter,
  title,
  color,
  count,
}: DrillDownModalProps) {
  const [data, setData]           = React.useState<DrillDownEmployee[]>([]);
  const [total, setTotal]         = React.useState<number>(0);
  const [aggregate, setAggregate] = React.useState<AttendancePctData | null>(null);
  const [loading, setLoading]     = React.useState(false);
  const [error, setError]         = React.useState<string | null>(null);
  const [search, setSearch]       = React.useState("");

  const isAttendancePct = filter === "attendancePct";
  const colConfig       = getColConfig(filter);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSearch("");
    setData([]);
    setTotal(0);
    setAggregate(null);
    fetchDrillDown(orgId, filter, date)
      .then((res) => {
        if (cancelled) return;
        setData(res.employees);
        setTotal(res.total);
        setAggregate(res.aggregate ?? null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load data.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, orgId, filter, date]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (e) =>
        e.employeeName?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        String(e.employeeId).includes(q) ||
        e.employeeNumber?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const displayCount = count ?? total;

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size="extraLarge" className="gap-0 p-0 overflow-hidden">
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-border-accent">
          <ResponsiveModalHeader className="flex-row items-center gap-3 text-left">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {isAttendancePct
                ? <ChartBarIcon className="w-5 h-5" />
                : <UserIcon className="w-5 h-5" />
              }
            </div>
            <div className="flex-1 min-w-0 text-left">
              <ResponsiveModalTitle className="text-left normal-case text-base">
                {title}
              </ResponsiveModalTitle>
              <p className="text-xs text-text-secondary mt-0.5 font-normal normal-case">
                {date}
                {!isAttendancePct && displayCount > 0 && (
                  <>
                    {" "}&middot;{" "}
                    <span className="font-semibold" style={{ color }}>
                      {displayCount} employee{displayCount !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </p>
            </div>
            <ResponsiveModalClose className="ml-auto shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-background hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1">
              <XMarkIcon className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </ResponsiveModalClose>
          </ResponsiveModalHeader>
          {/* Search — hidden for attendancePct */}
          {!isAttendancePct && (
            <div className="relative mt-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, department or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-10 w-full rounded-full border border-border-grey bg-transparent pl-9 pr-4 text-sm font-normal text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto max-h-[60vh] scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              <p className="text-sm text-text-secondary font-medium">
                Loading data…
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#FDEAEA" }}
              >
                <span className="text-xl">⚠️</span>
              </div>
              <p className="text-sm font-semibold text-text-primary">Could not load data</p>
              <p className="text-xs text-text-secondary max-w-xs">{error}</p>
            </div>
          ) : isAttendancePct ? (
            /* ── Attendance % panel ── */
            <div className="px-6 py-5">
              {aggregate ? (
                <AttendancePctPanel data={aggregate} />
              ) : (
                <div className="py-16 text-center text-text-secondary text-sm">
                  No attendance data available.
                </div>
              )}
            </div>
          ) : (
            /* ── Employee table — columns differ per filter ── */
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-accent z-10 border-b border-border-accent">
                <tr className="text-text-secondary text-[11px] uppercase tracking-wider font-semibold">
                  {/* Fixed cols */}
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Department</th>
                  {/* <th className="px-4 py-3 text-left hidden md:table-cell">Type</th> */}
                  {/* Dynamic cols */}
                  {colConfig.headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3 + colConfig.headers.length}
                      className="py-16 text-center text-text-secondary text-sm"
                    >
                      {search
                        ? "No employees match your search."
                        : "No employees in this category."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => {
                    const extraCells = colConfig.cells(emp);
                    return (
                      <tr
                        key={emp.employeeId}
                        className="border-b border-border-accent hover:bg-background transition-colors"
                      >
                        {/* Name + EmpNo — unchanged */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <AvatarCell name={emp.employeeName} color={color} />
                            <div className="min-w-0 w-[264px] max-w-[264px]">
                              <p className="font-semibold text-text-primary truncate leading-tight text-sm">
                                {emp.employeeName}
                              </p>
                              <p className="text-[11px] text-text-secondary mt-0.5">
                                {emp.employeeNumber
                                  ? `Emp No: ${emp.employeeNumber}`
                                  : `Emp ID: ${emp.employeeId}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-text-primary truncate leading-tight text-sm">
                                {emp.department ?? "—"}
                              </p>
                              <p className="text-[11px] text-text-secondary mt-0.5">
                                {emp.employeeType
                                  ? `Employee Type: ${emp.employeeType}`
                                  : `-`}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Dynamic extra cells */}
                        {extraCells.map((cell, i) => (
                          <td key={i} className="py-3 px-4 text-sm">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer — employee table only ── */}
        {!loading && !error && !isAttendancePct && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-border-accent bg-background flex items-center justify-between">
            <p className="text-xs text-text-secondary">
              Showing{" "}
              <span className="font-semibold text-text-primary">{filtered.length}</span>
              {search && (
                <> of <span className="font-semibold text-text-primary">{total}</span></>
              )}{" "}
              employee{filtered.length !== 1 ? "s" : ""}
            </p>
            {hasWorkedHours(filtered) && (
              <p className="text-xs text-text-secondary">Worked hours shown in expanded view</p>
            )}
          </div>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}