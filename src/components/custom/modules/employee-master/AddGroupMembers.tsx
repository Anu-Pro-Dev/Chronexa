"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useShowToast } from "@/src/utils/toastHelper";
import { Button } from "@/src/components/ui/button";
import PowerSearch from "@/src/components/custom/power-comps/power-search";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEmployeeGroupMemberRequest } from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { AddIcon, CancelIcon2 } from "@/src/icons/icons";

export default function AddGroupMembers({
  on_open_change,
  selectedRowData,
  onSave,
  props,
  groupCode,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
  props: any;
  groupCode?: string | null;
}) {
  const { modules, language, translations } = useLanguage();
  const showToast = useShowToast();
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

  const currentGroupCode = groupCode || searchParams.get("group");

  const preserveUrlParams = useCallback(() => {
    if (currentGroupCode && !searchParams.get("group")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("group", currentGroupCode);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [currentGroupCode, searchParams, pathname, router]);

  useEffect(() => {
    preserveUrlParams();
  }, [preserveUrlParams]);

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

  const { data: existingMembersData, refetch: refetchExistingMembers } = useFetchAllEntity("employeeGroupMember", {
    searchParams: {
      ...(currentGroupCode && { group_code: currentGroupCode }),
      limit: "9999",
    },
  });

  useEffect(() => {
    if (currentGroupCode) {
      refetchExistingMembers?.();
    }
  }, [currentGroupCode, refetchExistingMembers]);

  const existingEmployeeIds = useMemo(() => {
    if (!existingMembersData?.data || !Array.isArray(existingMembersData.data)) {
      return new Set<number>();
    }
    return new Set(existingMembersData.data.map((member: any) => member.employee_id));
  }, [existingMembersData]);

  const employeeSearchParams = useMemo(() => {
    const params: Record<string, string> = {
      limit: "9999", 
      offset: "1",
    };

    if (debouncedSearchValue) {
      params.search = debouncedSearchValue;
    }

    if (sortField) params.sort_by = sortField;
    if (sortDirection) params.sort_order = sortDirection;

    return params;
  }, [debouncedSearchValue, sortField, sortDirection]);

  const { data: employeeData, isLoading, refetch: refetchEmployees } = useFetchAllEntity("employee", {
    searchParams: employeeSearchParams,
  });

  const addMutation = useMutation({
    mutationFn: addEmployeeGroupMemberRequest,
    onSuccess: (data) => {
      preserveUrlParams();
      onSave(null, data.data);
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "employeeGroupMember",
      });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error");
      }
      preserveUrlParams();
    },
  });

  const handleAdd = async () => {
    const group = groupListData?.data?.find((g: EmployeeGroup) => g.group_code === currentGroupCode);
    const employee_group_id = group?.employee_group_id;

    if (!employee_group_id) {
      showToast("error", "group_not_found");
      return;
    }

    if (selectedRows.length === 0) {
      showToast("error", "select_at_least_one_employee");
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

      showToast("success", "add_group_members_success");
      preserveUrlParams();
      onSave(null, null);
      on_open_change(false);
    } catch (error) {
      console.error(error);
      showToast("error", "add_group_members_error");
      preserveUrlParams();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = useCallback(() => {
    preserveUrlParams();
    on_open_change(false);
  }, [preserveUrlParams, on_open_change]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  }, []);

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

  const allAvailableEmployees = useMemo(() => {
    if (Array.isArray(employeeData?.data)) {
      return employeeData.data
        .filter((emp: any) => !existingEmployeeIds.has(emp.employee_id))
        .map((emp: any) => ({
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
  }, [employeeData, existingEmployeeIds]);

  const data = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return allAvailableEmployees.slice(startIndex, endIndex);
  }, [allAvailableEmployees, currentPage, rowsPerPage]);

  const totalAvailableEmployees = allAvailableEmployees.length;
  const hasNext = currentPage * rowsPerPage < totalAvailableEmployees;

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
    total: totalAvailableEmployees,
    hasNext: hasNext,
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
                  SearchValue: searchValue,
                  SetSearchValue: handleSearchChange,
                }}
              />
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={"success"}
                size={"sm"}
                disabled={isSubmitting || selectedRows.length === 0}
                onClick={handleAdd}
                className="flex items-center space-y-0.5 border border-success"
              >
                <AddIcon /> {translations.buttons.add}
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
          overrideEditIcon={false}
        />
      </div>
    </>
  );
}