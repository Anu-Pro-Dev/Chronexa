"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface StatusSelectorProps {
  status: string | null;
  onStatusChange: (newStatus: string) => void;
}

export function StatusSelector({
  status,
  onStatusChange,
}: StatusSelectorProps) {
  if (!status) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={`w-20 ${
            status === "Day"
              ? "bg-green-500 hover:bg-green-600"
              : status === "Friday"
              ? "bg-purple-500 hover:bg-purple-600"
              : ""
          }`}
        >
          {status}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="default"
            onClick={() => onStatusChange("Normal")}
            className="w-full"
          >
            Nor
          </Button>
          <Button
            variant="destructive"
            onClick={() => onStatusChange("Night")}
            className="w-full"
          >
            Nig
          </Button>
          <Button
            variant="success"
            onClick={() => onStatusChange("Day")}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            Day
          </Button>
          <Button
            
            onClick={() => onStatusChange("Friday")}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            Fri
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
