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
import { exportTeamAttendance } from "@/src/lib/dashboardApiHandler";
import toast from "react-hot-toast";

export const EmployeeCardHeader = () => {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const selectedDate = useSelectedDate((s) => s.date);
  const setSelectedDate = useSelectedDate((s) => s.setDate);
  const [localDate, setLocalDate] = useState<Date>(selectedDate);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocalDate(selectedDate);
  }, [selectedDate]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setLocalDate(newDate);
      setSelectedDate(newDate);
      setOpen(false); // auto-close on selection
    }
  };

  const handleBackendExport = async () => {
    try {
      const pad = (n: number) => (n < 10 ? `0${n}` : n);
      const targetDate = localDate || selectedDate || new Date();
      const formattedDate = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`;

      const blob = await exportTeamAttendance("all", formattedDate);
      const filename = `Team_Attendance_all_${formattedDate}.xlsx`;

      const blobUrl = window.URL.createObjectURL(
        blob instanceof Blob
          ? blob
          : new Blob([blob], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })
      );
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Team attendance export downloaded successfully");
    } catch (error: any) {
      console.error("Error exporting team attendance:", error);
      toast.error(error?.message || "Failed to download Excel");
    }
  };

  return (
    <div className="flex flex-row justify-between p-4">
      <div className="flex gap-2 items-center">
        <h5 className="cursor-pointer font-bold text-lg text-text-primary">
          {t?.emp_overview || "Employee Overview"}
        </h5>
        <ExportButton
          onExport={handleBackendExport}
        />
      </div>

      <Popover open={open} onOpenChange={setOpen}>
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
