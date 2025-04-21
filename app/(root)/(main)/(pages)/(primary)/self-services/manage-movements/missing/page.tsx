"use client";
import React, { useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Required from "@/components/ui/required";

export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "employee" },
    { field: "date" },
    { field: "time_in", headerName: "Time In" },
    { field: "time_out", headerName: "Time Out" },
    { field: "applied_in", headerName: "Applied IN" },
    { field: "applied_out", headerName: "Applied OUT" },
    { field: "status" },
  ]);
  const [open, on_open_change] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  
  const props = {
    Data,
    SetData,
    Columns,
    open,
    on_open_change,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.selfServices?.items}
        disableAdd
      />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button size={"lg"} variant={"outline"}
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    From Date : <Required/>
                  </Label>
                  <span className="px-1 text-sm text-text-primary"> {fromDate ? format(fromDate, "dd/MM/yy") : "Choose date"}</span>
                </p>
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Popover>
          <PopoverTrigger asChild>
              <Button size={"lg"} variant={"outline"}
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    To Date : <Required/>
                  </Label>
                  <span className="px-1 text-sm text-text-primary"> {toDate ? format(toDate, "dd/MM/yy") : "Choose date"}</span>
                </p>
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={toDate} onSelect={setToDate} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">Missing Movements</h1>
          <h1 className="font-semibold text-sm text-text-secondary">
            Missing Movements can be viewed in this tab
          </h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.manage_movements?.items} />
        </div>
        <PowerTable props={props} Data={Data} api={"/self-services/manage-movements/missing"} />
      </div>
    </div>
  );
}
