"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useEmployeeEditStore } from "@/src/store/useEmployeeEditStore";
import { useDebounce } from "@/src/hooks/useDebounce";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { DeleteIcon } from "@/src/icons/icons";

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState<string>("");
  const [selectedVertical, setSelectedVertical] = useState<string>("");
  const [popoverStates, setPopoverStates] = useState({
    vertical: false,
    organization: false,
    employeeType: false,
  });
  const t = translations?.modules?.employeeMaster || {};

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  const { data: employeeData, isLoading, refetch } = useFetchAllEntity("employee", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
      ...(selectedOrganization && { organization_id: selectedOrganization }),
      ...(selectedEmployeeType && { employee_type_id: selectedEmployeeType }),
    },
  });

  const { data: organizationData } = useFetchAllEntity("organization", {
    searchParams: {
      limit: "1000",
    },
  });

  const { data: designationData } = useFetchAllEntity("designation", {
    removeAll: true,
  });

  const { data: employeeTypeData } = useFetchAllEntity("employeeType", {
    removeAll: true,
  });

  const organizationMap = useMemo(() => {
    if (!organizationData?.data) return {};
    return organizationData.data.reduce((acc: any, org: any) => {
      acc[org.organization_id] = language === "ar" ? org.organization_arb : org.organization_eng;
      return acc;
    }, {});
  }, [organizationData, language]);

  const designationMap = useMemo(() => {
    if (!designationData?.data) return {};
    return designationData.data.reduce((acc: any, des: any) => {
      acc[des.designation_id] = language === "ar" ? des.designation_arb : des.designation_eng;
      return acc;
    }, {});
  }, [designationData, language]);

  const verticalData = useMemo(() => {
    if (!organizationData?.data) return [];

    const parentMap = new Map();

    organizationData.data.forEach((item: any) => {
      if (item.organizations) {
        parentMap.set(item.organizations.organization_id, {
          organization_id: item.organizations.organization_id,
          organization_eng: item.organizations.organization_eng,
          organization_arb: item.organizations.organization_arb,
        });
      }
    });

    return Array.from(parentMap.values());
  }, [organizationData]);

  const organizationsData = useMemo(() => {
    if (!organizationData?.data) return [];
    return organizationData.data.filter(
      (item: any) => String(item.parent_id) === selectedVertical
    );
  }, [organizationData, selectedVertical]);

  const employeeTypesData = useMemo(() => {
    return (employeeTypeData?.data || []).filter(
      (item: any) => item.employee_type_id
    );
  }, [employeeTypeData]);

  useEffect(() => {
    setColumns([
      { field: "emp_no", headerName: t.emp_no },
      {
        field: language === "ar" ? "firstname_arb" : "firstname_eng",
        headerName: t.employee_name,
      },
      {
        field: "email",
        headerName: t.email_id,
      },
      {
        field: "join_date",
        headerName: t.join_date,
      },
      {
        field: "designation_name",
        headerName: t.designation,
      },
      {
        field: "organization_name",
        headerName: t.organization,
      },
      { field: "manager_flag", headerName: t.manager },
    ]);
  }, [language, t]);

  const data = useMemo(() => {
    if (Array.isArray(employeeData?.data)) {
      return employeeData.data.map((emp: any) => ({
        ...emp,
        id: emp.employee_id,
        designation_name: designationMap[emp.designation_id] || "-",
        organization_name: organizationMap[emp.organization_id] || "-",
        join_date: emp.join_date ? new Date(emp.join_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : "-",
      }));
    }
    return [];
  }, [employeeData, designationMap, organizationMap]);

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

  const closePopover = useCallback((key: 'organization' | 'employeeType' | 'vertical') => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const handleOrganizationChange = useCallback((value: string) => {
    setSelectedOrganization(value);
    setCurrentPage(1);
    closePopover('organization');
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [closePopover, refetch]);

  const handleEmployeeTypeChange = useCallback((value: string) => {
    setSelectedEmployeeType(value);
    setCurrentPage(1);
    closePopover('employeeType');
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [closePopover, refetch]);

  const handleVerticalChange = useCallback((value: string) => {
    setSelectedVertical(value);
    setSelectedOrganization("");
    setCurrentPage(1);
    closePopover("vertical");
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [closePopover, refetch]);

  const handleClearFilters = useCallback(() => {
    setSelectedOrganization("");
    setSelectedEmployeeType("");
    setSelectedVertical("");
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const props = useMemo(() => ({
    Data: data,
    Columns: columns,
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
    total: employeeData?.total || 0,
    hasNext: employeeData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  }), [data, columns, selectedRows, isLoading, sortField, currentPage, sortDirection, searchValue, employeeData, rowsPerPage, handlePageChange, handleSearchChange, handleRowsPerPageChange]);

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["employee"] });
  }, [queryClient]);

  const setSelectedRowData = useEmployeeEditStore((state) => state.setSelectedRowData);
  const clearSelectedRowData = useEmployeeEditStore((state) => state.clearSelectedRowData);

  const handleEditClick = useCallback(
    (row: any) => {
      setSelectedRowData(row);
      router.push(`/employee-master/employee/edit?id=${row.employee_id}`);
    },
    [router, setSelectedRowData]
  );

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const handleAddNew = useCallback(() => {
    clearSelectedRowData();
    router.push("/employee-master/employee/add");
  }, [router, clearSelectedRowData]);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.employeeMaster.items}
        entityName="employee"
        isAddNewPagePath="/employee-master/employee/add"
      />
      
      <PowerTable
        props={props}
        onRowSelection={handleRowSelection}
        onEditClick={handleEditClick}
        isLoading={isLoading}
      />
    </div>
  );
}