"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddLocations from "@/forms/company-master/AddLocations";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";
import { useDebounce } from "@/hooks/useDebounce"; 

export default function Page() {
  const { modules, language } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);

  useEffect(() => {
    setColumns([
      {
        field: "location_code",
        headerName: language === "ar" ? "رمز الموقع" : "Location Code",
      },
      {
        field: language === "ar" ? "location_arb" : "location_eng",
        headerName: language === "ar" ? "اسم الموقع" : "Location Name",
      },
      {
        field: "geolocation",
        headerName: language === "ar" ? "الإحداثيات الجغرافية" : "Geo Coordinates",
      },
      {
        field: "radius",
        headerName: language === "ar" ? "نصف القطر" : "Radius",
      },
    ]);
  }, [language]);

  const { data: locationsData, isLoading } = useFetchAllEntity("location", {
    searchParams: {
      name: debouncedSearchValue,
      code: debouncedSearchValue,
    },
  });

  const data = useMemo(() => {
    if (Array.isArray(locationsData?.data)) {
      return locationsData.data.map((loc: any) => {
        let geo = "";
        if (loc.geolocation) {
          const match = loc.geolocation.match(/\(([^)]+)\)/);
          if (match) {
            const [lng, lat] = match[1].split(" ");
            geo = `${lat}, ${lng}`;
          }
        }
        return {
          ...loc,
          id: loc.location_id,
          geolocation: geo,
        };
      });
    }
    return [];
  }, [locationsData]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

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
    SetCurrentPage: setCurrentPage,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: setSearchValue,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["location"] });
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
        items={modules?.companyMaster.items}
        entityName="location"
        modal_title="Locations"
        modal_component={
          <AddLocations
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        isLarge
      />
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