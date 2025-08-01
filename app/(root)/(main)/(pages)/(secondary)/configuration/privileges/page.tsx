// "use client";
// import PowerHeader from "@/components/custom/power-comps/power-header";
// import PowerTable from "@/components/custom/power-comps/power-table";

// import React, { useState } from "react";

// import { useLanguage } from "@/providers/LanguageProvider";
// import AddPrivelege from "@/forms/configuration/AddPrivileges";
// export default function Page() {
//   const { modules } = useLanguage();

//   const [Columns, setColumns] = useState([
//     { field: "name" },
//     { field: "group" },
//   ]);

//   const [Data, SetData] = useState<any>([]);
//   const [CurrentPage, SetCurrentPage] = useState<number>(1);
//   const [SortField, SetSortField] = useState<string>("");
//   const [SortDirection, SetSortDirection] = useState<string>("asc");
//   const [selectedRowData, setSelectedRowData] = useState<any>(null);
//   const [open, on_open_change] = useState<boolean>(false);

//   const props = {
//     Data,
//     SetData,
//     Columns,
//     SortField,
//     CurrentPage,
//     SetCurrentPage,
//     SetSortField,
//     SortDirection,
//     SetSortDirection,
//     open,
//     on_open_change,
//   };

//   const handleEditClick = (data: any) => {
//     setSelectedRowData(data);
//     on_open_change(true);
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       <PowerHeader
//         props={props}
//         items={modules?.configuration?.items}
//         modal_title="Privileges"
//        //modal_description="Choose the privileges"
//         modal_component={<AddPrivelege on_open_change={on_open_change} />}
//       />
//       <PowerTable props={props} api={"/security/privileges"} showEdit={true} onEditClick={handleEditClick}/>
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";

export default function Page() {
  const { modules, language } = useLanguage();

  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    setColumns([
      {
        field: "privilege_name",
        headerName: language === "ar" ? "قانون الجنسية" : "Privilege",
      },
      {
        field: "module_name",
        headerName: language === "ar" ? "مجموعة" : "Module",
      },
      // {
      //   field: "sub_module_id",
      //   headerName: language === "ar" ? "مجموعة" : "Sub Module",
      // },
    ]);
  }, [language]);

  const { data: secPrivilegeData, isLoading } = useFetchAllEntity("secPrivilege");
  const { data: secModuleData, isLoading: isLoadingModule } = useFetchAllEntity("secModule");

    // Helper function to get employee name (following the same pattern as the first document)
  const getModuleName = (moduleId: number, secModuleData: any) => {
    const module = secModuleData?.data?.find(
      (emp: any) => emp.module_id === moduleId
    );
    
    if (!module) {
      return `Module ${moduleId}`;
    }
    
    // Use the same naming pattern as the first document
    const moduleName = module.module_name;
    return moduleName;
  };

  const data = useMemo(() => {
    if (Array.isArray(secPrivilegeData?.data)) {
      return secPrivilegeData.data.map((secPrivi: any) => ({
        ...secPrivi,
        id: secPrivi.privilege_id,
        module_name: getModuleName(secPrivi.module_id, secModuleData),
      }));
    }
    return [];
  }, [secPrivilegeData]);

  useEffect(() => {
    if (!open) setSelectedRowData(null);
  }, [open]);

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
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["secPrivilege"] });
  };
  
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        disableAdd
        disableDelete
        selectedRows={selectedRows}
        items={modules?.configuration.items}
        entityName="privilege"
      />
      <PowerTable
        props={props}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />
    </div>
  );
}