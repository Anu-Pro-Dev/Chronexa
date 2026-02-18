import { format } from "date-fns";
import { apiRequest } from "@/src/lib/apiHandler";
import { formatInTimeZone } from "date-fns-tz";

interface PDFExporterFGICProps {
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
  logoUrl?: string;
  onProgress?: (current: number, total: number, phase: string) => void;
  showToast: (type: "success" | "error", key: string, options?: { duration?: number }) => void;
}

export class PDFExporterFGIC {
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  private logoUrl?: string;
  private onProgress?: (current: number, total: number, phase: string) => void;
  private showToast: (type: "success" | "error", key: string, options?: { duration?: number }) => void;

  constructor({ formValues, headerMap, calculateSummaryTotals, logoUrl, onProgress, showToast }: PDFExporterFGICProps) {
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

    const hasSpecificEmployees = this.formValues.employee_ids?.length > 0;

    if (!hasSpecificEmployees && this.formValues.manager_id) {
      params.manager_id = this.formValues.manager_id.toString();
    }

    if (this.formValues.employee_type) {
      params.employee_type = this.formValues.employee_type.toString();
    }

    if (this.formValues.department) {
      params.organization_id = this.formValues.department.toString();
    } else if (this.formValues.division) {
      params.organization_id = this.formValues.division.toString();
    } else if (this.formValues.organization) {
      params.organization_id = this.formValues.organization.toString();
    } else if (this.formValues.company) {
      params.organization_id = this.formValues.company.toString();
    }

    if (this.formValues.vertical) {
      params.parent_orgid = this.formValues.vertical.toString();
    }

    return params;
  }

  private buildUrl(params: Record<string, string>): string {
    const queryParts: string[] = [];

    if (this.formValues.employee_ids && this.formValues.employee_ids.length > 0) {
      const ids = this.formValues.employee_ids.join(',');
      queryParts.push(`employee_ids=${ids}`);
    }

    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });

    const queryString = queryParts.join('&');
    return `/report/new${queryString ? `?${queryString}` : ''}`;
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
          throw new Error('Session expired. Please login again.');
        }

        throw new Error('Failed to fetch data from server');
      }
    }

    return allData;
  }

  private getEmployeeDetails(data: any[]) {
    const hasMultipleEmployees = this.formValues.employee_ids && this.formValues.employee_ids.length > 1;
    const hasSingleEmployee = this.formValues.employee_ids && this.formValues.employee_ids.length === 1;
    const isSpecificEmployee = this.formValues.employee || hasSingleEmployee;

    if (hasMultipleEmployees) {
      return {
        employeeId: `${this.formValues.employee_ids.length} Employees`,
        employeeName: `${this.formValues.employee_ids.length} Employees Selected`,
        employeeNo: '',
        isSingleEmployee: false,
      };
    } else if (isSpecificEmployee && data.length > 0) {
      const firstRow = data[0];
      return {
        employeeId: firstRow?.employee_id || this.formValues.employee || this.formValues.employee_ids?.[0] || '',
        employeeName: firstRow?.firstname_eng || '',
        employeeNo: firstRow?.employee_number || '',
        company: firstRow?.parent_org_eng || '',
        division: firstRow?.organization_eng || '',
        type: firstRow?.employee_type || '',
        isSingleEmployee: true,
      };
    } else {
      return {
        employeeId: 'All Employees',
        employeeName: 'All Employees',
        employeeNo: '',
        isSingleEmployee: false,
      };
    }
  }

  private getFilteredHeaders(isSingleEmployee: boolean) {
    if (isSingleEmployee) {
      return [
        'transdate',
        'WorkDay',
        'schCode',
        'in_time',
        'out_time',
        'punch_in',
        'punch_out',
        'dailyworkhrs',
        'DailyMissedHrs',
        'dailyextrawork',
        'late',
        'early',
        'missed_punch',
        'comment'
      ];
    } else {
      return [
        'employee_number',
        'firstname_eng',
        'organization_eng',
        'employee_type',
        'schCode',
        'in_time',
        'out_time',
        'transdate',
        'WorkDay',
        'punch_in',
        'punch_out',
        'dailyworkhrs',
        'DailyMissedHrs',
        'dailyextrawork',
        'late',
        'early',
        'missed_punch',
        'comment'
      ];
    }
  }

  private getColumnWidth(header: string): string {
    const widthMap: Record<string, string> = {
      'employee_number': '5%',
      'firstname_eng': '8%',
      'organization_eng': '7%',
      'employee_type': '6%',
      'schCode': '6%',
      'in_time': '5%',
      'out_time': '5%',
      'transdate': '5%',
      'WorkDay': '4%',
      'punch_in': '5%',
      'punch_out': '5%',
      'dailyworkhrs': '5%',
      'DailyMissedHrs': '5%',
      'dailyextrawork': '5%',
      'late': '5%',
      'early': '5%',
      'missed_punch': '5%',
      'comment': '6%',
    };
    return widthMap[header] || '5%';
  }

  private formatCellValue(header: string, value: any, row?: Record<string, any>): string {
    if (!value && value !== 0) return '';

    if (header === 'WorkDay' && row) {
      return String(value);
    }

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

    if ((header === 'punch_in' || header === 'punch_out' || header === 'in_time' || header === 'out_time') && value) {
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
    const employeeDetails = this.getEmployeeDetails(dataForSummary);
    const { isSingleEmployee, employeeName, employeeNo, company, division, type } = employeeDetails;
    const filteredHeaders = this.getFilteredHeaders(isSingleEmployee);
    const summaryTotals = this.calculateSummaryTotals(dataForSummary);

    const MAX_PDF_ROWS = 1000;
    const showingLimitedData = allData && allData.length > MAX_PDF_ROWS;

    const dataArray = [...displayData];

    return `
      <div style="padding: 15px; font-family: Arial, sans-serif; width: 100%; font-size: 13px;">
        ${showingLimitedData ? `
          <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 14px; margin-bottom: 18px; font-size: 14px;">
            <strong>Note:</strong> PDF showing first ${MAX_PDF_ROWS.toLocaleString()} of ${allData!.length.toLocaleString()} records. 
            Summary totals reflect all ${allData!.length.toLocaleString()} records. Use Excel export for complete dataset.
          </div>
        ` : ''}

        <table style="width: 100%; margin-bottom: 18px; font-size: 14px;">
          <tr>
            <td style="text-align: right;">
              <strong>Generated On:</strong> ${format(new Date(), 'dd/MM/yyyy')}
            </td>
          </tr>
        </table>
        
        ${logoBase64 ? `
          <div style="text-align: center; margin-bottom: 18px;">
            <img src="${logoBase64}" alt="Logo" style="height: 84px;" />
          </div>
        ` : ''}
        
        <h1 style="text-align: center; font-size: 20px; font-weight: bold; margin: 18px 0 25px 0;">
          EMPLOYEE TIME ATTENDANCE REPORT
        </h1>

        ${isSingleEmployee ? `
          <div style="margin-bottom: 22px; padding: 18px; background-color: #f3702110; border: 1px solid #fff; border-radius: 6px;">
            <table style="page-break-inside: avoid;width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 12px; width: 33%; vertical-align: top;">
                  <div style="color: #6b7280; font-size: 12px;">Employee Name</div>
                  <div style="color: #F37021; font-weight: 600; font-size: 14px;">${employeeName}</div>
                </td>
                <td style="padding: 10px 12px; width: 33%; vertical-align: top;">
                  <div style="color: #6b7280; font-size: 12px;">Emp No</div>
                  <div style="color: #F37021; font-weight: 600; font-size: 14px;">${employeeNo}</div>
                </td>
                <td style="padding: 10px 12px; width: 34%; vertical-align: top;">
                  <div style="color: #6b7280; font-size: 12px;">Employee Type</div>
                  <div style="color: #F37021; font-weight: 600; font-size: 14px;">${type}</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; vertical-align: top;">
                  <div style="color: #6b7280; font-size: 12px;">Company</div>
                  <div style="color: #F37021; font-weight: 600; font-size: 14px;">Federal Geographic Information Center</div>
                </td>
                <td style="padding: 10px 12px; vertical-align: top;">
                  <div style="color: #6b7280; font-size: 12px;">Division</div>
                  <div style="color: #F37021; font-weight: 600; font-size: 14px;">${company}</div>
                </td>
                <td style="padding: 10px 12px; vertical-align: top;" colspan="2">
                  <div style="color: #6b7280; font-size: 12px;">Sub Division</div>
                  <div style="color: #F37021; font-weight: 600; font-size: 14px;">${division}</div>
                </td>
              </tr>
              ${this.formValues.from_date || this.formValues.to_date ? `
                <tr>
                  <td style="padding: 10px 12px; vertical-align: top;">
                    <div style="color: #6b7280; font-size: 12px;">From Date</div>
                    <div style="color: #F37021; font-weight: 600; font-size: 14px;">${this.formValues.from_date ? format(this.formValues.from_date, 'dd/MM/yyyy') : ''}</div>
                  </td>
                  <td style="padding: 10px 12px; vertical-align: top;">
                  </td>
                  <td style="padding: 10px 12px; vertical-align: top;" colspan="2">
                    <div style="color: #6b7280; font-size: 12px;">To Date</div>
                    <div style="color: #F37021; font-weight: 600; font-size: 14px;">${this.formValues.to_date ? format(this.formValues.to_date, 'dd/MM/yyyy') : ''}</div>
                  </td>
                </tr>
              ` : ''}
            </table>
          </div>
        ` : (this.formValues.from_date || this.formValues.to_date ? `
            <div style="
              margin-bottom: 22px;
              padding: 0 18px 10px 18px;
              background-color: #f3702110;
              border: 1px solid #fff;
              border-radius: 6px;
              page-break-inside: avoid;
              break-inside: avoid;
            ">
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 12px; vertical-align: top;">
                    <div style="color: #6b7280; font-size: 12px;">From Date</div>
                    <div style="color: #F37021; font-weight: 600; font-size: 14px;">${this.formValues.from_date ? format(this.formValues.from_date, 'dd/MM/yyyy') : ''}</div>
                  </td>
                  <td style="padding: 10px 12px; vertical-align: top;">
                  </td>
                  <td style="padding: 10px 12px; vertical-align: top;" colspan="2">
                    <div style="color: #6b7280; font-size: 12px;">To Date</div>
                    <div style="color: #F37021; font-weight: 600; font-size: 14px;">${this.formValues.to_date ? format(this.formValues.to_date, 'dd/MM/yyyy') : ''}</div>
                  </td>
                </tr>
              </table>
            </div>
        ` : '')}
      
        <table style="width: 100%; border-collapse: collapse; margin-top: 18px; table-layout: fixed;">
          <thead>
            <tr style="background-color: #F37021;">
              ${filteredHeaders.map(header => `
                <th style="border: 1px solid black; padding: 7px; text-align: center; color: white; font-weight: bold; font-size: 11px; width: ${this.getColumnWidth(header)}; word-wrap: break-word; overflow: hidden;">${(this.headerMap[header] || header).toUpperCase()}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${dataArray.map((row: Record<string, any>) => `
              <tr>
                ${filteredHeaders.map(header => {
      const cellValue = this.formatCellValue(header, row[header], row);
      const isLateOrMissed = header === 'late' || header === 'DailyMissedHrs';

      let textColor = '';
      if (header === 'comment') {
        const statusLower = String(cellValue).toLowerCase();
        if (statusLower === 'absent') {
          textColor = 'color: red;';
        } else if (statusLower === 'week off') {
          textColor = 'color: green;';
        }
      } else if (
        (header === 'late' || header === 'early' || header === 'DailyMissedHrs') &&
        cellValue !== '' && cellValue !== '00:00' && cellValue !== '00:00:00'
      ) {
        textColor = 'color: red;';
      } else if (
        header === 'dailyextrawork' &&
        cellValue !== '' && cellValue !== '00:00' && cellValue !== '00:00:00'
      ) {
        textColor = 'color: green;';
      }

      return `
                    <td style="border: 1px solid black; padding: 6px; font-size: 10px; ${textColor} width: ${this.getColumnWidth(header)}; word-wrap: break-word; overflow: hidden; text-overflow: ellipsis;">${cellValue}</td>
                  `;
    }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="
          margin-top: 28px;
          page-break-inside: avoid;
          break-inside: avoid;
        ">

          <!-- Heading inside table to avoid split -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
            <tr>
              <td style="
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                padding: 10px 0;
              ">
                SUMMARY TOTALS ${showingLimitedData ? `(All ${allData!.length.toLocaleString()} Records)` : ''}
              </td>
            </tr>
          </table>

          <table style="
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            page-break-inside: avoid;
          ">
            <tr>
              <td style="border: 1px solid black; padding: 10px; background-color: #F37021; color: white; font-weight: bold; text-align: center;">Total Late In Hours</td>
              <td style="border: 1px solid black; padding: 10px; text-align: center;">${summaryTotals.totalLateInHours}</td>
              <td style="border: 1px solid black; padding: 10px; background-color: #F37021; color: white; font-weight: bold; text-align: center;">Total Early Out Hours</td>
              <td style="border: 1px solid black; padding: 10px; text-align: center;">${summaryTotals.totalEarlyOutHours}</td>
              <td style="border: 1px solid black; padding: 10px; background-color: #F37021; color: white; font-weight: bold; text-align: center;">Total Missed Hours</td>
              <td style="border: 1px solid black; padding: 10px; text-align: center;">${summaryTotals.totalMissedHours}</td>
            </tr>

            <tr>
              <td style="border: 1px solid black; padding: 10px; background-color: #F37021; color: white; font-weight: bold; text-align: center;">Total Worked Hours</td>
              <td style="border: 1px solid black; padding: 10px; text-align: center;">${summaryTotals.totalWorkedHours}</td>
              <td style="border: 1px solid black; padding: 10px; background-color: #F37021; color: white; font-weight: bold; text-align: center;">Total Extra Hours</td>
              <td style="border: 1px solid black; padding: 10px; text-align: center;">${summaryTotals.totalExtraHours}</td>
              <td colspan="2" style="border: 1px solid black;"></td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 28px; padding: 18px; page-break-inside: avoid;">
          <p style="font-size: 14px; font-weight: bold; color: #d32f2f; text-align: center; margin: 0;">
            Please take action for all the violations within two days; otherwise, this will be treated as a violation.
          </p>
        </div>
      </div>
    `;
  }

  async export(): Promise<void> {
    try {
      this.onProgress?.(0, 0, 'initializing');

      const allData = await this.fetchDataInBatches();

      if (allData.length === 0) {
        this.showToast("error", "no_data_export");
        return;
      }

      this.onProgress?.(allData.length, allData.length, 'processing');

      const MAX_PDF_ROWS = 1000;
      const dataToExport = allData.length > MAX_PDF_ROWS
        ? allData.slice(0, MAX_PDF_ROWS)
        : allData;

      if (allData.length > MAX_PDF_ROWS) {
        this.showToast("error", "pdf_limited_rows", { duration: 4000 });
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

      this.showToast("success", "pdf_export_success");

    } catch (error) {
      console.error("Error generating PDF:", error);

      if (error instanceof Error && error.message.includes('Session expired')) {
        this.showToast("error", "session_expired");
      } else {
        this.showToast("error", "pdf_export_error");
      }
      throw error;
    }
  }
}