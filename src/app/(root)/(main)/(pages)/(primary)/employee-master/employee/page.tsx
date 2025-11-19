"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useEmployeeEditStore } from "@/src/stores/employeeEditStore";
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
  const t = translations?.modules?.employeeMaster || {};
  
  // Filter states
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState<string>("");
  const [popoverStates, setPopoverStates] = useState({
    organization: false,
    employeeType: false,
  });
  
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
    removeAll: true,
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

  const employeeMap = useMemo(() => {
    if (!employeeData?.data) return {};
    return employeeData.data.reduce((acc: any, emp: any) => {
      acc[emp.employee_id] = language === "ar" ? emp.firstname_arb : emp.firstname_eng;
      return acc;
    }, {});
  }, [employeeData, language]);

  const getOrganizationsData = () => (organizationData?.data || []).filter((item: any) => 
    item.organization_id && item.organization_id.toString().trim() !== ''
  );

  const getEmployeeTypesData = () => (employeeTypeData?.data || []).filter((item: any) => 
    item.employee_type_id && item.employee_type_id.toString().trim() !== ''
  );

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
  }, [language]);

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
  }, [employeeData, designationMap, organizationMap, employeeMap]);

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

  const closePopover = (key: 'organization' | 'employeeType') => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganization(value);
    setCurrentPage(1);
    closePopover('organization');
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  };

  const handleEmployeeTypeChange = (value: string) => {
    setSelectedEmployeeType(value);
    setCurrentPage(1);
    closePopover('employeeType');
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  };

  const handleClearFilters = () => {
    setSelectedOrganization("");
    setSelectedEmployeeType("");
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  };

  const props = {
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
  };

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["employee"] });
  }, [queryClient]);

  const setSelectedRowData = useEmployeeEditStore((state) => state.setSelectedRowData);

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

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.employeeMaster.items}
        entityName="employee"
        isAddNewPagePath="/employee-master/employee/add"
      />
            <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Popover 
              open={popoverStates.organization} 
              onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, organization: open }))}
            >
              <PopoverTrigger asChild>
                <Button 
                  size={"lg"} 
                  variant={"outline"}
                  className="w-full bg-accent px-4 flex justify-between border-grey"
                >
                  <p>
                    <Label className="font-normal text-secondary">
                      {t.organization || "Organization"} :
                    </Label>
                    <span className="px-1 text-sm text-text-primary">
                      {selectedOrganization
                        ? getOrganizationsData().find((item: any) => 
                            String(item.organization_id) === selectedOrganization
                          )?.[language === "ar" ? "organization_arb" : "organization_eng"]
                        : (t.placeholder_org || "Choose organization")}
                    </span>
                  </p>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                <Command>
                  <CommandInput placeholder="Search organization..." className="border-none" />
                  <CommandEmpty>No organization found</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {getOrganizationsData().map((item: any) => (
                      <CommandItem
                        key={item.organization_id}
                        value={language === "ar" ? item.organization_arb : item.organization_eng}
                        onSelect={() => handleOrganizationChange(String(item.organization_id))}
                      >
                        <Check 
                          className={cn(
                            "mr-2 h-4 w-4", 
                            selectedOrganization === String(item.organization_id) ? "opacity-100" : "opacity-0"
                          )} 
                        />
                        {language === "ar" ? item.organization_arb : item.organization_eng}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Popover 
              open={popoverStates.employeeType} 
              onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, employeeType: open }))}
            >
              <PopoverTrigger asChild>
                <Button 
                  size={"lg"} 
                  variant={"outline"}
                  className="w-full bg-accent px-4 flex justify-between border-grey"
                >
                  <p>
                    <Label className="font-normal text-secondary">
                      {t.employee_type || "Employee Type"} :
                    </Label>
                    <span className="px-1 text-sm text-text-primary">
                      {selectedEmployeeType
                        ? getEmployeeTypesData().find((item: any) => 
                            String(item.employee_type_id) === selectedEmployeeType
                          )?.[language === "ar" ? "employee_type_arb" : "employee_type_eng"]
                        : (t.placeholder_type || "Choose type")}
                    </span>
                  </p>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                <Command>
                  <CommandInput placeholder="Search employee type..." className="border-none" />
                  <CommandEmpty>No employee type found</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {getEmployeeTypesData().map((item: any) => (
                      <CommandItem
                        key={item.employee_type_id}
                        value={language === "ar" ? item.employee_type_arb : item.employee_type_eng}
                        onSelect={() => handleEmployeeTypeChange(String(item.employee_type_id))}
                      >
                        <Check 
                          className={cn(
                            "mr-2 h-4 w-4", 
                            selectedEmployeeType === String(item.employee_type_id) ? "opacity-100" : "opacity-0"
                          )} 
                        />
                        {language === "ar" ? item.employee_type_arb : item.employee_type_eng}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end">
            <Button 
              variant="destructive" 
              onClick={handleClearFilters}
              size="sm"
              disabled={!selectedOrganization && !selectedEmployeeType}
            >
              <DeleteIcon /> {translations?.buttons?.clear || "Clear"}
            </Button>
          </div>
        </div>
      </div>
      <PowerTable
        props={props}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}