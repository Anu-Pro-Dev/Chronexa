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
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ClockIcon, VoilationIcon } from "@/src/icons/icons";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { ExportButton } from "../export/ExportButton";
import type { ExportColumn } from "../export/DashboardExcelExporter";
import { useDashboardStore } from "@/src/store/useDashboardStore";

interface ViolationDrillDownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  filter: string;
  count: number;
  color: string;
  summaryId: number;
}

interface EmployeeRow {
  EmployeeID: string;
  EmployeeName: string;
  TotalLate: number;
  TotalLateMinutes: number;
  TotalEarlyOut: number;
  TotalEarlyOutMinutes: number;
  TotalMissedPunch: number;
  TotalIncompleteDuty: number;
  TotalIncompleteDutyMinutes: number;
  DailyViolationsJSON?: string;
}

const violationIcons: Record<string, React.ReactNode> = {
  "Late": <ClockIcon color="#FF6347" />,
  "Early Out": <ArrowUpIcon className="size-5 text-[#FFBF00]" />,
  "Missed Punch": <VoilationIcon color="#0078D4" />,
  "Incomplete Duty": <ArrowDownIcon className="size-5 text-[#1E9090]" />,
};

type ColConfig = {
  headers: string[];
  cells: (emp: EmployeeRow) => React.ReactNode[];
};

function getColConfig(filter: string): ColConfig {
  switch (filter) {
    case "late":
      return {
        headers: ["Total Late", "Late Minutes"],
        cells: (emp) => [
          <span className="font-semibold text-text-primary">{emp.TotalLate}</span>,
          <span className="tabular-nums text-text-secondary">{emp.TotalLateMinutes}m</span>,
        ],
      };
    case "early":
      return {
        headers: ["Total Early Out", "Early Minutes"],
        cells: (emp) => [
          <span className="font-semibold text-text-primary">{emp.TotalEarlyOut}</span>,
          <span className="tabular-nums text-text-secondary">{emp.TotalEarlyOutMinutes}m</span>,
        ],
      };
    case "missed_punch":
      return {
        headers: ["Missed Punches"],
        cells: (emp) => [
          <span className="font-semibold text-text-primary">{emp.TotalMissedPunch}</span>,
        ],
      };
    case "incomplete_duty":
      return {
        headers: ["Incomplete Duty", "Duty Minutes"],
        cells: (emp) => [
          <span className="font-semibold text-text-primary">{emp.TotalIncompleteDuty}</span>,
          <span className="tabular-nums text-text-secondary">{emp.TotalIncompleteDutyMinutes}m</span>,
        ],
      };
    default:
      return { headers: [], cells: () => [] };
  }
}

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function AvatarCell({ name, color }: { name?: string; color: string }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
      style={{ backgroundColor: color }}
    >
      {getInitials(name)}
    </div>
  );
}

function ViolationDrillDownModal({ open, onOpenChange, type, filter, count, color, summaryId }: ViolationDrillDownModalProps) {
  const fetchWeeklyViolationDetail = useDashboardStore((s) => s.fetchWeeklyViolationDetail);
  const weeklyViolationDetailCache = useDashboardStore((s) => s.weeklyViolationDetailCache);
  const loading = useDashboardStore((s) => s.loadingWeeklyViolationDetail);

  const cacheKey = `${summaryId}_${filter}_10000`;
  const detailData: any = weeklyViolationDetailCache[cacheKey];

  const employees: EmployeeRow[] = detailData?.employees || [];
  const activeFilter: string = detailData?.activeFilter || filter;
  const total = detailData?.total ?? employees.length;

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open && summaryId) {
      fetchWeeklyViolationDetail(summaryId, filter);
    }
  }, [open, summaryId, filter, fetchWeeklyViolationDetail]);

  const colConfig = getColConfig(activeFilter);

  const filtered = useMemo(() => {
    if (!employees.length) return [];
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter((emp) =>
      [emp.EmployeeID, emp.EmployeeName].some((v) =>
        String(v).toLowerCase().includes(q)
      )
    );
  }, [employees, search]);

  const displayColumns: ExportColumn[] = [
    { header: "Employee Name", key: "name", width: 24 },
    { header: "Employee ID", key: "empId", width: 14 },
    ...colConfig.headers.map((h) => ({ header: h, key: h.toLowerCase().replace(/[^a-z0-9]/g, "_"), width: 16 } as ExportColumn)),
  ];

  const exportData = filtered.map((emp) => {
    const extra: Record<string, any> = {};
    const cells = colConfig.cells(emp);
    colConfig.headers.forEach((h, i) => {
      extra[h.toLowerCase().replace(/[^a-z0-9]/g, "_")] = (emp as any)[
        h === "Total Late" ? "TotalLate" :
        h === "Late Minutes" ? "TotalLateMinutes" :
        h === "Total Early Out" ? "TotalEarlyOut" :
        h === "Early Minutes" ? "TotalEarlyOutMinutes" :
        h === "Missed Punches" ? "TotalMissedPunch" :
        h === "Incomplete Duty" ? "TotalIncompleteDuty" :
        h === "Duty Minutes" ? "TotalIncompleteDutyMinutes" : ""
      ] ?? 0;
    });
    return {
      name: emp.EmployeeName,
      empId: emp.EmployeeID,
      ...extra,
    };
  });

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
              {violationIcons[type] || <VoilationIcon color={color} />}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <ResponsiveModalTitle className="text-left normal-case text-base">
                {type}
              </ResponsiveModalTitle>
              <p className="text-xs text-text-secondary mt-0.5 font-normal normal-case">
                <span className="font-semibold" style={{ color }}>
                  {count} violation{count !== 1 ? "s" : ""}
                </span>
                {employees.length > 0 && (
                  <> &middot; {total} employee{total !== 1 ? "s" : ""}</>
                )}
              </p>
            </div>
            <ExportButton
              data={exportData}
              columns={displayColumns}
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
              placeholder="Search by name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-full border border-border-grey bg-transparent pl-9 pr-4 text-sm font-normal text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto max-h-[60vh] scrollbar-hide">
          {loading && !detailData ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              <p className="text-sm text-text-secondary font-medium">Loading data…</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
              >
                <p className="text-4xl font-bold" style={{ color }}>{count}</p>
              </div>
              <p className="text-text-secondary text-sm text-center">
                No employees found for {type.toLowerCase()}.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-accent z-10 border-b border-border-accent">
                <tr className="text-text-secondary text-[11px] uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Employee ID</th>
                  {colConfig.headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={2 + colConfig.headers.length} className="py-16 text-center text-text-secondary text-sm">
                      No employees match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp, idx) => {
                    const extraCells = colConfig.cells(emp);
                    return (
                      <tr
                        key={emp.EmployeeID || idx}
                        className="border-b border-border-accent hover:bg-background transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <AvatarCell name={emp.EmployeeName} color={color} />
                            <div className="min-w-0 max-w-[264px]">
                              <p className="font-semibold text-text-primary truncate leading-tight text-sm">
                                {emp.EmployeeName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-secondary tabular-nums">
                          {emp.EmployeeID}
                        </td>
                        {extraCells.map((cell, i) => (
                          <td key={i} className="py-3 px-4 text-sm">{cell}</td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        {!loading && employees.length > 0 && (
          <div className="px-6 py-3 border-t border-border-accent bg-background flex items-center justify-between">
            <p className="text-xs text-text-secondary">
              Showing{" "}
              <span className="font-semibold text-text-primary">{filtered.length}</span>
              {search && (
                <> of <span className="font-semibold text-text-primary">{total}</span></>
              )}{" "}
              employee{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

export default ViolationDrillDownModal;
