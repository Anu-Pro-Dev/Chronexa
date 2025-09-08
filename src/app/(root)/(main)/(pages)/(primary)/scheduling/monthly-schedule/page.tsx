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
  LockIcon,
  UnlockIcon,
  DeleteIcon,
  PasteIcon,
  SaveIcon,
} from "@/src/icons/icons";

export default function Page() {
  const { translations, modules } = useLanguage();
  const [SearchValue, SetSearchValue] = useState<string>("");
  
  const props = {
    SearchValue,
    SetSearchValue,
  };
  
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.scheduling?.items}
        disableAdd
        disableDelete
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
      <div className="justify-end gap-4 flex">
        <Button size={"sm"} type="button">
          <SaveIcon /> {translations?.buttons?.save}
        </Button>
        <Button size={"sm"} type="button" variant="success">
          <LockIcon /> {translations?.buttons?.finalize}
        </Button>
        <Button size={"sm"} type="button" className="text-[#979797] bg-[#F3F3F3] border border-[#E7E7E7]">
          <UnlockIcon /> {translations?.buttons?.un_finalize}
        </Button>
        <Button size={"sm"} type="button" variant="destructive">
          <DeleteIcon /> {translations?.buttons?.clear}
        </Button>
      </div>
      <div className="relative">
        <MonthlyScheduleTable />
      </div>
    </div>
  );
}
