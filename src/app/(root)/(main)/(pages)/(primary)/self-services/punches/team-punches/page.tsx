"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce"; 
import { InlineLoading } from "@/src/app/loading";

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const { isAuthenticated, isChecking, employeeId, userInfo } = useAuthGuard();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("transaction_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedEmployeeFilter = useDebounce(employeeFilter, 300);
  const t = translations?.modules?.selfServices || {};
  
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState<string>("");
  const [selectedVertical, setSelectedVertical] = useState<string>("");
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
    vertical: false,
    organization: false,
    employeeType: false,
  });
  
    const closePopover = (key: 'fromDate'| 'toDate' |'organization' | 'employeeType' | 'vertical' ) => {
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

    const { data: organizationData } = useFetchAllEntity("organization", {
        searchParams: {
          limit: "1000",
        },
      });
    
      const { data: employeeTypeData } = useFetchAllEntity("employeeType", {
        removeAll: true,
      });
    
      const getVerticalData = () => {
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
      };
    
      const getOrganizationsData = () => {
        if (!organizationData?.data) return [];
    
        return organizationData.data.filter(
          (item: any) => String(item.parent_id) === selectedVertical
        );
      };
    
      const getEmployeeTypesData = () =>
        (employeeTypeData?.data || []).filter(
          (item: any) => item.employee_type_id
      );

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  useEffect(() => {
    setColumns([
      { 
        field: "emp_no", 
        headerName: t.employee_no || "Employee No",
      },
      { 
        field: "employee_name", 
        headerName: t.employee_name || "Employee Name",
      },
      {
        field: "reason",
        headerName: t.trans_type || "Transaction Type",
      },
      { 
        field: "transaction_date", 
        headerName: t.trans_date || "Transaction Date"
      },
      { 
        field: "transaction_time", 
        headerName: t.trans_time || "Transaction Time"
      },
      {
        field: "remarks",
        headerName: "Remarks"
      }
    ]);
  }, [language, t]);

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { data: punchesData, isLoading: isLoadingTransactions, error, refetch } = useFetchAllEntity(
    "employeeEventTransaction", 
    {
      searchParams: {
        limit: String(rowsPerPage),
        offset: String(offset),
        ...(debouncedSearchValue && { search: debouncedSearchValue }),
        ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
        ...(toDate && { to_date: formatDateForAPI(toDate) }),
        ...(debouncedEmployeeFilter && { employeeId: debouncedEmployeeFilter }),
      },
      enabled: !!employeeId && isAuthenticated && !isChecking,
      endpoint: `/employeeEventTransaction/team/all`,
    }
  );

  const getEmployeeName = (transaction: any) => {
    if (userInfo && transaction.employee_id === employeeId) {
      const name = language === "ar" 
        ? `${userInfo.employeename?.firstarb || ""}`.trim()
        : `${userInfo.employeename?.firsteng || ""}`.trim();
      
      if (name) return name;
    }
    
    const employee = transaction.employee_master;
    
    if (!employee) {
      return `Emp ${transaction.employee_id}`;
    }
    
    const fullName = language === "ar"
      ? `${employee.firstname_arb || ""} ${employee.lastname_arb || ""}`.trim()
      : `${employee.firstname_eng || ""} ${employee.lastname_eng || ""}`.trim();
    
    return fullName || `Emp ${transaction.employee_id}`;
  };

  const data = useMemo(() => {
    if (Array.isArray(punchesData?.data)) {
      const processedData = punchesData.data.map((transaction: any) => {
        const transactionTimeStr = transaction.transaction_time;
        
        let formattedTime = '';
        let formattedDate = '';
        
        if (transactionTimeStr) {
          const date = new Date(transactionTimeStr);
          formattedTime = date.toISOString().substr(11, 8);
          formattedDate = date.toISOString().substr(0, 10);
        }

        return {
          ...transaction,
          id: transaction.transaction_id,
          emp_no: transaction.employee_master?.emp_no || `EMP${transaction.employee_id}`,
          employee_name: getEmployeeName(transaction),
          transaction_date: formattedDate,
          transaction_time: formattedTime,
        };
      });

      return processedData;
    }
    return [];
  }, [punchesData, language, userInfo, employeeId, error]);

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

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [refetch]);

  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);
    handleFilterChange();
  };

  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);
    handleFilterChange();
  };

  const handleEmployeeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeFilter(event.target.value);
    setCurrentPage(1);
  };
  
  const props = {
    Data: data,
    Columns: columns,
    open,
    on_open_change: setOpen,
    selectedRows,
    setSelectedRows,
    isLoading: isLoadingTransactions || isChecking,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: punchesData?.total || 0,
    hasNext: punchesData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
    filter_open,
    filter_on_open_change,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["employeeEventTransaction", employeeId] });
  };
 
  const handleEditClick = (rowData: any) => {
    try {
      const editData = {
        ...rowData,
      };
      
      sessionStorage.setItem('editTransactionsData', JSON.stringify(editData));
    } catch (error) {
      console.error("Error setting edit data:", error);
      toast.error("Failed to load transaction data for editing");
    }
  };
 
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const renderPowerTable = () => {
    if (isChecking) {
      return (
        <div className="flex justify-center items-center p-8">
          <InlineLoading />
        </div>
      );
    }

    if (!isAuthenticated || !employeeId) {
      return (
        <div className="p-8">
          <div className="bg-backdrop rounded-md p-3">
            <div className="text-center">
              <p>Unable to load employee data. Please try logging in again.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <PowerTable
        props={props}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoadingTransactions || isChecking}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.selfServices?.items}
        entityName="employeeEventTransaction"
      />
      <div className="grid grid-cols-3 gap-4">
        {/* Filter 1: VERTICAL ORGANIZATION */}
        <Popover
          open={popoverStates.vertical}
          onOpenChange={(open) =>
            setPopoverStates((prev) => ({ ...prev, vertical: open }))
          }
        >
          <PopoverTrigger asChild>
            <Button size="lg" variant="outline" className="w-full bg-accent px-4 flex justify-between border-grey">
              <p>
                <Label className="font-normal text-secondary">Vertical :</Label>
                <span className="px-1 text-sm text-text-primary">
                  {selectedVertical
                    ? getVerticalData().find((item: any) =>
                        String(item.organization_id) === selectedVertical
                      )?.[language === "ar" ? "organization_arb" : "organization_eng"]
                    : "Choose Vertical"}
                </span>
              </p>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
            <Command>
              <CommandInput placeholder="Search vertical..." />
              <CommandGroup className="max-h-64 overflow-auto">
                {getVerticalData().map((item: any) => (
                  <CommandItem
                    key={item.organization_id}
                    onSelect={() => {
                      setSelectedVertical(String(item.organization_id));
                      setSelectedOrganization("");
                      closePopover("vertical");
                    }}
                  >
                    {language === "ar" ? item.organization_arb : item.organization_eng}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Filter 2: ORGANIZATION (Filtered by parent_id = selectedVertical) */}
        <Popover
          open={popoverStates.organization}
          onOpenChange={(open) =>
            setPopoverStates((prev) => ({ ...prev, organization: open }))
          }
        >
          <PopoverTrigger asChild>
            <Button size="lg" variant="outline" className="w-full bg-accent px-4 flex justify-between border-grey">
              <p className="truncate w-64">
                <Label className="font-normal text-secondary">Organization :</Label>
                <span className="px-1 text-sm text-text-primary">
                  {selectedOrganization
                    ? getOrganizationsData().find((item: any) =>
                        String(item.organization_id) === selectedOrganization
                      )?.[language === "ar" ? "organization_arb" : "organization_eng"]
                    : "Choose Organization"}
                </span>
              </p>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
            <Command>
              <CommandInput placeholder="Search organization..." />
              <CommandGroup className="max-h-64 overflow-auto">
                {getOrganizationsData().map((item: any) => (
                  <CommandItem
                    key={item.organization_id}
                    onSelect={() => handleOrganizationChange(String(item.organization_id))}
                  >
                    {language === "ar" ? item.organization_arb : item.organization_eng}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Filter 3: EMPLOYEE TYPE (Already existed - no change except position) */}
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
                <Label className="font-normal text-secondary">Employee Type :</Label>
                <span className="px-1 text-sm text-text-primary">
                  {selectedEmployeeType
                    ? getEmployeeTypesData().find((item: any) => 
                        String(item.employee_type_id) === selectedEmployeeType
                      )?.[language === "ar" ? "employee_type_arb" : "employee_type_eng"]
                    : "Choose type"}
                </span>
              </p>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
            <Command>
              <CommandInput placeholder="Search employee type..." />
              <CommandGroup className="max-h-64 overflow-auto">
                {getEmployeeTypesData().map((item: any) => (
                  <CommandItem
                    key={item.employee_type_id}
                    onSelect={() => handleEmployeeTypeChange(String(item.employee_type_id))}
                  >
                    {language === "ar" ? item.employee_type_arb : item.employee_type_eng}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>   
      </div>
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">Manage Team Punches</h1>
        </div>
        <div className="px-6">
          <PowerTabs />
        </div>
        {renderPowerTable()}
      </div>
    </div>
  );
}