"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/src/providers/LanguageProvider";
import { Button } from "@/src/components/ui/button";
import { usePunch } from "@/src/providers/PunchProvider";
import { PunchInIcon, PunchOutIcon } from "@/src/icons/icons";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { addEventTransaction, serverTimeZoneRequest } from "@/src/lib/apiHandler";

export function PunchButton() {
  const { translations } = useLanguage();
  const t = translations?.buttons || {};
  const { isPunchedIn, punchInTime, togglePunch } = usePunch();
  const { employeeId } = useAuthGuard();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePunchClick = async () => {
    if (!employeeId) {
      console.error("Employee ID not found");
      return;
    }

    setIsLoading(true);

    try {
      const serverResponse = await serverTimeZoneRequest();
      const rawTime = serverResponse?.time;

      const formattedTime = rawTime && !isNaN(Date.parse(rawTime))
        ? rawTime
        : new Date().toISOString();

      const transactionData = {
        employee_id: employeeId,
        transaction_time: rawTime, 
        reason: isPunchedIn ? "OUT" : "IN",
        user_entry_flag: true,
        transaction_type: isPunchedIn ? "OUT" : "IN",
        remarks: "Web Punch",
        device_id: 2,
      };

      const response = await addEventTransaction(transactionData);

      if (response.success || response) {
        togglePunch();
      }

    } catch (error) {
      console.error("Error during punch transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <Button
        variant={"gradient"}
        className="flex items-center px-3 gap-2 rounded-md font-bold text-sm text-white hover:opacity-90"
        disabled
      >
        <PunchInIcon/>
        <span>Loading...</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePunchClick}
      variant={"gradient"}
      className="flex items-center px-3 gap-2 rounded-md font-bold text-sm text-white hover:opacity-90"
      disabled={isLoading || !employeeId}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Processing...</span>
        </>
      ) : isPunchedIn ? (
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