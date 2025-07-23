// "use client";
// import PowerHeader from "@/components/custom/power-comps/power-header";
// import PowerTable from "@/components/custom/power-comps/power-table";

// import React, { useState } from "react";

// import { useLanguage } from "@/providers/LanguageProvider";
// import PowerTabs from "@/components/custom/power-comps/power-tabs";
// import AddManageMovements from "@/forms/self-services/AddManageMovements";
// import FilterManualMovement from "@/forms/self-services/FilterManualMovement";

// export default function Page() {
//   const { modules } = useLanguage();
//   const [Data, SetData] = useState<any>([]);
//   const [DataAdd, SetDataAdd] = useState<any>([]);

//   const [Columns, setColumns] = useState([
//     { field: "number" },
//     { field: "employee" },
//     { field: "date" },
//     { field: "from_date", headerName: "From date" },
//     { field: "to_date", headerName: "To date" },
//     { field: "from_time", headerName: "From time" },
//     { field: "to_time", headerName: "To Time" },
//   ]);

//   const [ColumnsAdd, setColumnsAdd] = useState([
//     { field: "number" },
//     { field: "name" },
//     { field: "designation" },
//     { field: "organization" },
//     { field: "schedule_type" },
//   ]);

//   const [open, on_open_change] = useState<boolean>(false);
//   const [filter_open, filter_on_open_change] = useState<boolean>(false);
//   const [CurrentPage, SetCurrentPage] = useState<number>(1)
//   const [SortField, SetSortField] = useState<string>("")
//   const [SortDirection, SetSortDirection] = useState<string>("asc")
//   const [CurrentPageAdd, SetCurrentPageAdd] = useState<number>(1)
//   const [SortFieldAdd, SetSortFieldAdd] = useState<string>("")
//   const [SortDirectionAdd, SetSortDirectionAdd] = useState<string>("asc")
//   const [SearchValue, SetSearchValue] = useState<string>("")

//    const props = {
//     Data,
//     SetData,
//     Columns,
//     filter_open,
//     filter_on_open_change,
//     SortField,
//     CurrentPage,
//     SetCurrentPage,
//     SetSortField,
//     SortDirection,
//     SetSortDirection,
//     SearchValue,
//     SetSearchValue,
//     open,
//     on_open_change,
//   };

//   const propsAdd = {
//     Data:DataAdd,
//     SetData:SetDataAdd,
//     Columns: ColumnsAdd,
//     filter_open,
//     filter_on_open_change,
//     SortField: SortFieldAdd,
//     CurrentPage: CurrentPageAdd,
//     SetCurrentPage: SetCurrentPageAdd,
//     SetSortField : SetSortFieldAdd,
//     SortDirection: SortDirectionAdd,
//     SetSortDirection: SetSortDirectionAdd,
//     SearchValue,
//     SetSearchValue,
//     open,
//     on_open_change,
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       <PowerHeader
//         props={props}
//         items={modules?.selfServices?.items}
//         // enableFilters
//         // modal_title="none"
//         modal_component={<AddManageMovements on_open_change={on_open_change} props={propsAdd} />}
//         isLarge2={true}
//         // filter_modal_title="none"
//         filter_modal_component={
//           <FilterManualMovement on_open_change={filter_on_open_change} />
//         }
//         isLarge={true}
//       />
//       <div className="bg-accent rounded-2xl">
//         <div className="col-span-2 p-6">
//           <h1 className="font-bold text-xl text-primary">My Punches</h1>
//           {/* <h1 className="font-semibold text-sm text-text-secondary">
//             Manual Movements can be viewed in this tab
//           </h1> */}
//         </div>
//         <div className="px-6">
//           <PowerTabs items={modules?.selfServices?.punches?.items} />
//         </div>
//         <PowerTable props={props} api={"/self-services/manage-movements/manual"} />
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import { useLanguage } from "@/providers/LanguageProvider";
import AddManageMovements from "@/forms/self-services/AddManageMovements";
import FilterManualMovement from "@/forms/self-services/FilterManualMovement";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const { modules, language } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  useEffect(() => {
    setColumns([
      { field: "permission_type_code", headerName: language === "ar" ? "الكود" : "Code" },
      {
        field: "reason",
        headerName: language === "ar" ? "نوع المعاملة" : "Transcation Type",
      },
      { field: "max_perm_per_day", headerName: language === "ar" ? "إذن ماكس" : "Max Permission" },
      { field: "max_minutes_per_day", headerName: language === "ar" ? "دقائق ماكس" : "Max Minutes" },
    ]);
  }, [language]);


  const { data: employeeEventTransactionsData, isLoading } = useFetchAllEntity("employeeEventTransactions");

  const data = useMemo(() => {
    if (Array.isArray(employeeEventTransactionsData?.data)) {
      return employeeEventTransactionsData.data.map((permission: any) => {
        return {
          ...permission,
          id: permission.permission_id,
        };
      });
    }
    return [];
  }, [employeeEventTransactionsData]);

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
    SetCurrentPage: setCurrentPage,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: setSearchValue,
    filter_open,
    filter_on_open_change,
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["employeeEventTransactions"] });
  };
 
  const handleEditClick = (rowData: any) => {
    try {
      const editData = {
        ...rowData,
      };
      
      sessionStorage.setItem('editTransactionsData', JSON.stringify(editData));
      
      // Navigate to the add page (which will handle edit mode)
      // router.push("/self-services/permissions/manage/add");
    } catch (error) {
      console.error("Error setting edit data:", error);
      toast.error("Failed to load permission data for editing");
    }
  };
 
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        disableAdd
        selectedRows={selectedRows}
        items={modules?.selfServices.items}
        entityName="employeeEventTransactions"
        modal_component={
          <AddManageMovements 
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        isLarge2={true}
        filter_modal_component={
          <FilterManualMovement on_open_change={filter_on_open_change} />
        }
        isLarge={true}
      />
      <div className="bg-accent rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">Manage Punches</h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.punches?.items} />
        </div>
        <PowerTable
          props={props}
          showEdit={true}
          onEditClick={handleEditClick}
          onRowSelection={handleRowSelection}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}