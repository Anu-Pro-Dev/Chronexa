"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UnlockIcon } from "@/icons/icons";
import { useLanguage } from "@/providers/LanguageProvider";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { getEmployeeGroupByEmployeeId } from "@/lib/apiHandler";

const columnNumbers = Array.from({ length: 31 }, (_, i) => i + 1);

export default function ScheduleGrid() {
  const { language } = useLanguage();
  const { data: monthlyScheduleData } = useFetchAllEntity("employeeMonthlyRoster");
  const { data: scheduleListData } = useFetchAllEntity("schedule");
  const { data: employeeListData } = useFetchAllEntity("employee");

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (
      !monthlyScheduleData?.data ||
      !scheduleListData?.data ||
      !employeeListData?.data
    )
      return;

    const employeeMap: Record<number, string> = {};
    employeeListData.data.forEach((emp: any) => {
      const fullName =
        language === "ar"
          ? `${emp.firstname_arb || ""}`.trim()
          : `${emp.firstname_eng || ""}`.trim();
      employeeMap[emp.employee_id] = fullName || `Emp ${emp.employee_id}`;
    });

    async function fetchGroups() {
      const groupCache: Record<number, string> = {};

      const employeesInSchedule: number[] = Array.from(
        new Set<number>(monthlyScheduleData.data.map((item: any) => item.employee_id))
      );

      const groupPromises = employeesInSchedule.map(async (empId: number) => {
        try {
          const res = await getEmployeeGroupByEmployeeId(empId);
          if (res?.success && res.data) {
            const groupName =
              language === "ar"
                ? res.data.employee_group_name_arb
                : res.data.employee_group_name_eng;
            groupCache[empId] = groupName || "Unknown Group";
          } else {
            groupCache[empId] = "Unknown Group";
          }
        } catch {
          groupCache[empId] = "Unknown Group";
        }
      });

      await Promise.all(groupPromises);

      const groupedData: Record<string, any[]> = {};
      monthlyScheduleData.data.forEach((item: any) => {
        const groupName = groupCache[item.employee_id] || "Unknown Group";
        if (!groupedData[groupName]) groupedData[groupName] = [];
        groupedData[groupName].push(item);
      });

      const subcategories = Object.entries(groupedData).map(
        ([groupName, groupItems]) => ({
          name: groupName,
          rows: groupItems.map((item: any, index: number) => {
            const emp = employeeListData.data.find((e: any) => e.employee_id === item.employee_id);
            const empNo = emp?.emp_no || `#${item.employee_id}`;
            const empName =
              language === "ar"
                ? `${emp?.firstname_arb || ""}`.trim()
                : `${emp?.firstname_eng || ""}`.trim();

            const slots = Array.from({ length: 31 }, (_, i) => {
              const dayKey = `D${i + 1}`;
              const scheduleId = item[dayKey];
              const scheduleItem = scheduleListData.data.find(
                (s: any) => s.schedule_id === scheduleId
              );
              if (!scheduleItem) return { status: "", sch_color: "" };

              const code = scheduleItem.schedule_code;
              const color = scheduleItem.sch_color;
              const formattedCode =
                code.length >= 3
                  ? code.charAt(0).toUpperCase() + code.slice(1, 3).toLowerCase()
                  : code;

              return {
                status: formattedCode,
                sch_color: color,
              };
            });

            return {
              id: item.schedule_roster_id,
              number: empNo,
              name: empName || `Emp ${item.employee_id}`,
              version: item.version_no,
              hours: "0",
              slots,
            };
          }),

        })
      );

      setData([
        {
          name: language === "ar" ? "كل الموظفين" : "All Employees",
          subcategories,
        },
      ]);
    }

    fetchGroups();
  }, [monthlyScheduleData, scheduleListData, employeeListData, language]);

  return (
    <div className="">
      <div className="bg-accent px-5 rounded-t-2xl py-4">
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="table-header">
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
          <TableBody className="space-y-2">
            {data.map((category) => (
              <React.Fragment key={category.name}>
                <TableRow className="bg-[#a3aed0e8]">
                  <TableCell
                    colSpan={40}
                    className="font-black text-[15px] text-text-content"
                  >
                    {category.name}
                  </TableCell>
                </TableRow>
                {category.subcategories.map((subcategory: any) => (
                  <React.Fragment key={subcategory.name}>
                    <TableRow className="bg-[#a3aed040]">
                      <TableCell
                        colSpan={40}
                        className="pl-6 font-bold text-[15px] text-text-content"
                      >
                        {subcategory.name}
                      </TableCell>
                    </TableRow>
                    {subcategory.rows.map((row: any) => (
                      <TableRow
                        key={row.id}
                        className="text-text-content text-sm font-bold hover:bg-backdrop"
                      >
                        <TableCell className="w-12 px-4">
                          <Checkbox className="border-2 border-[#E5E7EB] rounded-[3px]" />
                        </TableCell>
                        <TableCell className="px-4 text-center">{row.number}</TableCell>
                        <TableCell className="px-4 text-center">{row.name}</TableCell>
                        <TableCell className="px-4 text-center">{row.version}</TableCell>
                        <TableCell className="w-10 px-4">
                          <div className="flex items-center justify-center h-full">
                            <UnlockIcon color="#0078d4" className="h-4" />
                          </div>
                        </TableCell>
                        {row.slots.map((slot: any, slotIndex: number) => (
                          <TableCell
                            key={slotIndex}
                            className="text-center text-xs py-3 px-[2px]"
                          >
                            <div
                              key={slotIndex}
                              style={{
                                backgroundColor: slot.sch_color,
                                color: "#fff",
                                borderRadius: 4,
                                fontWeight: 700,
                                textTransform: "capitalize",
                                width: "40px",
                                height: "28px",
                                lineHeight: "28px",
                              }}
                            >
                              {slot.status}
                            </div>
                          </TableCell>
                        ))}
                        <TableCell className="text-right">{row.hours}</TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-accent rounded-b-2xl flex items-center justify-between px-5 py-0 pb-6">
        <div className="flex items-center space-x-2">
          <Select defaultValue="10">
            <SelectTrigger className="w-20 h-10 border-none text-sm font-normal text-secondary bg-accent rounded-lg shadow-lg">
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
          <Button variant="ghost" size="pagination" className="h-6 w-6 flex justify-center items-center bg-backdrop ml-2">
            <ChevronLeft className="h-4 w-4 text-secondary" />
          </Button>
          <Button variant="ghost" size="pagination" className="text-sm font-normal text-secondary">1</Button>
          <Button variant="ghost" size="pagination" className="h-6 w-6 flex justify-center items-center bg-backdrop">
            <ChevronRight className="h-4 w-4 text-secondary" />
          </Button>
        </div>
      </div>
    </div>
  );
}