"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import React, { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import FilterForm from "@/forms/monthly-roaster/FilterForm";
import { Button } from "@/components/ui/button";
import {
  CopyIcon,
  DeleteIcon,
  ExportIcon,
  ImportIcon,
  LockIcon,
  UnlockIcon,
} from "@/icons/icons";
import PowerTableRoaster from "@/components/custom/power-comps/power-table-roaster";
import { SaveIcon } from "lucide-react";

export default function Page() {
  const { modules } = useLanguage();

  // Initial data for the table
  const [Data, SetData] = useState<any>([
    {
      category: "ADMIN - ADMIN",
      subcategory:
        "A/ Executive Director Corporate Support Services Centre - A/ Executive Director Corporate Support Services Centre",
      rows: [
        {
          name: "Executive",
          number: "DGS78",
          version: "Normal",
          status: "Locked",
          schedule: [
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nig",
            "Nor",
            "Day",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
          ],
          work_hours: "170:00",
        },
      ],
    },
    {
      category: "ADMIN - ADMIN",
      subcategory: "Advisor - Advisor",
      rows: [
        {
          name: "Employee 61",
          number: "DGS131",
          version: "Normal",
          status: "Locked",
          schedule: [
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nig",
            "Nor",
            "Day",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
          ],
          work_hours: "170:00",
        },
        {
          name: "Chairman",
          number: "ODGS1",
          version: "Normal",
          status: "Locked",
          schedule: [
            "Nor",
            "Nor",
            "Nor",
            "Nig",
            "Nig",
            "Day",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
            "Nor",
          ],
          work_hours: "189:30",
        },
      ],
    },
  ]);

  // Generate columns dynamically
  const [Columns, setColumns] = useState(() => {
    const dayColumns = Array.from({ length: 31 }, (_, i) => ({
      field: `${i + 1}`,
      headerName: `${i + 1}`,
      width: 50,
      cellStyle: (params: any) => {
        switch (params.value) {
          case "Nor":
            return {
              backgroundColor: "#007bff",
              color: "#fff",
              fontSize: "10px",
            };
          case "Nig":
            return {
              backgroundColor: "#6c757d",
              color: "#fff",
              fontSize: "10px",
            };
          case "Day":
            return {
              backgroundColor: "#28a745",
              color: "#fff",
              fontSize: "10px",
            };
          default:
            return {};
        }
      },
    }));
    return [
      { field: "category", headerName: "Category", width: 200 },
      { field: "subcategory", headerName: "Subcategory", width: 200 },
      { field: "number", headerName: "Employee ID", width: 150 },
      { field: "name", headerName: "Name", width: 200 },
      ...dayColumns,
      {
        field: "work_hours",
        headerName: "Work Hours",
        pinned: "right",
        width: 120,
      },
    ];
  });

  // Handle filter modal state
  const [filter_open, filter_on_open_change] = useState<boolean>(false);

  // Flatten the data for rendering, add `category` and `subcategory` columns
  const flattenedData = Data.flatMap((group: any) => {
    const categoryRow = {
      category: group.category,
      subcategory: "", // No subcategory in this row
      name: "Category", // Special name for the category row
      schedule: Array(31).fill(""), // Empty schedule cells
      work_hours: "",
    };
    const subcategoryRow = {
      category: "",
      subcategory: group.subcategory,
      name: "Subcategory", // Special name for the subcategory row
      schedule: Array(31).fill(""), // Empty schedule cells
      work_hours: "",
    };
    const rows = group.rows.map((row: any) => {
      const days = row.schedule.reduce(
        (acc: any, day: string, index: number) => {
          acc[index + 1] = day;
          return acc;
        },
        {}
      );
      return {
        ...row,
        ...days,
        category: group.category,
        subcategory: group.subcategory,
      };
    });

    return [categoryRow, subcategoryRow, ...rows];
  });

  const props = {
    Data: flattenedData,
    SetData,
    Columns,
    filter_open,
    filter_on_open_change,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        enableClear
        props={props}
        items={modules?.scheduling?.items}
        disableFeatures
        enableFilters
        filter_modal_component={
          <FilterForm on_open_change={filter_on_open_change} />
        }
        isLarge
        filter_modal_description="Select the filter for further process"
      />
      <div className="flex justify-between items-center gap-4">
        <input
          type="file"
          className="border rounded-md text-primary px-2 py-2"
        />
        <div className="flex items-center gap-2">
          <Button className="border-primary-50 bg-white text-primary border bg-primary/40">
            <ImportIcon /> Import
          </Button>
          <Button className="border-primary-50 bg-white text-primary border bg-primary/40">
            <ExportIcon /> Export
          </Button>
          <Button className="border-primary-50 bg-white text-primary border bg-primary/40">
            <CopyIcon /> Copy Roaster
          </Button>
          <Button className="border-primary-50 bg-white text-primary border bg-primary/40">
            <CopyIcon /> Copy
          </Button>
        </div>
      </div>

      {/* Render the table */}
      <PowerTableRoaster props={props} />
      <div className="justify-end gap-4 flex">
        <Button>
          <SaveIcon />
          Save
        </Button>
        <Button variant="success">
          <LockIcon />
          Finalize
        </Button>
        <Button className="bg-[#f3f3f3] text-black border">
          <UnlockIcon />
          Un-finalize
        </Button>
        <Button variant="destructive">
          <DeleteIcon />
          Clear
        </Button>
      </div>
    </div>
  );
}
