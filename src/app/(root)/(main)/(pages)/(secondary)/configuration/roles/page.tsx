"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddRole from "@/src/components/custom/modules/configuration/AddRole";
import AssignPrivileges from "@/src/components/custom/modules/configuration/AssignPrivileges";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const router = useRouter();
  
  type Columns = {
    field: string;
    headerName?: string;
    clickable?: boolean;
    onCellClick?: (data: any) => void;
  };
  
  const [columns, setColumns] = useState<Columns[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data: rolesData, isLoading } = useFetchAllEntity("secRole");

  const handleCellClick = useCallback((data: any) => {
    setSelectedRowData(data);
    setIsModalOpen(true);
  }, []);
  
  const handleCellClickPath = useCallback((data: any) => {
    if (data?.role_name) {
      router.push(`/configuration/roles/assign-roles?role=${data.role_name}`);
    } else {
      console.error("Error: No code found for this row", data);
    }
  }, [router]);

  const data = useMemo(() => {
    if (Array.isArray(rolesData?.data)) {
      return rolesData.data.map((role: any) => {
        return {
          ...role,
          id: role.id || role.role_id,
          privileges: "View",
          assign_role: "Users",
        };
      });
    }
    return [];
  }, [rolesData]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  useEffect(() => {
    setColumns([
      {
        field: "role_name",
        headerName: language === "ar" ? "اسم الدور" : "Role Name",
      },
      { field: "privileges", clickable: true, onCellClick: handleCellClick },
      { field: "assign_role", headerName: "Assign Role", clickable: true, onCellClick: handleCellClickPath },
      { field: "_count.sec_user_roles", headerName: "Users" },
    ]);
  }, [language, handleCellClick, handleCellClickPath]);

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

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleEditClick = useCallback((data: any) => {
    setSelectedRowData(data);
    setOpen(true);
  }, []);

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["secRole"] });
  };

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        disableAdd
        selectedRows={selectedRows}
        items={modules?.configuration?.items}
        entityName="secRole"
        modal_title="Roles"
        modal_component={
          <AddRole 
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
      />
      <PowerTable 
        props={props} 
        showEdit={false} 
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
      {isModalOpen && selectedRowData && (
        <AssignPrivileges
          modal_props={{
            open: isModalOpen,
            on_open_change: setIsModalOpen,
          }}
          roleName={selectedRowData?.role_name ?? ""}
          roleId={selectedRowData?.role_id || selectedRowData?.id}
        />
      )}
    </div>
  );
}