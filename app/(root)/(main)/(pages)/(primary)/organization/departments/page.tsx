"use client";
import React, { useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import DepartmentAdmins from "@/forms/organization/DepartmentAdmins";

export default function Page() {
  const { modules } = useLanguage();
  const router = useRouter();

  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCellClick = (data: any) => {
    console.log("Cell Clicked:", data);
    setSelectedRowData(data); // Store clicked row data
    setIsModalOpen(true); // Open the modal
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // Close the modal
  };

  const handleEditClick = (data: any) => {
    setSelectedRowData(data);
    router.push("/organization/departments/add");
  };

  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "name" },
    { field: "organization", clickable: true, onCellClick: handleCellClick },
    { field: "from_date", headerName: "From date" },
    { field: "to_date", headerName: "To date" },
    { field: "active" },
    { field: "created_by", headerName: "Created" },
    { field: "updated", headerName: "Updated" },
  ]);

  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");

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
    SearchValue,
    SetSearchValue,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.organization.items}
        isAddNewPagePath="/organization/departments/add"
      />
      <PowerTable props={props} api={"/organization/departments"} showEdit={true} onEditClick={handleEditClick} />
      
      {isModalOpen && selectedRowData && (
        <DepartmentAdmins
          modal_props={{
            open: isModalOpen,
            on_open_change: setIsModalOpen, // Pass function to update modal state
          }}
          rowData={selectedRowData} // Pass dynamic row data
        />
      )}
    </div>
  );
}
