"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Required from "@/components/ui/required";
import { AutoComplete } from "@/components/ui/autocomplete";
import { TransferList } from "@/components/ui/transfer-list";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function AddDepartment() {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedOption, setSelectedOption] = useState<string>("");

  const options = [
    { value: "option1", label: "Organization 1" },
    { value: "option2", label: "Organization 2" },
    { value: "option3", label: "Organization 3" },
  ];

  const initialEmployees = Array.from({ length: 20 }, (_, i) => ({
    id: `emp-${i + 1}`,
    name: `DSG12 - Employee ${i + 1}`,
    selected: false,
  }));

  const initialOrganizations = Array.from({ length: 20 }, (_, i) => ({
    id: `org-${i + 1}`,
    name: `ORG - ${i + 1}`,
    selected: false,
  }));

  const [employees, setEmployees] = useState(initialEmployees);
  const handleSelectionChange = (selectedItems: typeof initialEmployees) => {
    setEmployees((prev) =>
      prev.map((emp) => ({
        ...emp,
        selected: selectedItems.some((item) => item.id === emp.id),
      }))
    );
  };

  const [organizations, setOrganizations] = useState(initialOrganizations);
  const handleSelectionChangeOrg = (
    selectedItems: typeof initialOrganizations
  ) => {
    setOrganizations((prev) =>
      prev.map((emp) => ({
        ...emp,
        selected: selectedItems.some((item) => item.id === emp.id),
      }))
    );
  };

  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Select onValueChange={setSelectedOption} value={selectedOption}>
            <SelectTrigger className="">
              <h1>
                Organization: <Required />
              </h1>
              <SelectValue placeholder="Choose option" />
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
              <Button
                className={cn(
                  "w-full pl-3 text-left text-foreground font-normal rounded-2xl bg-white border"
                )}
              >
                {fromDate ? format(fromDate, "PPP") : "From date"}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
              <Button
                className={cn(
                  "w-full pl-3 text-left text-foreground font-normal rounded-2xl bg-white border"
                )}
              >
                {toDate ? format(toDate, "PPP") : "To date"}

                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={toDate} onSelect={setToDate} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="bg-white p-4 rounded-md">
        <h1 className="text-primary text-lg">Employees</h1>
        <div className="">
          <TransferList
            title="Employees"
            items={employees}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      </div>
      <div className="bg-white p-4 rounded-md">
        <h1 className="text-primary text-lg">Organization</h1>
        <div className="">
          <TransferList
            title="Organizations"
            items={organizations}
            onSelectionChange={handleSelectionChangeOrg}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-md">
        <Label className="text-primary pb-2">Remarks</Label>
        <Textarea />
      </div>

      <div>
        <div className="w-full flex gap-2 items-center col-span-2 justify-end">
          <Button
            variant="outline"
            type="button"
            size="lg"
            onClick={() => {
              router.push("/organization/departments");
            }}
          >
            Cancel
          </Button>

          <Button size="lg" type="submit">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
