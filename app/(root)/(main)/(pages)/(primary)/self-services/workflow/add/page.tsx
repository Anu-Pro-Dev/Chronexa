"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import AddWorkflow from "@/forms/self-services/AddWorkflow";
import WorkflowTable from "@/forms/self-services/WorkFlowTable";
import { useLanguage } from "@/providers/LanguageProvider";
import React, { useState } from "react";

export default function Add() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [open, on_open_change] = useState<boolean>(false);
  const props = {
    Data,
    SetData,
    SortField,
    CurrentPage,
    SetCurrentPage,
    SetSortField,
    SortDirection,
    SetSortDirection,
    open,
    on_open_change,
    SearchValue,
    SetSearchValue,
  };

  return (
    <div>
      <PowerHeader props={props} items={modules?.self_services?.items} />
      <div className="flex flex-col gap-6 pt-6 bg-white p-6 rounded-md mt-4">
        <AddWorkflow />
      </div>
      <div>
        <WorkflowTable />
      </div>
    </div>
  );
}
