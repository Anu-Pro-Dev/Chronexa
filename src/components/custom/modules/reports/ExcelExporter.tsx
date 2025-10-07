import { format } from "date-fns";
import { toast } from "react-hot-toast";

export interface ExcelExporterProps {
  data: any[];
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
}

export class ExcelExporter {
  private data: any[];
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  
  constructor({ data, formValues, headerMap, calculateSummaryTotals  }: ExcelExporterProps) {
    this.data = data;
    this.formValues = formValues;
    this.headerMap = headerMap;
    this.calculateSummaryTotals = calculateSummaryTotals;
  }

  private getFilteredHeaders() {   
    return [
      'employee_number',     
      'firstname_eng',
      'organization_eng',
      'transdate',
      'punch_in',
      'punch_out',
      'late',
      'early',
      'dailyworkhrs',
      'DailyMissedHrs',
      'dailyextrawork',
      'remarks',
      'isabsent'
    ];
  }

  private getEmployeeDetails() {
    const firstRow = this.data[0];
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
    if (header === 'transdate' && value) {
      try {
        const date = new Date(value);
        return format(date, 'dd-MM-yyyy');
      } catch {
        return value;
      }
    }
    
    if ((header === 'punch_in' || header === 'punch_out') && value) {
      try {
        const date = new Date(value);
        return format(date, 'HH:mm:ss');
      } catch {
        return value;
      }
    }
    
    return value || '';
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

  async export(): Promise<void> {
    if (this.data.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    try {
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

      const { employeeId, employeeName, employeeNo } = this.getEmployeeDetails();
      let currentRow = 1;

      worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
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

      worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
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

      worksheet.getCell(`M${currentRow}`).value = `Generated On: ${format(
        new Date(),
        "dd/MM/yyyy"
      )}`;
      worksheet.getCell(`M${currentRow}`).font = { name: "Nunito Sans", size: 10 };
      worksheet.getCell(`M${currentRow}`).alignment = { horizontal: "right" };
      currentRow += 2;
      
      const nameCell = worksheet.getCell(`A${currentRow}`);
      nameCell.value = 'EMPLOYEE NAME';
      this.applyCellStyle(nameCell, 'label');

      const nameValueCell = worksheet.getCell(`B${currentRow}`);
      nameValueCell.value = employeeName;
      this.applyCellStyle(nameValueCell, 'value');

      const empNoCell = worksheet.getCell(`L${currentRow}`);
      empNoCell.value = 'EMPLOYEE NO';
      this.applyCellStyle(empNoCell, 'label');

      const empNoValueCell = worksheet.getCell(`M${currentRow}`);
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

        const toDateCell = worksheet.getCell(`L${currentRow}`);
        toDateCell.value = 'TO DATE';
        this.applyCellStyle(toDateCell, 'label');

        const toDateValueCell = worksheet.getCell(`M${currentRow}`);
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

      this.data.forEach((row: Record<string, any>) => {
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
      });

      currentRow += 2;
      const summaryTotals = this.calculateSummaryTotals(this.data);

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

      saveAs(blob, filename);
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Error generating Excel file. Please try again.");
    }
  }
}