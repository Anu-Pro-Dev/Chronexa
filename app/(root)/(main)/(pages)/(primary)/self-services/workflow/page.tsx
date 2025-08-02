"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
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
      { field: "workflow_code", headerName: language === "ar" ? "الكود" : "Code" },
      {
        field: language === "ar" ? "workflow_name_arb" : "workflow_name_eng",
        headerName: language === "ar" ? "اسم سير العمل" : "Workflow Name",
      },
      {
        field: language === "ar" ? "workflow_category_arb" : "workflow_category_eng",
        headerName: language === "ar" ? "فئة" : "Category",
      },
      { field: "steps", headerName: language === "ar" ? "خطوات" : "Steps" },
    ]);
  }, [language]);


  const { data: workflowTypeData, isLoading } = useFetchAllEntity("workflowType");

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
    queryClient.invalidateQueries({ queryKey: ["workflowType"] });
  };
 
  const handleEditClick = (rowData: any) => {
    try {
      // Store the workflow data in sessionStorage so it persists across navigation
      const editData = {
        ...rowData,
        // Make sure we have the workflow steps data
        workflow_type_steps: rowData.workflow_type_steps || []
      };
      
      sessionStorage.setItem('editWorkflowData', JSON.stringify(editData));
      
      // Navigate to the add page (which will handle edit mode)
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
        showEdit={true}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}