"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import AddGroupMembers from "@/src/components/custom/modules/employee-master/AddGroupMembers";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/src/lib/apiHandler";
import { useDebounce } from "@/src/hooks/useDebounce"; 

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

  // Function to preserve URL parameters
  const preserveUrlParams = useCallback(() => {
    if (group && !searchParams.get("group")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("group", group);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [group, searchParams, pathname, router]);

  // Ensure URL parameters are preserved on component mount and updates
  useEffect(() => {
    preserveUrlParams();
  }, [preserveUrlParams]);

  // Calculate offset for pagination
  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  // Set up columns
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
      ...(debouncedSearchValue && {
        employee_name: debouncedSearchValue,
        employee_no: debouncedSearchValue,
      }),
    },
  });

  // Fetch groups data
  const { data: groupsData, isLoading: isLoadingGroups } = useFetchAllEntity("employeeGroup");

  const filteredGroupMembers = useMemo(() => {
    if (!groupMembersData?.data || !Array.isArray(groupMembersData.data)) {
      return [];
    }
    
    let filtered = groupMembersData.data;
    
    if (group && groupsData?.data) {      
      // Find the group ID for the given group code
      const targetGroup = groupsData.data.find((g: any) => 
        g.group_code === group || g.code === group || g.groupCode === group
      );
            
      if (targetGroup) {
        const targetGroupId = targetGroup.id || targetGroup.group_id || targetGroup.employee_group_id;
        
        filtered = filtered.filter((member: any) => {
          const memberGroupId = member.employee_group_id || member.group_id || member.groupId;
          const matches = memberGroupId?.toString() === targetGroupId?.toString();
          
          return matches;
        });
      } else {
        filtered = []; // No matches if group not found
      }      
    }
    
    return filtered;
  }, [groupMembersData, groupsData, group]);

  // Process and merge data - Updated to use the nested employee_master data
  const filteredData = useMemo(() => {
    if (!filteredGroupMembers || filteredGroupMembers.length === 0) {
      return [];
    }
    
    const mergedData = filteredGroupMembers.map((member: any) => {
      const emp = member.employee_master; // Get employee data from nested object
      
      if (!emp) {
        console.warn(`No employee_master data found for group member ID: ${member.group_member_id}`);
      }

      return {
        ...member,
        id: member.group_member_id || member.id,
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

    return mergedData;
  }, [filteredGroupMembers, language]);

  // Loading state
  const isLoading = isLoadingGroupMembers || isLoadingGroups;

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  // Pagination handlers - matching employee-group structure
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

  // Modified handleSave to preserve URL parameters
  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["employeeGroupMember"] });
    setOpen(false);
    
    // Ensure URL parameters are preserved after save
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

  // Modified handleOpenChange to preserve URL parameters
  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    
    // Preserve URL parameters when modal state changes
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

  // Props object with pagination data - matching employee-group structure
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
    hasNext: groupMembersData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
    groupCode: group,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.employeeMaster?.items}
        entityName="employeeGroupMember"
        modal_title="Group Members"
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
      />
      <PowerTable
        props={props}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}