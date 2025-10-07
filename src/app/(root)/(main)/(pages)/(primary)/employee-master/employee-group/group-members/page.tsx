"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import AddGroupMembers from "@/src/components/custom/modules/employee-master/AddGroupMembers";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { apiRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import toast from "react-hot-toast"; 

export default function MembersTable() {
  const searchParams = useSearchParams();
  const group = searchParams.get("group");
  const router = useRouter();
  const pathname = usePathname();
  const { modules, language, translations } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string; clickable?: boolean; onCellClick?: (data: any) => void }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.employeeMaster || {};
  const showToast = useShowToast();

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      if (ids.length === 1) {
        return apiRequest(`/employeeGroupMember/delete/${ids[0]}`, "DELETE");
      } else {
        return apiRequest(`/employeeGroupMember/delete`, "DELETE", { ids });
      }
    },
    onSuccess: (_result, ids) => {
      const count = ids.length;
      if (count === 1) {
        showToast("success", "delete_success", { displayText: "Group Member" });
      } else {
        showToast("success", "delete_multiple_success", { displayText: "Group Members", count });
      }
      queryClient.invalidateQueries({ queryKey: ["employeeGroupMember"] });
      setSelectedRows([]);
    },
    onError: (error) => {
      console.error("Delete operation failed:", error);
      showToast("error", "formsubmission_error");
    },
  });

  const handleDelete = useCallback(() => {
    if (!selectedRows || selectedRows.length === 0) {
      toast.error("No items selected for deletion");
      return;
    }

    const ids = selectedRows
      .map(row => row.group_member_id || row.id)
      .filter(id => id !== undefined && id !== null);

    if (ids.length === 0) {
      toast.error("Selected items do not have valid IDs");
      return;
    }

    deleteMutation.mutate(ids);
  }, [selectedRows, deleteMutation]);

  const preserveUrlParams = useCallback(() => {
    if (group && !searchParams.get("group")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("group", group);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [group, searchParams, pathname, router]);

  useEffect(() => {
    preserveUrlParams();
  }, [preserveUrlParams]);

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  useEffect(() => {
    setColumns([
      { field: "employee_no", headerName: t.emp_no },
      { field: "employee_name", headerName: t.employee },
      { field: "designation", headerName: "Designation" },
      { field: "organization", headerName: "Organization" },
    ]);
  }, [language, t]);

  const { data: groupMembersData, isLoading: isLoadingGroupMembers, refetch: refetchGroupMembers } = useFetchAllEntity("employeeGroupMember", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(group && { group_code: group }),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const filteredData = useMemo(() => {
    if (!groupMembersData?.data || !Array.isArray(groupMembersData.data)) {
      return [];
    }
    
    const mergedData = groupMembersData.data.map((member: any) => {
      const emp = member.employee_master;
      
      if (!emp) {
        console.warn(`No employee_master data found for group member ID: ${member.group_member_id}`);
      }

      if (!member.group_member_id) {
        console.error('Missing group_member_id for member:', member);
      }

      return {
        ...member,
        id: member.group_member_id,
        group_member_id: member.group_member_id,
        employee_no: emp?.emp_no || "N/A",
        employee_name: language === "ar" 
          ? (emp?.firstname_arb || emp?.firstname_eng || "N/A")
          : (emp?.firstname_eng || emp?.firstname_arb || "N/A"),
        designation: emp?.designation 
          ? (language === "ar" 
              ? (emp.designation.designation_arb || emp.designation.designation_eng || "N/A")
              : (emp.designation.designation_eng || emp.designation.designation_arb || "N/A"))
          : "N/A",
        organization: emp?.organization 
          ? (language === "ar" 
              ? (emp.organization.organization_arb || emp.organization.organization_eng || "N/A")
              : (emp.organization.organization_eng || emp.organization.organization_arb || "N/A"))
          : "N/A",
        effective_from_date: member.effective_from_date,
        effective_to_date: member.effective_to_date,
      };
    });

    if (mergedData.length > 0) {
      console.log('Sample row data for deletion:', {
        id: mergedData[0].id,
        group_member_id: mergedData[0].group_member_id
      });
    }

    return mergedData;
  }, [groupMembersData, language]);

  const isLoading = isLoadingGroupMembers;

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    
    if (refetchGroupMembers) {
      setTimeout(() => refetchGroupMembers(), 100);
    }
  }, [refetchGroupMembers]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    
    if (refetchGroupMembers) {
      setTimeout(() => refetchGroupMembers(), 100);
    }
  }, [refetchGroupMembers]);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["employeeGroupMember"] });
    setOpen(false);
    
    setTimeout(() => {
      if (group) {
        const params = new URLSearchParams(searchParams.toString());
        if (!params.get("group")) {
          params.set("group", group);
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
      }
    }, 100);
  }, [queryClient, group, searchParams, pathname, router]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (group) {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.get("group")) {
        params.set("group", group);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }
  }, [group, searchParams, pathname, router]);

  const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    setOpen(true);
  }, []);

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const props = {
    Data: filteredData,
    Columns: columns,
    open,
    on_open_change: handleOpenChange,
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
    total: groupMembersData?.total || 0,
    hasNext: groupMembersData?.hasNext || false,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
    groupCode: group,
    onCustomDelete: handleDelete,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.employeeMaster?.items}
        entityName="employeeGroupMember"
        modal_title={t.group_members}
        modal_component={
          <AddGroupMembers
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
            props={props}
            groupCode={group}
          />
        }
        size="large"
        disableDelete={false}
        customDeleteHandler={handleDelete}
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