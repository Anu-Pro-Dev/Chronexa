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

  // ── Columns per report type (must mirror the on-screen view headers) ──
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
    // daily (default)
    return [
      'EmployeeNo', 'Name', 'ParentOrganization', 'Organization', 'Department',
      'BusinessUnit', 'EmployeeType', 'WorkDate', 'WorkDay', 'Shift', 'PunchIn', 'GeoLocationIn',
      'PunchOut', 'GeoLocationOut', 'DailyWorkedHrs', 'DailyMissedHrs',
      'DailyExtraWork', 'IsAbsent', 'MissedPunch', 'EmployeeStatus',
    ];
  }

  private formatCellValue(header: string, value: any): string {
    if (value === null || value === undefined || value === '') return '';

    // Date columns — format from the date part to avoid timezone day-shift
    if (header === 'WorkDate' || header === 'WeekStart' || header === 'WeekEnd') {
      try {
        const datePart = String(value).split('T')[0];
        const [y, m, d] = datePart.split('-');
        if (y && m && d) return `${d}-${m}-${y}`;
        return value;
      } catch {
        return value;
      }
    }

    if (header === 'PunchIn' || header === 'PunchOut') {
      return value || '';
    }

    // Time columns are already "HH:MM" / "HH:MM:SS" strings from the API
    if ([
      'DailyWorkedHrs', 'DailyMissedHrs', 'DailyExtraWork',
      'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs',
    ].includes(header)) {
      return value || '';
    }

    if (header === 'IsAbsent') return value || '';
    if (header === 'MissedPunch') return value || '';

    return value || '';
  }

  // Build a totals row aligned to the active column set (works for any type)
  private buildSummaryRow(filteredHeaders: string[], totals: any): string[] {
    return filteredHeaders.map((h) => {
      if (h === 'EmployeeNo') return 'SUMMARY TOTALS';
      if (h === 'TotalWorkedHrs' || h === 'DailyWorkedHrs') return totals.totalWorkedHours;
      if (h === 'TotalMissedHrs' || h === 'DailyMissedHrs') return totals.totalMissedHours;
      if (h === 'TotalExtraHrs' || h === 'DailyExtraWork') return totals.totalExtraHours;
      if (h === 'TotalAbsents') return totals.totalAbsents;
      return '';
    });
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

    // NOTE: No limit/offset — exports fetch ALL matching (aggregated) rows in one request.
    const queryString = queryParts.join('&');
    return `${API_URL}/report/attendance${queryString ? `?${queryString}` : ''}`;
  }

  // Single-request fetch via native fetch (handles large JSON without blocking like axios can)
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

    this.onProgress?.(0, 0, 'parsing');
    const json = await response.json();
    const rows = Array.isArray(json) ? json : (json?.data || []);

    this.onProgress?.(rows.length, rows.length, 'fetching');
    return rows;
  }

  private buildFileName(): string {
    const rt = this.formValues.report_type || 'daily';
    const who =
      this.formValues.employee_ids?.length > 0
        ? this.formValues.employee_ids.length === 1
          ? 'employee_' + this.formValues.employee_ids[0]
          : this.formValues.employee_ids.length + '_employees'
        : 'all';
    return `report_${rt}_${who}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  }

  private triggerDownload(content: string): void {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const blobUrl = URL.createObjectURL(blob);

    link.setAttribute('href', blobUrl);
    link.setAttribute('download', this.buildFileName());
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }

  // ── Chunked streaming export (used by the CSV button) ──
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

      // Totals row aligned to the active column set
      const totals = this.calculateSummaryTotals(allData);
      const blank = filteredHeaders.map(() => '');
      csvContent += Papa.unparse([blank], { header: false }) + '\n';
      csvContent += Papa.unparse([this.buildSummaryRow(filteredHeaders, totals)], { header: false }) + '\n';

      this.onProgress?.(allData.length, allData.length, 'generating');
      this.triggerDownload(csvContent);

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

  // ── Object-based export with a labelled totals block (kept for compatibility) ──
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

      const formattedData: any[] = allData.map((row: any) => {
        const formattedRow: any = {};
        filteredHeaders.forEach(header => {
          const displayHeader = this.headerMap[header] || header;
          formattedRow[displayHeader] = this.formatCellValue(header, row[header]);
        });
        return formattedRow;
      });

      await this.yieldToMain();

      // Totals block aligned to the active columns
      const totals = this.calculateSummaryTotals(allData);
      formattedData.push({});
      const summaryRowObj: any = {};
      const summaryRow = this.buildSummaryRow(filteredHeaders, totals);
      filteredHeaders.forEach((h, idx) => {
        const displayHeader = this.headerMap[h] || h;
        summaryRowObj[displayHeader] = summaryRow[idx];
      });
      formattedData.push(summaryRowObj);

      this.onProgress?.(allData.length, allData.length, 'generating');

      const csv = Papa.unparse(formattedData, {
        quotes: true,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ",",
        header: true,
        newline: "\r\n",
      });

      this.triggerDownload(csv);

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