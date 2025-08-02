"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";
import FilterWeeklyScheduling from "@/forms/scheduling/FilterWeeklyScheduling";


type Column = {
  field: string;
  headerName: string;
  cellRenderer?: (row: any) => React.ReactNode;
};

export default function Page() {
  const { modules, language } = useLanguage();
  const router = useRouter();
  const [columns, setColumns] = useState<Column[]>([]);
  // const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();

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

  const { data: organizationScheduleData, isLoading } = useFetchAllEntity("organizationSchedule");
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

  console.log("Data:", data);
  const props = {
    Data: data,
    Columns: columns,
    selectedRows,
    setSelectedRows,
    isLoading,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: setCurrentPage,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: setSearchValue,
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
        <FilterWeeklyScheduling/>
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

