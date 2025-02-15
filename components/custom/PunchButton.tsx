"use client";
import React from 'react';
import { Button } from "../ui/button";
import { usePunch } from "../../providers/PunchProvider";
import { PunchInIcon, PunchOutIcon } from "../../lib/svg/icons";

export function PunchButton() {
  const { isPunchedIn, punchInTime, togglePunch } = usePunch();

  return (
    <Button
      onClick={togglePunch}
      className="flex items-center gap-2 rounded-[10px] bg-gradient-to-bl from-[#0078D4] to-[#003E6E] hover:opacity-90"
    >
      {isPunchedIn ? (
        <>
          {PunchOutIcon()}
          <span>Punch Out</span>
        </>
      ) : (
        <>
          {PunchInIcon()}
          <span>Punch In</span>
        </>
      )}
    </Button>
  );
}
