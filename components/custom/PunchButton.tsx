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
      variant={"gradient"}
      className="flex items-center px-3 gap-2 rounded-md font-bold text-sm text-white hover:opacity-90"
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
