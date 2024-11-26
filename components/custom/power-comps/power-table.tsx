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

export default function PowerTable({ props }: { props: any }) {
  const [TotalPages, SetTotalPages] = useState<number>(20);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [rows_per_page, set_rows_per_page] = useState<string>("20");

  const onSortChanged = (event: any) => {
    const sortColumns = event.columns;

    if (sortColumns && sortColumns.length > 0) {
      const sortedColumn = sortColumns?.find(
        (column: any) => column.sort !== null && column.sort !== undefined
      );

      const sortedField = {
        field: sortedColumn?.colId,
        direction: sortedColumn?.sort,
      };
      console.log(sortedField);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="ag-theme-quartz" style={{ height: "60dvh" }}>
        <AgGridReact
          onSortChanged={(e: any) => {
            onSortChanged(e);
          }}
          rowData={props?.Data}
          columnDefs={props.Columns || []}
        />
      </div>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Select value={rows_per_page} onValueChange={set_rows_per_page}>
            <SelectTrigger className="w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["5", "10", "20", "30", "50"]?.map(
                (item: any, index: number) => (
                  <SelectItem value={item} key={index}>
                    {item}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <div>
            <p className=" text-xs">Records per page</p>
          </div>
        </div>
        <div>
          <PowerTablePagination
            totalPages={TotalPages}
            currentPage={CurrentPage}
            onPageChange={SetCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
