"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import AddManageMovements from "@/forms/self-services/AddManageMovements";
import FilterManualMovement from "@/forms/self-services/FilterManualMovement";

export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const [DataAdd, SetDataAdd] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "employee" },
    { field: "date" },
    { field: "from_date" },
    { field: "to_date" },
    { field: "from_time" },
    { field: "to_time" },
    { field: "status" },
  ]);

  const [ColumnsAdd, setColumnsAdd] = useState([
    { field: "number" },
    { field: "name" },
    { field: "designation" },
    { field: "organization" },
    { field: "schedule_type" },

  ]);

  const [open, on_open_change] = useState<boolean>(false);
  const [filter_open, filter_on_open_change] = useState<boolean>(false);
  const [CurrentPage, SetCurrentPage] = useState<number>(1)
  const [SortField, SetSortField] = useState<string>("")
  const [SortDirection, SetSortDirection] = useState<string>("asc")
  const [CurrentPageAdd, SetCurrentPageAdd] = useState<number>(1)
  const [SortFieldAdd, SetSortFieldAdd] = useState<string>("")
  const [SortDirectionAdd, SetSortDirectionAdd] = useState<string>("asc")
  const [SearchValue, SetSearchValue] = useState<string>("")

   const props = {
    Data,
    SetData,
    Columns,
    filter_open,
    filter_on_open_change,
    SortField,
    CurrentPage,
    SetCurrentPage,
    SetSortField,
    SortDirection,
    SetSortDirection,
    SearchValue,
    SetSearchValue,
    open,
    on_open_change,
  };

  const propsAdd = {
    Data:DataAdd,
    SetData:SetDataAdd,
    Columns: ColumnsAdd,
    filter_open,
    filter_on_open_change,
    SortField: SortFieldAdd,
    CurrentPage: CurrentPageAdd,
    SetCurrentPage: SetCurrentPageAdd,
    SetSortField : SetSortFieldAdd,
    SortDirection: SortDirectionAdd,
    SetSortDirection: SetSortDirectionAdd,
    SearchValue,
    SetSearchValue,
    open,
    on_open_change,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.selfServices?.items}
        enableFilters
        modal_title="none"
        modal_component={<AddManageMovements on_open_change={on_open_change} props={propsAdd} />}
        isLarge2={true}
        filter_modal_title="none"
        filter_modal_component={
          <FilterManualMovement on_open_change={filter_on_open_change} />
        }
        isLarge={true}
      />
      <div className="bg-white rounded-2xl">
        <div className="col-span-2 p-6">
          <h1 className="font-bold text-xl text-primary">Manual Movements</h1>
          <h1 className="font-semibold text-sm text-text-secondary">
            Manual Movements can be viewed in this tab
          </h1>
        </div>
        <div className="px-6">
          <PowerTabs items={modules?.selfServices?.manage_movements?.items} />
        </div>
        <PowerTable props={props} api={"/self-services/manage-movements/manual"} />
      </div>
    </div>
  );
}
