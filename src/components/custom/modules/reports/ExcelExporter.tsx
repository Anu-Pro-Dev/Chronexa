import { format } from "date-fns";
import { apiRequest } from "@/src/lib/apiHandler";

export interface ExcelExporterProps {
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
  onProgress?: (current: number, total: number, phase: string) => void;
  showToast: (type: 'success' | 'error', messageKey: string, params?: Record<string, any>) => void;
}

export class ExcelExporter {
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  private onProgress?: (current: number, total: number, phase: string) => void;
  private showToast: (type: 'success' | 'error', messageKey: string, params?: Record<string, any>) => void;

  constructor({ formValues, headerMap, calculateSummaryTotals, onProgress, showToast }: ExcelExporterProps) {
    this.formValues = formValues;
    this.headerMap = headerMap;
    this.calculateSummaryTotals = calculateSummaryTotals;
    this.onProgress = onProgress;
    this.showToast = showToast;
  }

  // 1-based column index -> Excel column letter (1 -> A, 27 -> AA)
  private colLetter(n: number): string {
    let s = '';
    while (n > 0) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }

  private getReportTitle(): string {
    const rt = this.formValues.report_type;
    if (rt === 'weekly') return 'EMPLOYEE WEEKLY ATTENDANCE REPORT';
    if (rt === 'monthly') return 'EMPLOYEE MONTHLY ATTENDANCE REPORT';
    if (rt === 'summary') return 'EMPLOYEE ATTENDANCE SUMMARY REPORT';
    return 'EMPLOYEE DAILY MOVEMENT REPORT';
  }

  // ── Columns per report type (mirrors the on-screen view headers) ──
  private getFilteredHeaders(): string[] {
    const rt = this.formValues.report_type;

    if (rt === 'weekly') {
      return ['EmployeeNo', 'Name', 'WeekStart', 'WeekEnd', 'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs', 'TotalAbsents'];
    }
    if (rt === 'monthly') {
      return ['EmployeeNo', 'Name', 'Month', 'Year', 'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs', 'TotalAbsents'];
    }
    if (rt === 'summary') {
      return ['EmployeeNo', 'Name', 'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs', 'TotalAbsents'];
    }
    return [
      'EmployeeNo', 'Name', 'ParentOrganization', 'Organization', 'Department',
      'BusinessUnit', 'EmployeeType', 'WorkDate', 'WorkDay', 'Shift', 'PunchIn', 'GeoLocationIn',
      'PunchOut', 'GeoLocationOut', 'DailyWorkedHrs', 'DailyMissedHrs',
      'DailyExtraWork', 'IsAbsent', 'MissedPunch', 'EmployeeStatus',
    ];
  }

  private getEmployeeDetails(data: any[]) {
    const hasSpecificEmployees = this.formValues.employee_ids && this.formValues.employee_ids.length > 0;
    if (hasSpecificEmployees && data.length > 0) {
      const firstRow = data[0];
      return {
        employeeId: firstRow?.EmployeeID || this.formValues.employee_ids[0] || '',
        employeeName: firstRow?.Name || '',
        employeeNo: firstRow?.EmployeeNo || '',
      };
    }
    return { employeeId: 'All Employees', employeeName: 'All Employees', employeeNo: '' };
  }

  private getTextWidth(text: string): number {
    const wideChars = /[MW]/g;
    const wideCount = (text.match(wideChars) || []).length;
    return text.length + wideCount * 0.5;
  }

  private formatCellValue(header: string, value: any): string {
    if (value === null || value === undefined || value === '') return '';

    // Date columns — format from the date part to avoid timezone day-shift
    if (header === 'WorkDate' || header === 'WeekStart' || header === 'WeekEnd') {
      try {
        const datePart = String(value).split(' ')[0].split('T')[0];
        const [year, month, day] = datePart.split('-');
        if (year && month && day) return `${day}-${month}-${year}`;
        return value;
      } catch {
        return value;
      }
    }

    if (header === 'PunchIn' || header === 'PunchOut') {
      return value || '';
    }

    // Already-formatted "HH:MM"/"HH:MM:SS" strings
    if ([
      'DailyWorkedHrs', 'DailyMissedHrs', 'DailyExtraWork',
      'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs',
    ].includes(header)) {
      return value || '';
    }

    return String(value);
  }

  private applyCellStyle(cell: any, styleType: 'header' | 'data' | 'title' | 'label' | 'value') {
    const baseStyle = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    switch (styleType) {
      case 'header':
        cell.font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        break;
      case 'data':
        cell.font = { name: "Nunito Sans", size: 8 };
        cell.alignment = { vertical: "middle", wrapText: true };
        break;
      case 'title':
        cell.font = { name: "Nunito Sans", bold: true, size: 12, color: { argb: "FF000000" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        break;
      case 'label':
        cell.font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        break;
      case 'value':
        cell.font = { name: "Nunito Sans", size: 9 };
        cell.alignment = { vertical: "middle" };
        break;
    }

    cell.border = baseStyle.border;
  }

  private async yieldToMain(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  private buildQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};

    if (this.formValues.from_date) params.from_date = format(this.formValues.from_date, 'yyyy-MM-dd');
    if (this.formValues.to_date) params.to_date = format(this.formValues.to_date, 'yyyy-MM-dd');
    if (this.formValues.manager_id) params.manager_id = this.formValues.manager_id.toString();
    if (this.formValues.organization) params.organization_id = this.formValues.organization.toString();
    if (this.formValues.company) params.organization_id = this.formValues.company.toString();
    if (this.formValues.department) params.department_id = this.formValues.department.toString();
    if (this.formValues.vertical) params.parent_orgid = this.formValues.vertical.toString();
    if (this.formValues.report_type && this.formValues.report_type !== 'daily') {
      params.type = this.formValues.report_type;
    }

    return params;
  }

  private buildUrl(params: Record<string, string>): string {
    const queryParts: string[] = [];

    if (this.formValues.employee_ids && this.formValues.employee_ids.length > 0) {
      queryParts.push(`employee_ids=${this.formValues.employee_ids.join(',')}`);
    }
    if (this.formValues.employee_type_ids && this.formValues.employee_type_ids.length > 0) {
      queryParts.push(`employee_type_ids=${this.formValues.employee_type_ids.join(',')}`);
    }

    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });

    const queryString = queryParts.join('&');
    return `/report/attendance${queryString ? `?${queryString}` : ''}`;
  }

  private async fetchDataInBatches(): Promise<any[]> {
    const allData: any[] = [];
    const BATCH_SIZE = 2000;
    let offset = 0;
    let hasMore = true;
    let apiTotal = 0;
    let fetchedRecords = 0;

    this.onProgress?.(0, 0, 'initializing');

    while (hasMore) {
      try {
        const baseParams = this.buildQueryParams();
        const params = {
          ...baseParams,
          limit: BATCH_SIZE.toString(),
          offset: offset.toString(),
        };

        const url = this.buildUrl(params);
        const response = await apiRequest(url, "GET");

        const batch = Array.isArray(response) ? response : (response.data || []);
        const total = response?.total || 0;

        if (offset === 0 && total > 0) apiTotal = total;

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        allData.push(...batch);
        fetchedRecords += batch.length;
        offset += BATCH_SIZE;

        hasMore = batch.length === BATCH_SIZE;

        this.onProgress?.(fetchedRecords, apiTotal || fetchedRecords, 'fetching');
        await this.yieldToMain();
      } catch (error) {
        console.error('Error fetching batch:', error);
        if (error && typeof error === 'object' && 'requireLogin' in error) {
          this.showToast('error', 'excel_session_expired');
          throw new Error('Session expired. Please login again.');
        }
        this.showToast('error', 'excel_fetch_error');
        throw new Error('Failed to fetch data from server');
      }
    }

    return allData;
  }

  async export(): Promise<void> {
    try {
      this.onProgress?.(0, 0, 'initializing');

      const allData = await this.fetchDataInBatches();

      if (allData.length === 0) {
        this.showToast('error', 'excel_no_data_error');
        return;
      }

      this.onProgress?.(allData.length, allData.length, 'processing');

      const excel = await import("exceljs");
      const ExcelJS = excel.default ?? excel;

      const fs = await import("file-saver");
      const { saveAs } = fs.default ?? fs;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");
      workbook.creator = "Report Generator";
      workbook.created = new Date();

      const filteredHeaders = this.getFilteredHeaders();
      const lastColIndex = filteredHeaders.length;
      const lastCol = this.colLetter(lastColIndex);
      const noLabelCol = this.colLetter(Math.max(lastColIndex - 1, 1));
      const noValueCol = lastCol;

      const { employeeId, employeeName, employeeNo } = this.getEmployeeDetails(allData);
      let currentRow = 1;

      // Brand row
      worksheet.mergeCells(`A${currentRow}:${lastCol}${currentRow}`);
      const brandCell = worksheet.getCell(`A${currentRow}`);
      brandCell.value = "CHRONEXA";
      brandCell.font = { name: "Nunito Sans", bold: true, size: 18, color: { argb: "FF0078D4" } };
      brandCell.alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getRow(currentRow).height = 35;
      currentRow += 2;

      // Title row (dynamic by report type)
      worksheet.mergeCells(`A${currentRow}:${lastCol}${currentRow}`);
      const titleCell = worksheet.getCell(`A${currentRow}`);
      titleCell.value = this.getReportTitle();
      titleCell.font = { name: "Nunito Sans", bold: true, size: 14, color: { argb: "FF0078D4" } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getRow(currentRow).height = 30;
      currentRow += 2;

      // Meta row
      const metaEmployeeLabel =
        Array.isArray(this.formValues.employee_ids) &&
        this.formValues.employee_ids.length === 1
          ? `Employee ID: ${employeeId}`
          : this.formValues.employee_ids && this.formValues.employee_ids.length > 1
          ? `Employees: ${this.formValues.employee_ids.length} selected`
          : `Employee: All`;
      worksheet.getCell(`A${currentRow}`).value = metaEmployeeLabel;
      worksheet.getCell(`A${currentRow}`).font = { name: "Nunito Sans", size: 10 };
      worksheet.getCell(`${lastCol}${currentRow}`).value = `Generated On: ${format(new Date(), "dd/MM/yyyy")}`;
      worksheet.getCell(`${lastCol}${currentRow}`).font = { name: "Nunito Sans", size: 10 };
      worksheet.getCell(`${lastCol}${currentRow}`).alignment = { horizontal: "right" };
      currentRow += 2;

      // Employee name / no — only meaningful for a single selected employee.
      // For multiple specific employees (or all), skip this block.
      const isSingleEmployee =
        Array.isArray(this.formValues.employee_ids) &&
        this.formValues.employee_ids.length === 1;

      if (isSingleEmployee) {
        const nameCell = worksheet.getCell(`A${currentRow}`);
        nameCell.value = 'EMPLOYEE NAME';
        this.applyCellStyle(nameCell, 'label');
        const nameValueCell = worksheet.getCell(`B${currentRow}`);
        nameValueCell.value = employeeName;
        this.applyCellStyle(nameValueCell, 'value');
        const empNoCell = worksheet.getCell(`${noLabelCol}${currentRow}`);
        empNoCell.value = 'EMPLOYEE NO';
        this.applyCellStyle(empNoCell, 'label');
        const empNoValueCell = worksheet.getCell(`${noValueCol}${currentRow}`);
        empNoValueCell.value = employeeNo;
        this.applyCellStyle(empNoValueCell, 'value');
        currentRow++;
      }

      // From / To
      if (this.formValues.from_date || this.formValues.to_date) {
        const fromDateCell = worksheet.getCell(`A${currentRow}`);
        fromDateCell.value = 'FROM DATE';
        this.applyCellStyle(fromDateCell, 'label');
        const fromDateValueCell = worksheet.getCell(`B${currentRow}`);
        fromDateValueCell.value = this.formValues.from_date ? format(this.formValues.from_date, 'dd/MM/yyyy') : '-';
        this.applyCellStyle(fromDateValueCell, 'value');
        const toDateCell = worksheet.getCell(`${noLabelCol}${currentRow}`);
        toDateCell.value = 'TO DATE';
        this.applyCellStyle(toDateCell, 'label');
        const toDateValueCell = worksheet.getCell(`${noValueCol}${currentRow}`);
        toDateValueCell.value = this.formValues.to_date ? format(this.formValues.to_date, 'dd/MM/yyyy') : '-';
        this.applyCellStyle(toDateValueCell, 'value');
        currentRow++;
      }

      currentRow += 1;

      // Header row
      filteredHeaders.forEach((header, index) => {
        const cell = worksheet.getCell(currentRow, index + 1);
        cell.value = (this.headerMap[header] || header).toUpperCase();
        this.applyCellStyle(cell, 'header');
      });
      currentRow++;

      this.onProgress?.(allData.length, allData.length, 'generating');

      // Data rows (chunked)
      const CHUNK_SIZE = 500;
      const totalRows = allData.length;
      let processedRows = 0;

      for (let i = 0; i < totalRows; i += CHUNK_SIZE) {
        const chunk = allData.slice(i, i + CHUNK_SIZE);

        chunk.forEach((row: Record<string, any>) => {
          filteredHeaders.forEach((header, index) => {
            const cell = worksheet.getCell(currentRow, index + 1);
            const cellValue = this.formatCellValue(header, row[header]);
            cell.value = cellValue;
            this.applyCellStyle(cell, 'data');

            if ((header === 'IsAbsent' && cellValue && cellValue !== '') ||
              (header === 'MissedPunch' && cellValue && cellValue !== '')) {
              cell.font = { ...cell.font, color: { argb: 'FFFF0000' } };
            }
          });
          currentRow++;
          processedRows++;
        });

        this.onProgress?.(processedRows, allData.length, 'generating');
        await this.yieldToMain();
      }

      // Summary section
      currentRow += 2;
      const summaryTotals = this.calculateSummaryTotals(allData);

      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const summaryTitleCell = worksheet.getCell(`A${currentRow}`);
      summaryTitleCell.value = 'SUMMARY TOTALS';
      this.applyCellStyle(summaryTitleCell, 'title');
      worksheet.getRow(currentRow).height = 25;
      currentRow += 2;

      const summaryData = [
        ['Total Worked Hours', summaryTotals.totalWorkedHours, 'Total Missed Hours', summaryTotals.totalMissedHours, 'Total Extra Hours', summaryTotals.totalExtraHours],
        ['Total Absents', summaryTotals.totalAbsents, '', '', '', ''],
      ];

      summaryData.forEach((rowData) => {
        for (let i = 0; i < rowData.length; i += 2) {
          const labelCol = String.fromCharCode(65 + i);
          const valueCol = String.fromCharCode(65 + i + 1);
          if (rowData[i]) {
            const labelCell = worksheet.getCell(`${labelCol}${currentRow}`);
            labelCell.value = rowData[i];
            this.applyCellStyle(labelCell, 'label');
            const valueCell = worksheet.getCell(`${valueCol}${currentRow}`);
            valueCell.value = rowData[i + 1];
            this.applyCellStyle(valueCell, 'value');
          }
        }
        currentRow++;
      });

      // Column widths — set width per column WITHOUT reassigning worksheet.columns
      // (reassigning .columns after merges/data can shift the merged title rows).
      filteredHeaders.forEach((_header, index) => {
        const colIndex = index + 1;
        let maxWidth = 0;
        for (let rowIndex = 1; rowIndex <= currentRow; rowIndex++) {
          const cell = worksheet.getCell(rowIndex, colIndex);
          if (cell.value) {
            const textWidth = this.getTextWidth(String(cell.value));
            maxWidth = Math.max(maxWidth, textWidth);
          }
        }
        worksheet.getColumn(colIndex).width = Math.min(Math.max(maxWidth + 1, 6), 40);
      });

      // Row heights
      for (let rowIndex = 1; rowIndex <= currentRow; rowIndex++) {
        const row = worksheet.getRow(rowIndex);
        if (rowIndex === 1) {
          row.height = 25;
        } else {
          let maxRequiredHeight = 25;
          row.eachCell((cell) => {
            if (cell.value && cell.alignment && cell.alignment.wrapText) {
              const cellText = String(cell.value);
              const columnWidth = worksheet.getColumn(cell.col).width || 15;
              const charsPerLine = Math.floor(columnWidth * 0.8);
              const lines = Math.ceil(cellText.length / charsPerLine);
              const requiredHeight = lines * 15;
              maxRequiredHeight = Math.max(maxRequiredHeight, requiredHeight);
            }
          });
          row.height = Math.min(Math.max(maxRequiredHeight, 15), 80);
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const rt = this.formValues.report_type || 'daily';
      const filename = `report_${rt}_${this.formValues.employee_ids?.length > 0
          ? this.formValues.employee_ids.length === 1
            ? 'employee_' + this.formValues.employee_ids[0]
            : this.formValues.employee_ids.length + '_employees'
          : 'all'
        }_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      this.onProgress?.(allData.length, allData.length, 'complete');
      saveAs(blob, filename);

      this.showToast('success', 'excel_export_success', { count: allData.length.toLocaleString() });
    } catch (error) {
      console.error("Excel export error:", error);
      if (error instanceof Error && error.message.includes('Session expired')) {
        // already toasted
      } else {
        this.showToast('error', 'excel_export_error');
      }
      throw error;
    }
  }
}