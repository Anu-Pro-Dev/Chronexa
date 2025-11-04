"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import AddRoleToUser from "@/src/components/custom/modules/configuration/AddRoleToUser";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/src/lib/apiHandler";
import { useDebounce } from "@/src/hooks/useDebounce";

export default function MembersTable() {
  const { modules, language } = useLanguage();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  
  const [columns, setColumns] = useState([
    { field: "user_id", headerName: "User ID" },
    { field: "employee_no", headerName: "Employee No" },
    { field: "user_name", headerName: "Employee Name" },
    // { field: "email", headerName: "Email" },
    { field: "designation", headerName: "Designation" },
    { field: "organization", headerName: "Organization" },
    { field: "created_date", headerName: "Assigned Date" },
  ]);
  
  const [open, setOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  const { data: rolesData, isLoading: isLoadingRoles } = useFetchAllEntity("secRole");

  const roleId = useMemo(() => {
    if (!role || !rolesData?.data) return null;
    
    const foundRole = rolesData.data.find((r: any) => 
      r.role_name === role || r.name === role || r.roleName === role
    );
    
    return foundRole?.id || foundRole?.role_id || null;
  }, [role, rolesData]);

  const { data: userRolesData, isLoading: isLoadingUserRoles, refetch } = useQuery({
    queryKey: ["secUserRole", "byRole", roleId, offset, rowsPerPage, debouncedSearchValue],
    queryFn: async () => {
      if (!roleId) return { data: [], total: 0, hasNext: false };
      
      try {
        const params = new URLSearchParams({
          role_id: String(roleId),
          limit: String(rowsPerPage),
          offset: String(offset),
        });

        if (debouncedSearchValue) {
          params.append('search', debouncedSearchValue);
        }

        const response = await apiRequest(`/secUserRole/all?${params.toString()}`, "GET");
        return {
          data: response?.data || [],
          total: response?.total || 0,
          hasNext: response?.hasNext || false,
        };
      } catch (error) {
        console.error("Error fetching user roles:", error);
        return { data: [], total: 0, hasNext: false };
      }
    },
    enabled: !!roleId,
  });

  const data = useMemo(() => {
    if (!userRolesData?.data || !Array.isArray(userRolesData.data)) {
      return [];
    }

    const mappedData = userRolesData.data
      .filter((userRole: any) => userRole.user_role_id)
      .map((userRole: any) => {
        const secUser = userRole.sec_users;
        const employeeMaster = secUser?.employee_master;
        const roleInfo = rolesData?.data?.find((r: any) => 
          (r.id || r.role_id) === userRole.role_id
        );

        // Get employee name based on language
        const employeeName = language === 'ar' 
          ? employeeMaster?.firstname_arb || employeeMaster?.firstname_eng || "N/A"
          : employeeMaster?.firstname_eng || "N/A";

        // Get designation based on language
        const designation = language === 'ar'
          ? employeeMaster?.designation?.designation_arb || employeeMaster?.designation?.designation_eng || "N/A"
          : employeeMaster?.designation?.designation_eng || "N/A";

        // Get organization based on language
        const organization = language === 'ar'
          ? employeeMaster?.organization?.organization_arb || employeeMaster?.organization?.organization_eng || "N/A"
          : employeeMaster?.organization?.organization_eng || "N/A";

        return {
          id: Number(userRole.user_role_id),
          user_role_id: Number(userRole.user_role_id),
          user_id: secUser?.user_id || userRole.user_id,
          role_id: userRole.role_id,
          employee_id: secUser?.employee_id,
          user_name: employeeName,
          email: employeeMaster?.email || "N/A",
          employee_no: employeeMaster?.emp_no || "N/A",
          designation: employeeMaster.designation.designation_eng || "N/A",
          organization: employeeMaster.organization.organization_eng || "N/A",
          role_name: roleInfo?.role_name || roleInfo?.name || "N/A",
          created_date: userRole.created_date ? new Date(userRole.created_date).toLocaleDateString() : "N/A",
          last_updated_date: userRole.last_updated_date ? new Date(userRole.last_updated_date).toLocaleDateString() : "N/A",
          created_id: userRole.created_id,
          last_updated_id: userRole.last_updated_id,
        };
      });

    return mappedData;
  }, [userRolesData, rolesData, language]);

  const isLoading = isLoadingRoles || isLoadingUserRoles;

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["secUserRole"] });
  }, [queryClient]);

  const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    setOpen(true);
  }, []);

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

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
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: userRolesData?.total || 0,
    hasNext: userRolesData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.configuration?.items}
        entityName="secUserRole"
        modal_title="Add User to Role"
        modal_component={
          <AddRoleToUser
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
            props={props}
          />
        }
        size="large"
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