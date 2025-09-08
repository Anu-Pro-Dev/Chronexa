"use client";

import * as React from "react";
import { Label } from "@/src/components/ui/label";
import { TimePickerInput } from "./time-picker-input";

import { Period } from "./time-picker-utils";
import { TimePeriodSelect } from "./period-select";

interface TimePickerProps {
  date: Date | undefined | any;
  setDate: (date: Date | undefined) => void;
  showPeriod?: boolean;
}

export function TimePicker({ date, setDate, showPeriod = true }: TimePickerProps) {
  const [period, setPeriod] = React.useState<Period>("AM");

  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);
  const periodRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-end gap-2 p-3 rounded-md border-none bg-accent text-text-primary shadow-dropdown">
      <div className="grid gap-2 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <TimePickerInput
          picker="12hours"
          period={period}
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <span className="h-10 flex justify-center items-center text-base">:</span>
      <div className="grid gap-2 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <TimePickerInput
          picker="minutes"
          id="minutes12"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={showPeriod ? () => periodRef.current?.focus() : undefined}
        />
      </div>
      {showPeriod && (
        <div className="grid gap-2 text-center">
          <Label htmlFor="period" className="text-xs">
            Period
          </Label>
          <TimePeriodSelect
            period={period}
            setPeriod={setPeriod}
            date={date}
            setDate={setDate}
            ref={periodRef}
            onLeftFocus={() => secondRef.current?.focus()}
          />
        </div>
      )}
    </div>
  );
}
