"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState, useRef } from "react";
import { PowerTablePagination } from "./power-table-pagination";
import { DynamicApi } from "@/lib/dynamicapi";
import { themeQuartz } from "ag-grid-community";
import { useLanguage } from "@/providers/LanguageProvider";
import { EditIcon } from "@/icons/icons";

const EditIconRenderer = ({ data, onEditClick }: { data: any, onEditClick: (data: any) => void }) => {
  const handleClick = () => {
    onEditClick(data);
  };

  return (
    <button onClick={handleClick}>
      {EditIcon()}
    </button>
  );
};

export default function     PowerTable({ props, api, showEdit, onEditClick  }: { props: any; afpi?: any; showEdit?: boolean; onEditClick?: (data: any) => void  }) {
  
  const { dir } = useLanguage();

  const gridRef = useRef<any>();

  const [TotalPages, SetTotalPages] = useState<number>(1);

  const [rows_per_page, set_rows_per_page] = useState<string>("5");

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

  useEffect(() => {
    if (api) {
      console.log(props.CurrentPage);
      FetchData();
    }
  }, [
    props?.CurrentPage,
    rows_per_page,
    props?.SortField,
    props?.SortDirection,
    props?.SearchValue,
  ]);
  
  const onSortChanged = (event: any) => {
    const sortColumns = event.columns;

    if (sortColumns && sortColumns.length > 0) {
      const sortedColumn = sortColumns.find(
        (column: any) => column.sort !== null && column.sort !== undefined
      );

      const sortedField = {
        field: sortedColumn?.colId,
        direction: sortedColumn?.sort,
      };

      if (sortedField.field) {
        props?.SetSortField(sortedField.field);
        props?.SetSortDirection(
          sortedField.direction === "asc" ? "asc" : "desc"
        );
      }
    }
  };

  const handlePageChange = (page: number) => {
    console.log("Navigating to page:", page);
    props.SetCurrentPage(page);
  };

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.api.setDomLayout(dir === "rtl" ? "rtl" : "ltr");
    }
  }, [dir]);

  const myTheme = themeQuartz.withParams({
    fontFamily: "Nunito Sans",
    borderColor: "#00000005",
    borderRadius: "0px",
    browserColorScheme: "light",
    columnBorder: false,
    headerTextColor: "#9BA9D2",
    headerBackgroundColor: "#FFFFFF",
    headerFontSize: 15,
    headerFontWeight: 600,
    headerRowBorder: { width: 1, color: '#E5EDF7' },
    rowBorder: false,
    sidePanelBorder: false,
    wrapperBorder: false,
    cellTextColor: "#2B3674",
    wrapperBorderRadius: "0px",
    checkboxBorderRadius: "3px",
    checkboxBorderWidth: "2px",
    checkboxUncheckedBorderColor: "#E5E7EB",
  });

  const columnDefs = [
    ...props.Columns,
    ...(showEdit
      ? [
          {
            field: "actions",
            headerName: "",
            cellRenderer: "editIconRenderer",
            cellStyle: { textAlign: "right", display: "flex", alignItems: "center", justifyContent: "end", whiteSpace: "normal", wordBreak: "break-word"},
            autoHeight:true,
          },
        ]
      : []),
  ];
  
  return (
    <div className="flex flex-col gap-4 bg-white p-3 rounded-2xl pb-6 width-screen">
      <div style={{ width: "100%" }}>
        <AgGridReact
          key={dir}
          enableRtl={dir === "rtl"}
          theme={myTheme}
          onSortChanged={(e: any) => {
            onSortChanged(e);
          }}
          rowData={props.Data}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          gridOptions={{
            // getRowHeight: () => 50,
            rowSelection: {
              mode: "multiRow",
            },
          }}
          rowStyle={{
            fontWeight: "bold",
          }}
          components={{
            editIconRenderer: (params: any) => <EditIconRenderer {...params} onEditClick={onEditClick} />,
          }}
        />
      </div>

      <div className="flex justify-between px-3">
        <div className="flex items-center gap-2">
          <Select
            defaultValue="5"
            value={rows_per_page}
            onValueChange={set_rows_per_page}
          >
            <SelectTrigger className="w-20 text-sm font-normal text-secondary border-none shadow-lg bg-white rounded-lg">
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