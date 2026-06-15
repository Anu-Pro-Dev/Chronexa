import { format } from "date-fns";
import Papa from "papaparse";
import { getAuthToken } from "@/src/utils/authToken";
import { DEFAULT_API_URL } from "@/src/utils/constants";

export interface CSVExporterProps {
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
  onProgress?: (current: number, total: number, phase: string) => void;
  showToast: (type: 'success' | 'error', messageKey: string, params?: Record<string, any>) => void;
}

export class CSVExporter {
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  private onProgress?: (current: number, total: number, phase: string) => void;
  private showToast: (type: 'success' | 'error', messageKey: string, params?: Record<string, any>) => void;
  
  constructor({ formValues, headerMap, calculateSummaryTotals, onProgress, showToast }: CSVExporterProps) {
    this.formValues = formValues;
    this.headerMap = headerMap;
    this.calculateSummaryTotals = calculateSummaryTotals;
    this.onProgress = onProgress;
    this.showToast = showToast;
  }

  private getFilteredHeaders() {   
    return [
      'EmployeeNo',
      'Name',
      'ParentOrganization',
      'Organization',
      'Department',
      'EmployeeType',
      'WorkDate',
      'WorkDay',
      'Shift',
      'PunchIn',
      'GeoLocationIn',
      'PunchOut',
      'GeoLocationOut',
      'DailyWorkedHrs',
      'DailyMissedHrs',
      'DailyExtraWork',
      'IsAbsent',
      'MissedPunch',
      'EmployeeStatus',
    ];
  }
  
  private formatCellValue(header: string, value: any): string {
    if (value === null || value === undefined || value === '') return '';
    
    if (header === 'WorkDate' && value) {
      try {
        const date = new Date(value);
        return format(date, 'dd-MM-yyyy');
      } catch {
        return value;
      }
    }

    if (header === 'PunchIn' || header === 'PunchOut') {
      return value || '';
    }

    if (['DailyWorkedHrs', 'DailyMissedHrs', 'DailyExtraWork'].includes(header)) {
      return value || '';
    }

    if (header === 'IsAbsent') {
      return value || '';
    }

    if (header === 'MissedPunch') {
      return value || '';
    }

    return value || '';
  }

  private async yieldToMain(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  private buildExportUrl(): string {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
    const queryParts: string[] = [];

    if (this.formValues.employee_ids && this.formValues.employee_ids.length > 0) {
      queryParts.push(`employee_ids=${this.formValues.employee_ids.join(',')}`);
    }

    if (this.formValues.employee_type_ids && this.formValues.employee_type_ids.length > 0) {
      queryParts.push(`employee_type_ids=${this.formValues.employee_type_ids.join(',')}`);
    }

    if (this.formValues.from_date) {
      queryParts.push(`from_date=${format(this.formValues.from_date, 'yyyy-MM-dd')}`);
    }

    if (this.formValues.to_date) {
      queryParts.push(`to_date=${format(this.formValues.to_date, 'yyyy-MM-dd')}`);
    }

    if (this.formValues.manager_id) {
      queryParts.push(`manager_id=${this.formValues.manager_id}`);
    }

    if (this.formValues.organization) {
      queryParts.push(`organization_id=${this.formValues.organization}`);
    }

    if (this.formValues.company) {
      queryParts.push(`organization_id=${this.formValues.company}`);
    }

    if (this.formValues.department) {
      queryParts.push(`department_id=${this.formValues.department}`);
    }

    if (this.formValues.vertical) {
      queryParts.push(`parent_orgid=${this.formValues.vertical}`);
    }

    if (this.formValues.report_type && this.formValues.report_type !== 'daily') {
      queryParts.push(`type=${this.formValues.report_type}`);
    }

    // NOTE: No limit or offset — fetch ALL matching records in one request.
    // The backend's /report/attendance endpoint does not support offset-based
    // pagination reliably, so we request everything at once for exports.

    const queryString = queryParts.join('&');
    return `${API_URL}/report/attendance${queryString ? `?${queryString}` : ''}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch all report data in a single request using the native fetch API.
  //
  // We use fetch() instead of axios because for very large JSON responses
  // (10+ MB), axios can block the main thread during JSON parsing. The
  // native fetch API handles this more gracefully.
  // ─────────────────────────────────────────────────────────────────────────
  private async fetchAllData(): Promise<any[]> {
    const token = getAuthToken();
    const url = this.buildExportUrl();

    this.onProgress?.(0, 0, 'fetching');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    // Parse JSON — for very large responses this may take a moment
    this.onProgress?.(0, 0, 'parsing');
    const json = await response.json();

    // Handle both { data: [...] } and direct array responses
    const rows = Array.isArray(json) ? json : (json?.data || []);

    this.onProgress?.(rows.length, rows.length, 'fetching');
    return rows;
  }

  async exportStreaming(): Promise<void> {
    try {
      this.onProgress?.(0, 0, 'initializing');

      const filteredHeaders = this.getFilteredHeaders();
      const displayHeaders = filteredHeaders.map(h => this.headerMap[h] || h);

      let allData: any[];

      try {
        allData = await this.fetchAllData();
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error && typeof error === 'object' && 'requireLogin' in error) {
          this.showToast('error', 'csv_session_expired');
          throw new Error('Session expired. Please login again.');
        }
        this.showToast('error', 'csv_fetch_error');
        throw new Error('Failed to fetch data from server');
      }

      if (allData.length === 0) {
        this.showToast('error', 'csv_no_data_error');
        return;
      }

      this.onProgress?.(0, allData.length, 'processing');
      await this.yieldToMain();

      // Build CSV in chunks to keep the UI responsive
      let csvContent = Papa.unparse([displayHeaders], { header: false }) + '\n';
      const CHUNK = 500;

      for (let i = 0; i < allData.length; i += CHUNK) {
        const chunk = allData.slice(i, i + CHUNK);
        const formatted = chunk.map((row: any) =>
          filteredHeaders.map(header => this.formatCellValue(header, row[header]))
        );
        csvContent += Papa.unparse(formatted, { header: false }) + '\n';

        if (i % 2000 === 0) {
          this.onProgress?.(Math.min(i + CHUNK, allData.length), allData.length, 'processing');
          await this.yieldToMain();
        }
      }

      this.onProgress?.(allData.length, allData.length, 'generating');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const blobUrl = URL.createObjectURL(blob);
      
      link.setAttribute('href', blobUrl);
      link.setAttribute('download', `report_${
        this.formValues.employee_ids?.length > 0
          ? this.formValues.employee_ids.length === 1
            ? 'employee_' + this.formValues.employee_ids[0]
            : this.formValues.employee_ids.length + '_employees'
          : 'all'
      }_${format(new Date(), "yyyy-MM-dd")}.csv`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);

      this.onProgress?.(allData.length, allData.length, 'complete');
      this.showToast('success', 'csv_export_success', { count: allData.length.toLocaleString() });
      
    } catch (error) {
      console.error("CSV export error:", error);
      if (!(error instanceof Error && error.message.includes('Session expired'))) {
        this.showToast('error', 'csv_export_error');
      }
      throw error;
    }
  }

  async export(): Promise<void> {
    try {
      this.onProgress?.(0, 0, 'initializing');

      let allData: any[];

      try {
        allData = await this.fetchAllData();
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error && typeof error === 'object' && 'requireLogin' in error) {
          this.showToast('error', 'csv_session_expired');
          throw new Error('Session expired. Please login again.');
        }
        this.showToast('error', 'csv_fetch_error');
        throw new Error('Failed to fetch data from server');
      }

      if (allData.length === 0) {
        this.showToast('error', 'csv_no_data_error');
        return;
      }

      this.onProgress?.(allData.length, allData.length, 'processing');

      const filteredHeaders = this.getFilteredHeaders();
      
      const formattedData = allData.map((row: any) => {
        const formattedRow: any = {};
        filteredHeaders.forEach(header => {
          const displayHeader = this.headerMap[header] || header;
          formattedRow[displayHeader] = this.formatCellValue(header, row[header]);
        });
        return formattedRow;
      });

      await this.yieldToMain();

      const summaryTotals = this.calculateSummaryTotals(allData);
      
      formattedData.push({});
      formattedData.push({});
      
      const summaryHeader: any = {};
      summaryHeader[this.headerMap['EmployeeNo'] || 'Emp No'] = 'SUMMARY TOTALS';
      formattedData.push(summaryHeader);
      
      formattedData.push({
        [this.headerMap['EmployeeNo'] || 'Emp No']: 'Total Worked Hours',
        [this.headerMap['Name'] || 'Employee Name']: summaryTotals.totalWorkedHours,
        [this.headerMap['Organization'] || 'Organization']: 'Total Missed Hours',
        [this.headerMap['WorkDate'] || 'Work Date']: summaryTotals.totalMissedHours,
        [this.headerMap['PunchIn'] || 'Punch In']: 'Total Extra Hours',
        [this.headerMap['PunchOut'] || 'Punch Out']: summaryTotals.totalExtraHours,
      });
      
      formattedData.push({
        [this.headerMap['EmployeeNo'] || 'Emp No']: 'Total Absents',
        [this.headerMap['Name'] || 'Employee Name']: summaryTotals.totalAbsents,
      });

      this.onProgress?.(allData.length, allData.length, 'generating');

      const csv = Papa.unparse(formattedData, {
        quotes: true,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ",",
        header: true,
        newline: "\r\n",
      });

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const blobUrl = URL.createObjectURL(blob);
      
      link.setAttribute('href', blobUrl);
      link.setAttribute('download', `report_${
        this.formValues.employee_ids?.length > 0
          ? this.formValues.employee_ids.length === 1
            ? 'employee_' + this.formValues.employee_ids[0]
            : this.formValues.employee_ids.length + '_employees'
          : 'all'
      }_${format(new Date(), "yyyy-MM-dd")}.csv`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);

      this.onProgress?.(allData.length, allData.length, 'complete');
      this.showToast('success', 'csv_export_success', { count: allData.length.toLocaleString() });
      
    } catch (error) {
      console.error("CSV export error:", error);
      if (!(error instanceof Error && error.message.includes('Session expired'))) {
        this.showToast('error', 'csv_export_error');
      }
      throw error;
    }
  }
}