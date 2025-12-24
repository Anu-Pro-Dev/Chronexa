"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import AddGroupMembers from "@/src/components/custom/modules/employee-master/AddGroupMembers";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useEmployeeGroupStore } from "@/src/store/useEmployeeGroupStore";
import { useDeleteEntityMutation } from "@/src/hooks/useDeleteEntityMutation";
import toast from "react-hot-toast";

export default function MembersTable() {
  const searchParams = useSearchParams();
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

  const group = searchParams.get("group");
  const groupIdFromUrl = searchParams.get("id")
    ? Number(searchParams.get("id"))
    : null;
  const { groupId, groupCode } = useEmployeeGroupStore();

  // Use the delete hook
  const deleteMutation = useDeleteEntityMutation({
    onSelectionClear: () => setSelectedRows([]),
  });

  useEffect(() => {
    if (
      groupIdFromUrl &&
      Number.isFinite(groupIdFromUrl) &&
      groupId !== groupIdFromUrl
    ) {
      useEmployeeGroupStore
        .getState()
        .setGroup(groupIdFromUrl, group || "");
    }
  }, [groupIdFromUrl, group]);

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

    deleteMutation.mutate({
      entityName: "employeeGroupMember",
      ids,
    });
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

  const { data: groupMembersData, isLoading, refetch } = useFetchAllEntity("employeeGroupMember", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
    enabled: !!groupId,
    endpoint: `/employeeGroupMember/byGroup/${groupId}`,
  });

  const filteredData = useMemo(() => {
    if (!groupMembersData?.data || !Array.isArray(groupMembersData.data)) {
      return [];
    }

    return groupMembersData.data.map((member: any) => {
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
  }, [groupMembersData, language]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

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

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        query.queryKey[0] === "employeeGroupMember",
    });
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