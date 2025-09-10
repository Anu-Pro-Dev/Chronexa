"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import PowerSearch from "@/src/components/custom/power-comps/power-search";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addEmployeeGroupMemberRequest } from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { AddIcon, CancelIcon2 } from "@/src/icons/icons";

export default function AddGroupMembers({
  on_open_change,
  selectedRowData,
  onSave,
  props,
  groupCode, // Accept groupCode as prop to avoid URL dependency issues
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
  props: any;
  groupCode?: string | null;
}) {
  const { modules, language, translations } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.employeeMaster || {};

  // Use groupCode prop first, fallback to URL parameter
  const currentGroupCode = groupCode || searchParams.get("group");

  // Function to preserve URL parameters
  const preserveUrlParams = useCallback(() => {
    if (currentGroupCode && !searchParams.get("group")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("group", currentGroupCode);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [currentGroupCode, searchParams, pathname, router]);

  // Ensure URL parameters are preserved
  useEffect(() => {
    preserveUrlParams();
  }, [preserveUrlParams]);

  // Calculate offset for pagination
  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  type EmployeeGroup = {
    employee_group_id: number;
    group_code: string;
  };

  const { data: groupListData } = useFetchAllEntity("employeeGroup");
  const group = groupListData?.data?.find((g: EmployeeGroup) => g.group_code === currentGroupCode);
  const employee_group_id = group?.employee_group_id ?? null;

  // Fetch employees with pagination and search
  const { data: employeeData, isLoading, refetch: refetchEmployees } = useFetchAllEntity("employee", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && {
        firstname_eng: debouncedSearchValue,
        firstname_arb: debouncedSearchValue,
        emp_no: debouncedSearchValue,
      }),
      ...(sortField && { sort_by: sortField }),
      ...(sortDirection && { sort_order: sortDirection }),
    },
  });

  const addMutation = useMutation({
    mutationFn: addEmployeeGroupMemberRequest,
    onSuccess: (data) => {
      // toast.success("Employee group member added successfully!");
      
      // Preserve URL parameters after success
      preserveUrlParams();
      
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["employeeGroupMember"] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
      
      // Preserve URL parameters after error
      preserveUrlParams();
    },
  });

  const handleAdd = async () => {
    const group = groupListData?.data?.find((g: EmployeeGroup) => g.group_code === currentGroupCode);
    const employee_group_id = group?.employee_group_id;

    if (!employee_group_id) {
      toast.error("Group not found.");
      return;
    }

    if (selectedRows.length === 0) {
      toast.error("Please select at least one employee.");
      return;
    }

    setIsSubmitting(true);

    const today = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(today.getFullYear() + 1);

    const effective_from_date = today.toISOString();
    const effective_to_date = oneYearLater.toISOString();

    try {
      for (const row of selectedRows) {
        const payload = {
          employee_group_id,
          employee_id: row.employee_id,
          effective_from_date,
          effective_to_date,
          active_flag: true,
        };

        await addMutation.mutateAsync(payload);
      }

      toast.success("Employee(s) added to the group successfully.");
      
      // Preserve URL parameters before closing
      preserveUrlParams();
      
      onSave(null, null);
      on_open_change(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add some or all employees.");
      
      // Preserve URL parameters after error
      preserveUrlParams();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel with URL preservation
  const handleCancel = useCallback(() => {
    preserveUrlParams();
    on_open_change(false);
  }, [preserveUrlParams, on_open_change]);

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    
    if (refetchEmployees) {
      setTimeout(() => refetchEmployees(), 100);
    }
  }, [refetchEmployees]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    
    if (refetchEmployees) {
      setTimeout(() => refetchEmployees(), 100);
    }
  }, [refetchEmployees]);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleSortChange = useCallback((field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
    
    if (refetchEmployees) {
      setTimeout(() => refetchEmployees(), 100);
    }
  }, [refetchEmployees]);

  useEffect(() => {
    setColumns([
      { field: "emp_no", headerName: t.emp_no },
      {
        field: language === "ar" ? "firstname_arb" : "firstname_eng",
        headerName: t.employee,
      },
      {
        field: "join_date",
        headerName: t.join_date,
      },
    ]);
  }, [language, t]);

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const data = useMemo(() => {
    if (Array.isArray(employeeData?.data)) {
      return employeeData.data.map((emp: any) => ({
        ...emp,
        id: emp.employee_id,
        join_date: emp.join_date ? new Date(emp.join_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : "-",
      }));
    }
    return [];
  }, [employeeData]);

  const tableProps = {
    Data: data,
    Columns: columns,
    selectedRows,
    setSelectedRows: setSelectedRows,
    isLoading,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: employeeData?.total || 0,
    hasNext: employeeData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
    onSortChange: handleSortChange,
  };

  return (
    <>
      <form className="bg-accent rounded-2xl">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex">
              <PowerSearch 
                props={{
                  ...props,
                  onSearchChange: handleSearchChange,
                  placeholder: "Search employees...",
                  searchValue: searchValue,
                }} 
              />
            </div>
            <div className="flex gap-4">
              <Button 
                type="button"
                variant={"success"} 
                size={"sm"}
                disabled={isSubmitting}
                onClick={handleAdd}
                className="flex items-center space-y-0.5 border border-success"
              >
                <AddIcon/> {translations.buttons.add}
              </Button>
              <Button
                variant={"outlineGrey"}
                type="button"
                size={"sm"}
                className="flex items-center gap-1 p-0 pl-1 pr-2 bg-[#F3F3F3] border-[#E7E7E7]"
                onClick={handleCancel}
              >
                <CancelIcon2 /> {translations.buttons.cancel}
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      <div className="border border-[#E5E7EB] mt-6">
        <PowerTable 
          props={tableProps} 
          ispageValue5={true}
          onRowSelection={handleRowSelection}
        />
      </div>
    </> 
  );
}