"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/providers/LanguageProvider";
import { Button } from "../ui/button";
import { usePunch } from "../../providers/PunchProvider";
import { PunchInIcon, PunchOutIcon } from "@/icons/icons";

export function PunchButton() {
  const { translations } = useLanguage();
  const t = translations?.buttons || {};
  const { isPunchedIn, punchInTime, togglePunch } = usePunch();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Button
        variant={"gradient"}
        className="flex items-center px-3 gap-2 rounded-md font-bold text-sm text-accent hover:opacity-90"
        disabled
      >
        <PunchInIcon/>
        <span>Loading...</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={togglePunch}
      variant={"gradient"}
      className="flex items-center px-3 gap-2 rounded-md font-bold text-sm text-accent hover:opacity-90"
    >
      {isPunchedIn ? (
        <>
          <PunchOutIcon/>
          <span>{t?.punch_out}</span>
        </>
      ) : (
        <>
          <PunchInIcon/>
          <span>{t?.punch_in}</span>
        </>
      )}
    </Button>
  );
}