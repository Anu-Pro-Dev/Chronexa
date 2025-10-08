import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { apiRequest } from "@/src/lib/apiHandler";

interface PDFExporterProps {
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
  logoUrl?: string;
  onProgress?: (progress: number) => void;
}

export class PDFExporter {
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  private logoUrl?: string;
  private onProgress?: (progress: number) => void;

  constructor({ formValues, headerMap, calculateSummaryTotals, logoUrl, onProgress }: PDFExporterProps) {
    this.formValues = formValues;
    this.headerMap = headerMap;
    this.calculateSummaryTotals = calculateSummaryTotals;
    this.logoUrl = logoUrl;
    this.onProgress = onProgress;
  }

  private async yieldToMain(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  private async fetchDataInBatches(): Promise<any[]> {
    const allData: any[] = [];
    const BATCH_SIZE = 1000;
    let offset = 0;
    let hasMore = true;

    this.onProgress?.(5);

    while (hasMore) {
      try {
        const params: Record<string, string> = {
          limit: BATCH_SIZE.toString(),
          offset: offset.toString(),
        };

        if (this.formValues.from_date) {
          params.startDate = format(this.formValues.from_date, 'yyyy-MM-dd');
        }
        if (this.formValues.to_date) {
          params.endDate = format(this.formValues.to_date, 'yyyy-MM-dd');
        }
        if (this.formValues.employee) {
          params.employeeId = this.formValues.employee.toString();
        }
        if (this.formValues.organization) {
          params.organizationId = this.formValues.organization.toString();
        }

        const queryString = Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');

        const url = `/report/new${queryString ? `?${queryString}` : ''}`;
        const response = await apiRequest(url, "GET");

        const batch = Array.isArray(response) ? response : (response.data || []);

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        allData.push(...batch);
        offset += BATCH_SIZE;
        hasMore = batch.length === BATCH_SIZE;

        const progress = 5 + Math.min(Math.round((offset / 10000) * 35), 35);
        this.onProgress?.(progress);

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

  private getEmployeeDetails(data: any[]) {
    const isSpecificEmployee = this.formValues.employee;
    
    if (isSpecificEmployee && data.length > 0) {
      const firstRow = data[0];
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

  private generateHTMLContent(data: any[]): string {
    const { employeeId, employeeName, employeeNo } = this.getEmployeeDetails(data);
    const filteredHeaders = this.getFilteredHeaders();
    const displayHeaders = filteredHeaders.map(header => 
      (this.headerMap[header] || header).toUpperCase()
    );
    const summaryTotals = this.calculateSummaryTotals(data);
    
    const MAX_PDF_ROWS = 1000;
    const dataToShow = data.length > MAX_PDF_ROWS 
      ? data.slice(-MAX_PDF_ROWS) 
      : data;
    
    const reversedDataArray = [...dataToShow].reverse();

    return `
      <div style="padding: 15px; font-family: 'Nunito Sans', sans-serif; width: 100%; box-sizing: border-box;">
        ${data.length > MAX_PDF_ROWS ? `
          <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
            <strong>Note:</strong> PDF showing last ${MAX_PDF_ROWS.toLocaleString()} of ${data.length.toLocaleString()} records. 
            Summary totals reflect all ${data.length.toLocaleString()} records. Use Excel export for complete dataset.
          </div>
        ` : ''}
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; width: 100%;">
          ${this.logoUrl ? `
            <div style="flex: 0 0 auto;">
              <img src="${this.logoUrl}" alt="Company Logo" style="height: 50px; width: auto; object-fit: contain;" />
            </div>
          ` : ''}

          <div style="flex: 1; text-align: center;">
            <h1 style="margin: 0; font-size: 16px; font-weight: 700; font-family: 'Nunito Sans', sans-serif; color: #333;">
              EMPLOYEE DAILY MOVEMENT REPORT
            </h1>
          </div>

          <div style="flex: 0 0 50px;"></div>
        </div>

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
                  const textColor = isLateOrMissed && parseFloat(cellValue) > 0 ? 'color: #FF0000;' : '';
                  
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

        <div style="margin-top: 30px; page-break-inside: avoid;">
          <h2 style="text-align: center; color: #333; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 15px;">
            SUMMARY TOTALS ${data.length > MAX_PDF_ROWS ? `(All ${data.length.toLocaleString()} Records)` : ''}
          </h2>
          
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
    try {
      this.onProgress?.(0);

      const allData = await this.fetchDataInBatches();

      if (allData.length === 0) {
        toast.error("No data available to export.");
        return;
      }

      this.onProgress?.(45);

      if (allData.length > 5000) {
        toast.loading(
          `Processing ${allData.length.toLocaleString()} records. PDF will show last 1,000 rows. Consider using Excel export for complete data.`,
          { duration: 4000 }
        );
      }

      const html2pdf = await import('html2pdf.js').then(module => module.default);
      
      this.onProgress?.(55);
      
      const htmlContent = this.generateHTMLContent(allData);

      this.onProgress?.(65);

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `report_${this.formValues.employee ? 'employee_' + this.formValues.employee : 'all'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 1.2,
          useCORS: true,
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1400,
          windowHeight: window.innerHeight,
          logging: false,
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

      this.onProgress?.(75);

      const pdf = await html2pdf().set(opt).from(htmlContent).outputPdf('blob');
      
      this.onProgress?.(95);

      const pdfUrl = URL.createObjectURL(pdf);
      window.open(pdfUrl, '_blank');
      
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);

      this.onProgress?.(100);
      
      toast.success(`PDF generated successfully! (${allData.length > 1000 ? 'Last 1,000 of ' : ''}${allData.length.toLocaleString()} records)`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        toast.error(error.message);
      } else {
        toast.error("Error generating PDF. Please try again.");
      }
      throw error;
    }
  }

  async exportMultiplePDFs(): Promise<void> {
    try {
      this.onProgress?.(0);

      const allData = await this.fetchDataInBatches();

      if (allData.length === 0) {
        toast.error("No data available to export.");
        return;
      }

      const RECORDS_PER_PDF = 500;
      const numPDFs = Math.ceil(allData.length / RECORDS_PER_PDF);

      if (numPDFs === 1) {
        return this.export();
      }

      toast.loading(`Generating ${numPDFs} PDF files...`, { duration: 3000 });

      const html2pdf = await import('html2pdf.js').then(module => module.default);

      for (let i = 0; i < numPDFs; i++) {
        const start = i * RECORDS_PER_PDF;
        const end = Math.min(start + RECORDS_PER_PDF, allData.length);
        const chunk = allData.slice(start, end);

        const htmlContent = this.generateHTMLContent(chunk);

        const opt = {
          margin: [0.3, 0.3, 0.3, 0.3],
          filename: `report_part${i + 1}_of_${numPDFs}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { 
            scale: 1.2,
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 1400,
            windowHeight: window.innerHeight,
            logging: false,
          },
          jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'landscape',
            compress: true
          },
        };

        await html2pdf().set(opt).from(htmlContent).save();

        const progress = Math.round(((i + 1) / numPDFs) * 100);
        this.onProgress?.(progress);

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast.success(`${numPDFs} PDF files generated successfully!`);

    } catch (error) {
      console.error("Error generating PDFs:", error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        toast.error(error.message);
      } else {
        toast.error("Error generating PDF files. Please try again.");
      }
      throw error;
    }
  }
}