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
  const [rows_per_page, set_rows_per_page] = useState<string>("20");

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
    columnBorder: true,
    headerTextColor: "#9ba9d2",
    headerBackgroundColor: "#FFFFFF",
    headerFontSize: 14,
    rowBorder: true,
    sidePanelBorder: false,
    wrapperBorder: false,
    headerFontWeight: "bold",
    cellTextColor: "black",
    wrapperBorderRadius: "0px",
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="">
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
      </div>

      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Select
            defaultValue="20"
            value={rows_per_page}
            onValueChange={set_rows_per_page}
          >
            <SelectTrigger className="w-20 text-sm font-normal text-secondary border border-border-grey shadow-lg bg-white rounded-lg">
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
