"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const { modules, language } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    setColumns([
      { field: "leave_type_code", headerName: language === "ar" ? "الكود" : "Code" },
      {
        field: language === "ar" ? "leave_type_arb" : "leave_type_eng",
        headerName: language === "ar" ? "اسم سير العمل" : "Leave Name",
      },
      { 
        field: "need_approval_flag", 
        headerName: language === "ar" ? "بحاجة إلى موافقة" : "Need Approval" 
      },
    ]);
  }, [language]);


  const { data: leaveTypeData, isLoading } = useFetchAllEntity("leaveType");

  const data = useMemo(() => {
    if (Array.isArray(leaveTypeData?.data)) {
      return leaveTypeData.data.map((leave: any) => {
        return {
          ...leave,
          id: leave.leave_id,
        };
      });
    }
    return [];
  }, [leaveTypeData]);

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
    queryClient.invalidateQueries({ queryKey: ["leaveType"] });
  };
 
  const handleEditClick = (rowData: any) => {
    try {
      const editData = {
        ...rowData,
      };
      
      sessionStorage.setItem('editLeavesData', JSON.stringify(editData));
      
      // Navigate to the add page (which will handle edit mode)
      router.push("/self-services/leaves/manage/add");
    } catch (error) {
      console.error("Error setting edit data:", error);
      toast.error("Failed to load leave data for editing");
    }
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
        items={modules?.selfServices.items}
        entityName="leaveType"
        isAddNewPagePath="/self-services/leaves/manage/add"
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