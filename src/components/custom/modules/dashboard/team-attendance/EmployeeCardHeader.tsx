"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useSelectedDate } from "@/src/store/useSelectedDate";
import { Calendar } from "@/src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { Calendar1Icon } from "@/src/icons/icons";
import { cn } from "@/src/lib/utils";
import { ExportButton } from "../export/ExportButton";
import type { ExportColumn } from "../export/DashboardExcelExporter";
import { useTeamAttendanceData } from "./TeamAttendanceDataProvider";

export const EmployeeCardHeader = () => {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const selectedDate = useSelectedDate((s) => s.date);
  const setSelectedDate = useSelectedDate((s) => s.setDate);
  const [localDate, setLocalDate] = useState<Date>(selectedDate);
  const { teamAttendanceDetails } = useTeamAttendanceData();

  useEffect(() => {
    setLocalDate(selectedDate);
  }, [selectedDate]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setLocalDate(newDate);
      setSelectedDate(newDate);
    }
  };

  const formatHrs = (v: any) => {
    if (!v || v === "0:00" || v === "00:00") return "0";
    const [h, m] = String(v).split(":");
    return `${Number(h) + Number(m) / 60}`;
  };

  const teamExportColumns: ExportColumn[] = [
    { header: "Metric", key: "metric", width: 22 },
    { header: "Value", key: "value", width: 14 },
  ];

  const teamExportData = teamAttendanceDetails
    ? [
        { metric: "Workforce", value: teamAttendanceDetails.Workforce ?? 0 },
        { metric: "Project Managers", value: teamAttendanceDetails.ProjectManagers ?? 0 },
        { metric: "Check-ins", value: teamAttendanceDetails.CheckInCount ?? 0 },
        { metric: "Check-outs", value: teamAttendanceDetails.CheckOutCount ?? 0 },
        { metric: "Approved Leaves", value: teamAttendanceDetails.ApprovedLeaves ?? 0 },
        { metric: "Absent", value: teamAttendanceDetails.AbsentCount ?? 0 },
        { metric: "Missed Check-in", value: teamAttendanceDetails.MissedCheckIn ?? 0 },
        { metric: "Missed Check-out", value: teamAttendanceDetails.MissedCheckOut ?? 0 },
        { metric: "Missing Hours", value: formatHrs(teamAttendanceDetails.MissingHours) },
        { metric: "Overtime", value: formatHrs(teamAttendanceDetails.Overtime) },
      ]
    : [];

  return (
    <div className="flex flex-row justify-between p-4">
      <div className="flex gap-2 items-center">
        <h5 className="cursor-pointer font-medium text-lg text-text-primary">
          {t?.emp_overview || "Employee Overview"}
        </h5>
        <ExportButton
          data={teamExportData}
          columns={teamExportColumns}
          meta={{
            title: "Employee Overview",
            filters: { Date: localDate?.toDateString() ?? "" },
          }}
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-auto h-9 border pl-3 pr-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2 justify-start",
              !localDate && "text-muted-foreground"
            )}
          >
            <Calendar1Icon width="14" height="16" />
            {localDate?.toDateString() || <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0 bg-accent" align="end">
          <Calendar
            mode="single"
            selected={localDate}
            onSelect={handleDateSelect}
            disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};