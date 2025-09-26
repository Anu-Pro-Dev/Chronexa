"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { PowerTablePagination } from "./power-table-pagination";
import { DynamicApi } from "@/src/lib/dynamicApi";
import { themeQuartz } from "ag-grid-community";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { FaPen } from "react-icons/fa";
import { CheckCircle, XCircle } from "lucide-react";
import Lottie from "lottie-react";
import loadingAnimation from "@/src/animations/hourglass-blue.json";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";

const EditIconRenderer = ({ data, onEditClick }: { data: any, onEditClick: (data: any) => void }) => {
  const handleClick = () => {
    onEditClick(data);
  };

  return (
    <button onClick={handleClick}>
      <FaPen size={10}/>
    </button>
  );
};

export default function PowerTable({
  props,
  api,
  // showEdit = false,
  // showCheckbox = true,
  onEditClick,
  customColDef = {},
  ispageValue5,
  onRowSelection,
  isLoading = false,
}: {
  props: any;
  api?: any;
  // showEdit?: boolean;
  // showCheckbox?: boolean;
  onEditClick?: (data: any) => void;
  customColDef?: any;
  ispageValue5?: any;
  onRowSelection?: (selectedRows: any[]) => void;
  isLoading?: boolean; 
}) {
  const { language, dir, translations } = useLanguage();
  const gridRef = useRef<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  const currentPage = props.CurrentPage || 1;
  const setCurrentPage = props.SetCurrentPage || (() => {});
  const pageSize = props.rowsPerPage || 10;
  const setRowsPerPage = props.setRowsPerPage || (() => {});
  const totalRecords = props.total || 0;
  const hasNext = props.hasNext || false;
  
  const totalPages = Math.ceil(totalRecords / pageSize);
  const { privilegeMap } = usePrivileges();
  const pathname = window?.location?.pathname || "";
  const firstPathSegment = pathname.split("/")[1];

  const activeModuleKey = Object.keys(privilegeMap).find(
    (key) => key.replace(/\s+/g, "-").toLowerCase() === firstPathSegment
  );

  const activeSubmodules = activeModuleKey
    ? privilegeMap[activeModuleKey]?.subModules || []
    : [];
  
  const activeSubmodule = activeSubmodules.find(sm => pathname.includes(sm.path));

  const pathSegments = pathname.split("/").filter(Boolean);
  const submodulePathIndex = pathSegments.findIndex(seg => seg === activeSubmodule?.path);

  const currentTabSlug = pathSegments[submodulePathIndex + 1]; // next segment after submodule path

  const currentTab = activeSubmodule?.tabs?.find(tab =>
    tab.tab_name.replace(/\s+/g, "-").toLowerCase() === currentTabSlug
  );
  
  const effectivePrivileges = {
    create: currentTab?.privileges?.create ?? activeSubmodule?.privileges?.create ?? false,
    edit: currentTab?.privileges?.edit ?? activeSubmodule?.privileges?.edit ?? false,
    delete: currentTab?.privileges?.delete ?? activeSubmodule?.privileges?.delete ?? false,
    view: currentTab?.privileges?.view ?? activeSubmodule?.privileges?.view ?? false,
  };
  
  const onSelectionChanged = (event: any) => {
    const selectedNodes = event.api.getSelectedNodes();
    const newSelectedRows = selectedNodes.map((node: any) => node.data);
  
    if (JSON.stringify(selectedRows) !== JSON.stringify(newSelectedRows)) {
      setSelectedRows(newSelectedRows);
      if (onRowSelection) {
        onRowSelection(newSelectedRows);
      }
      if (props?.setSelectedRows) {
        props.setSelectedRows(newSelectedRows);
      }
    }
  };  

  const FetchData = async () => {
    if (!api) return;
    
    try {
      const response: any = await DynamicApi(api, {
        page: currentPage,
        limit: pageSize,
        sortField: props?.SortField,
        sortType: props?.SortDirection,
        search: props?.SearchValue,
      });
      
      setTableData(response.data.data || response.data.items || []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setTableData([]);
    }
  };

  useEffect(() => {
    if (api) {
      FetchData();
    }
  }, [api, currentPage, pageSize, props?.SortField, props?.SortDirection, props?.SearchValue]);

  const handleRowsPerPageChange = (newValue: string) => {
    const newPageSize = parseInt(newValue);
    setRowsPerPage(newPageSize);
  };

  const onSortChanged = (event: any) => {
    const sortedColumn = event.columns?.find((column: any) => column.sort);
    if (sortedColumn && props?.SetSortField && props?.SetSortDirection) {
      props.SetSortField(sortedColumn.colId);
      props.SetSortDirection(sortedColumn.sort);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onGridReady = (params: any) => {
    gridRef.current = params;
  };
  
  useEffect(() => {
  }, [dir]);

  const [cellTextColor, setCellTextColor] = useState("#2B3674");

  useEffect(() => {
    const updateCellTextColor = () => {
      const htmlElement = document.documentElement;
      if (htmlElement.classList.contains('dark') || htmlElement.classList.contains('night')) {
        setCellTextColor('#b5b6b7'); 
      } else {
        setCellTextColor('#2B3674');
      }
    };

    updateCellTextColor();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateCellTextColor();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const myTheme = themeQuartz.withParams({
    fontFamily: "inherit",
    borderColor: "#EEEEEE",
    borderRadius: "0px",
    browserColorScheme: "light",
    headerTextColor: "#9BA9D2",
    headerBackgroundColor: "transparent", 
    backgroundColor: "transparent", 
    oddRowBackgroundColor: "transparent", 
    headerFontSize: 15,
    headerFontWeight: 600,
    headerRowBorder: { width: 1, color: "#EEEEEE" }, 
    headerColumnBorder: props?.EnableBorders ? { width: 1, color: "#EEEEEE" } : false, 
    rowBorder: props?.EnableBorders ? { width: 1, color: "#EEEEEE" } : false, 
    columnBorder: props?.EnableBorders ? { width: 1, color: "#EEEEEE" } : false, 
    sidePanelBorder: false,
    wrapperBorder: false,
    cellTextColor: cellTextColor,
    wrapperBorderRadius: "0px",
    checkboxBorderRadius: "3px",
    checkboxBorderWidth: "2px",
    checkboxUncheckedBorderColor: "#E5E7EB",
    checkboxCheckedBackgroundColor: "#076bb7",
    checkboxCheckedBorderColor: "transparent",
    checkboxIndeterminateBackgroundColor: "#E5E7EB",
    checkboxIndeterminateBorderColor: "transparent",
  });

  const ClickableCellRenderer = ({ value, data, onCellClick }: { value: any, data: any, onCellClick: (data: any) => void }) => {
    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      if (onCellClick) onCellClick(data);
    };
  
    return (
      <div 
        onClick={handleClick} 
        className="w-full h-full flex items-center justify-start cursor-pointer text-primary underline"
        style={{ padding: "8px" }}
      >
        {value}
      </div>
    );
  };

  // const showEdit = activeSubmodules.some(
  //   (sm) => pathname.includes(sm.path) && sm.privileges.edit
  // );

  const showEdit = effectivePrivileges.edit;
  const showCheckbox = effectivePrivileges.create || effectivePrivileges.edit || effectivePrivileges.delete;

  // Show checkboxes only if create/edit/delete is true
  // If only view_flag is true, hide checkboxes
  // const showCheckbox = activeSubmodules.some(
  //   (sm) =>
  //     pathname.includes(sm.path) &&
  //     (sm.privileges.create || sm.privileges.edit || sm.privileges.delete)
  // );

  const columnDefs = [
    ...(showCheckbox
      ? [
          {
            field: "checkbox",
            headerName: "",
            headerCheckboxSelection: true,
            checkboxSelection: true,
            width: 50,
            sortable: false,
            filter: false,
            pinned: language === "ar" ? "right" : "left",
            cellStyle: { border: "none" },
          },
        ]
      : []),
    ...props.Columns.map((col: any) => ({
      ...col,
      cellRenderer:
      typeof col.field === "string"
        ? (params: any) => {
            const value = params.value;

            if (typeof value === "boolean") {
              return value ? (
                <CheckCircle className="text-green-500 h-4 w-4" />
              ) : (
                <XCircle className="text-red-500 h-4 w-4" />
              );
            }

            if (col.clickable) {
              return (
                <ClickableCellRenderer
                  {...params}
                  onCellClick={col.onCellClick}
                />
              );
            }

            if (col.cellRenderer) {
              return col.cellRenderer(params.data);
            }

            return value;
          }
        : undefined,
    })),
    ...(showEdit
      ? [
          {
            field: "actions",
            headerName: "",
            cellRenderer: "editIconRenderer",
            width: 50,
            sortable: false,
            filter: false,
            pinned: language === "ar" ? "left" : "right",
            cellStyle: {
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
            },
          },
        ]
      : []),
  ];

  const displayData = api ? tableData : (props?.Data || []);

  return (
    <div className="flex flex-col gap-4 bg-accent p-3 rounded-2xl pb-6 overflow-auto scrollbar-hide mb-4">
      
      <div style={{ width: "100%" }}>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Lottie animationData={loadingAnimation} style={{ width: 48, height: 48 }} />
          </div>
        ) : (
          <AgGridReact
            key={dir}
            ref={gridRef}
            enableRtl={dir === "rtl"}
            theme={myTheme}
            onGridReady={onGridReady}
            onSortChanged={onSortChanged}
            rowData={displayData}
            columnDefs={columnDefs}
            domLayout="autoHeight"
            onSelectionChanged={onSelectionChanged}
            gridOptions={{
              rowSelection: showCheckbox ? "multiple" : undefined,
              suppressCellFocus: true,
              suppressMovableColumns: true,
              suppressRowClickSelection: true,
            }}
            defaultColDef={{
              autoHeight: true,
              wrapHeaderText: true,
              autoHeaderHeight: true,
              flex: 1,
              wrapText: true,
              resizable: false,
              cellStyle: {
                display: "flex",
                alignItems: "center",
                justifyContent: "start",
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "1.5",
              },
              ...customColDef,
            }}
            rowStyle={{ fontWeight: "bold" }}
            components={{
              editIconRenderer: (params: any) => <EditIconRenderer {...params} onEditClick={onEditClick} />,
            }}
          />
        )}
      </div>

      <div className="flex justify-between items-center mt-4 px-4">
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={handleRowsPerPageChange}
          >
            <SelectTrigger className="w-20 text-sm font-normal text-secondary border-none shadow-lg bg-accent rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map(size => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-secondary">
            {translations?.records_per_page }
          </span>
        </div>
        <PowerTablePagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        <span className="text-sm text-secondary">
          {totalRecords === 0
            ? translations?.no_records
            : `${translations?.showing} ${(currentPage - 1) * pageSize + 1}-${Math.min(
                currentPage * pageSize,
                totalRecords
              )} ${translations?.of || "of"} ${totalRecords}`}
        </span>
        
      </div>
    </div>
  );
}