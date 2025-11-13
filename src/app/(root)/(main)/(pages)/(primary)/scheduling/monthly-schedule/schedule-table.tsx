"use client";
import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusSelector } from "./status-selector";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { getEmployeeGroupByEmployeeId, editMonthlyRosterRequest, finalizeMonthlyRosterRequest } from "@/src/lib/apiHandler";
import {
  LockIcon,
  UnlockIcon,
  DeleteIcon,
  SaveIcon,
} from "@/src/icons/icons";
import { useShowToast } from "@/src/utils/toastHelper";

const columnNumbers = Array.from({ length: 31 }, (_, i) => i + 1);

interface ScheduleGridProps {
  groupFilter?: number | null;
  filterData?: any;
}

export default function ScheduleGrid({ groupFilter, filterData }: ScheduleGridProps = {}) {
  const { language, translations } = useLanguage();
  const showToast = useShowToast();
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [data, setData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [filterData]);

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  const searchParams = useMemo(() => {
    const params: any = {
      limit: String(rowsPerPage),
      offset: String(offset),
    };

    if (filterData) {
      if (filterData.organization_id) params.organization_id = String(filterData.organization_id);
      if (filterData.month) params.month = String(filterData.month);
      if (filterData.year) params.year = String(filterData.year);
      if (filterData.day) params.day = String(filterData.day);
      if (filterData.employee_id) params.employee_id = String(filterData.employee_id);
      if (filterData.manager_id) params.manager_id = String(filterData.manager_id);
      if (filterData.employee_group_id) params.employee_group_id = String(filterData.employee_group_id);
      if (filterData.schedule_id) params.schedule_id = String(filterData.schedule_id);
    }

    return params;
  }, [rowsPerPage, offset, filterData]);

  const { data: monthlyScheduleData, isLoading, refetch } = useFetchAllEntity("employeeMonthlyRoster", {
    searchParams,
  });

  const { data: scheduleListData } = useFetchAllEntity("schedule");
  const { data: employeeListData } = useFetchAllEntity("employee");

  const handleStatusChange = (
    rowId: number,
    dayIndex: number,
    scheduleId: number,
    statusCode: string
  ) => {
    setData((prevData: any) =>
      prevData.map((row: any) => {
        if (row.type !== "row" || row.id !== rowId) return row;

        const updatedSlots = [...row.slots];
        
        const formattedCode =
          statusCode.length >= 3
            ? statusCode.charAt(0).toUpperCase() + statusCode.slice(1, 3).toLowerCase()
            : statusCode;
        
        const scheduleItem = scheduleListData?.data?.find(
          (s: any) => s.schedule_id === scheduleId
        );
        
        updatedSlots[dayIndex] = {
          status: formattedCode,
          sch_color: scheduleItem?.sch_color || "",
          schedule_id: scheduleId,
        };

        return { ...row, slots: updatedSlots };
      })
    );
  };

  const handleRowSelection = (rowId: number, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allRowIds = data
        .filter((item) => item.type === "row")
        .map((item) => item.id);
      setSelectedRows(new Set(allRowIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const handleRowsPerPageChange = useCallback((value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
    
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    if (monthlyScheduleData?.hasNext) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, monthlyScheduleData?.hasNext, handlePageChange]);

  useEffect(() => {
    if (
      !monthlyScheduleData?.data ||
      !scheduleListData?.data ||
      !employeeListData?.data
    )
      return;

    async function processData() {
      const processedRows = [];

      if (groupFilter) {
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

        for (const [groupName, groupItems] of Object.entries(groupedData)) {
          processedRows.push({
            type: "group",
            name: groupName,
          });

          for (const item of groupItems) {
            processedRows.push(createRowData(item));
          }
        }
      } else {
        for (const item of monthlyScheduleData.data) {
          processedRows.push(createRowData(item));
        }
      }

      setData(processedRows);
    }

    function createRowData(item: any) {
      const empNo = item.emp_no || item.employee_master?.emp_no || `#${item.employee_id}`;
      
      let empName = "";
      if (language === "ar") {
        empName = item.employee_master?.firstname_arb || 
                  "";
      } else {
        empName = item.employee_master?.firstname_eng || 
                  "";
      }
      
      empName = empName.trim() || `Employee ${item.employee_id}`;

      const slots = Array.from({ length: 31 }, (_, i) => {
        const dayKey = `D${i + 1}`;
        const scheduleId = item[dayKey];
        const scheduleItem = scheduleListData.data.find(
          (s: any) => s.schedule_id === scheduleId
        );
        if (!scheduleItem) return { status: "", sch_color: "", schedule_id: null };

        const code = scheduleItem.schedule_code;
        const color = scheduleItem.sch_color;
        const formattedCode =
          code.length >= 3
            ? code.charAt(0).toUpperCase() + code.slice(1, 3).toLowerCase()
            : code;

        return {
          status: formattedCode,
          sch_color: color,
          schedule_id: scheduleId,
        };
      });

      return {
        type: "row",
        id: item.schedule_roster_id,
        number: empNo,
        name: empName,
        version: item.version_no,
        hours: "0",
        finalize_flag: item.finalize_flag || false,
        slots,
      };
    }

    processData();
  }, [monthlyScheduleData, scheduleListData, employeeListData, language, groupFilter]);

  const totalRecords = monthlyScheduleData?.total || 0;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const allRowsSelected = data.filter(item => item.type === "row").length > 0 && 
    data.filter(item => item.type === "row").every(item => selectedRows.has(item.id));

  const buildPayload = (row: any) => {
    const payload: any = { schedule_roster_id: row.id };

    row.slots.forEach((slot: any, index: number) => {
      const key = `D${index + 1}`;
      payload[key] = slot.schedule_id || null;
    });

    return payload;
  };

  const handleSave = async () => {
    try {
      for (const row of data) {
        if (row.type !== "row") continue;

        const payload = buildPayload(row);
        await editMonthlyRosterRequest(payload);
      }
      showToast("success", "saveroster_success");
      refetch();
    } catch (err) {
      console.error(err);
      showToast("error", "saveroster_error");
    }
  };

  const handleFinalize = async () => {
    if (selectedRows.size === 0) {
      showToast("error", "selectrow_error");
      return;
    }

    try {
      for (const rowId of selectedRows) {
        await finalizeMonthlyRosterRequest({
          schedule_roster_id: rowId,
        });
      }
      showToast("success", "finalizeroster_success");
      setSelectedRows(new Set());
      refetch();
    } catch (err) {
      console.error(err);
      showToast("error", "finalizeroster_error");
    }
  };

  const handleUnFinalize = async () => {
    if (selectedRows.size === 0) {
      showToast("error", "selectrow_error");
      return;
    }

    try {
      for (const rowId of selectedRows) {
        await editMonthlyRosterRequest({
          schedule_roster_id: rowId,
          finalize_flag: false
        });
      }
      showToast("success", "unfinalizeroster_success");
      setSelectedRows(new Set());
      refetch();
    } catch (err) {
      console.error(err);
      showToast("error", "unfinalizeroster_error");
    }
  };

  const handleClear = async () => {
    if (selectedRows.size === 0) {
      showToast("error", "selectrow_error");
      return;
    }

    try {
      for (const rowId of selectedRows) {
        const payload: any = { schedule_roster_id: rowId };
        for (let i = 1; i <= 31; i++) payload[`D${i}`] = null;

        await editMonthlyRosterRequest(payload);
      }

      showToast("success", "clearroster_success");
      setSelectedRows(new Set());
      refetch();
    } catch (err) {
      console.error(err);
      showToast("error", "clearroster_error");
    }
  };

  return (
    <div className="absolute w-full">
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-3">
        <Button size="sm" type="button" onClick={handleSave}>
          <SaveIcon /> {translations?.buttons?.save}
        </Button>

        <Button size="sm" type="button" variant="success" onClick={handleFinalize}>
          <LockIcon /> {translations?.buttons?.finalize}
        </Button>

        <Button size="sm" type="button" className="text-[#979797] bg-[#F3F3F3] border border-[#E7E7E7] hover:bg-[#E7E7E7]" onClick={handleUnFinalize}>
          <UnlockIcon /> {translations?.buttons?.un_finalize}
        </Button>

        {selectedRows.size > 0 && (
          <Button size="sm" type="button" variant="destructive" onClick={handleClear}>
            <DeleteIcon /> {translations?.buttons?.clear}
          </Button>
        )}
      </div>

      <div className="bg-accent rounded-t-2xl py-4 px-5 overflow-x-auto scrollbar-hide">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="table-header text-[15px]">
              <TableHead className="h-12 w-12 px-4">
                <Checkbox 
                  className="border-2 border-[#E5E7EB] rounded-[3px]"
                  checked={allRowsSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="h-12 w-[100px] px-4 text-center">
                {translations?.modules?.scheduling?.nmber || "Number"}
              </TableHead>
              <TableHead className="h-12 w-[150px] px-4 text-center">
                {translations?.modules?.scheduling?.name || "Name"}
              </TableHead>
              <TableHead className="h-12 w-[100px] px-4 text-center">
                {translations?.modules?.scheduling?.version || "Version"}
              </TableHead>
              <TableHead className="h-12 w-[70px] px-4 text-center">
                {translations?.modules?.scheduling?.status || "Status"}
              </TableHead>
              {columnNumbers.map((num) => (
                <TableHead
                  key={num}
                  className="h-12 w-[40px] px-[2px] text-center"
                >
                  {num}
                </TableHead>
              ))}
              <TableHead className="h-12 w-[100px] px-4 text-center">
                {translations?.modules?.scheduling?.work_hrs || "Work hours"}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="space-y-2">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={37} className="text-center py-8">
                  {translations?.buttons?.loading || "Loading"}...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={37} className="text-center py-8">
                  {filterData 
                    ? (translations?.modules?.scheduling?.no_rows || "No data found for the selected filters")
                    : (translations?.no_data || "Please apply filters to view data")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => {
                if (item.type === "group") {
                  return (
                    <TableRow key={`group-${index}`} className="bg-[#a3aed040]">
                      <TableCell
                        colSpan={37}
                        className="pl-6 font-bold text-[15px] text-text-content"
                      >
                        {item.name}
                      </TableCell>
                    </TableRow>
                  );
                }

                return (
                  <TableRow
                    key={item.id}
                    className="text-text-content text-sm font-bold hover:bg-backdrop"
                  >
                    <TableCell className="w-12 px-4">
                      <Checkbox 
                        className="border-2 border-[#E5E7EB] rounded-[3px]"
                        checked={selectedRows.has(item.id)}
                        onCheckedChange={(checked) => handleRowSelection(item.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="w-[100px] px-4 text-center">{item.number}</TableCell>
                    <TableCell className="w-[150px] px-4 text-center">{item.name}</TableCell>
                    <TableCell className="w-[100px] px-4 text-center">{item.version}</TableCell>
                    <TableCell className="w-[70px] px-4">
                      <div className="flex items-center justify-center h-full">
                        {item.finalize_flag ? (
                          <LockIcon color="#0078d4" className="h-4" />
                        ) : (
                          <UnlockIcon color="#0078d4" className="h-4" />
                        )}
                      </div>
                    </TableCell>

                    {item.slots.map((slot: any, slotIndex: number) => (
                      <TableCell
                        key={slotIndex}
                        className="p-0"
                      >
                        <StatusSelector
                          status={slot.status}
                          scheduleId={slot.schedule_id}
                          onStatusChange={(scheduleId, statusCode) =>
                            handleStatusChange(item.id, slotIndex, scheduleId, statusCode)
                          }
                        />
                      </TableCell>
                    ))}

                    <TableCell className="w-[100px] px-4 text-center">{item.hours}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="bg-accent rounded-b-2xl flex items-center justify-between px-5 py-0 pb-6">
        <div className="flex items-center space-x-2">
          <Select 
            value={rowsPerPage.toString()} 
            onValueChange={handleRowsPerPageChange}
          >
            <SelectTrigger className="w-20 h-10 border-none text-sm font-normal text-secondary bg-accent rounded-lg shadow-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-secondary text-sm font-normal">
            {translations?.records_per_page || "Records per page"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="pagination" 
            className="h-6 w-6 flex justify-center items-center bg-backdrop ml-2"
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 text-secondary" />
          </Button>
          <Button variant="ghost" size="pagination" className="text-sm font-normal text-secondary">
            {currentPage} / {totalPages || 1}
          </Button>
          <Button 
            variant="ghost" 
            size="pagination" 
            className="h-6 w-6 flex justify-center items-center bg-backdrop"
            onClick={handleNextPage}
            disabled={!monthlyScheduleData?.hasNext || isLoading}
          >
            <ChevronRight className="h-4 w-4 text-secondary" />
          </Button>
        </div>
      </div>
    </div>
  );
}