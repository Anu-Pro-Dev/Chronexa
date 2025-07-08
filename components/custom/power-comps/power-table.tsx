"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { PowerTablePagination } from "./power-table-pagination";
import { DynamicApi } from "@/lib/dynamicapi";
import { themeQuartz } from "ag-grid-community";
import { useLanguage } from "@/providers/LanguageProvider";
import { EditIcon } from "@/icons/icons";
import { CheckCircle, XCircle } from "lucide-react";
import Lottie from "lottie-react";
import loadingAnimation from "@/animations/hourglass-blue.json";
import { FaPen } from "react-icons/fa";

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
  showEdit = false,
  showCheckbox = true,
  onEditClick,
  customColDef = {},
  ispageValue5,
  onRowSelection,
  isLoading = false,
}: {
  props: any;
  api?: any;
  showEdit?: boolean;
  showCheckbox?: boolean;
  onEditClick?: (data: any) => void;
  customColDef?: any;
  ispageValue5?: any;
  onRowSelection?: (selectedRows: any[]) => void;
  isLoading?: boolean; 
}) {
  const { language, dir } = useLanguage();
  const gridRef = useRef<any>();

  const [TotalPages, SetTotalPages] = useState<number>(1);
  const [rows_per_page, set_rows_per_page] = useState<string>(ispageValue5 === true ? "5" : "10");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(props?.CurrentPage || 1);

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

  // Client-side pagination logic
  const paginatedData = useMemo(() => {
    if (!props?.Data || api) return tableData; // Use API data if api prop exists
    
    const data = props.Data || [];
    const pageSize = parseInt(rows_per_page);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // Calculate total pages for client-side data
    const totalPages = Math.ceil(data.length / pageSize);
    SetTotalPages(totalPages);
    
    return data.slice(startIndex, endIndex);
  }, [props?.Data, rows_per_page, currentPage, api, tableData]);

  // Handle search and sorting for client-side data
  const filteredAndSortedData = useMemo(() => {
    if (api) return paginatedData; // Let server handle filtering/sorting if API exists
    
    let data = props?.Data || [];
    
    // Apply search filter
    if (props?.SearchValue) {
      const searchValue = props.SearchValue.toLowerCase();
      data = data.filter((row: any) => {
        return Object.values(row).some((value: any) => 
          String(value).toLowerCase().includes(searchValue)
        );
      });
    }
    
    // Apply sorting
    if (props?.SortField && props?.SortDirection) {
      data = [...data].sort((a: any, b: any) => {
        const aValue = a[props.SortField];
        const bValue = b[props.SortField];
        
        if (aValue < bValue) return props.SortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return props.SortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    // Apply pagination
    const pageSize = parseInt(rows_per_page);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // Update total pages based on filtered data
    const totalPages = Math.ceil(data.length / pageSize);
    SetTotalPages(totalPages);
    
    return data.slice(startIndex, endIndex);
  }, [props?.Data, props?.SearchValue, props?.SortField, props?.SortDirection, rows_per_page, currentPage, api, paginatedData]);

  // Fetch Data Function for API mode
  const FetchData = async () => {
    if (!api) return; // Skip if no API
    
    try {
      const response: any = await DynamicApi(api, {
        page: currentPage,
        limit: parseInt(rows_per_page),
        sortField: props?.SortField,
        sortType: props?.SortDirection,
        search: props?.SearchValue,
      });
      
      SetTotalPages(response.data.pagination.totalPages);
      setTableData(response.data.data || response.data.items || []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setTableData([]);
    }
  };

  // Fetch data on dependency change (only for API mode)
  useEffect(() => {
    if (api) {
      FetchData();
    }
  }, [api, currentPage, rows_per_page, props?.SortField, props?.SortDirection, props?.SearchValue]);

  // Sync currentPage with props.CurrentPage when it changes
  useEffect(() => {
    if (props?.CurrentPage !== undefined && props.CurrentPage !== currentPage) {
      setCurrentPage(props.CurrentPage);
    }
  }, [props?.CurrentPage]);

  // Handle rows per page change
  const handleRowsPerPageChange = (newValue: string) => {
    set_rows_per_page(newValue);
    // Reset to first page when changing page size
    setCurrentPage(1);
    if (props?.SetCurrentPage) {
      props.SetCurrentPage(1);
    }
  };

  // Handle Sorting
  const onSortChanged = (event: any) => {
    const sortedColumn = event.columns?.find((column: any) => column.sort);
    if (sortedColumn) {
      props?.SetSortField?.(sortedColumn.colId);
      props?.SetSortDirection?.(sortedColumn.sort);
    }
  };

  // Handle Page Change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (props?.SetCurrentPage) {
      props.SetCurrentPage(page);
    }
  };

  // Apply RTL dynamically
  const onGridReady = (params: any) => {
    gridRef.current = params;
    params.api.setDomLayout(dir === "rtl" ? "rtl" : "ltr");
  };
  
  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setDomLayout(dir === "rtl" ? "rtl" : "ltr");
    }
  }, [dir]);

  // Define AG Grid Theme
  const myTheme = themeQuartz.withParams({
    fontFamily: "Nunito Sans",
    borderColor: "#00000005",
    borderRadius: "0px",
    browserColorScheme: "light",
    headerTextColor: "#9BA9D2",
    headerBackgroundColor: "#FFFFFF",
    headerFontSize: 15,
    headerFontWeight: 600,
    headerRowBorder: { width: 1, color: "#E5EDF7" },
    headerColumnBorder: props?.EnableBorders ? { width: 1, color: "#E5EDF7" } : false,
    rowBorder: props?.EnableBorders ? { width: 1, color: "#E5EDF7" } : false,
    columnBorder: props?.EnableBorders ? { width: 1, color: "#E5EDF7" } : false,
    sidePanelBorder: false,
    wrapperBorder: false,
    cellTextColor: "#2B3674",
    wrapperBorderRadius: "0px",
    checkboxBorderRadius: "3px",
    checkboxBorderWidth: "2px",
    checkboxUncheckedBorderColor: "#E5E7EB",
  });

  const ClickableCellRenderer = ({ value, data, onCellClick }: { value: any, data: any, onCellClick: (data: any) => void }) => {
    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      if (onCellClick) onCellClick(data);
    };
  
    return (
      <div 
        onClick={handleClick} 
        className="w-full h-full flex items-center justify-start cursor-pointer text-blue-500 underline"
        style={{ padding: "8px" }}
      >
        {value}
      </div>
    );
  };

  // Define Table Columns
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

  // Get the display data based on whether API is used or not
  const displayData = api ? tableData : filteredAndSortedData;

  return (
    <div className="flex flex-col gap-4 bg-accent p-3 rounded-2xl pb-6 overflow-auto scrollbar-hide">
      
      <div style={{ width: "100%" }}>
        <AgGridReact
          key={dir}
          ref={gridRef}
          enableRtl={dir === "rtl"}
          theme={myTheme}
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
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between px-3">
        <div className="flex items-center gap-2">
          <Select value={rows_per_page} onValueChange={handleRowsPerPageChange}>
            <SelectTrigger className="w-20 text-sm font-normal text-secondary border-none shadow-lg bg-accent rounded-lg" iconSize={24}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["5", "10", "20", "30", "50"].map((item, index) => (
                <SelectItem value={item} key={index}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-secondary text-sm font-normal">{language === "ar" ? "السجلات لكل صفحة" : "Records per page"}</p>
        </div>

        <PowerTablePagination
          totalPages={TotalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}