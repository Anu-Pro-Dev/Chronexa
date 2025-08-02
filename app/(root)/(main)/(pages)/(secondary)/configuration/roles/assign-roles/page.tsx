"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import AddRoleToUser from "@/forms/configuration/AddRoleToUser";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiHandler";

export default function MembersTable() {
  const { modules } = useLanguage();
  const searchParams = useSearchParams();
  const role = searchParams.get("role"); // Get role name from URL (e.g., "ADMIN")
  
  const [columns, setColumns] = useState([
    { field: "user_id", headerName: "User ID" },
    { field: "employee_no", headerName: "Employee No" },
    { field: "user_name", headerName: "Employee Name" },
    { field: "email", headerName: "Email" },
    { field: "created_date", headerName: "Assigned Date" },
  ]);
  
  const [open, setOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const queryClient = useQueryClient();

  // Fetch all roles to get role_id from role name
  const { data: rolesData, isLoading: isLoadingRoles } = useFetchAllEntity("secRole");

  // Find the role_id for the given role name
  const roleId = useMemo(() => {
    if (!role || !rolesData?.data) return null;
    
    const foundRole = rolesData.data.find((r: any) => 
      r.role_name === role || r.name === role || r.roleName === role
    );
    
    return foundRole?.id || foundRole?.role_id || null;
  }, [role, rolesData]);

  // Fetch user roles for the specific role_id ONLY
  const { data: userRolesData, isLoading: isLoadingUserRoles } = useQuery({
    queryKey: ["secUserRole", "byRole", roleId],
    queryFn: async () => {
      if (!roleId) return { data: [] };
      
      try {
        // This API call fetches ONLY users assigned to the specific role_id
        const response = await apiRequest(`/secUserRole/all?role_id=${roleId}`, "GET");
        console.log(`Fetching users for role_id: ${roleId}`, response);
        return response;
      } catch (error) {
        console.error("Error fetching user roles:", error);
        return { data: [] };
      }
    },
    enabled: !!roleId, // Only fetch when we have a role_id
  });

  // Get unique user IDs from the user roles data
  const userIds = useMemo(() => {
    if (!userRolesData?.data || !Array.isArray(userRolesData.data)) {
      return [];
    }
    return userRolesData.data.map((ur: any) => ur.user_id).filter(Boolean);
  }, [userRolesData]);

  // Fetch employee details for all user IDs from employee API
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees", "byIds", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      
      try {
        // Fetch all employees from employee API
        const response = await apiRequest(`/employee/all`, "GET");
        console.log("Employee API response:", response);
        
        let employees = [];
        if (response?.data && Array.isArray(response.data)) {
          employees = response.data;
        } else if (response?.success && response?.result && Array.isArray(response.result)) {
          employees = response.result;
        } else if (Array.isArray(response)) {
          employees = response;
        }

        // Create a map of user_id to employee data
        // Assuming employees have user_id field that matches with userRoles user_id
        const employeeMap: any = {};
        employees.forEach((employee: any) => {
          // Try different possible user ID field names in employee data
          const empUserId = employee.user_id || employee.userId || employee.id || employee.employee_id;
          if (empUserId && userIds.includes(empUserId)) {
            employeeMap[empUserId] = employee;
          }
        });

        console.log("Employee map created:", employeeMap);
        return employeeMap;
      } catch (error) {
        console.error("Error fetching employees:", error);
        return {};
      }
    },
    enabled: userIds.length > 0,
  });

  // Process and merge the data
  const filteredData = useMemo(() => {
    if (!userRolesData?.data || !Array.isArray(userRolesData.data) || !employeesData) {
      return [];
    }

    return userRolesData.data.map((userRole: any) => {
      const employee = employeesData[userRole.user_id];
      const roleInfo = rolesData?.data?.find((r: any) => 
        (r.id || r.role_id) === userRole.role_id
      );

      return {
        ...userRole,
        id: userRole.user_role_id || userRole.id,
        user_name: employee?.firstname_eng || employee?.first_name || employee?.name || employee?.employee_name || "N/A",
        email: employee?.email || employee?.email_address || "N/A",
        employee_no: employee?.emp_no || employee?.employee_no || employee?.empNo || "N/A",
        designation: employee?.designation_name || employee?.designation || employee?.position || "N/A",
        organization: employee?.organization_name || employee?.organization || employee?.company || "N/A",
        role_name: roleInfo?.role_name || roleInfo?.name || "N/A",
        created_date: userRole.created_date ? new Date(userRole.created_date).toLocaleDateString() : "N/A",
        last_updated_time: userRole.last_updated_time ? new Date(userRole.last_updated_time).toLocaleDateString() : "N/A",
      };
    });
  }, [userRolesData, employeesData, rolesData]);

  const isLoading = isLoadingRoles || isLoadingUserRoles || isLoadingEmployees;

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["secUserRole"] });
    setOpen(false);
  }, [queryClient]);

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

  return (
    <div className="flex flex-col gap-4">
      {/* Show role information header */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Users Assigned to Role: <span className="font-bold">{role || "Unknown Role"}</span>
        </h2>
        <p className="text-sm text-gray-600">
          {isLoading ? "Loading..." : `Showing ${filteredData.length} user(s) assigned to this role`}
        </p>
        {roleId && (
          <p className="text-xs text-gray-500 mt-1">
            Role ID: {roleId}
          </p>
        )}
      </div>

      <PowerHeader
        props={props}
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
        isLarge
      />
      <PowerTable
        props={props}
        onRowSelection={handleRowSelection}
      />
    </div>
  );
}