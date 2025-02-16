import { Button } from "@/components/ui/button";
import { ExportExcelIcon } from "@/icons/icons";
import React from "react";
import { useLanguage } from "@/providers/LanguageProvider";

export default function PowerExport() {
  const { translations } = useLanguage();

  return (
    <div>
      <Button
        variant={"success"}
        size={"sm"}
        className="flex items-center space-y-0.5 bg-[#21A366]"
      >
        <ExportExcelIcon />
        <span>{translations?.buttons.exportExcel}</span>
      </Button>
    </div>
  );
}
