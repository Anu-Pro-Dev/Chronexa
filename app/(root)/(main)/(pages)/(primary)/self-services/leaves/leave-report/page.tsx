"use client";
import React, { useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import AddLeaveReport from "@/forms/self-services/AddLeaveReport"

export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "name" },
    { field: "leave_type", headerName: "Leave type" },
    { field: "from_date", headerName: "From date" },
    { field: "to_date", headerName: "To date" },
    { field: "status", headerName: "Approve" },
  ]);
  const [open, on_open_change] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  
  const props = {
    Data,
    SetData,
    Columns,
    open,
    on_open_change,
  };

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    on_open_change(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader 
        props={props} 
        items={modules?.selfServices?.items} 
        isLarge
        modal_title="Leave Report"
       //modal_description="Choose the report details"
        modal_component={
          <AddLeaveReport on_open_change={on_open_change}/>
        }
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
                    From Date :
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
                    To Date :
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
          <h1 className="font-bold text-xl text-primary">Leave Report</h1>
          {/* <h1 className="font-semibold text-sm text-text-secondary">
            Leave report can be viewed in this tab
          </h1> */}
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.leaves?.items} />
        </div>
        <PowerTable props={props} Data={Data} api={"/self-services/leaves/leave-approval"} showEdit={true} onEditClick={handleEditClick}/>
      </div>
    </div>
  );
}
