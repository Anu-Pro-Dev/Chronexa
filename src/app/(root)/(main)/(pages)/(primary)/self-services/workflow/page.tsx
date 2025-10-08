"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDebounce } from "@/src/hooks/useDebounce"; 

export default function Page() {
  const router = useRouter();
  const { modules, language, translations } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.selfServices || {};

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);
  
  useEffect(() => {
    setColumns([
      { field: "workflow_code", headerName: t.code },
      {
        field: language === "ar" ? "workflow_name_arb" : "workflow_name_eng",
        headerName: t.workflow_name,
      },
      {
        field: language === "ar" ? "workflow_category_arb" : "workflow_category_eng",
        headerName: t.category,
      },
      { field: "steps", headerName: t.steps },
    ]);
  }, [language]);

  const { data: workflowTypeData, isLoading, refetch } = useFetchAllEntity("workflowType", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const data = useMemo(() => {
    if (Array.isArray(workflowTypeData?.data)) {
      return workflowTypeData.data.map((workflow: any) => {
        return {
          ...workflow,
          id: workflow.workflow_id,
          steps: workflow._count?.workflow_type_steps || workflow.workflow_type_steps?.length || 0,
        };
      });
    }
    return [];
  }, [workflowTypeData]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [currentPage, refetch]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [rowsPerPage, refetch]);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

  const props = {
    Data: data,
    Columns: columns,
    selectedRows,
    setSelectedRows,
    isLoading,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: workflowTypeData?.total || 0,
    hasNext: workflowTypeData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };
 
  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["workflowType"] });
  };
 
  const handleEditClick = (rowData: any) => {
    try {
      const editData = {
        ...rowData,
        workflow_type_steps: rowData.workflow_type_steps || []
      };
      
      sessionStorage.setItem('editWorkflowData', JSON.stringify(editData));
      
      router.push("/self-services/workflow/add");
    } catch (error) {
      console.error("Error setting edit data:", error);
      toast.error("Failed to load workflow data for editing");
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
        entityName="workflowType"
        isAddNewPagePath="/self-services/workflow/add"
      />
      <PowerTable
        props={props}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
        overrideEditIcon={false}
      />
    </div>
  );
}