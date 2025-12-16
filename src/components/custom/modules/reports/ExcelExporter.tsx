import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { apiRequest } from "@/src/lib/apiHandler"; 

export interface ExcelExporterProps {
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
  onProgress?: (current: number, total: number, phase: string) => void;
}

export class ExcelExporter {
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  private onProgress?: (current: number, total: number, phase: string) => void;
  
  constructor({ formValues, headerMap, calculateSummaryTotals, onProgress }: ExcelExporterProps) {
    this.formValues = formValues;
    this.headerMap = headerMap;
    this.calculateSummaryTotals = calculateSummaryTotals;
    this.onProgress = onProgress;
  }

  private getFilteredHeaders() {   
    return [
      'employee_number',     
      'firstname_eng',
      'parent_org_eng',
      'organization_eng',
      'department_name_eng',
      'employee_type',
      'transdate',
      'WorkDay',
      'punch_in',
      'GeoLocation_In',
      'punch_out',
      'GeoLocation_Out',
      'dailyworkhrs',
      'DailyMissedHrs',
      'dailyextrawork',
      'isabsent',
      'MissedPunch',
      'EmployeeStatus'
    ];
  }

  private getEmployeeDetails(data: any[]) {
    const firstRow = data[0];
    const isSpecificEmployee = this.formValues.employee && this.formValues.employee !== '';
    
    if (isSpecificEmployee) {
      return {
        employeeId: firstRow?.employee_id || this.formValues.employee || '',
        employeeName: firstRow?.firstname_eng || '',
        employeeNo: firstRow?.employee_number || '',
      };
    } else {
      return {
        employeeId: 'All Employees',
        employeeName: 'All Employees',
        employeeNo: '', 
      };
    }
  }

  private getTextWidth(text: string): number {
    const wideChars = /[MW]/g;
    const wideCount = (text.match(wideChars) || []).length;
    return text.length + wideCount * 0.5;
  }

  private formatCellValue(header: string, value: any): string {
    if (!value && value !== 0) return '';
    
    if (header === 'transdate' && value) {
      if (typeof value === 'string') {
        const datePart = value.split(' ')[0].split('T')[0];
        if (datePart.includes('-')) {
          const [year, month, day] = datePart.split('-');
          return `${day}-${month}-${year}`;
        }
      }
      return value;
    }

    if ((header === 'punch_in' || header === 'punch_out') && value) {
      if (typeof value === 'string') {
        if (value.includes('T')) {
          const timePart = value.split('T')[1];
          return timePart.split('.')[0];
        }
        if (value.includes(' ')) {
          const timePart = value.split(' ')[1];
          return timePart.split('.')[0]; 
        }
        if (value.includes(':')) {
          return value.split('.')[0];
        }
      }
      return value;
    }

    if (['late', 'early', 'dailyworkhrs', 'DailyMissedHrs', 'dailyextrawork'].includes(header)) {
      if (value === '0' || value === 0) return '00:00:00';
      
      if (typeof value === 'string') {
        let timeOnly = value;
        if (value.includes('T')) {
          timeOnly = value.split('T')[1];
        } else if (value.includes(' ')) {
          timeOnly = value.split(' ')[1];
        }
        return timeOnly.split('.')[0];
      }
      
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '00:00:00';
      
      const totalSeconds = Math.round(Math.abs(numValue) * 3600);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return String(value);
  }

  private applyCellStyle(cell: any, styleType: 'header' | 'data' | 'title' | 'label' | 'value') {
    const baseStyle = {
      border: {
        top: { style: 'thin' }, 
        left: { style: 'thin' }, 
        bottom: { style: 'thin' }, 
        right: { style: 'thin' }
      }
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

    if (this.formValues.from_date) {
      params.from_date = format(this.formValues.from_date, 'yyyy-MM-dd');
    }

    if (this.formValues.to_date) {
      params.to_date = format(this.formValues.to_date, 'yyyy-MM-dd');
    }

    if (this.formValues.employee) {
      params.employee_id = this.formValues.employee.toString();
    }

    if (this.formValues.manager_id) {
      params.manager_id = this.formValues.manager_id.toString();
    }

    if (this.formValues.employee_type) {
      params.employee_type = this.formValues.employee_type.toString();
    }

    if (this.formValues.organization) {
      params.organization_id = this.formValues.organization.toString();
    }

    if (this.formValues.company) {
      params.organization_id = this.formValues.company.toString();
    }

    if (this.formValues.department) {
      params.department_id = this.formValues.department.toString();
    }

    if (this.formValues.vertical) {
      params.parent_orgid = this.formValues.vertical.toString();
    }

    return params;
  }

  private buildUrl(params: Record<string, string>): string {
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

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

        // Handle API response structure: {success, data, total, hasNext}
        const batch = Array.isArray(response) ? response : (response.data || []);
        const total = response?.total || 0;
        const hasNext = response?.hasNext ?? (batch.length === BATCH_SIZE);

        // Set total from first API response
        if (offset === 0 && total > 0) {
          apiTotal = total;
        }

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        allData.push(...batch);
        fetchedRecords += batch.length;
        offset += BATCH_SIZE;
        
        // Update hasMore based on API response
        hasMore = hasNext && batch.length === BATCH_SIZE;

        // Report progress with actual values
        this.onProgress?.(fetchedRecords, apiTotal || fetchedRecords, 'fetching');

        await this.yieldToMain();

      } catch (error) {
        console.error('Error fetching batch:', error);
        
        if (error && typeof error === 'object' && 'requireLogin' in error) {
          throw new Error('Session expired. Please login again.');
        }
        
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
        toast.error("No data available to export.");
        return;
      }

      this.onProgress?.(allData.length, allData.length, 'processing');

      const [{ default: ExcelJS }, fileSaver] = await Promise.all([
        import("exceljs"),
        import("file-saver"),
      ]);

      const { saveAs } = fileSaver;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      workbook.creator = "Report Generator";
      workbook.created = new Date();

      const filteredHeaders = this.getFilteredHeaders();
      const { employeeId, employeeName, employeeNo } = this.getEmployeeDetails(allData);
      let currentRow = 1;

      worksheet.mergeCells(`A${currentRow}:R${currentRow}`);
      const dailyReportsCell = worksheet.getCell(`A${currentRow}`);
      dailyReportsCell.value = "NULL";
      dailyReportsCell.font = {
        name: "Nunito Sans",
        bold: true,
        size: 18,
        color: { argb: "FFFFFFFF" },
      };
      dailyReportsCell.alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getRow(currentRow).height = 35;
      currentRow += 2;

      worksheet.mergeCells(`A${currentRow}:R${currentRow}`);
      const titleCell = worksheet.getCell(`A${currentRow}`);
      titleCell.value = "EMPLOYEE DAILY MOVEMENT REPORT";
      titleCell.font = {
        name: "Nunito Sans",
        bold: true,
        size: 14,
        color: { argb: "FF0078D4" },
      };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getRow(currentRow).height = 30;
      currentRow += 2;

      worksheet.getCell(`A${currentRow}`).value = `Employee ID: ${employeeId}`;
      worksheet.getCell(`A${currentRow}`).font = { name: "Nunito Sans", size: 10 };
      worksheet.getCell(`R${currentRow}`).value = `Generated On: ${format(new Date(), "dd/MM/yyyy")}`;
      worksheet.getCell(`R${currentRow}`).font = { name: "Nunito Sans", size: 10 };
      worksheet.getCell(`R${currentRow}`).alignment = { horizontal: "right" };
      currentRow += 2;
      
      const nameCell = worksheet.getCell(`A${currentRow}`);
      nameCell.value = 'EMPLOYEE NAME';
      this.applyCellStyle(nameCell, 'label');
      const nameValueCell = worksheet.getCell(`B${currentRow}`);
      nameValueCell.value = employeeName;
      this.applyCellStyle(nameValueCell, 'value');
      const empNoCell = worksheet.getCell(`Q${currentRow}`);
      empNoCell.value = 'EMPLOYEE NO';
      this.applyCellStyle(empNoCell, 'label');
      const empNoValueCell = worksheet.getCell(`R${currentRow}`);
      empNoValueCell.value = employeeNo;
      this.applyCellStyle(empNoValueCell, 'value');
      currentRow++;

      if (this.formValues.from_date || this.formValues.to_date) {
        const fromDateCell = worksheet.getCell(`A${currentRow}`);
        fromDateCell.value = 'FROM DATE';
        this.applyCellStyle(fromDateCell, 'label');
        const fromDateValueCell = worksheet.getCell(`B${currentRow}`);
        fromDateValueCell.value = this.formValues.from_date ? format(this.formValues.from_date, 'dd/MM/yyyy') : '01/07/2025';
        this.applyCellStyle(fromDateValueCell, 'value');
        const toDateCell = worksheet.getCell(`Q${currentRow}`);
        toDateCell.value = 'TO DATE';
        this.applyCellStyle(toDateCell, 'label');
        const toDateValueCell = worksheet.getCell(`R${currentRow}`);
        toDateValueCell.value = this.formValues.to_date ? format(this.formValues.to_date, 'dd/MM/yyyy') : '31/07/2025';
        this.applyCellStyle(toDateValueCell, 'value');
        currentRow++;
      }

      currentRow += 1;
      
      filteredHeaders.forEach((header, index) => {
        const cell = worksheet.getCell(currentRow, index + 1);
        cell.value = (this.headerMap[header] || header).toUpperCase();
        this.applyCellStyle(cell, 'header');
      });
      currentRow++;

      this.onProgress?.(allData.length, allData.length, 'generating');

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
            
            if (
              (header === 'DailyMissedHrs' || header === 'late') &&
              cellValue &&
              parseFloat(cellValue) > 0
            ) {
              cell.font = { ...cell.font, color: { argb: 'FFFF0000' } };
            }
          });
          currentRow++;
          processedRows++;
        });

        // Update progress while generating Excel rows
        // This keeps the progress bar moving during the generation phase
        this.onProgress?.(processedRows, allData.length, 'generating');
        
        await this.yieldToMain();
      }

      currentRow += 2;
      const summaryTotals = this.calculateSummaryTotals(allData);

      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const summaryTitleCell = worksheet.getCell(`A${currentRow}`);
      summaryTitleCell.value = 'SUMMARY TOTALS';
      this.applyCellStyle(summaryTitleCell, 'title');
      worksheet.getRow(currentRow).height = 25;
      currentRow += 2;

      const summaryData = [
        ['Total Late In Hours', summaryTotals.totalLateInHours, 'Total Early Out Hours', summaryTotals.totalEarlyOutHours, 'Total Missed Hours', summaryTotals.totalMissedHours],
        ['Total Worked Hours', summaryTotals.totalWorkedHours, 'Total Extra Hours', summaryTotals.totalExtraHours, '', '']
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

      // Auto-sizing columns
      worksheet.columns = filteredHeaders.map(header => ({
        header: this.headerMap[header] || header,
        key: header,
        width: 10
      }));

      worksheet.columns.forEach((column, index) => {
        let maxWidth = 0;
        for (let rowIndex = 1; rowIndex <= currentRow; rowIndex++) {
          const cell = worksheet.getCell(rowIndex, index + 1);
          if (cell.value) {
            const cellText = String(cell.value);
            const textWidth = this.getTextWidth(cellText);
            maxWidth = Math.max(maxWidth, textWidth);
          }
        }
        column.width = Math.min(Math.max(maxWidth + 1, 6), 40);
      });

      // Auto-sizing rows
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

      const filename = `report_${
        this.formValues.employee
          ? "employee_" + this.formValues.employee
          : "all"
      }_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      this.onProgress?.(allData.length, allData.length, 'complete');
      saveAs(blob, filename);
      
      toast.success(`Excel file generated successfully! (${allData.length.toLocaleString()} records)`);
    } catch (error) {
      console.error("Excel export error:", error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        toast.error(error.message);
      } else {
        toast.error("Error generating Excel file. Please try again.");
      }
      throw error;
    }
  }
}