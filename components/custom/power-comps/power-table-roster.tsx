"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgGridReact } from "ag-grid-react";
import { PowerTablePagination } from "./power-table-pagination";
import { DynamicApi } from "@/lib/dynamicapi";
import { themeQuartz } from "ag-grid-community";
import { useLanguage } from "@/providers/LanguageProvider";

export default function PowerTableRoster({
  props,
  api,
  showCheckbox = true,
  customColDef = {},
}: {
  props: any;
  api?: any;
  showCheckbox?: boolean;
  customColDef?: any;
}) {
  const { dir } = useLanguage();
  const gridRef = useRef<any>();

  const [TotalPages, SetTotalPages] = useState<number>(1);
  const [rows_per_page, set_rows_per_page] = useState<string>("10");

  // Fetch Data Function
  const FetchData = async () => {
    try {
      const response: any = await DynamicApi(api, {
        page: props?.CurrentPage,
        limit: rows_per_page,
        sortField: props?.SortField,
        sortType: props?.SortDirection,
        search: props?.SearchValue,
      });
      props.SetData(response.data.payload);
      SetTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  // Fetch data on dependency change
  useEffect(() => {
    if (api) {
      FetchData();
    }
  }, [props?.CurrentPage, rows_per_page, props?.SortField, props?.SortDirection, props?.SearchValue]);

  // Handle Sorting
  const onSortChanged = (event: any) => {
    const sortedColumn = event.columns?.find((column: any) => column.sort);
    if (sortedColumn) {
      props?.SetSortField(sortedColumn.colId);
      props?.SetSortDirection(sortedColumn.sort);
    }
  };
  // Handle Page Change
  const handlePageChange = (page: number) => {
    console.log("Navigating to page:", page);
    props.SetCurrentPage(page);
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
            pinned: "left",
            cellStyle: { border: "none" },
          },
        ]
      : []),
    ...props.Columns,
  ];

  return (
    <div className="flex flex-col gap-4 bg-white p-3 rounded-2xl pb-6">
      <div style={{ width: "100%" }}>
        <AgGridReact
          groupDisplayType="multipleColumns"
          key={dir} 
          ref={gridRef}
          enableRtl={dir === "rtl"}
          theme={myTheme}
          onSortChanged={onSortChanged}
          rowData={props.Data}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          getRowStyle={(params) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
          gridOptions={{
            rowSelection: showCheckbox ? "multiple" : undefined,
            suppressCellFocus: true,
            suppressMovableColumns: true,
          }}
          defaultColDef={{
            autoHeight: true,
            resizable: false,
            cellStyle: {
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
            },
            ...customColDef,
          }}
          rowStyle={{ fontWeight: "bold" }}
        />
      </div>

      <div className="flex justify-between px-3">
        <div className="flex items-center gap-2">
          <Select
            defaultValue="10"
            value={rows_per_page}
            onValueChange={set_rows_per_page}
          >
            <SelectTrigger className="w-20 text-sm font-normal text-secondary border-none shadow-lg bg-white rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-md">
              {["5", "10", "20", "30", "50"].map((item, index) => (
                <SelectItem value={item} key={index}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <p className="text-secondary text-sm font-normal">
              Records per page
            </p>
          </div>
        </div>

        <div>
          <PowerTablePagination
            totalPages={TotalPages}
            currentPage={props.CurrentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}