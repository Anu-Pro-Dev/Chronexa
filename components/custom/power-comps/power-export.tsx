"use client";

import { Button } from "@/components/ui/button";
import { ExportExcelIcon } from "@/icons/icons";
import React from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface PowerExportProps {
  data: Record<string, any>[];
  fileName?: string;
}

export default function PowerExport({ data, fileName = "exported_data" }: PowerExportProps) {
  const { translations } = useLanguage();

  const handleExport = async () => {
    if (!data || data.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Extract headers from first item
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    // Add data rows
    data.forEach((item) => {
      worksheet.addRow(Object.values(item));
    });

    // Create buffer and save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

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