"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import FilterWeeklyScheduling from "@/src/components/custom/modules/scheduling/FilterWeeklyScheduling";
import { useDebounce } from "@/src/hooks/useDebounce"; 

type Column = {
  field: string;
  headerName: string;
  cellRenderer?: (row: any) => React.ReactNode;
};

export default function Page() {
  const router = useRouter();
  const [columns, setColumns] = useState<Column[]>([]);
  const { modules, language, translations } = useLanguage();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.scheduling || {};

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  useEffect(() => {
    setColumns([
      { field: "from_date", headerName: "From date" },
      { field: "to_date", headerName: "To date" },
      { 
        field: "monday_schedule_id", 
        headerName: "Monday",
        cellRenderer: (row: any) => (
          <span style={{ color: row.monday_schedule_color }}>
            {row.monday_schedule_id}
          </span>
        ),
      },
      { 
        field: "tuesday_schedule_id", 
        headerName: "Tuesday",
        cellRenderer: (row: any) => (
          <span style={{ color: row.tuesday_schedule_color }}>
            {row.tuesday_schedule_id}
          </span>
        ),
      },
      { 
        field: "wednesday_schedule_id", 
        headerName: "Wednesday",
        cellRenderer: (row: any) => (
          <span style={{ color: row.wednesday_schedule_color }}>
            {row.wednesday_schedule_id}
          </span>
        ),
      },
      { 
        field: "thursday_schedule_id", 
        headerName: "Thursday",
        cellRenderer: (row: any) => (
          <span style={{ color: row.thursday_schedule_color }}>
            {row.thursday_schedule_id}
          </span>
        ),
      },
      { 
        field: "friday_schedule_id", 
        headerName: "Friday",
        cellRenderer: (row: any) => (
          <span style={{ color: row.friday_schedule_color }}>
            {row.friday_schedule_id}
          </span>
        ),
      },
      { 
        field: "saturday_schedule_id", 
        headerName: "Saturday",
        cellRenderer: (row: any) => (
          <span style={{ color: row.saturday_schedule_color }}>
            {row.saturday_schedule_id}
          </span>
        ),
      },
    ]);
  }, [language]);

  const { data: organizationScheduleData, isLoading, refetch } = useFetchAllEntity("organizationSchedule",{
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const { data: scheduleData } = useFetchAllEntity("schedule");

  const scheduleMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (Array.isArray(scheduleData?.data)) {
      scheduleData.data.forEach((schedule: any) => {
        map[schedule.schedule_id] = schedule.schedule_code;
      });
    }
    return map;
  }, [scheduleData]);

  const scheduleColorMap = useMemo(() => {
  const map: Record<number, string> = {};
    if (Array.isArray(scheduleData?.data)) {
      scheduleData.data.forEach((schedule: any) => {
        map[schedule.schedule_id] = schedule.sch_color; // or whatever the color field is
      });
    }
    return map;
  }, [scheduleData]);

  const data = useMemo(() => {
    if (!Array.isArray(organizationScheduleData)) return [];

    return organizationScheduleData.map((orgSch: any) => ({
      id: orgSch.organization_schedule_id,
      from_date: new Date(orgSch.from_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      to_date: new Date(orgSch.to_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      monday_schedule_id: scheduleMap[orgSch.monday_schedule_id]?.trim() ?? "-",
      tuesday_schedule_id: scheduleMap[orgSch.tuesday_schedule_id]?.trim() ?? "-",
      wednesday_schedule_id: scheduleMap[orgSch.wednesday_schedule_id]?.trim() ?? "-",
      thursday_schedule_id: scheduleMap[orgSch.thursday_schedule_id]?.trim() ?? "-",
      friday_schedule_id: scheduleMap[orgSch.friday_schedule_id]?.trim() ?? "-",
      saturday_schedule_id: scheduleMap[orgSch.saturday_schedule_id]?.trim() ?? "-",
      sunday_schedule_id: scheduleMap[orgSch.sunday_schedule_id]?.trim() ?? "-",
      monday_schedule_color: scheduleColorMap[orgSch.monday_schedule_id] ?? "#000", // fallback black
      tuesday_schedule_color: scheduleColorMap[orgSch.tuesday_schedule_id] ?? "#000", // fallback black
      wednesday_schedule_color: scheduleColorMap[orgSch.wednesday_schedule_id] ?? "#000", // fallback black
      thursday_schedule_color: scheduleColorMap[orgSch.thursday_schedule_id] ?? "#000", // fallback black
      friday_schedule_color: scheduleColorMap[orgSch.friday_schedule_id] ?? "#000", // fallback black
      saturday_schedule_color: scheduleColorMap[orgSch.saturday_schedule_id] ?? "#000", // fallback black
      sunday_schedule_color: scheduleColorMap[orgSch.sunday_schedule_id] ?? "#000", // fallback black
    }));
  }, [organizationScheduleData, scheduleMap]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [currentPage, refetch]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [rowsPerPage, refetch]);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

  const props = {
    Data: data,
    Columns: columns,
    selectedRows,
    setSelectedRows,
    isLoading,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: organizationScheduleData?.total || 0,
    hasNext: organizationScheduleData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,  
  };
 
  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["organizationSchedule"] });
  };

  const handleEditClick = useCallback(
    (row: any) => {
      setSelectedRowData(row);
      router.push("/scheduling/weekly-schedule/add");
    },
    [router, setSelectedRowData]
  );

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.scheduling.items}
        entityName="organizationSchedule"
        isAddNewPagePath="/scheduling/weekly-schedule/add"
      />
      <div className="">
        {/* <FilterWeeklyScheduling/> */}
        <PowerTable
          props={props}
          showEdit={false}
          onEditClick={handleEditClick}
          onRowSelection={handleRowSelection}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

