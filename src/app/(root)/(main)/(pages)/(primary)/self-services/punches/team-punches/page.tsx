// "use client";
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import PowerHeader from "@/src/components/custom/power-comps/power-header";
// import PowerTable from "@/src/components/custom/power-comps/power-table";
// import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
// import { useLanguage } from "@/src/providers/LanguageProvider";
// import { useQueryClient } from "@tanstack/react-query";
// import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
// import { useQuery } from "@tanstack/react-query";
// import { getEmployeeTransactionById } from "@/src/lib/apiHandler";
// import { useAuthGuard } from "@/src/hooks/useAuthGuard";
// import { useDebounce } from "@/src/hooks/useDebounce"; 
// import Lottie from "lottie-react";
// import loadingAnimation from "@/src/animations/hourglass-blue.json";

// export default function Page() {
//   const router = useRouter();
//   const { modules, language, translations } = useLanguage();
//   const { isAuthenticated, isChecking, employeeId, userInfo } = useAuthGuard();
//   const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [sortField, setSortField] = useState<string>("transaction_id");
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
//   const [searchValue, setSearchValue] = useState<string>("");
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);
//   const queryClient = useQueryClient();
//   const [open, setOpen] = useState<boolean>(false);
//   const [filter_open, filter_on_open_change] = useState<boolean>(false);
//   const [selectedRowData, setSelectedRowData] = useState<any>(null);
//   const [rowsPerPage, setRowsPerPage] = useState<number>(10);
//   const debouncedSearchValue = useDebounce(searchValue, 300);
//   const t = translations?.modules?.selfServices || {};

//   const offset = useMemo(() => {
//     return currentPage;
//   }, [currentPage]);

//   useEffect(() => {
//     setColumns([
//       { 
//         field: "employee_name", 
//         headerName: "Employee",
//       },
//       {
//         field: "reason",
//         headerName: t.trans_type,
//       },
//       { 
//         field: "transaction_date", 
//         headerName: t.trans_date 
//       },
//       { 
//         field: "transaction_time", 
//         headerName: t.trans_time
//       },
//     ]);
//   }, [language]);

//   const { data: punchesData, isLoading: isLoadingTransactions, error, refetch } = useFetchAllEntity(
//     "employeeEventTransaction", 
//     {
//       searchParams: {
//         limit: String(rowsPerPage),
//         offset: String(offset),
//         ...(debouncedSearchValue && {
//           name: debouncedSearchValue,
//           code: debouncedSearchValue,
//         }),
//       },
//       enabled: !!employeeId && isAuthenticated && !isChecking,
//       endpoint: `/employeeEventTransaction/all`,
//     }
//   );

//   const { data: employeesData } = useFetchAllEntity("employee", {
//     removeAll: true
//   });

//   const getEmployeeName = (transactionEmployeeId: number, employeesData: any) => {
//     if (userInfo && transactionEmployeeId === employeeId) {
//       const name = language === "ar" 
//         ? `${userInfo.employeename?.firstarb || ""}`.trim()
//         : `${userInfo.employeename?.firsteng || ""}`.trim();
      
//       if (name) return name;
//     }
    
//     const employee = employeesData?.data?.find(
//       (emp: any) => emp.employee_id === transactionEmployeeId
//     );
    
//     if (!employee) {
//       return `Emp ${transactionEmployeeId}`;
//     }
    
//     const fullName = language === "ar"
//       ? `${employee.firstname_arb || ""}`.trim()
//       : `${employee.firstname_eng || ""}`.trim();
    
//     return fullName || `Emp ${transactionEmployeeId}`;
//   };

//   const data = useMemo(() => {
//     if (Array.isArray(punchesData?.data)) {
//       const processedData = punchesData.data.map((transaction: any) => {
//         const transactionTimeStr = transaction.transaction_time;
        
//         const [datePart, timePart] = transactionTimeStr.split('T');
        
//         const formattedTime = timePart ? timePart.substring(0, 5) : '';
        
//         let formattedDate = '';
//         if (datePart) {
//           const [year, month, day] = datePart.split('-');
//           formattedDate = `${day}/${month}/${year}`;
//         }
        
//         return {
//           ...transaction,
//           id: transaction.transaction_id,
//           employee_name: getEmployeeName(transaction.employee_id, employeesData),
//           transaction_date: formattedDate,
//           transaction_time: formattedTime,
//         };
//       });

//       return processedData;
//     }
//     return [];
//   }, [punchesData, employeesData, language, error]);

//   const handlePageChange = useCallback((newPage: number) => {
//     setCurrentPage(newPage);
//     if (refetch) {
//       setTimeout(() => refetch(), 100);
//     }
//   }, [currentPage, refetch]);

//   const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
//     setRowsPerPage(newRowsPerPage);
//     setCurrentPage(1);
//     if (refetch) {
//       setTimeout(() => refetch(), 100);
//     }
//   }, [rowsPerPage, refetch]);

//   const handleSearchChange = useCallback((newSearchValue: string) => {
//     setSearchValue(newSearchValue);
//     setCurrentPage(1);
//   }, []);
  
//   const props = {
//     Data: data,
//     Columns: columns,
//     open,
//     on_open_change: setOpen,
//     selectedRows,
//     setSelectedRows,
//     isLoading: isLoadingTransactions || isChecking,
//     SortField: sortField,
//     CurrentPage: currentPage,
//     SetCurrentPage: handlePageChange,
//     SetSortField: setSortField,
//     SortDirection: sortDirection,
//     SetSortDirection: setSortDirection,
//     SearchValue: searchValue,
//     SetSearchValue: handleSearchChange,
//     total: punchesData?.total || 0,
//     hasNext: punchesData?.hasNext,
//     rowsPerPage,
//     setRowsPerPage: handleRowsPerPageChange,
//     filter_open,
//     filter_on_open_change,
//   };

//   const handleSave = () => {
//     queryClient.invalidateQueries({ queryKey: ["employeeEventTransaction", employeeId] });
//   };
 
//   const handleEditClick = (rowData: any) => {
//     try {
//       const editData = {
//         ...rowData,
//       };
      
//       sessionStorage.setItem('editTransactionsData', JSON.stringify(editData));
//     } catch (error) {
//       console.error("Error setting edit data:", error);
//       toast.error("Failed to load transaction data for editing");
//     }
//   };
 
//   const handleRowSelection = useCallback((rows: any[]) => {
//     setSelectedRows(rows);
//   }, []);

//   const renderPowerTable = () => {
//     if (isChecking) {
//       return (
//         <div className="flex justify-center items-center p-8">
//           <div style={{ width: 50}}>
//             <Lottie animationData={loadingAnimation} loop={true} />
//           </div>
//         </div>
//       );
//     }

//     if (!isAuthenticated || !employeeId) {
//       return (
//         <div className="p-8">
//           <div className="bg-backdrop rounded-md p-3">
//             <div className="text-center">
//               <p>Unable to load employee data. Please try logging in again.</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <PowerTable
//         props={props}
//         showEdit={false}
//         onEditClick={handleEditClick}
//         onRowSelection={handleRowSelection}
//         isLoading={isLoadingTransactions || isChecking}
//       />
//     );
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       <PowerHeader
//         props={props}
//         disableAdd
//         disableDelete
//         selectedRows={selectedRows}
//         items={modules?.selfServices.items}
//         entityName="employeeEventTransaction"
//       />
//       <div className="bg-accent rounded-2xl">
//         <div className="col-span-2 p-6 pb-6">
//           <h1 className="font-bold text-xl text-primary">Manage My Punches</h1>
//         </div>
//         <div className="px-6">
//           <PowerTabs items={modules?.selfServices?.punches?.items} />
//         </div>
//         {renderPowerTable()}
//       </div>
//     </div>
//   );
// }
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
import { useQuery } from "@tanstack/react-query";
import { getEmployeeTransactionById } from "@/src/lib/apiHandler";
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

  useEffect(() => {
    setColumns([
      { 
        field: "emp_no", 
        headerName: "Employee No",
      },
      { 
        field: "employee_name", 
        headerName: "Employee Name",
      },
      {
        field: "reason",
        headerName: t.trans_type,
      },
      { 
        field: "transaction_date", 
        headerName: t.trans_date 
      },
      { 
        field: "transaction_time", 
        headerName: t.trans_time
      },
    ]);
  }, [language]);

  const { data: punchesData, isLoading: isLoadingTransactions, error, refetch } = useFetchAllEntity(
    "employeeEventTransaction", 
    {
      searchParams: {
        limit: String(rowsPerPage),
        offset: String(offset),
        ...(debouncedSearchValue && {
          name: debouncedSearchValue,
          code: debouncedSearchValue,
        }),
      },
      enabled: !!employeeId && isAuthenticated && !isChecking,
      endpoint: `/employeeEventTransaction/all`,
    }
  );

  // Removed the employeesData fetch since we don't need it anymore

  const getEmployeeName = (transaction: any) => {
    // Check if this is the current user's transaction
    if (userInfo && transaction.employee_id === employeeId) {
      const name = language === "ar" 
        ? `${userInfo.employeename?.firstarb || ""}`.trim()
        : `${userInfo.employeename?.firsteng || ""}`.trim();
      
      if (name) return name;
    }
    
    // Use employee data from the transaction response
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
          emp_no: transaction.employee_master?.emp_no || `EMP${transaction.employee_id}`,
          employee_name: getEmployeeName(transaction),
          transaction_date: formattedDate,
          transaction_time: formattedTime,
          // Add UAE time for debugging
          uae_datetime: transactionTimeStr ? new Date(transactionTimeStr).toLocaleString("en-US", {timeZone: "Asia/Dubai"}) : '',
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

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        disableAdd
        disableDelete
        selectedRows={selectedRows}
        items={modules?.selfServices.items}
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