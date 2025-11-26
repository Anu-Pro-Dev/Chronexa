"use client";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { Calendar1Icon } from "@/src/icons/icons";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

export const EmployeeCardHeader = () => {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className='flex flex-row justify-between p-4'>
      <div className='flex gap-2'>
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
              !date && "text-muted-foreground"
            )}
          >
            <Calendar1Icon width="14" height="16" />
            {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-accent" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};