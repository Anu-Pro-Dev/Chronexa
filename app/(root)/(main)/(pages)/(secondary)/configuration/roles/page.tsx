"use client";
import React, { useEffect, useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import AddRole from "@/forms/configuration/AddRole";
import AssignPrivileges from "@/forms/configuration/AssignPrivileges";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export default function Page() {
  const { modules, language } = useLanguage();
  const router = useRouter();
  type Columns = {
    field: string;
    headerName?: string;
    clickable?: boolean;
    onCellClick?: (data: any) => void;
  };
  const [Columns, setColumns] = useState<Columns[]>([]);
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, on_open_change] = useState<boolean>(false);
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
  };

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  useEffect(() => {
    setColumns([
      {
        field: language === "ar" ? "name_ar" : "name_en",
        headerName: language === "ar" ? "اسم الدور" : "Role Name",
      },
      { field: "privileges", clickable: true, onCellClick: handleCellClick },
      { field: "assign_role", headerName: "Assign Role", clickable: true, onCellClick: handleCellClickPath },
      { field: "users" },
    ]);
  }, [language]);

  const handleCellClick = (data: any) => {
    setSelectedRowData(data);
    setIsModalOpen(true);
  };
  
  const handleCellClickPath = (data: any) => {
    if (data?.name_en) {
      router.push(`/configuration/roles/assign-roles?role=${data.name_en}`);    } else {
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

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.configuration?.items}
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
        <AssignPrivileges
          modal_props={{
            open: isModalOpen,
            on_open_change: setIsModalOpen,
          }}
          roleName={selectedRowData?.name_en ?? ""}
        />
      )}

    </div>
  );
}
