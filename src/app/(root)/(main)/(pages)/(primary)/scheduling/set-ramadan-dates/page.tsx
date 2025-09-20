"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddRamadanDateRange from "@/src/components/custom/modules/scheduling/AddRamadanDateRange";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.scheduling || {};

  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string | null>(null);

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  useEffect(() => {
    setColumns([
      {
        field: language === "ar" ? "ramadan_name_arb" : "ramadan_name_eng",
        headerName: t.ramadan_name,
      },
      { field: "from_date", headerName: t.from_date },
      { field: "to_date", headerName: t.to_date },
    ]);
  }, [language, t]);

  const { data: ramadanData, isLoading, refetch } = useFetchAllEntity("ramadan", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(year && { year }),
      ...(month && { month }),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const data = useMemo(() => {
    if (Array.isArray(ramadanData?.data)) {
      return ramadanData.data.map((ramadan: any) => ({
        ...ramadan,
        id: ramadan.ramadan_id,
        from_date: new Date(ramadan.from_date).toISOString().split('T')[0],
        to_date: new Date(ramadan.to_date).toISOString().split('T')[0],
      }));
    }
    return [];
  }, [ramadanData]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

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
    open,
    on_open_change: setOpen,
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
    total: ramadanData?.total || 0,
    hasNext: ramadanData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
    if (refetch) setTimeout(() => refetch(), 100);
  }, [refetch]);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYear(e.target.value);
    handleFilterChange();
  };

  const handleMonthChange = (val: string) => {
    setMonth(val);
    handleFilterChange();
  };
 
  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["ramadan"] });
  };
 
  const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    setOpen(true);
  }, []);
 
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.scheduling.items}
        entityName="ramadan"
        modal_title={t.ramadan_dates}
        modal_component={
          <AddRamadanDateRange
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        size="large"
      />
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-accent border-grey border-[1px] rounded-full flex items-center max-w-[350px]">
          <Label className="font-normal text-secondary w-auto px-3 min-w-[100px]">
            {t.year} :
          </Label>
          <Input
            placeholder="Enter year"
            value={year}
            onChange={handleYearChange}
            className="bg-accent border-none"
          />
        </div>
        <div>
          <Select onValueChange={handleMonthChange} value={month || ""}>
            <SelectTrigger className="bg-accent border-grey">
              <Label className="font-normal text-secondary">
                {t.month} :
              </Label>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <PowerTable
        props={props}
        showEdit={true}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}
