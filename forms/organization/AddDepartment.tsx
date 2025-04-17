"use client";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@/icons/icons";
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
} from "@/components/ui/select"
import Required from "@/components/ui/required"
import { TransferList } from "@/components/ui/transfer-list"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function AddDepartment() {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [showDetails, setShowDetails] = useState(false)

  const options = [
    { value: "option1", label: "Organization 1" },
    { value: "option2", label: "Organization 2" },
    { value: "option3", label: "Organization 3" },
  ];

  const initialUsers = Array.from({ length: 7 }, (_, i) => ({
    id: `emp-${i + 1}`,
    name: `DSG12 - User ${i + 1}`,
    selected: false,
  }));

  const initialOrganizations = Array.from({ length: 7 }, (_, i) => ({
    id: `org-${i + 1}`,
    name: `ORG - ${i + 1}`,
    selected: false,
  }));

  const [users, setUsers] = useState(initialUsers);
  const handleSelectionChange = (selectedItems: typeof initialUsers) => {
    setUsers((prev) =>
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
      {/* <div className="grid grid-cols-3 gap-4"> */}
        <div className="py-2">
          <Select onValueChange={setSelectedOption} value={selectedOption}>
            <SelectTrigger className="bg-white border-grey">
              <Label className="font-normal text-secondary">
                Organization : <Required />
              </Label>
              <SelectValue placeholder="Choose organization" />
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
      {/* </div> */}

      {/* {!showDetails ? (
        <div className="flex justify-end">
          <Button 
            size="lg" 
            onClick={() => setShowDetails(true)}
            className="bg-primary hover:bg-primary/90"
          >
            Add
          </Button>
        </div>
      ) : ( */}
        <>
          <div className="bg-white rounded-2xl flex flex-col gap-8 px-6 py-8">
            {/* <h1 className="font-bold text-xl text-primary">User</h1> */}
            <TransferList
              title="Users"
              items={users}
              onSelectionChange={handleSelectionChange}
              // height="200px"
            />
            <div className="w-full flex gap-2 items-center col-span-2 justify-end pt-2">
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

          {/* <div className="bg-white p-6 rounded-2xl pb-8">
            <h1 className="font-bold text-xl text-primary pb-4">Organization</h1>
            <TransferList
              title="Organizations"
              items={organizations}
              onSelectionChange={handleSelectionChangeOrg}
              // height="200px"
            />
          </div> */}

          {/* <div className="bg-white p-6 rounded-2xl pb-4">
            <Label className="font-bold text-xl text-primary">Remarks</Label>
            <Textarea 
              className="border border-border-accent shadow-searchbar my-4 mx-auto"
              rows={5} 
              placeholder="Enter your remarks here..."
            />
          </div> */}

          {/* <div>
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
          </div> */}
        </>
      {/* )} */}
    </div>
  );
}
