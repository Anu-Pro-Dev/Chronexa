"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useSelectedDate } from "@/src/stores/useSelectedDate";
import { Calendar } from "@/src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { Calendar1Icon } from "@/src/icons/icons";
import { cn } from "@/src/lib/utils";

export const EmployeeCardHeader = () => {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const selectedDate = useSelectedDate((s) => s.date);
  const setSelectedDate = useSelectedDate((s) => s.setDate);
  const [localDate, setLocalDate] = useState<Date>(selectedDate);

  useEffect(() => {
    setLocalDate(selectedDate);
  }, [selectedDate]);

  return (
    <div className="flex flex-row justify-between p-4">
      <div className="flex gap-2">
        <h5 className="cursor-pointer font-bold text-lg text-text-primary">
          {t?.emp_overview || "Employee Overview"}
        </h5>
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
            onSelect={(newDate) => {
              if (newDate) {
                setLocalDate(newDate);
                setSelectedDate(newDate); // triggers provider fetch
              }
            }}
            disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
