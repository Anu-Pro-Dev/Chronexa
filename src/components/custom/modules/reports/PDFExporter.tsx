import { format } from "date-fns";
import { toast } from "react-hot-toast";

interface PDFExporterProps {
  data: any[];
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
  logoUrl?: string;
}

export class PDFExporter {
  private data: any[];
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  private logoUrl?: string;

  constructor({ data, formValues, headerMap, calculateSummaryTotals, logoUrl }: PDFExporterProps) {
    this.data = data;
    this.formValues = formValues;
    this.headerMap = headerMap;
    this.calculateSummaryTotals = calculateSummaryTotals;
    this.logoUrl = logoUrl;
  }

  private getEmployeeDetails() {
    const isSpecificEmployee = this.formValues.employee;
    
    if (isSpecificEmployee) {
      const firstRow = this.data[0];
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

  private generateHTMLContent(): string {
    const { employeeId, employeeName, employeeNo } = this.getEmployeeDetails();
    const filteredHeaders = this.getFilteredHeaders();
    const displayHeaders = filteredHeaders.map(header => 
      (this.headerMap[header] || header).toUpperCase()
    );
    const summaryTotals = this.calculateSummaryTotals(this.data);
    const reversedDataArray = [...this.data].reverse();

    return `
      <div style="padding: 15px; font-family: 'Nunito Sans', sans-serif; width: 100%; box-sizing: border-box;">
        <!-- PAGE HEADER WITH LOGO -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; width: 100%;">
          <!-- Logo (optional) -->
          ${this.logoUrl ? `
            <div style="flex: 0 0 auto;">
              <img src="${this.logoUrl}" alt="Company Logo" style="height: 50px; width: auto; object-fit: contain;" />
            </div>
          ` : ''}

          <!-- Title -->
          <div style="flex: 1; text-align: center;">
            <h1 style="margin: 0; font-size: 16px; font-weight: 700; font-family: 'Nunito Sans', sans-serif; color: #333;">
              EMPLOYEE DAILY MOVEMENT REPORT
            </h1>
          </div>

          <!-- Placeholder for right-aligned space (keeps title centered) -->
          <div style="flex: 0 0 50px;"></div>
        </div>

        <!-- GENERATED ON and EMPLOYEE ID row -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; width: 100%;">
          <div style="flex: 1;">
            <p style="margin: 2px 0; font-size: 12px; font-family: 'Nunito Sans', sans-serif;">
              <span style="font-weight: bold;">Employee ID:</span> ${employeeId}
            </p>
          </div>
          <div style="flex: 1; text-align: right;">
            <p style="margin: 2px 0; font-size: 12px; font-family: 'Nunito Sans', sans-serif;">
              <span style="font-weight: bold;">Generated On:</span> ${format(new Date(), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
         
        <!-- EMPLOYEE DETAILS TABLE -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: avoid;">
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; width: 25%; text-align: center; vertical-align: middle;">EMPLOYEE NAME</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; width: 25%; vertical-align: middle;">${employeeName}</td>
            <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; width: 25%; text-align: center; vertical-align: middle;">EMPLOYEE NO</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; width: 25%; vertical-align: middle;">${employeeNo}</td>
          </tr>
          ${this.formValues.from_date || this.formValues.to_date ? 
            `<tr>
              <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle;">FROM DATE</td>
              <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; vertical-align: middle;">${this.formValues.from_date ? format(this.formValues.from_date, 'dd/MM/yyyy') : '01/07/2025'}</td>
              <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle;">TO DATE</td>
              <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; vertical-align: middle;">${this.formValues.to_date ? format(this.formValues.to_date, 'dd/MM/yyyy') : '31/07/2025'}</td>
            </tr>`
          : ''}
        </table>
      
        <!-- MAIN DATA TABLE -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: auto; min-width: 100%; page-break-inside: auto;">
          <thead style="display: table-header-group;">
            <tr style="background-color: #0078D4;">
              ${displayHeaders.map(header => `
                <th style="
                  border: 1px solid #ddd; 
                  padding: 8px 6px; 
                  text-align: center; 
                  vertical-align: middle;
                  color: #FFFFFF; 
                  font-family: 'Nunito Sans', sans-serif; 
                  font-weight: bold; 
                  font-size: 11px;
                  white-space: nowrap;
                  min-width: fit-content;
                ">${header}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody style="page-break-inside: auto;">
            ${reversedDataArray.map((row: Record<string, any>, rowIndex: number) => `
              <tr style="page-break-inside: avoid; ${rowIndex > 0 && rowIndex % 20 === 0 ? 'page-break-before: auto;' : ''}">
                ${filteredHeaders.map(header => {
                  const cellValue = this.formatCellValue(header, row[header]);
                  const isLateOrMissed = header === 'late' || header === 'DailyMissedHrs';
                  const textColor = isLateOrMissed ? 'color: #FF0000;' : '';
                  
                  return `
                    <td style="
                      border: 1px solid #ddd; 
                      padding: 6px 4px; 
                      font-family: 'Nunito Sans', sans-serif; 
                      font-size: 10px;
                      word-wrap: break-word;
                      overflow-wrap: break-word;
                      min-width: fit-content;
                      vertical-align: middle;
                      ${textColor}
                    ">${String(cellValue)}</td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- SUMMARY TOTALS TABLE -->
        <div style="margin-top: 30px; page-break-inside: avoid;">
          <h2 style="text-align: center; color: #333; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 15px;">SUMMARY TOTALS</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">Total Late In Hours</td>
              <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">${summaryTotals.totalLateInHours}</td>
              <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">Total Early Out Hours</td>
              <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">${summaryTotals.totalEarlyOutHours}</td>
              <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">Total Missed Hours</td>
              <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">${summaryTotals.totalMissedHours}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle;">Total Worked Hours</td>
              <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; text-align: center; vertical-align: middle;">${summaryTotals.totalWorkedHours}</td>
              <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle;">Total Extra Hours</td>
              <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; text-align: center; vertical-align: middle;">${summaryTotals.totalExtraHours}</td>
              <td colspan="2" style="border: 1px solid #ddd; padding: 8px;"></td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }

  async export(): Promise<void> {
    if (this.data.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    try {
      const html2pdf = await import('html2pdf.js').then(module => module.default);
      const htmlContent = this.generateHTMLContent();

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `report_${this.formValues.employee ? 'employee_' + this.formValues.employee : 'all'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 1.5, 
          useCORS: true,
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1400,
          windowHeight: window.innerHeight
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: '.page-break-avoid'
        }
      };

      const pdf = await html2pdf().set(opt).from(htmlContent).outputPdf('blob');
      const pdfUrl = URL.createObjectURL(pdf);
      window.open(pdfUrl, '_blank');
      
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error generating PDF. Please try again.");
    }
  }
}