"use client";
import React, { useEffect, useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddLocations from "@/forms/company-master/AddLocations";
import { useLanguage } from "@/providers/LanguageProvider";
import { getAllLocations } from "@/lib/apiHandler";

export default function Page() {
  const { modules, language } = useLanguage();
  const [Columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [open, on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const props = {
    Data,
    SetData,
    Columns,
    SortField,
    CurrentPage,
    SetCurrentPage,
    SetSortField,
    SortDirection,
    SetSortDirection,
    open,
    on_open_change,
    SearchValue,
    SetSearchValue,
    // setSelectedRows,
  };

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  useEffect(() => {
    setColumns([
      { field: "location_code", headerName: language === "ar" ? "رمز الموقع" : "Location Code" },
      {
        field: language === "ar" ? "location_arb" : "location_eng",
        headerName: language === "ar" ? "اسم الموقع" : "Location Name",
      },
      { field: "geolocation", headerName: language === "ar" ? "الإحداثيات الجغرافية" : "Geo Coordinates" },
      { field: "radius", headerName: language === "ar" ? "نصف القطر" : "Radius" },
    ]);
  }, [language]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getAllLocations();
        if (response?.success && Array.isArray(response?.data)) {
          const mapped = response.data.map((loc: any) => {
            let coordinates = "";

            // Convert POINT(lng lat) to "lat, lng"
            const pointMatch = loc.geolocation?.match(/\(([^)]+)\)/);
            if (pointMatch) {
              const [lng, lat] = pointMatch[1].split(" ");
              coordinates = `${lat}, ${lng}`;
            }

            return {
              ...loc,
              geolocation: coordinates,
              id: loc.location_id,
            };
          });

          SetData(mapped);
        } else {
          console.error("Unexpected response structure:", response);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    on_open_change(true);
  };

  const handleSave = (id: string | null, newData: any) => {
    // Parse POINT(lng lat) to "lat, lng"
    let coordinates = newData.geolocation;
    const pointMatch = newData.geolocation?.match(/\(([^)]+)\)/);
    if (pointMatch) {
      const [lng, lat] = pointMatch[1].split(" ");
      coordinates = `${lat}, ${lng}`;
    }

    const formattedData = { ...newData, geolocation: coordinates };

    if (id) {
      SetData((prevData: any) =>
        prevData.map((row: any) => (row.id === id ? { ...row, ...formattedData } : row))
      );
    } else {
      SetData((prevData: any) => [
        ...prevData,
        { id: Date.now().toString(), ...formattedData },
      ]);
    }

    setSelectedRowData(null);
  };

  const handleRowSelection = (rows: any[]) => {
    console.log("Selected rows:", selectedRows);
    setSelectedRows(rows); // Update selected rows
  };

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
            on_open_change={on_open_change}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        isLarge
      />
      <PowerTable props={props} Data={Data} showEdit={true} onEditClick={handleEditClick} onRowSelection={handleRowSelection}/>
    </div>
  );
}
