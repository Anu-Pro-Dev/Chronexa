"use client";

import * as React from "react";
import {useState} from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";

interface StatusSelectorProps {
  status: string | null;
  onStatusChange: (newStatus: string) => void;
}

export function StatusSelector({
  status,
  onStatusChange,
}: StatusSelectorProps) {

  const [popoverStates, setPopoverStates] = useState({
    scheduleSelect: false,
    toDate: false,
  });

  if (!status) return null;

  return (
    <Popover open={popoverStates.scheduleSelect} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, scheduleSelect: open }))}>
      <PopoverTrigger asChild>
        <Button
          size={'sm'}
          className={`w-8 h-7 rounded ${
            status === "Day"
              ? "bg-success hover:bg-success-100"
              : status === "Nig"
            ? "bg-destructive hover:bg-destructive-100"
              : status === "Fri"
              ? "bg-purple-500 hover:bg-purple-600"
              : "bg-primary hover:bg-primary-100"
          }`}
        >
          {status}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2 bg-accent">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size={'sm'}
            variant="default"
            onClick={() => onStatusChange("Nor")}
            className="w-full rounded-md"
          >
            Normal
          </Button>
          <Button
            size={'sm'}
            variant="destructive"
            onClick={() => onStatusChange("Nig")}
            className="w-full rounded-md"
          >
            Night
          </Button>
          <Button
            size={'sm'}
            variant="success"
            onClick={() => onStatusChange("Day")}
            className="w-full rounded-md"
          >
            Day
          </Button>
          <Button
            size={'sm'}
            onClick={() => onStatusChange("Fri")}
            className="w-full rounded-md bg-purple-500 hover:bg-purple-600"
          >
            Friday
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
