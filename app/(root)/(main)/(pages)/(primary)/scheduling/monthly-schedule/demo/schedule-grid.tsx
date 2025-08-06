"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { UnlockIcon } from "@/icons/icons";
import { Category, scheduleData } from "../data";
import { StatusSelector } from "../status-selector";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const columnNumbers = Array.from({ length: 31 }, (_, i) => i + 1);

export default function ScheduleGrid() {
  const [data, setData] = React.useState<any>(scheduleData);

  const handleStatusChange = (
    categoryIndex: number,
    subcategoryIndex: number,
    rowIndex: number,
    slotIndex: number,
    newStatus: string
  ) => {
    setData((prevData: any) => {
      const newData = [...prevData];
      newData[categoryIndex].subcategories[subcategoryIndex].rows[
        rowIndex
      ].slots[slotIndex].status = newStatus as
        | "Normal"
        | "Night"
        | "Day"
        | "Friday";
      return newData;
    });
  };

  return (
    <div className="w-full">
      <div className="bg-accent p-3 rounded-t-2xl pb-6">
        <div className="w-full">
          <Table className="min-w-[1200px] w-full text-sm">
            <TableHeader>
              <TableRow className="table-header w-full">
                <TableHead className="h-12 w-12 px-4">
                  <Checkbox className="border-2 border-[#E5E7EB] rounded-[3px]" />
                </TableHead>
                <TableHead className="h-12 px-6 text-center">Number</TableHead>
                <TableHead className="h-12 px-6 text-center">Name</TableHead>
                <TableHead className="h-12 px-6 text-center">Version</TableHead>
                <TableHead className="h-12 w-10 px-6">Status</TableHead>
                {columnNumbers.map((num) => (
                  <TableHead key={num} className="h-12 w-7 text-center">
                    {num}
                  </TableHead>
                ))}
                <TableHead className="h-12 px-6 text-center">Work hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="table-content">
              {data.map((category: any, categoryIndex: any) => (
                <React.Fragment key={category.name}>
                  <TableRow className="bg-[#a3aed0e8]">
                    <TableCell
                      colSpan={20}
                      className="font-black text-[15px] text-text-content"
                    >
                      {category.name}
                    </TableCell>
                  </TableRow>
                  {category.subcategories.map((subcategory: any, subcategoryIndex: any) => (
                    <React.Fragment key={subcategory.name}>
                      <TableRow className="bg-[#a3aed040]">
                        <TableCell colSpan={20} className="pl-6 font-bold text-[15px] text-text-content">
                          {subcategory.name}
                        </TableCell>
                      </TableRow>
                      {subcategory.rows.map((row: any, rowIndex: any) => (
                        <TableRow key={row.id} className="text-text-content text-sm font-bold hover:bg-backdrop">
                          <TableCell className="w-12 px-4">
                            <Checkbox className="border-2 border-[#E5E7EB] rounded-[3px]" />
                          </TableCell>
                          <TableCell className="px-4 text-center">{row.number}</TableCell>
                          <TableCell className="px-4 text-center">{row.name}</TableCell>
                          <TableCell className="px-4 text-center">{row.version}</TableCell>
                          <TableCell className="w-10 px-4">
                            <div className="flex items-center justify-center h-full">
                              <UnlockIcon color="#0078d4" className="h-4"/>
                            </div>
                          </TableCell>
                          {row.slots.map((slot: any, slotIndex: 2) => (
                            <TableCell key={slotIndex} className="text-center">
                              <StatusSelector
                                status={slot.status}
                                onStatusChange={(newStatus) =>
                                  handleStatusChange(
                                    categoryIndex,
                                    subcategoryIndex,
                                    rowIndex,
                                    slotIndex,
                                    newStatus
                                  )
                                }
                              />
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            {row.hours}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-accent rounded-b-2xl flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <Select defaultValue="10">
            <SelectTrigger className="flex h-10 items-center justify-between whitespace-nowrap border border-border-grey px-3 py-2 ring-offset-background placeholder:text-text-secondary focus:outline-none focus:ring-0 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 max-w-[350px] w-20 text-sm font-normal text-secondary border-none shadow-lg bg-accent rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-secondary text-sm font-normal">Records per page</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="pagination" className="gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground font-normal false p-2 border-none outline-none rounded-[5px] h-6 w-6 flex justify-center items-center text-sm cursor-pointer bg-backdrop ml-2">
            <ChevronLeft className="h-4 w-4 text-secondary" />
          </Button>
          <Button variant="ghost" size="pagination" className="text-sm font-normal text-secondary">1</Button>
          <Button variant="ghost" size="pagination" className="gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground font-normal false p-2 border-none outline-none rounded-[5px] h-6 w-6 flex justify-center items-center text-sm cursor-pointer bg-backdrop">
            <ChevronRight className="h-4 w-4 text-secondary" />
          </Button>
        </div>
      </div>
    </div>
  );
}
