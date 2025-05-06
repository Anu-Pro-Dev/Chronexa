"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/legacy/image";
import { PunchInIcon, PunchOutIcon } from "@/icons/icons";
import { usePunch } from "@/providers/PunchProvider";

function TimerCard() {
  const { 
    isPunchedIn, 
    punchInTime, 
    punchOutTime, 
    elapsedSeconds,
    updateElapsedSeconds 
  } = usePunch();

  // Use useRef to store the interval ID
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    // Start timer if punched in
    if (isPunchedIn) {
      timerInterval.current = setInterval(() => {
        // Update elapsed seconds directly
        updateElapsedSeconds(elapsedSeconds + 1);
      }, 1000);
    }

    // Cleanup on unmount or when punch state changes
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isPunchedIn, elapsedSeconds, updateElapsedSeconds]);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const remainingSeconds = elapsedSeconds % 60;

  // Calculate remaining time (8-hour workday)
  const totalWorkSeconds = 8 * 3600;
  const remainingWorkSeconds = Math.max(0, totalWorkSeconds - elapsedSeconds);
  const remainingHours = Math.floor(remainingWorkSeconds / 3600);
  const remainingMinutes = Math.floor((remainingWorkSeconds % 3600) / 60);

  // Calculate overtime
  const overtimeSeconds = Math.max(0, elapsedSeconds - totalWorkSeconds);
  const overtimeHours = Math.floor(overtimeSeconds / 3600);
  const overtimeMinutes = Math.floor((overtimeSeconds % 3600) / 60);

  return (
    <div className="shadow-card relative rounded-[10px] bg-gradient-to-bl from-[#0078D4] to-[#003E6E] text-accent p-4 flex flex-col items-center">
      <Image
        src="/clock-bg.svg"
        alt="Clock Your Hours"
        objectFit="cover"
        layout="fill"
        className="blur-[2px] !absolute"
        priority
      />
      <h5 className="text-base font-bold">Clock your hours</h5>
      <p className={`text-[35px] font-bold align-center py-4 ${isPunchedIn ? '' : ''}`}>
        {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {remainingSeconds.toString().padStart(2, "0")}
      </p>
      <div className="flex gap-8">
        <div className="flex text-center items-center flex-col rounded-[10px] bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.23)] text-xs px-4 py-2">
          <p className="font-semibold pb-1">Remaining</p>
          <p className="text-[13px] font-bold">
            {remainingHours.toString().padStart(2, "0")}:
            {remainingMinutes.toString().padStart(2, "0")}
          </p>
        </div>
        <div className="flex text-center items-center flex-col rounded-[10px] bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.23)] text-xs px-4 py-2">
          <p className="font-semibold pb-1">Overtime</p>
          <p className="text-[13px] font-bold">
            {overtimeHours.toString().padStart(2, "0")}:
            {overtimeMinutes.toString().padStart(2, "0")}
          </p>
        </div>
        <div className="flex text-center items-center flex-col rounded-[10px] bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.23)] text-xs px-4 py-2">
          <p className="font-semibold pb-1">Break Time</p>
          <p className="text-[13px] font-bold">00:30</p>
        </div>
      </div>
      <div className="w-full pt-5 flex justify-between uppercase">
        <div className="flex items-center gap-2 font-bold text-xs">
          <PunchInIcon/>
          <p>{punchInTime || "_ _ : _ _"}</p>
        </div>
        <div className="flex items-center gap-2 font-bold text-xs">
          <PunchOutIcon/>
          <p>{punchOutTime || "_ _ : _ _"}</p>
        </div>
      </div>
    </div>
  );
}

export default TimerCard;
