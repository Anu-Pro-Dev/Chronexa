"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce"; 
import Lottie from "lottie-react";
import loadingAnimation from "@/src/animations/hourglass-blue.json";

export default function Page() {
  const router = useRouter();
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
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.selfServices || {};

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  // Helper function to get employee name from transaction data
  const getEmployeeDisplayInfo = useCallback((transaction: any, language: string = 'en') => {
    // Check if employee_master exists in the transaction
    const employeeMaster = transaction.employee_master;
    
    if (!employeeMaster) {
      // Fallback if no employee_master data
      return {
        emp_no: `EMP${transaction.employee_id}`,
        employee_name: `Employee ${transaction.employee_id}`,
        firstName: '',
        lastName: '',
        fullName: `Employee ${transaction.employee_id}`
      };
    }

    // Extract names based on language preference
    const firstNameEn = employeeMaster.firstname_eng || '';
    const lastNameEn = employeeMaster.lastname_eng || '';
    const firstNameAr = employeeMaster.firstname_arb || '';
    const lastNameAr = employeeMaster.lastname_arb || '';

    const firstName = language === 'ar' ? firstNameAr : firstNameEn;
    const lastName = language === 'ar' ? lastNameAr : lastNameEn;
    
    // Create full name
    const fullName = language === 'ar' 
      ? `${firstNameAr} ${lastNameAr}`.trim()
      : `${firstNameEn} ${lastNameEn}`.trim();

    return {
      emp_no: employeeMaster.emp_no || `EMP${transaction.employee_id}`,
      employee_name: fullName || firstName || `Employee ${transaction.employee_id}`,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName || firstName || `Employee ${transaction.employee_id}`,
      employee_id: transaction.employee_id
    };
  }, [language]);

  useEffect(() => {
    setColumns([
      { 
        field: "emp_no", 
        headerName: "Emp No",
      },
      { 
        field: "employee_name", 
        headerName: "Employee Name",
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
    ]);
  }, [language, t]);

  const { data: punchesData, isLoading: isLoadingTransactions, error, refetch } = useFetchAllEntity(
    "employeeEventTransaction", 
    {
      searchParams: {
        limit: String(rowsPerPage),
        offset: String(offset),
        ...(debouncedSearchValue && { search: debouncedSearchValue }),
      },
      enabled: !!employeeId && isAuthenticated && !isChecking,
      endpoint: `/employeeEventTransaction/employee/${employeeId}`,
    }
  );

  // Process transaction data using employee_master from the same response
  const data = useMemo(() => {
    if (!Array.isArray(punchesData?.data)) {
      return [];
    }

    const processedData = punchesData.data.map((transaction: any) => {
      // Get employee info directly from transaction.employee_master
      const employeeInfo = getEmployeeDisplayInfo(transaction, language);
      
      // Process time formatting - Convert UTC to UAE time
      const transactionTimeStr = transaction.transaction_time || '';
      
      let formattedTime = '';
      let formattedDate = '';
      
      if (transactionTimeStr) {
        // Parse the UTC time
        const utcDate = new Date(transactionTimeStr);
        
        // Convert to UAE timezone (Asia/Dubai)
        const uaeDate = new Date(utcDate.toLocaleString("en-US", {timeZone: "Asia/Dubai"}));
        
        // Format time as HH:MM:SS for display
        formattedTime = uaeDate.toLocaleTimeString("en-GB", { 
          hour12: false, 
          hour: "2-digit", 
          minute: "2-digit", 
          second: "2-digit" 
        });
        
        // Format date as DD/MM/YYYY
        formattedDate = uaeDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit", 
          year: "numeric"
        });
      }
      
      return {
        ...transaction,
        id: transaction.transaction_id,
        // Use employee info from transaction.employee_master
        emp_no: employeeInfo.emp_no,
        employee_name: employeeInfo.employee_name,
        firstName: employeeInfo.firstName,
        lastName: employeeInfo.lastName,
        fullName: employeeInfo.fullName,
        transaction_date: formattedDate,
        transaction_time: formattedTime,
        // Keep original data for reference
        raw_employee_id: transaction.employee_id,
        employee_master: transaction.employee_master,
        // Add UAE time for debugging
        uae_datetime: transactionTimeStr ? new Date(transactionTimeStr).toLocaleString("en-US", {timeZone: "Asia/Dubai"}) : '',
      };
    });

    return processedData;
  }, [punchesData, language, getEmployeeDisplayInfo]);

  // // Process transaction data using employee_master from the same response
  // const data = useMemo(() => {
  //   if (!Array.isArray(punchesData?.data)) {
  //     return [];
  //   }

  //   const processedData = punchesData.data.map((transaction: any) => {
  //     // Get employee info directly from transaction.employee_master
  //     const employeeInfo = getEmployeeDisplayInfo(transaction, language);
      
  //     // Process time formatting
  //     const transactionTimeStr = transaction.transaction_time || '';
  //     const [datePart, timePart] = transactionTimeStr.split('T');
  //     const formattedTime = timePart ? timePart.substring(0, 5) : '';
      
  //     let formattedDate = '';
  //     if (datePart) {
  //       const [year, month, day] = datePart.split('-');
  //       formattedDate = `${day}/${month}/${year}`;
  //     }
      
  //     return {
  //       ...transaction,
  //       id: transaction.transaction_id,
  //       // Use employee info from transaction.employee_master
  //       emp_no: employeeInfo.emp_no,
  //       employee_name: employeeInfo.employee_name,
  //       firstName: employeeInfo.firstName,
  //       lastName: employeeInfo.lastName,
  //       fullName: employeeInfo.fullName,
  //       transaction_date: formattedDate,
  //       transaction_time: formattedTime,
  //       // Keep original data for reference
  //       raw_employee_id: transaction.employee_id,
  //       employee_master: transaction.employee_master,
  //     };
  //   });

  //   return processedData;
  // }, [punchesData, language, getEmployeeDisplayInfo]);

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
        // Include employee info for editing
        employeeInfo: {
          emp_no: rowData.emp_no,
          firstName: rowData.firstName,
          lastName: rowData.lastName,
          fullName: rowData.fullName,
          employee_master: rowData.employee_master
        }
      };
      
      sessionStorage.setItem('editTransactionsData', JSON.stringify(editData));
      
      // Optional: Log employee details for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Employee Info for editing:', {
          emp_no: rowData.emp_no,
          firstName: rowData.firstName,
          fullName: rowData.fullName,
          transaction_id: rowData.transaction_id
        });
      }
      
    } catch (error) {
      console.error("Error setting edit data:", error);
      toast.error("Failed to load transaction data for editing");
    }
  };
 
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
    
    // Optional: Log selected employee details
    if (process.env.NODE_ENV === 'development' && rows.length > 0) {
      console.log('Selected employees:', rows.map(row => ({
        emp_no: row.emp_no,
        firstName: row.firstName,
        employee_name: row.employee_name,
        transaction_id: row.transaction_id
      })));
    }
  }, []);

  // Helper function to get employee details by transaction (for external use)
  const getEmployeeDetailsByTransaction = useCallback((transaction: any) => {
    return getEmployeeDisplayInfo(transaction, language);
  }, [getEmployeeDisplayInfo, language]);

  const renderPowerTable = () => {
    if (isChecking) {
      return (
        <div className="flex justify-center items-center p-8">
          <div style={{ width: 50}}>
            <Lottie animationData={loadingAnimation} loop={true} />
          </div>
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
        showEdit={false}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoadingTransactions || isChecking}
      />
    );
  };

  // Optional: Add some debugging info (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Transaction data status:', {
        punchesDataLoaded: !!punchesData?.data,
        punchesCount: punchesData?.data?.length || 0,
        currentLanguage: language,
        currentUser: userInfo?.employee_id,
        sampleEmployeeMaster: punchesData?.data?.[0]?.employee_master
      });
    }
  }, [punchesData, language, userInfo]);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        disableAdd
        disableDelete
        selectedRows={selectedRows}
        items={modules?.selfServices?.items}
        entityName="employeeEventTransaction"
      />
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6 pb-6">
          <h1 className="font-bold text-xl text-primary">Manage My Punches</h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.punches?.items} />
        </div>
        {renderPowerTable()}
      </div>
    </div>
  );
}