"use client";
import React, { useState, useMemo } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import { useLanguage } from "@/providers/LanguageProvider";
import FilterForm from "@/forms/scheduling/MonthlyScheduleFilterForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PowerTableRoster from "@/components/custom/power-comps/power-table-roster";
import {
  CopyIcon,
  ExportIcon,
  ImportIcon,
  LockIcon,
  UnlockIcon,
  DeleteIcon,
  PasteIcon,
  SaveIcon,
} from "@/icons/icons";
import { scheduleData } from "./demo/data";

export default function Page() {
  const { modules } = useLanguage();
  const [SearchValue, SetSearchValue] = useState<string>("");

  const [filter_open, filter_on_open_change] = useState<boolean>(false);

  const [Data, SetData] = useState<any>(() => {
    return scheduleData.flatMap((category: any) => {
      const flattenedRows = category.subcategories.flatMap((subcategory: any) => {
        return subcategory.rows.map((row: any) => {
          // Convert schedule slots into day-wise structure
          const schedule = row.slots.reduce((acc: any, slot: any, idx: number) => {
            acc[idx + 1] = slot.status; // Map slots to 1-31 for the days of the month
            return acc;
          }, {});
          return {
            ...row,
            category: category.name,
            subcategory: subcategory.name,
            ...schedule,
          };
        });
      });

      return flattenedRows;
    });
  });

  const [Columns] = useState(() => {
    const dayColumns = Array.from({ length: 31 }, (_, i) => ({
      field: `${i + 1}`,
      headerName: `${i + 1}`,
      width: 50,
      cellStyle: (params: any) => {
        switch (params.value) {
          case "Nor":
            return {
              backgroundColor: "#0E6ECF",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "800",
              width: "30px",
              height: "25px",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            };
          case "Nig":
            return {
              backgroundColor: "#DF2F4A",
              color: "#fff",
              fontSize: "12px",
              width: "30px",
              height: "25px",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            };
          case "Day":
            return {
              backgroundColor: "#00C875",
              color: "#fff",
              fontSize: "12px",
              width: "30px",
              height: "25px",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            };
          case "Fri":
            return {
              backgroundColor: "#9D50DD",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "800",
              width: "30px",
              height: "25px",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            };
          default:
            return {};
        }
      },
    }));

    return [
      { field: "category", headerName: "Category", width: 200 },
      { field: "subcategory", headerName: "Subcategory", width: 200 },
      { field: "number", headerName: "Number", width: 150 },
      { field: "name", headerName: "Name", width: 150 },
      // { field: "version", headerName: "Version", width: 100 },
      { field: "status", headerName: "Status", width: 100 },
      ...dayColumns,
      { field: "hours", headerName: "Work Hours", width: 120, pinned: "right" },
    ];
  });

  const props = {
    Data,
    SetData,
    Columns,
    SearchValue,
    SetSearchValue,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        // enableClear
        props={props}
        items={modules?.scheduling?.items}
        // enableFilters
        disableAdd
        disableDelete
        
        // filter_modal_component={
        //   <FilterForm on_open_change={filter_on_open_change} />
        // }
        // isLarge
        // filter_modal_title="none"
      />

      <div className="flex flex-col justify-between bg-accent rounded-[15px] items-center px-5 py-3">
        <div className="w-full py-3">
          <FilterForm />
        </div>
        <div className="w-full flex py-3 justify-between items-center">
          <Input
            className="border-0 p-0 h-auto rounded-none text-text-secondary"
            type="file"
          />
          <div className="flex items-center gap-2">
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold">
              <ImportIcon /> Import
            </Button>
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold">
              <ExportIcon /> Export
            </Button>
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold">
              <CopyIcon /> Copy Roster
            </Button>
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold">
              <CopyIcon /> Copy
            </Button>
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold" disabled>
              <PasteIcon /> Paste
            </Button>
          </div>
        </div>
      </div>

      <PowerTableRoster props={props} />

      <div className="justify-end gap-4 flex">
        <Button size={"sm"} type="button">
          <SaveIcon />
          Save
        </Button>
        <Button size={"sm"} type="button" variant="success">
          <LockIcon />
          Finalize
        </Button>
        <Button size={"sm"} type="button" className="text-[#979797] bg-[#F3F3F3] border border-[#E7E7E7]">
          <UnlockIcon />
          Un-finalize
        </Button>
        <Button size={"sm"} type="button" variant="destructive">
          <DeleteIcon />
          Clear
        </Button>
      </div>
    </div>
  );
}