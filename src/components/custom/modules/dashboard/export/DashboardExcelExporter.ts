import { format } from "date-fns";

const MAX_ROWS = 100000;
const WARN_ROWS = 50000;
const CHUNK_SIZE = 500;

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportMeta {
  title: string;
  filters?: Record<string, string>;
  description?: string;
}

export class DashboardExcelExporter {
  private static getTextWidth(text: string): number {
    const wideChars = /[MW]/g;
    const wideCount = (text.match(wideChars) || []).length;
    return text.length + wideCount * 0.5;
  }

  private static applyCellStyle(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cell: any,
    styleType: "header" | "data" | "title" | "label" | "value"
  ) {
    const border = {
      top: { style: "thin" as const },
      left: { style: "thin" as const },
      bottom: { style: "thin" as const },
      right: { style: "thin" as const },
    };

    switch (styleType) {
      case "header":
        cell.font = { name: "Nunito Sans", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        break;
      case "data":
        cell.font = { name: "Nunito Sans", size: 9 };
        cell.alignment = { vertical: "middle", wrapText: true };
        break;
      case "title":
        cell.font = { name: "Nunito Sans", bold: true, size: 14, color: { argb: "FF0078D4" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        break;
      case "label":
        cell.font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        break;
      case "value":
        cell.font = { name: "Nunito Sans", size: 9 };
        cell.alignment = { vertical: "middle" };
        break;
    }
    cell.border = border;
  }

  private static async yieldToMain(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  static async export(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>[],
    columns: ExportColumn[],
    meta: ExportMeta,
    filename?: string
  ): Promise<void> {
    if (data.length === 0) {
      throw new Error("No data to export");
    }

    if (data.length > MAX_ROWS) {
      data = data.slice(0, MAX_ROWS);
    }

    if (data.length > WARN_ROWS) {
      // warn via console; caller can show toast if desired
      console.warn(
        `Large dataset: ${data.length} rows. Export may be slow.`
      );
    }

    const [{ default: ExcelJS }, fileSaver] = await Promise.all([
      import("exceljs"),
      import("file-saver"),
    ]);
    const { saveAs } = fileSaver;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Chronexa Dashboard";
    workbook.created = new Date();

    // ── Data sheet ──────────────────────────────────────────────────────────
    const dataSheet = workbook.addWorksheet("Data");
    let currentRow = 1;

    const colCount = columns.length;
    const lastCol = colCount <= 26
      ? String.fromCharCode(64 + colCount)
      : "Z";

    // Title
    dataSheet.mergeCells(`A${currentRow}:${lastCol}${currentRow}`);
    const titleCell = dataSheet.getCell(`A${currentRow}`);
    titleCell.value = meta.title.toUpperCase();
    this.applyCellStyle(titleCell, "title");
    dataSheet.getRow(currentRow).height = 30;
    currentRow += 2;

    // Generated timestamp
    dataSheet.mergeCells(`A${currentRow}:${lastCol}${currentRow}`);
    const genCell = dataSheet.getCell(`A${currentRow}`);
    genCell.value = `Generated: ${format(new Date(), "dd MMM yyyy HH:mm:ss")}`;
    genCell.font = { name: "Nunito Sans", size: 9, italic: true, color: { argb: "FF666666" } };
    currentRow++;

    // Filters
    if (meta.filters) {
      const filterEntries = Object.entries(meta.filters).filter(([, v]) => v);
      if (filterEntries.length > 0) {
        dataSheet.mergeCells(`A${currentRow}:${lastCol}${currentRow}`);
        const filterCell = dataSheet.getCell(`A${currentRow}`);
        filterCell.value = `Filters: ${filterEntries.map(([k, v]) => `${k}: ${v}`).join(" | ")}`;
        filterCell.font = { name: "Nunito Sans", size: 9, italic: true, color: { argb: "FF666666" } };
        currentRow++;
      }
    }

    if (meta.description) {
      dataSheet.mergeCells(`A${currentRow}:${lastCol}${currentRow}`);
      const descCell = dataSheet.getCell(`A${currentRow}`);
      descCell.value = meta.description;
      descCell.font = { name: "Nunito Sans", size: 9, italic: true, color: { argb: "FF666666" } };
      currentRow++;
    }

    currentRow++;

    // Header row
    columns.forEach((col, i) => {
      const cell = dataSheet.getCell(currentRow, i + 1);
      cell.value = col.header.toUpperCase();
      this.applyCellStyle(cell, "header");
    });
    const headerRow = dataSheet.getRow(currentRow);
    headerRow.height = 22;
    currentRow++;

    // Data rows (in chunks for large datasets)
    const totalRows = data.length;
    for (let i = 0; i < totalRows; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      chunk.forEach((row) => {
        columns.forEach((col, colIndex) => {
          const cell = dataSheet.getCell(currentRow, colIndex + 1);
          const val = row[col.key];
          cell.value = val !== null && val !== undefined ? String(val) : "";
          this.applyCellStyle(cell, "data");
        });
        currentRow++;
      });
      await this.yieldToMain();
    }

    // Frozen panes (freeze header row)
    dataSheet.views = [{ state: "frozen", ySplit: currentRow - totalRows - 1 }];

    // Auto-fit column widths
    columns.forEach((col, i) => {
      const colIndex = i + 1;
      let maxWidth = col.header.length + 2;
      for (let r = currentRow - totalRows; r < currentRow; r++) {
        const cell = dataSheet.getCell(r, colIndex);
        if (cell.value) {
          const textWidth = this.getTextWidth(String(cell.value));
          maxWidth = Math.max(maxWidth, textWidth);
        }
      }
      dataSheet.getColumn(colIndex).width = Math.min(Math.max(maxWidth + 1, 10), 50);
    });

    // ── Metadata sheet ──────────────────────────────────────────────────────
    const metaSheet = workbook.addWorksheet("Metadata");

    const metaTitleCell = metaSheet.getCell("A1");
    metaTitleCell.value = "EXPORT METADATA";
    this.applyCellStyle(metaTitleCell, "title");
    metaSheet.mergeCells("A1:B1");

    const metaRows: [string, string][] = [
      ["Widget", meta.title],
      ["Export Date", format(new Date(), "dd MMM yyyy HH:mm:ss")],
      ["Total Rows", String(data.length)],
      ["Columns", String(columns.length)],
    ];

    if (meta.filters) {
      Object.entries(meta.filters).forEach(([key, value]) => {
        metaRows.push([`Filter: ${key}`, value]);
      });
    }

    metaRows.forEach(([key, value], idx) => {
      const rowNum = idx + 3;
      const keyCell = metaSheet.getCell(`A${rowNum}`);
      keyCell.value = key;
      this.applyCellStyle(keyCell, "label");
      const valCell = metaSheet.getCell(`B${rowNum}`);
      valCell.value = value;
      this.applyCellStyle(valCell, "value");
    });

    metaSheet.getColumn(1).width = 22;
    metaSheet.getColumn(2).width = 40;

    // ── Save ─────────────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const safeFilename =
      filename ||
      `${meta.title.replace(/[^a-zA-Z0-9]/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    saveAs(blob, safeFilename);
  }
}
