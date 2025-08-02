"use client";
import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";

interface Schedule {
  schedule_id: number;
  schedule_code: string;
  schedule_name: string;
  schedule_name_arb: string;
  sch_color: string;
}

interface StatusSelectorProps {
  status: string | null;
  onStatusChange: (newStatusCode: string) => void;
}

export function StatusSelector({
  status,
  onStatusChange,
}: StatusSelectorProps) {
  const { language } = useLanguage();
  const { data: scheduleListData } = useFetchAllEntity("schedule");
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    if (scheduleListData?.data?.length) {
      setSchedules(scheduleListData.data);
    }
  }, [scheduleListData]);

  if (!schedules.length) return null;

  const activeSchedule = schedules.find(
    (s) => s.schedule_code.toLowerCase().startsWith(status?.toLowerCase() || "")
  );

  const bgColor = activeSchedule?.sch_color;

  const formatStatusCode = (code: string | null): string => {
    if (!code) return "+";
    const trimmed = code.trim();
    return trimmed.length >= 3
      ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1, 3).toLowerCase()
      : trimmed;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="w-10 h-7 rounded text-white text-xs font-semibold mx-1 my-3"
          style={{
            backgroundColor:
              typeof status === "string" && status.trim() !== ""
                ? activeSchedule?.sch_color
                : "transparent",
            color: status ? "#fff" : "#9ba9d2",
          }}
        >
          {status ? formatStatusCode(status) : "+"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 bg-accent">
        <div className="grid grid-cols-2 gap-2">
          {schedules.map((schedule) => (
            <Button
              key={schedule.schedule_code}
              size="sm"
              onClick={() => onStatusChange(schedule.schedule_code)}
              className="w-full rounded-md text-white text-xs capitalize"
              style={{
                backgroundColor: schedule.sch_color,
              }}
            >
              {schedule.schedule_code}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
