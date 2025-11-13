"use client";
import React, { useState } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import FilterForm from "@/src/components/custom/modules/scheduling/MonthlyScheduleFilterForm";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import MonthlyScheduleTable from "./schedule-table";
import {
  CopyIcon,
  ExportIcon,
  ImportIcon,
  PasteIcon,
} from "@/src/icons/icons";
import toast from "react-hot-toast";
import { importMonthlyRosterRequest } from "@/src/lib/apiHandler";

export default function Page() {
  const { translations, modules } = useLanguage();
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [filterData, setFilterData] = useState<any>(null);
  
  const props = {
    SearchValue,
    SetSearchValue,
  };

  const handleFilterSubmit = (data: any) => {
    setFilterData(data);
  };

  const handleImport = async (file: File) => {
      try {
      const result = await importMonthlyRosterRequest(file);
      toast.success('Import successful');
    } catch (error) {
      toast.error('Import failed');
    }
  };
  
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.scheduling?.items}
      />

      <div className="flex flex-col justify-between bg-accent rounded-[15px] items-center px-5 py-3">
        <div className="w-full py-3">
          <FilterForm onFilterSubmit={handleFilterSubmit} />
        </div>
      </div>
      <div className="flex flex-col justify-between bg-accent rounded-[15px] items-center px-5 py-3">
        <div className="w-full flex py-3 justify-between items-center">
          <Input
            className="border-0 p-0 h-auto rounded-none text-text-secondary"
            type="file"
          />
          <div className="flex items-center gap-2">
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold">
              <ImportIcon /> {translations?.buttons?.import}
            </Button>
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold">
              <ExportIcon /> {translations?.buttons?.export}
            </Button>
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold">
              <CopyIcon /> {translations?.buttons?.copy_roster}
            </Button>
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold">
              <CopyIcon /> {translations?.buttons?.copy}
            </Button>
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold" disabled>
              <PasteIcon /> {translations?.buttons?.paste}
            </Button>
          </div>
        </div>
      </div>
      <div className="relative">
        <MonthlyScheduleTable 
          groupFilter={filterData?.employee_group_id} 
          filterData={filterData}
        />
      </div>
    </div>
  );
}