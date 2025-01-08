"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
import PowerTabs from "@/components/custom/power-comps/power-tabs";
import FilterDataOnVerification from "@/forms/self-services/FilterDataOnVerification";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const [Columns, setColumns] = useState([
    { field: "number" },
    { field: "name" },
  ]);

  const [open, on_open_change] = useState<boolean>(false);

  const [filter_open, filter_on_open_change] = useState<boolean>(false);

  const props = {
    Data,
    SetData,
    Columns,
    open,
    on_open_change,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.self_services?.items}
        disableFeatures
        enableFilters
        enable_take_action
        isLarge
        filter_modal_component={
          <FilterDataOnVerification on_open_change={filter_on_open_change} />
        }
      />
      <PowerTabs
        items={[
          {
            url: "/self-services/approvals/verification/",
            label: "Verification",
          },
          {
            url: "/self-services/approvals/pending/",
            label: "Pending",
          },
        ]}
      />
      <PowerTable props={props} api={"/self-services/approvals/pending"} />
    </div>
  );
}
