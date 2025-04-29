"use client";

import { Button } from "@/components/ui/button";
import { ExportExcelIcon } from "@/icons/icons";
import React from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Accepting data as a prop
interface PowerExportProps {
  data: Record<string, any>[];
  fileName?: string;
}

export default function PowerExport({ data, fileName = "exported_data" }: PowerExportProps) {
  const { translations } = useLanguage();

  const handleExport = () => {
    if (!data || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <div>
      <Button
        variant="success"
        size="sm"
        onClick={handleExport}
        className="flex items-center space-y-0.5 bg-[#21A366]"
      >
        <ExportExcelIcon />
        <span>{translations?.buttons.exportExcel}</span>
      </Button>
    </div>
  );
}