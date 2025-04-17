"use client";
import React, { useEffect, useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddRole from "@/forms/security/AddRole";
import AssignPriveleges from "@/forms/security/AssignPriveleges";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export default function Page() {
  const { modules } = useLanguage();
  const router = useRouter();
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, on_open_change] = useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  const handleCellClick = (data: any) => {
    console.log("Cell Clicked:", data);
    setSelectedRowData(data);
    setIsModalOpen(true);
  };
  
  const handleCellClickPath = (data: any) => {
    console.log("Clicked Data:", data); // Debugging
    if (data?.name_en) {
      router.push(`/security/roles/assign-roles?role=${data.name_en}`);    } else {
      console.error("Error: No code found for this row", data);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    on_open_change(true);
  };

  const handleSave = (id: string | null, newData: any) => {
    if (id) {
      // Update existing row
      SetData((prevData: any) =>
        prevData.map((row: any) => (row.id === id ? { ...row, ...newData } : row))
      );
    } else {
      // Add new row
      SetData((prevData: any) => [...prevData, { id: Date.now().toString(), ...newData }]);
    }
    setSelectedRowData(null);
  };


  const [Columns, setColumns] = useState([
    { field: "name_en", headerName: "Name (English)" },
    { field: "name_ar", headerName: "Name (العربية)" },
    { field: "privileges", clickable: true, onCellClick: handleCellClick },
    { field: "assign_role", headerName: "Assign Role", clickable: true, onCellClick: handleCellClickPath },
    { field: "users" },
  ]);

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
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.security?.items}
        modal_title="Roles"
       //modal_description="Select the Roles of user"
        modal_component={
          <AddRole 
            on_open_change={on_open_change}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
      />
      <PowerTable props={props} Data={Data} api={"/security/roles"} showEdit={true} onEditClick={handleEditClick}/>
      {isModalOpen && selectedRowData && (
        <AssignPriveleges
          modal_props={{
            open: isModalOpen,
            on_open_change: setIsModalOpen,
          }}
        />
      )}

    </div>
  );
}
