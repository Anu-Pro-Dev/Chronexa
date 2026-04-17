"use client";
import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "@/src/components/ui/calendar";
import { CalendarIcon } from "@/src/icons/icons";
import { useSelectedDate } from "@/src/store/useSelectedDate";

interface CurrentDateProps {
  interactive?: boolean;
}

const CurrentDate: React.FC<CurrentDateProps> = ({ interactive = false }) => {
  const { date, setDate } = useSelectedDate();
  const [showCalendar, setShowCalendar] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCalendar) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCalendar]);

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div ref={ref} className="relative flex justify-center items-center bg-accent rounded-md px-2 h-9">
      <div
        className={`flex items-center gap-2 ${interactive ? "cursor-pointer select-none" : ""}`}
        onClick={() => interactive && setShowCalendar((p) => !p)}
      >
        <div className="w-7 h-7 bg-backdrop rounded-full flex justify-center items-center">
          <CalendarIcon className="w-4 h-4" />
        </div>
        <p className="text-sm text-text-primary font-semibold">{formattedDate}</p>
        {interactive && (
          <svg
            className={`w-3 h-3 text-text-secondary transition-transform duration-200 ${showCalendar ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {interactive && showCalendar && (
        <div
          className="fixed bg-accent shadow-xl rounded-lg border border-border z-[9999]"
          style={{
            top: ref.current
              ? ref.current.getBoundingClientRect().bottom + 8
              : 0,
            right: ref.current
              ? window.innerWidth - ref.current.getBoundingClientRect().right
              : 0,
          }}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) {
                setDate(d);
                setShowCalendar(false);
              }
            }}
            disabled={{ after: new Date() }}
          />
        </div>
      )}
    </div>
  );
};

export default CurrentDate;