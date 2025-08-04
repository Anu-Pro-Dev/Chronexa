"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const { modules, language } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    setColumns([
      { field: "permission_type_code", headerName: language === "ar" ? "الكود" : "Code" },
      {
        field: language === "ar" ? "permission_type_arb" : "permission_type_eng",
        headerName: language === "ar" ? "اسم سير العمل" : "Permission Name",
      },
      { field: "max_perm_per_day", headerName: language === "ar" ? "إذن ماكس" : "Max Permission" },
      { field: "max_minutes_per_day", headerName: language === "ar" ? "دقائق ماكس" : "Max Minutes" },
    ]);
  }, [language]);


  const { data: permissionTypeData, isLoading } = useFetchAllEntity("permissionType");

  const data = useMemo(() => {
    if (Array.isArray(permissionTypeData?.data)) {
      return permissionTypeData.data.map((permission: any) => {
        return {
          ...permission,
          id: permission.permission_id,
        };
      });
    }
    return [];
  }, [permissionTypeData]);

  const props = {
    Data: data,
    Columns: columns,
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
    queryClient.invalidateQueries({ queryKey: ["permissionType"] });
  };
 
  const handleEditClick = (rowData: any) => {
    try {
      const editData = {
        ...rowData,
      };
      
      sessionStorage.setItem('editPermissionsData', JSON.stringify(editData));
      
      // Navigate to the add page (which will handle edit mode)
      router.push("/self-services/permissions/manage/add");
    } catch (error) {
      console.error("Error setting edit data:", error);
      toast.error("Failed to load permission data for editing");
    }
  };
 
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.selfServices.items}
        entityName="permissionType"
        isAddNewPagePath="/self-services/permissions/manage/add"
      />
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">Manage Permissions</h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.permissions?.items} />
        </div>
        <PowerTable
          props={props}
          showEdit={false}
          onEditClick={handleEditClick}
          onRowSelection={handleRowSelection}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}