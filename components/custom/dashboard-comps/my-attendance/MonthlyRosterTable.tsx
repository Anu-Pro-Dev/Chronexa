"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MonthlyRosterTableProps {
  month: string;
}

const MonthlyRosterTable: React.FC<MonthlyRosterTableProps> = ({ month }) => {
  // Sample data - in a real app, this would come from an API
  const data = [
    {
      date: "01",
      day: "Monday",
      schedule: "Morning Shift",
      workHours: "8:00 AM - 4:00 PM",
      status: "Present"
    },
    {
      date: "02",
      day: "Tuesday",
      schedule: "Morning Shift",
      workHours: "8:00 AM - 4:00 PM",
      status: "Present"
    },
    // Add more sample data as needed
  ];

  return (
    <div className="w-full">
      <div className="bg-primary/5 p-4 mb-4 rounded-lg">
        <h3 className="text-lg font-semibold text-primary">Monthly Roster Schedule</h3>
        <p className="text-sm text-muted-foreground">Schedule for {month}</p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] font-bold">Date</TableHead>
            <TableHead className="font-bold">Day</TableHead>
            <TableHead className="font-bold">Schedule</TableHead>
            <TableHead className="font-bold">Work Hours</TableHead>
            <TableHead className="font-bold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{row.date}</TableCell>
              <TableCell>{row.day}</TableCell>
              <TableCell>{row.schedule}</TableCell>
              <TableCell>{row.workHours}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MonthlyRosterTable;
