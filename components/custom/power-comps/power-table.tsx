"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useMemo, useState } from "react";
import { PowerTablePagination } from "./power-table-pagination";
import { DynamicApi } from "@/lib/dynamicapi";
import { themeQuartz } from "ag-grid-community";
export default function PowerTable({ props, api }: { props: any; api?: any }) {
  const [TotalPages, SetTotalPages] = useState<number>(1);
  const [rows_per_page, set_rows_per_page] = useState<string>("5");

  console.log(props);
  const FetchData = async () => {
    try {
      const response: any = await DynamicApi(api, {
        page: props?.CurrentPage,
        limit: rows_per_page,
        sortField: props?.SortField,
        sortType: props?.SortDirection,
        search: props?.SearchValue,
      });
      console.log(response);
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

  const myTheme = themeQuartz.withParams({
    fontFamily: "Nunito Sans",
    borderColor: "#00000005",
    borderRadius: "0px",
    browserColorScheme: "light",
    columnBorder: false,
    headerTextColor: "#9BA9D2",
    headerBackgroundColor: "#FFFFFF",
    headerFontSize: 15,
    rowBorder: false,
    sidePanelBorder: false,
    wrapperBorder: false,
    headerFontWeight: 600,
    cellTextColor: "#2B3674",
    wrapperBorderRadius: "0px",
    checkboxBorderRadius: "3px",
    checkboxBorderWidth: "2px",
    checkboxUncheckedBorderColor: "#E5E7EB",
  });

  return (
    <div className="flex flex-col gap-4 bg-background p-3 rounded-2xl pb-6">
      <div className="">
        {props.row_selection !== false && (
          <AgGridReact
            gridOptions={{
              rowSelection: {
                mode: "multiRow",
              },
            }}
            rowStyle={{
              fontWeight: "bold",
            }}
            theme={myTheme}
            onSortChanged={(e: any) => {
              onSortChanged(e);
            }}
            rowData={props.Data}
            columnDefs={props.Columns || []}
            domLayout="autoHeight"
          />
        )}
        {props.row_selection === false && (
          <AgGridReact
            rowStyle={{
              fontWeight: "bold",
            }}
            theme={myTheme}
            onSortChanged={(e: any) => {
              onSortChanged(e);
            }}
            rowData={props.Data}
            columnDefs={props.Columns || []}
            domLayout="autoHeight"
          />
        )}
      </div>

      <div className="flex justify-between px-3">
        <div className="flex items-center gap-2">
          <Select
            defaultValue="5"
            value={rows_per_page}
            onValueChange={set_rows_per_page}
          >
            <SelectTrigger className="w-20 text-sm font-normal text-secondary border border-border-grey shadow-lg bg-background rounded-lg">
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
