"use client";
import React, { useEffect, useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddOrganizationType from "@/forms/organization/AddOrganizationType";
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
  };

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  useEffect(() => {
    setColumns([
      {field: "hierarchy", headerName: "Hierarchy"},
      {
        field: language === "ar" ? "descriptionArb" : "descriptionEng",
        headerName: language === "ar" ? "منظمة" : "Organization Type",
      },
    ]);
  }, [language]);

  // useEffect(() => {
  //   const fetchOrganizationTypes = async () => {
  //     try {
  //       const response = await getAllLocations();
  //       console.log(response);
  //       SetData(response);
  //     } catch (error) {
  //       console.error("Error fetching organization types:", error);
  //     }
  //   };
  //   fetchOrganizationTypes();
  // }, []);

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    on_open_change(true);
  };

  const handleSave = (id: string | null, newData: any) => {
    if (id) {
      SetData((prevData: any) =>
        prevData.map((row: any) => (row.id === id ? { ...row, ...newData } : row))
      );
    } else {
      SetData((prevData: any) => [...prevData, { id: Date.now().toString(), ...newData }]);
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
        items={modules?.organization.items}
        entityName="organizationType"
        modal_title="Organization Types"
        modal_component={
          <AddOrganizationType
            on_open_change={on_open_change}
            selectedRowData={selectedRowData}
            onSave={handleSave}
            existingRows={Data}
          />
        }
      />
      <PowerTable props={props} Data={Data} api={"/organization/types"} showEdit={true} onEditClick={handleEditClick} onRowSelection={handleRowSelection}/>
    </div>
  );
}
