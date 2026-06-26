"use client";
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import {
  ResponsiveModal,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/ui/responsive-modal";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { LateInIcon, EarlyOutIcon, MissedInIcon, MissedOutIcon } from "@/src/icons/icons";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { getReportAttendance } from "@/src/lib/dashboardApiHandler";
import { ExportButton } from "../export/ExportButton";
import type { ExportColumn } from "../export/DashboardExcelExporter";

export type DiscrepancyFilter = "late" | "early" | "missedIn" | "missedOut";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: DiscrepancyFilter;
  type: string;   // card label
  color: string;
  count: number;  // monthly count from the card
}

function toLocalDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

const raw = (val: unknown): string => {
  if (val === null || val === undefined) return "—";
  const s = String(val).trim();
  return s === "" ? "—" : s;
};

// A time string like "04:33" / "00:00" / "" — true only when it carries minutes.
function nonZeroTime(v?: string | null): boolean {
  if (!v) return false;
  return /[1-9]/.test(String(v));
}

function matchesFilter(rec: any, filter: DiscrepancyFilter): boolean {
  const mp = String(rec?.MissedPunch ?? "");
  const st = String(rec?.AttendanceStatus ?? "");
  switch (filter) {
    case "late": return nonZeroTime(rec?.LateMinutes);
    case "early": return nonZeroTime(rec?.EarlyOutMinutes);
    // Match on attendance status OR the MissedPunch label.
    case "missedIn": return st === "MI" || /missed\s*in/i.test(mp);
    case "missedOut": return st === "MO" || /missed\s*out/i.test(mp);
    default: return false;
  }
}

// The type-specific detail column (header + value getter).
function detailColumn(filter: DiscrepancyFilter): { header: string; value: (rec: any) => string } {
  switch (filter) {
    case "late": return { header: "Late by", value: (r) => raw(r?.LateMinutes) };
    case "early": return { header: "Early by", value: (r) => raw(r?.EarlyOutMinutes) };
    case "missedIn":
    case "missedOut": return { header: "Status", value: (r) => raw(r?.AttendanceStatus ?? r?.MissedPunch) };
    default: return { header: "Detail", value: () => "—" };
  }
}

function iconFor(filter: DiscrepancyFilter, color: string): React.ReactNode {
  switch (filter) {
    case "late": return LateInIcon(color);
    case "early": return EarlyOutIcon(color);
    case "missedIn": return MissedInIcon(color);
    case "missedOut": return MissedOutIcon(color);
    default: return null;
  }
}

export default function DiscrepancyDetailModal({ open, onOpenChange, filter, type, color, count }: Props) {
  const { employeeId } = useAuthGuard();

  const [records, setRecords] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const { from_date, to_date } = useMemo(() => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from_date: toLocalDateStr(monthStart), to_date: toLocalDateStr(today) };
  }, []);

  // Fetch the month report once, the first time the modal opens.
  useEffect(() => {
    if (!open || loaded || !employeeId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getReportAttendance({
          employee_ids: employeeId,
          from_date,
          to_date,
          limit: 50,
          offset: 0,
        });
        if (!cancelled) {
          setRecords(res?.data || []);
          setLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load discrepancy detail:", err);
        if (!cancelled) setLoaded(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, loaded, employeeId, from_date, to_date]);

  useEffect(() => {
    if (open) setSearch("");
  }, [open, filter]);

  const detail = detailColumn(filter);

  const rows = useMemo(() => {
    return records
      .filter((rec) => matchesFilter(rec, filter))
      .map((rec) => {
        const d = rec?.WorkDate ? new Date(rec.WorkDate) : null;
        return {
          dateLabel: d ? d.toLocaleDateString("en-US", { day: "numeric", month: "short" }) : "—",
          dayLabel: d ? d.toLocaleDateString("en-US", { weekday: "short" }) : "—",
          checkIn: raw(rec?.PunchIn),
          checkOut: raw(rec?.PunchOut),
          detail: detail.value(rec),
          _sort: d ? d.getTime() : 0,
        };
      })
      .sort((a, b) => a._sort - b._sort);
  }, [records, filter, detail]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      [r.dateLabel, r.dayLabel, r.detail].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  const exportColumns: ExportColumn[] = [
    { header: "Date", key: "date", width: 14 },
    { header: "Day", key: "day", width: 10 },
    { header: "Check In", key: "checkIn", width: 14 },
    { header: "Check Out", key: "checkOut", width: 14 },
    { header: detail.header, key: "detail", width: 16 },
  ];

  const exportData = filtered.map((r) => ({
    date: r.dateLabel,
    day: r.dayLabel,
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    detail: r.detail,
  }));

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size="extraLarge" className="gap-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border-accent">
          <ResponsiveModalHeader className="flex-row items-center gap-3 text-left">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {iconFor(filter, color)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <ResponsiveModalTitle className="text-left normal-case text-base">
                {type}
              </ResponsiveModalTitle>
              <p className="text-xs text-text-secondary mt-0.5 font-normal normal-case">
                <span className="font-semibold" style={{ color }}>
                  {count} this month
                </span>
                {rows.length > 0 && (
                  <> &middot; {rows.length} day{rows.length !== 1 ? "s" : ""}</>
                )}
              </p>
            </div>
            <ExportButton
              data={exportData}
              columns={exportColumns}
              meta={{ title: type, filters: {} }}
            />
            <ResponsiveModalClose className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-background hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1">
              <XMarkIcon className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </ResponsiveModalClose>
          </ResponsiveModalHeader>
          {/* Search */}
          <div className="relative mt-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Search by date or day…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-full border border-border-grey bg-transparent pl-9 pr-4 text-sm font-normal text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[60vh] scrollbar-hide">
          {loading && !loaded ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              <p className="text-sm text-text-secondary font-medium">Loading data…</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
              >
                <p className="text-4xl font-bold" style={{ color }}>{count}</p>
              </div>
              <p className="text-text-secondary text-sm text-center">
                No matching days found for {type.toLowerCase()} this month.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-accent z-10 border-b border-border-accent">
                <tr className="text-text-secondary text-[11px] uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Day</th>
                  <th className="px-4 py-3 text-left">Check In</th>
                  <th className="px-4 py-3 text-left">Check Out</th>
                  <th className="px-4 py-3 text-left">{detail.header}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-text-secondary text-sm">
                      No days match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => (
                    <tr key={idx} className="border-b border-border-accent hover:bg-background transition-colors">
                      <td className="py-3 px-4 text-text-primary font-medium whitespace-nowrap tabular-nums">{r.dateLabel}</td>
                      <td className="py-3 px-4 text-text-secondary whitespace-nowrap">{r.dayLabel}</td>
                      <td className="py-3 px-4 text-text-secondary whitespace-nowrap tabular-nums">{r.checkIn}</td>
                      <td className="py-3 px-4 text-text-secondary whitespace-nowrap tabular-nums">{r.checkOut}</td>
                      <td className="py-3 px-4 text-sm font-semibold whitespace-nowrap" style={{ color }}>{r.detail}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && rows.length > 0 && (
          <div className="px-6 py-3 border-t border-border-accent bg-background flex items-center justify-between">
            <p className="text-xs text-text-secondary">
              Showing{" "}
              <span className="font-semibold text-text-primary">{filtered.length}</span>
              {search && (
                <> of <span className="font-semibold text-text-primary">{rows.length}</span></>
              )}{" "}
              day{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}