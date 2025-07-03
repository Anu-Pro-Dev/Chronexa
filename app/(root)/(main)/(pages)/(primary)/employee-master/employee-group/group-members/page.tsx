"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import AddGroupMembers from "@/forms/employee-master/AddGroupMembers";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiHandler";

export default function MembersTable() {
  const { modules } = useLanguage();
  const searchParams = useSearchParams();
  const group = searchParams.get("group");
  
  const [columns, setColumns] = useState([
    { field: "employee_no", headerName: "Employee No" },
    { field: "employee_name", headerName: "Employee Name" },
    { field: "designation", headerName: "Designation" },
    { field: "organization", headerName: "Organization" },
  ]);
  
  const [open, setOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const queryClient = useQueryClient();

  // Fetch group members and groups
  const { data: groupMembersData, isLoading: isLoadingGroupMembers } = useFetchAllEntity("employeeGroupMember");
  const { data: groupsData, isLoading: isLoadingGroups } = useFetchAllEntity("employeeGroup");

  // Filter group members by group if specified
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

  // Get unique employee IDs
  const employeeIds = useMemo(() => {
    const ids = filteredGroupMembers.map((member: any) => member.employee_id).filter(Boolean);
    return ids;
  }, [filteredGroupMembers]);
  // Replace the existing employee fetching query with this optimized version

  // Fetch all employees once and filter by needed IDs
  const { data: allEmployeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees", "all"],
    queryFn: async () => {
      try {
        const data = await apiRequest(`/employee/all`, "GET");
        
        // Handle different response structures
        let employees = [];
        if (data?.data && Array.isArray(data.data)) {
          employees = data.data;
        } else if (data?.success && data?.result && Array.isArray(data.result)) {
          employees = data.result;
        } else if (Array.isArray(data)) {
          employees = data;
        } else {
          console.error("Unexpected employee data structure:", data);
          return {};
        }
                
        // Create a map of employee_id to employee data for quick lookup
        const employeeMap: any = {};
        employees.forEach((emp: any) => {
          // Try different possible ID field names
          const empId = emp.id || emp.employee_id || emp.emp_id;
          if (empId) {
            employeeMap[empId] = emp;
          }
        });
        
        return employeeMap;
      } catch (error) {
        console.error("Error fetching all employees:", error);
        return {};
      }
    },
    // Remove the enabled condition since we want to fetch all employees regardless
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Update the filteredData useMemo to better handle the employee lookup
  const filteredData = useMemo(() => {

    if (!allEmployeesData || Object.keys(allEmployeesData).length === 0) {
      return [];
    }
    
    const mergedData = filteredGroupMembers.map((member: any) => {
      const employeeId = member.employee_id;
      const emp = allEmployeesData[employeeId];
      
      if (!emp) {
        console.warn(`No employee data found for ID: ${employeeId}`);
      }

      return {
        ...member,
        id: member.group_member_id || member.id,
        employee_no: emp?.emp_no || emp?.employee_no || emp?.empNo || "N/A",
        employee_name: emp?.firstname_eng,
        designation: emp?.designation_name || emp?.designation || emp?.position || "N/A",
        organization: emp?.organization_name || emp?.organization || emp?.company || "N/A",
        effective_from_date: member.effective_from_date,
        effective_to_date: member.effective_to_date,
      };
    });

    return mergedData;
  }, [filteredGroupMembers, allEmployeesData, employeeIds]);

  // Also update the loading state calculation
  const isLoading = isLoadingGroupMembers || isLoadingGroups || isLoadingEmployees;

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["employeeGroupMember"] });
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
      <PowerHeader
        props={props}
        items={modules?.employeeMaster?.items}
        entityName="employeeGroupMember"
        modal_title="Group Members"
        modal_component={
          <AddGroupMembers
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
        // showEdit={true}
        // onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
      />
    </div>
  );
}