"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useScheduleEditStore } from "@/src/stores/scheduleEditStore";

type Column = {
  field: string;
  headerName: string;
  cellRenderer?: (row: any) => React.ReactNode;
};

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [columns, setColumns] = useState<Column[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  useEffect(() => {
    setColumns([
      { 
        field: "schedule_code", 
        headerName: "Schedule Code", 
        cellRenderer: (row: any) =>
         (row["schedule_code"] || "").toUpperCase(),
      },
      {
        field: "sch_color",
        headerName: "Color",
        cellRenderer: (row: any) => (
          <div
            className="h-4 w-8"
            style={{
              backgroundColor: row.sch_color,
            }}
          ></div>
        ),
      },
      { 
        field: "organization_id", 
        headerName: "Organization",
        cellRenderer: (row: any) =>
          row.organizations
            ? (language === "ar"
                ? row.organizations.organization_arb || row.organizations.organization_eng
                : row.organizations.organization_eng || row.organizations.organization_arb)
            : row.organization_id,
      },
      { field: "in_time", headerName: "In Time" },
      { field: "out_time", headerName: "Out Time" },
      { field: "required_work_hours", headerName: "Duration"},
    ]);
  }, [language]);

  const { data: scheduleData, isLoading } = useFetchAllEntity("schedule");

  const data = useMemo(() => {
    if (Array.isArray(scheduleData?.data)) {
      return scheduleData.data.map((schedule: any) => ({
        ...schedule,
        id: schedule.schedule_id,
        in_time: new Date(schedule.in_time).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          // second: "2-digit",
          hour12: false,
        }),
        out_time: new Date(schedule.out_time).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          // second: "2-digit",
          hour12: false,
        }),
      }));
    }
    return [];
  }, [scheduleData, language]);

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
  
  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["schedule"] });
  }, [queryClient]);

  const setSelectedRowData = useScheduleEditStore((state) => state.setSelectedRowData);
  
  const handleEditClick = useCallback(
    (row: any) => {
      setSelectedRowData(row);
      router.push("/scheduling/schedules/add");
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
        entityName="schedule"
        isAddNewPagePath="/scheduling/schedules/add"
      />
      <PowerTable
        props={props}
        showEdit={false}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}

