"use client";
import React, { useEffect, useState, useCallback } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddLocations from "@/forms/company-master/AddLocations";
import { useLanguage } from "@/providers/LanguageProvider";
import { getAllLocations } from "@/lib/apiHandler";

export default function Page() {
  const { modules, language } = useLanguage();

  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const props = {
    Data: data,
    SetData: setData,
    Columns: columns,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: setCurrentPage,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    open,
    on_open_change: setOpen,
    SearchValue: searchValue,
    SetSearchValue: setSearchValue,
  };

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

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

  // Fetch locations once on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getAllLocations();
        if (response?.success && Array.isArray(response?.data)) {
          const mapped = response.data.map((loc: any) => {
            const pointMatch = loc.geolocation?.match(/\(([^)]+)\)/);
            if (pointMatch) {
              const [lng, lat] = pointMatch[1].split(" ");
              return {
                ...loc,
                geolocation: `${lat}, ${lng}`,
                id: loc.location_id,
              };
            } else {
              return {
                ...loc,
                geolocation: "",  // or null
                id: loc.location_id,
              };
            }
          });
          setData(mapped);
        } else {
          console.error("Unexpected response structure:", response);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    setOpen(true);
  }, []);

  const handleSave = useCallback((id: string | null, newData: any) => {
    const pointMatch = newData.geolocation?.match(/\(([^)]+)\)/);
    let coordinates = newData.geolocation;
    if (pointMatch) {
      const [lng, lat] = pointMatch[1].split(" ");
      coordinates = `${lat}, ${lng}`;
    }

    const formattedData = { ...newData, geolocation: coordinates };

    const dataWithId = {
      ...formattedData,
      id: formattedData.id ?? formattedData.location_id ?? null,
    };

    setData((prevData) =>
      id
        ? prevData.map((row) => (row.id === id ? { ...row, ...dataWithId } : row))
        : [...prevData, dataWithId]
    );

    setSelectedRowData(null);
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
        Data={data}
        showEdit={true}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
      />
    </div>
  );
}