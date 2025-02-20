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

export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "employee" },
    { field: "date" },
    { field: "from_date", headerName: "From date" },
    { field: "to_date", headerName: "To date" },
    { field: "from_time", headerName: "From time" },
    { field: "to_time", headerName: "To time" },
    { field: "remarks", headerName: "Status" },
  ]);
  const [open, on_open_change] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedOption, setSelectedOption] = useState<string>("");

  const options = [
    { value: "option1", label: "All" },
    { value: "option2", label: "Pending manger" },
    { value: "option3", label: "Pending HR" },
    { value: "option4", label: "Approved" },
    { value: "option5", label: "Rejected" },
    { value: "option6", label: "Cancelled" },
  ];
  
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
        disableDelete
        enableApprove
        enableReject
      />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Select onValueChange={setSelectedOption} value={selectedOption}>
            <SelectTrigger className="bg-white border-grey">
              <Label className="font-normal text-secondary">
                Status :
              </Label>
              <SelectValue placeholder="Choose status"/>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button size={"lg"} variant={"outline"}
                className="w-full bg-white px-4 flex justify-between border-grey"
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
                className="w-full bg-white px-4 flex justify-between border-grey"
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
      <div className="bg-white rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">Permission Approval</h1>
          <h1 className="font-semibold text-sm text-text-secondary">
            Permission approval can be viewed in this tab
          </h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.manage_permissions?.items} />
        </div>
        <PowerTable props={props} api={"/self-services/manage-permissions/application"} />
      </div>
    </div>
  );
}
