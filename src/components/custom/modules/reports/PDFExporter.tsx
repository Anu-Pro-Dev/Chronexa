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

  private async loadLogoAsBase64(): Promise<string | null> {
    if (!this.logoUrl) {
      return null;
    }
    
    try {
      const logoPath = this.logoUrl.startsWith('/') 
        ? window.location.origin + this.logoUrl 
        : this.logoUrl;
            
      const response = await fetch(logoPath);
      
      if (!response.ok) {
        console.error('Failed to fetch logo:', response.status, response.statusText);
        return null;
      }
      
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading logo:', error);
      return null;
    }
  }

  private async yieldToMain(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  private async fetchDataInBatches(): Promise<any[]> {
    const allData: any[] = [];
    const BATCH_SIZE = 2000; // Increased to match CSV for consistency
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
          params.employee_type_id = this.formValues.employee_type.toString();
        }

        if (this.formValues.organization) {
          params.organization_id = this.formValues.organization.toString();
        }

        // FIXED: Changed from company_id to organization_id to match CSV
        if (this.formValues.company) {
          params.organization_id = this.formValues.company.toString();
        }

        if (this.formValues.department) {
          params.department_id = this.formValues.department.toString();
        }

        if (this.formValues.vertical) {
          params.parent_orgid = this.formValues.vertical.toString();
        }

        const queryString = Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');

        const url = `/report/attendance${queryString ? `?${queryString}` : ''}`;
        
        console.log('PDF Fetching:', url); // Debug log
        const response = await apiRequest(url, "GET");

        const batch = Array.isArray(response) ? response : (response.data || []);
        
        console.log('PDF Batch received:', batch.length, 'records'); // Debug log

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

    console.log('PDF Total records fetched:', allData.length); // Debug log
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
      'parent_org_eng',
      'organization_eng',
      'department_name_eng',
      'employee_type',
      'WorkDate',
      'WorkDay',
      'punch_in',
      'geolocation_in',
      'punch_out',
      'geolocation_out',
      'dailyworkhrs',
      'DailyMissedHrs',
      'dailyextrawork',
      'isabsent',
      'MissedPunch',
      'EmployeeStatus'
    ];
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

  private generateHTMLContent(displayData: any[], allData?: any[], logoBase64?: string | null): string {
    const dataForSummary = allData || displayData;
    const { employeeId, employeeName, employeeNo } = this.getEmployeeDetails(dataForSummary);
    const filteredHeaders = this.getFilteredHeaders();
    const displayHeaders = filteredHeaders.map(header => 
      (this.headerMap[header] || header).toUpperCase()
    );
    const summaryTotals = this.calculateSummaryTotals(dataForSummary);
    
    const MAX_PDF_ROWS = 1000;
    const showingLimitedData = allData && allData.length > MAX_PDF_ROWS;
    
    // FIXED: Remove reverse() - keep data in original order
    const dataArray = [...displayData];
    
    console.log('Generating HTML for', dataArray.length, 'rows'); // Debug log

    return `
      <div style="padding: 15px; font-family: Arial, sans-serif; width: 100%;">
        ${showingLimitedData ? `
          <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin-bottom: 15px;">
            <strong>Note:</strong> PDF showing first ${MAX_PDF_ROWS.toLocaleString()} of ${allData!.length.toLocaleString()} records. 
            Summary totals reflect all ${allData!.length.toLocaleString()} records. Use Excel export for complete dataset.
          </div>
        ` : ''}
        
        ${logoBase64 ? `
          <div style="text-align: center; margin-bottom: 10px;">
            <img src="${logoBase64}" alt="Logo" style="height: 50px;" />
          </div>
        ` : ''}
        
        <h1 style="text-align: center; font-size: 16px; font-weight: bold; margin: 10px 0;">
          EMPLOYEE DAILY MOVEMENT REPORT
        </h1>

        <table style="width: 100%; margin-bottom: 10px;">
          <tr>
            <td style="font-size: 12px;">
              <strong>Employee ID:</strong> ${employeeId}
            </td>
            <td style="text-align: right; font-size: 12px;">
              <strong>Generated On:</strong> ${format(new Date(), 'dd/MM/yyyy')}
            </td>
          </tr>
        </table>
         
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="border: 1px solid black; padding: 8px; background-color: #0078D4; color: white; font-weight: bold; font-size: 11px; width: 25%; text-align: center;">EMPLOYEE NAME</td>
            <td style="border: 1px solid black; padding: 8px; font-size: 11px; width: 25%;">${employeeName}</td>
            <td style="border: 1px solid black; padding: 8px; background-color: #0078D4; color: white; font-weight: bold; font-size: 11px; width: 25%; text-align: center;">EMPLOYEE NO</td>
            <td style="border: 1px solid black; padding: 8px; font-size: 11px; width: 25%;">${employeeNo}</td>
          </tr>
          ${this.formValues.from_date || this.formValues.to_date ? 
            `<tr>
              <td style="border: 1px solid black; padding: 8px; background-color: #0078D4; color: white; font-weight: bold; font-size: 11px; text-align: center;">FROM DATE</td>
              <td style="border: 1px solid black; padding: 8px; font-size: 11px;">${this.formValues.from_date ? format(this.formValues.from_date, 'dd/MM/yyyy') : '01/07/2025'}</td>
              <td style="border: 1px solid black; padding: 8px; background-color: #0078D4; color: white; font-weight: bold; font-size: 11px; text-align: center;">TO DATE</td>
              <td style="border: 1px solid black; padding: 8px; font-size: 11px;">${this.formValues.to_date ? format(this.formValues.to_date, 'dd/MM/yyyy') : '31/07/2025'}</td>
            </tr>`
          : ''}
        </table>
      
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #0078D4;">
              ${displayHeaders.map(header => `
                <th style="border: 1px solid black; padding: 8px; text-align: center; color: white; font-weight: bold; font-size: 10px;">${header}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${dataArray.map((row: Record<string, any>, index: number) => {
              // Debug: log first row
              if (index === 0) {
                console.log('First row data:', row);
              }
              return `
              <tr>
                ${filteredHeaders.map(header => {
                  const cellValue = this.formatCellValue(header, row[header]);
                  const isLateOrMissed = header === 'late' || header === 'DailyMissedHrs';
                  const textColor = isLateOrMissed && parseFloat(cellValue) > 0 ? 'color: red;' : '';
                  
                  return `
                    <td style="border: 1px solid black; padding: 6px; font-size: 9px; ${textColor}">${cellValue}</td>
                  `;
                }).join('')}
              </tr>
            `}).join('')}
          </tbody>
        </table>

        <div style="margin-top: 30px;">
          <h2 style="text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 15px;">
            SUMMARY TOTALS ${showingLimitedData ? `(All ${allData!.length.toLocaleString()} Records)` : ''}
          </h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="border: 1px solid black; padding: 8px; background-color: #0078D4; color: white; font-weight: bold; font-size: 11px; text-align: center; width: 16.66%;">Total Late In Hours</td>
              <td style="border: 1px solid black; padding: 8px; font-size: 11px; text-align: center; width: 16.66%;">${summaryTotals.totalLateInHours}</td>
              <td style="border: 1px solid black; padding: 8px; background-color: #0078D4; color: white; font-weight: bold; font-size: 11px; text-align: center; width: 16.66%;">Total Early Out Hours</td>
              <td style="border: 1px solid black; padding: 8px; font-size: 11px; text-align: center; width: 16.66%;">${summaryTotals.totalEarlyOutHours}</td>
              <td style="border: 1px solid black; padding: 8px; background-color: #0078D4; color: white; font-weight: bold; font-size: 11px; text-align: center; width: 16.66%;">Total Missed Hours</td>
              <td style="border: 1px solid black; padding: 8px; font-size: 11px; text-align: center; width: 16.66%;">${summaryTotals.totalMissedHours}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 8px; background-color: #0078D4; color: white; font-weight: bold; font-size: 11px; text-align: center;">Total Worked Hours</td>
              <td style="border: 1px solid black; padding: 8px; font-size: 11px; text-align: center;">${summaryTotals.totalWorkedHours}</td>
              <td style="border: 1px solid black; padding: 8px; background-color: #0078D4; color: white; font-weight: bold; font-size: 11px; text-align: center;">Total Extra Hours</td>
              <td style="border: 1px solid black; padding: 8px; font-size: 11px; text-align: center;">${summaryTotals.totalExtraHours}</td>
              <td colspan="2" style="border: 1px solid black; padding: 8px;"></td>
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

      const MAX_PDF_ROWS = 1000;
      const dataToExport = allData.length > MAX_PDF_ROWS 
        ? allData.slice(0, MAX_PDF_ROWS)
        : allData;

      if (allData.length > MAX_PDF_ROWS) {
        toast.loading(
          `Dataset has ${allData.length.toLocaleString()} records. PDF will show first ${MAX_PDF_ROWS.toLocaleString()} rows. Summary totals include all records.`,
          { duration: 4000 }
        );
      }

      const html2pdf = await import('html2pdf.js').then(module => module.default);
      
      this.onProgress?.(55);
      
      const logoBase64 = await this.loadLogoAsBase64();
      
      const htmlContent = allData.length > MAX_PDF_ROWS 
        ? this.generateHTMLContent(dataToExport, allData, logoBase64)
        : this.generateHTMLContent(dataToExport, allData, logoBase64);

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
      
      const recordMessage = allData.length > MAX_PDF_ROWS 
        ? `First ${MAX_PDF_ROWS.toLocaleString()} of ${allData.length.toLocaleString()} records`
        : `${allData.length.toLocaleString()} records`;
      
      toast.success(`PDF generated successfully! (${recordMessage})`);

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
      
      const logoBase64 = await this.loadLogoAsBase64();

      for (let i = 0; i < numPDFs; i++) {
        const start = i * RECORDS_PER_PDF;
        const end = Math.min(start + RECORDS_PER_PDF, allData.length);
        const chunk = allData.slice(start, end);

        const htmlContent = this.generateHTMLContent(chunk, allData, logoBase64);

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