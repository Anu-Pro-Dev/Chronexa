import { format } from "date-fns";
import { apiRequest } from "@/src/lib/apiHandler";
import { formatInTimeZone } from "date-fns-tz";

interface PDFExporterProps {
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
  logoUrl?: string;
  onProgress?: (current: number, total: number, phase: string) => void;
  showToast: (type: 'success' | 'error' | 'loading', messageKey: string, params?: Record<string, any>) => void;
}

export class PDFExporter {
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  private logoUrl?: string;
  private onProgress?: (current: number, total: number, phase: string) => void;
  private showToast: (type: 'success' | 'error' | 'loading', messageKey: string, params?: Record<string, any>) => void;

  constructor({ formValues, headerMap, calculateSummaryTotals, logoUrl, onProgress, showToast }: PDFExporterProps) {
    this.formValues = formValues;
    this.headerMap = headerMap;
    this.calculateSummaryTotals = calculateSummaryTotals;
    this.logoUrl = logoUrl;
    this.onProgress = onProgress;
    this.showToast = showToast;
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

        const batch = Array.isArray(response) ? response : (response.data || []);
        const total = response?.total || 0;
        const hasNext = response?.hasNext ?? (batch.length === BATCH_SIZE);

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
        
        hasMore = hasNext && batch.length === BATCH_SIZE;

        this.onProgress?.(fetchedRecords, apiTotal || fetchedRecords, 'fetching');

        await this.yieldToMain();

      } catch (error) {
        console.error('Error fetching batch:', error);
        
        if (error && typeof error === 'object' && 'requireLogin' in error) {
          this.showToast('error', 'pdf_session_expired');
          throw new Error('Session expired. Please login again.');
        }
        
        this.showToast('error', 'pdf_fetch_error');
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

  private getColumnWidth(header: string): string {
    const widthMap: Record<string, string> = {
      'employee_number': '4%',
      'firstname_eng': '7%',
      'parent_org_eng': '6%',
      'organization_eng': '6%',
      'department_name_eng': '6%',
      'employee_type': '5%',
      'transdate': '5%',
      'WorkDay': '4%',
      'punch_in': '5%',
      'GeoLocation_In': '7%',
      'punch_out': '5%',
      'GeoLocation_Out': '7%',
      'dailyworkhrs': '5%',
      'DailyMissedHrs': '5%',
      'dailyextrawork': '5%',
      'isabsent': '5%',
      'MissedPunch': '5%',
      'EmployeeStatus': '8%'
    };
    return widthMap[header] || '5%';
  }

  private formatCellValue(header: string, value: any): string {
    if (!value && value !== 0) return '';
    
    if (header === 'transdate' && value) {
      try {
        return formatInTimeZone(value, 'UTC', 'dd-MM-yyyy');
      } catch {
        if (typeof value === 'string') {
          const datePart = value.split(' ')[0].split('T')[0];
          if (datePart.includes('-')) {
            const [year, month, day] = datePart.split('-');
            return `${day}-${month}-${year}`;
          }
        }
        return value;
      }
    }

    if ((header === 'punch_in' || header === 'punch_out') && value) {
      try {
        return formatInTimeZone(value, 'UTC', 'HH:mm:ss');
      } catch {
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
    const summaryTotals = this.calculateSummaryTotals(dataForSummary);
    
    const MAX_PDF_ROWS = 1000;
    const showingLimitedData = allData && allData.length > MAX_PDF_ROWS;
    
    const dataArray = [...displayData];

    return `
      <div style="padding: 10px; font-family: Arial, sans-serif; width: 100%; font-size: 7px;">
        ${showingLimitedData ? `
          <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 8px; margin-bottom: 10px; font-size: 9px;">
            <strong>Note:</strong> PDF showing first ${MAX_PDF_ROWS.toLocaleString()} of ${allData!.length.toLocaleString()} records. 
            Summary totals reflect all ${allData!.length.toLocaleString()} records. Use Excel export for complete dataset.
          </div>
        ` : ''}
        
        ${logoBase64 ? `
          <div style="text-align: center; margin-bottom: 8px;">
            <img src="${logoBase64}" alt="Logo" style="height: 40px;" />
          </div>
        ` : ''}
        
        <h1 style="text-align: center; font-size: 14px; font-weight: bold; margin: 8px 0;">
          EMPLOYEE DAILY MOVEMENT REPORT
        </h1>

        <table style="width: 100%; margin-bottom: 8px; font-size: 9px;">
          <tr>
            <td>
              <strong>Employee ID:</strong> ${employeeId}
            </td>
            <td style="text-align: right;">
              <strong>Generated On:</strong> ${format(new Date(), 'dd/MM/yyyy')}
            </td>
          </tr>
        </table>
         
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px;">
          <tr>
            <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; width: 25%; text-align: center;">EMPLOYEE NAME</td>
            <td style="border: 1px solid black; padding: 5px; width: 25%;">${employeeName}</td>
            <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; width: 25%; text-align: center;">EMPLOYEE NO</td>
            <td style="border: 1px solid black; padding: 5px; width: 25%;">${employeeNo}</td>
          </tr>
          ${this.formValues.from_date || this.formValues.to_date ? 
            `<tr>
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center;">FROM DATE</td>
              <td style="border: 1px solid black; padding: 5px;">${this.formValues.from_date ? format(this.formValues.from_date, 'dd/MM/yyyy') : '01/07/2025'}</td>
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center;">TO DATE</td>
              <td style="border: 1px solid black; padding: 5px;">${this.formValues.to_date ? format(this.formValues.to_date, 'dd/MM/yyyy') : '31/07/2025'}</td>
            </tr>`
          : ''}
        </table>
      
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; table-layout: fixed;">
          <thead>
            <tr style="background-color: #0078D4;">
              ${filteredHeaders.map(header => `
                <th style="border: 1px solid black; padding: 4px; text-align: center; color: white; font-weight: bold; font-size: 7px; width: ${this.getColumnWidth(header)}; word-wrap: break-word; overflow: hidden;">${(this.headerMap[header] || header).toUpperCase()}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${dataArray.map((row: Record<string, any>, index: number) => `
              <tr>
                ${filteredHeaders.map(header => {
                  const cellValue = this.formatCellValue(header, row[header]);
                  const isLateOrMissed = header === 'late' || header === 'DailyMissedHrs';
                  const textColor = isLateOrMissed && parseFloat(cellValue) > 0 ? 'color: red;' : '';
                  
                  return `
                    <td style="border: 1px solid black; padding: 3px; font-size: 6px; ${textColor} width: ${this.getColumnWidth(header)}; word-wrap: break-word; overflow: hidden; text-overflow: ellipsis;">${cellValue}</td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 20px; page-break-before: avoid;">
          <h2 style="text-align: center; font-size: 12px; font-weight: bold; margin-bottom: 10px;">
            SUMMARY TOTALS ${showingLimitedData ? `(All ${allData!.length.toLocaleString()} Records)` : ''}
          </h2>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <tr>
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center; width: 16.66%;">Total Late In Hours</td>
              <td style="border: 1px solid black; padding: 5px; text-align: center; width: 16.66%;">${summaryTotals.totalLateInHours}</td>
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center; width: 16.66%;">Total Early Out Hours</td>
              <td style="border: 1px solid black; padding: 5px; text-align: center; width: 16.66%;">${summaryTotals.totalEarlyOutHours}</td>
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center; width: 16.66%;">Total Missed Hours</td>
              <td style="border: 1px solid black; padding: 5px; text-align: center; width: 16.66%;">${summaryTotals.totalMissedHours}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center;">Total Worked Hours</td>
              <td style="border: 1px solid black; padding: 5px; text-align: center;">${summaryTotals.totalWorkedHours}</td>
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center;">Total Extra Hours</td>
              <td style="border: 1px solid black; padding: 5px; text-align: center;">${summaryTotals.totalExtraHours}</td>
              <td colspan="2" style="border: 1px solid black; padding: 5px;"></td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }

  async export(): Promise<void> {
    try {
      this.onProgress?.(0, 0, 'initializing');

      const allData = await this.fetchDataInBatches();

      if (allData.length === 0) {
        this.showToast('error', 'pdf_no_data_error');
        return;
      }

      this.onProgress?.(allData.length, allData.length, 'processing');

      const MAX_PDF_ROWS = 1000;
      const dataToExport = allData.length > MAX_PDF_ROWS 
        ? allData.slice(0, MAX_PDF_ROWS)
        : allData;

      if (allData.length > MAX_PDF_ROWS) {
        this.showToast('loading', 'pdf_limited_rows', { 
          count: allData.length.toLocaleString(),
          limit: MAX_PDF_ROWS.toLocaleString()
        });
      }

      const html2pdf = await import('html2pdf.js').then(module => module.default);
      
      this.onProgress?.(allData.length, allData.length, 'generating');
      
      const logoBase64 = await this.loadLogoAsBase64();
      
      const htmlContent = allData.length > MAX_PDF_ROWS 
        ? this.generateHTMLContent(dataToExport, allData, logoBase64)
        : this.generateHTMLContent(dataToExport, undefined, logoBase64);

      await this.yieldToMain();

      const opt = {
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: `report_${this.formValues.employee ? 'employee_' + this.formValues.employee : 'all'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'landscape'
        }
      };
      
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      document.body.appendChild(container);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await html2pdf().set(opt).from(container).save();
      
      setTimeout(() => {
        document.body.removeChild(container);
      }, 1000);
                  
      this.onProgress?.(allData.length, allData.length, 'complete');
      
      if (allData.length > MAX_PDF_ROWS) {
        this.showToast('success', 'pdf_export_success_limited', {
          limit: MAX_PDF_ROWS.toLocaleString(),
          total: allData.length.toLocaleString()
        });
      } else {
        this.showToast('success', 'pdf_export_success', {
          count: allData.length.toLocaleString()
        });
      }

    } catch (error) {
      console.error("Error generating PDF:", error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
      } else {
        this.showToast('error', 'pdf_export_error');
      }
      throw error;
    }
  }
}