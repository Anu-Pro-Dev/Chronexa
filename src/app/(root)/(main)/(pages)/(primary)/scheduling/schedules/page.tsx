"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useScheduleEditStore } from "@/src/stores/scheduleEditStore";
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
      { 
        field: "schedule_code", 
        headerName: t.code || "Schedule Code", 
        cellRenderer: (row: any) =>
         (row["schedule_code"] || "").toUpperCase(),
      },
      {
        field: "sch_color",
        headerName: t.color || "Color",
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
        headerName: t.organization || "Organization",
        cellRenderer: (row: any) =>
          row.organizations
            ? (language === "ar"
                ? row.organizations.organization_arb || row.organizations.organization_eng
                : row.organizations.organization_eng || row.organizations.organization_arb)
            : row.organization_id,
      },
      { field: "in_time", headerName: t.in_time || "In Time" },
      { field: "out_time", headerName: t.out_time || "Out Time" },
      { field: "required_work_hours", headerName: t.required_work_hrs || "Duration"},
    ]);
  }, [language, t]);

  const { data: scheduleData, isLoading, refetch } = useFetchAllEntity("schedule",{
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const data = useMemo(() => {
    if (Array.isArray(scheduleData?.data)) {
      return scheduleData.data.map((schedule: any) => {
        const formatTimeString = (timeString: string | null | undefined): string => {
          if (!timeString) return '';
          return timeString.includes('.') ? timeString.split('.')[0] : timeString;
        };

        const extractTimeFromISO = (dateTime: string | null | undefined): string => {
          if (!dateTime) return '';
          try {
            const timePart = dateTime.split('T')[1];
            if (timePart) {
              return timePart.split('.')[0];
            }
            return '';
          } catch (error) {
            console.error('Error extracting time:', dateTime, error);
            return '';
          }
        };

        return {
          ...schedule,
          id: schedule.schedule_id,
          in_time: extractTimeFromISO(schedule.in_time),
          out_time: extractTimeFromISO(schedule.out_time),
          required_work_hours: formatTimeString(schedule.required_work_hours),
        };
      });
    }
    return [];
  }, [scheduleData, language]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

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
    total: scheduleData?.total || 0,
    hasNext: scheduleData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange, 
  };
  
  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["schedule"] });
  }, [queryClient]);

  const setSelectedRowData = useScheduleEditStore((state) => state.setSelectedRowData);
  
  const handleEditClick = useCallback(
    (row: any) => {
      setSelectedRowData(row);
      router.push(`/scheduling/schedules/edit?id=${row.schedule_id}`);
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
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}