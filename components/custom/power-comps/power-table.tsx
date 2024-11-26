"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AgGridReact } from "ag-grid-react";
import React, { useState } from "react";

export default function PowerTable({ props }: { props: any }) {
  const [rows_per_page, set_rows_per_page] = useState<string>("20");
  return (
    <div className="flex flex-col gap-4">
      <div className="ag-theme-quartz" style={{ height: "60dvh" }}>
        <AgGridReact rowData={props?.Data} columnDefs={props.Columns} />
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
      </div>
    </div>
  );
}
