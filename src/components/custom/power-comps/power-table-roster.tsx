"use client";
import React, { useEffect, useState, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { AgGridReact } from "ag-grid-react";
import { PowerTablePagination } from "./power-table-pagination";
import { DynamicApi } from "@/src/lib/dynamicApi";
import { themeQuartz } from "ag-grid-community";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { inherits } from "util";

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
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (api) {
      FetchData();
    }
  }, [props?.CurrentPage, rows_per_page, props?.SortField, props?.SortDirection, props?.SearchValue]);

  const onSortChanged = (event: any) => {
    const sortedColumn = event.columns?.find((column: any) => column.sort);
    if (sortedColumn) {
      props?.SetSortField(sortedColumn.colId);
      props?.SetSortDirection(sortedColumn.sort);
    }
  };

  const handlePageChange = (page: number) => {
    props.SetCurrentPage(page);
  };

  const onGridReady = (params: any) => {
    gridRef.current = params;
    params.api.setDomLayout(dir === "rtl" ? "rtl" : "ltr");
  };
  
  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setDomLayout(dir === "rtl" ? "rtl" : "ltr");
    }
  }, [dir]);  

  const myTheme = themeQuartz.withParams({
    fontFamily: "inherit",
    borderColor: "#9BA9D2",
    borderRadius: "0px",
    browserColorScheme: "light",
    headerTextColor: "#9BA9D2",
    headerBackgroundColor: "transparent",
    backgroundColor: "transparent",
    oddRowBackgroundColor: "transparent",
    headerFontSize: 15,
    headerFontWeight: 600,
    headerRowBorder: { width: 1, color: "#9BA9D2" },
    headerColumnBorder: props?.EnableBorders ? { width: 1, color: "#9BA9D2" } : false,
    rowBorder: props?.EnableBorders ? { width: 1, color: "#9BA9D2" } : false,
    columnBorder: props?.EnableBorders ? { width: 1, color: "#9BA9D2" } : false,
    sidePanelBorder: false,
    wrapperBorder: false,
    cellTextColor: cellTextColor,
    wrapperBorderRadius: "0px",
    checkboxBorderRadius: "3px",
    checkboxBorderWidth: "2px",
    checkboxUncheckedBorderColor: "#E5E7EB",
  });

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
    <div className="flex flex-col gap-4 bg-accent p-3 rounded-2xl pb-6">
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
            <SelectTrigger className="w-20 text-sm font-normal text-secondary border-none shadow-lg bg-accent rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-accent rounded-md">
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