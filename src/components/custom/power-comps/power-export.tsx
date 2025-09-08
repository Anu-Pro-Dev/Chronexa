"use client";

import { Button } from "@/src/components/ui/button";
import { ExportExcelIcon, ExportPDFIcon, ExportWordIcon } from "@/src/icons/icons";
import React from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import * as docx from "docx";

interface PowerExportProps {
  data: Record<string, any>[];
  fileName?: string;
  enableExcel?: boolean;
  enablePdf?: boolean;
  enableWord?: boolean;
}

export default function PowerExport({
  data,
  fileName = "report",
  enableExcel = false,
  enablePdf = false,
  enableWord = false,
}: PowerExportProps) {
  const { translations } = useLanguage();

  const handleExportExcel = async () => {
    if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
      console.warn("Export failed: Invalid or empty data array.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    const headers = Object.keys(data[0]).map((key) => key.toUpperCase());
    worksheet.addRow(headers);

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    });

    data.forEach((item) => {
      worksheet.addRow(Object.values(item));
    });

    worksheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const length = String(cell.value ?? "").length;
        if (length > maxLength) maxLength = length;
        cell.alignment = { wrapText: true, vertical: "top" };
      });
      column.width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const handleExportWord = () => {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("Export failed: Invalid or empty data array.");
      return;
    }

    const toTitleCase = (str: string) =>
      str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

    const tableHeaders = Object.keys(data[0]);

    const tableRows = [
      // Header row
      new docx.TableRow({
        children: tableHeaders.map((key) =>
          new docx.TableCell({
            shading: { fill: "0078D4" },
            children: [
              new docx.Paragraph({
                text: toTitleCase(key),
                style: "tableHeader",
              }),
            ],
          })
        ),
      }),
      // Data rows
      ...data.map((item) =>
        new docx.TableRow({
          children: Object.values(item).map((val) =>
            new docx.TableCell({
              children: [new docx.Paragraph({ text: String(val) })],
            })
          ),
        })
      ),
    ];

    const doc = new docx.Document({
      styles: {
        paragraphStyles: [
          {
            id: "tableHeader",
            name: "Table Header",
            basedOn: "Normal",
            next: "Normal",
            run: { size: 20, bold: true, color: "FFFFFF" },
            paragraph: { alignment: docx.AlignmentType.CENTER },
          },
          {
            id: "titleHeading",
            name: "Title Heading",
            basedOn: "Normal",
            next: "Normal",
            run: { bold: true, size: 32, allCaps: true },
            paragraph: { alignment: docx.AlignmentType.CENTER, spacing: { after: 300 } },
          },
        ],
      },
      sections: [
        {
          children: [
            new docx.Paragraph({ text: fileName, style: "titleHeading" }),
            new docx.Table({ rows: tableRows }),
          ],
        },
      ],
    });

    docx.Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${fileName}.docx`);
    });
  };

  const handleExportPDF = async () => {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("Export failed: Invalid or empty data array.");
      return;
    }

    // Import html2pdf dynamically (client only)
    const html2pdf = (await import("html2pdf.js")).default;

    const tableHeaders = Object.keys(data[0]).map((key) =>
      key.replace(/([A-Z])/g, " $1").toUpperCase()
    );
    const tableRows = data.map((item) =>
      Object.values(item).map((value) => String(value))
    );

    // Build table HTML
    let tableHTML = `
      <table style="width:100%; border: 1px solid black; border-collapse: collapse; font-family: Arial, sans-serif;">
        <thead style="background-color: #f2f2f2;">
          <tr>
    `;

    tableHeaders.forEach((header) => {
      tableHTML += `
        <th style="padding: 10px; border: 1px solid black; text-align: center; font-weight: bold; text-transform: capitalize;">
          ${header}
        </th>
      `;
    });

    tableHTML += "</tr></thead><tbody>";

    tableRows.forEach((row) => {
      tableHTML += "<tr>";
      row.forEach((cell) => {
        tableHTML += `
          <td style="padding: 10px; border: 1px solid black; text-align: center;">
            ${cell}
          </td>
        `;
      });
      tableHTML += "</tr>";
    });

    tableHTML += "</tbody></table>";

    const tempElement = document.createElement("div");
    tempElement.innerHTML = tableHTML;

    html2pdf()
      .from(tempElement)
      .toPdf()
      .get("pdf")
      .then((pdf: { save: (fileName: string) => void }) => {
        pdf.save(`${fileName}.pdf`);
      });
  };

  return (
    <div className="flex gap-2">
      {enableExcel && (
        <Button
          onClick={handleExportExcel}
          variant="success"
          size="sm"
          className="flex items-center space-y-0.5 bg-[#21A366]"
        >
          <ExportExcelIcon />
          <span>{translations?.buttons.export_excel}</span>
        </Button>
      )}

      {enablePdf && (
        <Button
          onClick={handleExportPDF}
          variant="success"
          size="sm"
          className="flex items-center space-y-0.5 bg-[#DD2025]"
        >
          <ExportPDFIcon />
          <span>{translations?.buttons.export_pdf}</span>
        </Button>
      )}

      {enableWord && (
        <Button
          onClick={handleExportWord}
          size="sm"
          className="flex items-center space-y-0.5 bg-[#00A2ED]"
        >
          <ExportWordIcon />
          <span>{translations?.buttons.export_word}</span>
        </Button>
      )}
    </div>
  );
}
