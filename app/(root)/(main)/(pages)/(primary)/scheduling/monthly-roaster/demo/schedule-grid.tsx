"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { Category, scheduleData } from "./data";
import { StatusSelector } from "./status-selector";

// Generate array of numbers 1-15 for column headers
const columnNumbers = Array.from({ length: 15 }, (_, i) => i + 1);

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              {columnNumbers.map((num) => (
                <TableHead key={num} className="text-center">
                  {num}
                </TableHead>
              ))}
              <TableHead className="text-right">Work hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((category: any, categoryIndex: any) => (
              <React.Fragment key={category.name}>
                <TableRow className="bg-muted/20">
                  <TableCell
                    colSpan={20}
                    className="font-semibold text-primary"
                  >
                    {category.name}
                  </TableCell>
                </TableRow>
                {category.subcategories.map((subcategory: any, subcategoryIndex: any) => (
                  <React.Fragment key={subcategory.name}>
                    <TableRow className="bg-muted/10">
                      <TableCell colSpan={20} className="pl-8">
                        {subcategory.name}
                      </TableCell>
                    </TableRow>
                    {subcategory.rows.map((row: any, rowIndex: any) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>{row.number}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.version}</TableCell>
                        <TableCell>
                          <Lock className="h-4 w-4" />
                        </TableCell>
                        {row.slots.map((slot: any, slotIndex: any) => (
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

      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <Select defaultValue="10">
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Records per page</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            ←
          </Button>
          <Button variant="outline">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="secondary">4</Button>
          <Button variant="outline">5</Button>
          <div className="px-2">...</div>
          <Button variant="outline">15</Button>
          <Button variant="outline" size="icon">
            →
          </Button>
        </div>
      </div>
    </div>
  );
}
