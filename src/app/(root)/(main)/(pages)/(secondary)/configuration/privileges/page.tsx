"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";

export default function Page() {
  const { modules, language, translations } = useLanguage();

  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    setColumns([
      {
        field: "privilege_name",
        headerName: language === "ar" ? "قانون الجنسية" : "Privilege",
      },
      {
        field: "module_name",
        headerName: language === "ar" ? "مجموعة" : "Module",
      },
    ]);
  }, [language]);

  const { data: secPrivilegeData, isLoading } = useFetchAllEntity("secPrivilege");
  const { data: secModuleData, isLoading: isLoadingModule } = useFetchAllEntity("secModule");

  const getModuleName = (moduleId: number, secModuleData: any) => {
    const module = secModuleData?.data?.find(
      (emp: any) => emp.module_id === moduleId
    );
    
    if (!module) {
      return `Module ${moduleId}`;
    }
    
    const moduleName = module.module_name;
    return moduleName;
  };

  const data = useMemo(() => {
    if (Array.isArray(secPrivilegeData?.data)) {
      return secPrivilegeData.data.map((secPrivi: any) => ({
        ...secPrivi,
        id: secPrivi.privilege_id,
        module_name: getModuleName(secPrivi.module_id, secModuleData),
      }));
    }
    return [];
  }, [secPrivilegeData]);

  useEffect(() => {
    if (!open) setSelectedRowData(null);
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
    queryClient.invalidateQueries({ queryKey: ["secPrivilege"] });
  };
  
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.configuration.items}
        entityName="privilege"
      />
      <PowerTable
        props={props}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}