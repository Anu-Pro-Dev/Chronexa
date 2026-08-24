import { format } from "date-fns";
import Papa from "papaparse";
import { getAuthToken } from "@/src/utils/authToken";
import { DEFAULT_API_URL } from "@/src/utils/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Policy constants — kept in step with ExcelExporter and the backend cron job
// (jobs/dailyAttendanceReportExcelJob). Change all three together.
// ─────────────────────────────────────────────────────────────────────────────
const LATE_CHECKIN_HOUR = 8;
const LATE_CHECKIN_MINUTE = 30;
const EARLY_CHECKOUT_HOUR = 17;
const EARLY_CHECKOUT_MINUTE = 30;

/**
 * Employee type ids as they exist in sp_employee_daily_report:
 *   23 Professional Direct | 25 Professional Indirect
 *   26 Technical           | 29 Outsource
 *
 * Classification is by EXPLICIT membership. The previous rule was
 * `id !== 26`, which silently swept Outsource (29) in with Professional and
 * gave those employees Late/Early values they should not have.
 */
const PROFESSIONAL_EMPLOYEE_TYPE_IDS = [23, 25];

/**
 * Header label overrides. These rename COLUMN TITLES ONLY — the underlying
 * data keys are unchanged, so no lookup or filter logic is affected:
 *
 *   BusinessUnit  -> "Department"  (business-unit values sit under Department)
 *   Department    -> "Division"    (department values sit under Division)
 *   LocationIn/Out-> "Location In/Out"
 */
const HEADER_OVERRIDES: Record<string, string> = {
  BusinessUnit: "Department",
  Department: "Division",
  LateCheckIn: "Late Check-In",
  EarlyCheckOut: "Early Check-Out",
  LocationIn: "Location In",
  LocationOut: "Location Out",
};

function parseTimeHM(value: any): { h: number; m: number } | null {
  if (!value) return null;
  const s = String(value).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m) return { h: +m[1], m: +m[2] };
  const d = new Date(s);
  if (!isNaN(d.getTime())) return { h: d.getHours(), m: d.getMinutes() };
  return null;
}

function getMinutesLate(punchIn: any): number {
  const t = parseTimeHM(punchIn);
  if (!t) return 0;
  const diff = (t.h * 60 + t.m) - (LATE_CHECKIN_HOUR * 60 + LATE_CHECKIN_MINUTE);
  return diff > 0 ? diff : 0;
}

function getMinutesEarly(punchOut: any): number {
  const t = parseTimeHM(punchOut);
  if (!t) return 0;
  const diff = (EARLY_CHECKOUT_HOUR * 60 + EARLY_CHECKOUT_MINUTE) - (t.h * 60 + t.m);
  return diff > 0 ? diff : 0;
}

function formatMinutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** The API returns the type id under several casings — check them all. */
function getEmployeeTypeId(row: any): number {
  return Number(
    row?.EmployeeTypeID ?? row?.EmployeeTypeId ?? row?.employee_type_id ?? row?.EmployeeType_ID
  );
}

function isProfessional(row: any): boolean {
  const id = getEmployeeTypeId(row);
  if (!Number.isNaN(id) && id !== 0) {
    return PROFESSIONAL_EMPLOYEE_TYPE_IDS.includes(id);
  }
  // Fall back to the text field when the id is missing, otherwise every
  // unmatched row lands on one sheet.
  return String(row?.EmployeeType ?? "").toLowerCase().startsWith("professional");
}

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

  /** Display label for a column key: override first, then headerMap, then key. */
  private headerLabel(key: string): string {
    return HEADER_OVERRIDES[key] ?? this.headerMap[key] ?? key;
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
      'EmployeeNo', 'Name',
      // Vertical, Company, Division, Department — Department/BusinessUnit are
      // ordered so the labels read that way (see HEADER_OVERRIDES).
      'ParentOrganization', 'Organization', 'Department', 'BusinessUnit',
      'EmployeeType', 'WorkDate', 'WorkDay', 'Shift',
      'PunchIn', 'LocationIn', 'PunchOut', 'LocationOut',
      'DailyWorkedHrs', 'DailyMissedHrs',
      // DailyExtraWork is intentionally excluded, matching the cron job.
      'LateCheckIn', 'EarlyCheckOut',
      'IsAbsent', 'MissedPunch', 'EmployeeStatus',
    ];
  }

  private formatCellValue(header: string, row: Record<string, any>): string {
    // Derived columns are computed, not read off the row.
    // No punch -> blank, not "00:00". A missing punch is not "on time", and
    // showing 00:00 made absent employees look present.
    if (header === 'LateCheckIn') {
      if (!isProfessional(row) || !row.PunchIn) return '';
      return formatMinutesToHHMM(getMinutesLate(row.PunchIn));
    }
    if (header === 'EarlyCheckOut') {
      if (!isProfessional(row) || !row.PunchOut) return '';
      return formatMinutesToHHMM(getMinutesEarly(row.PunchOut));
    }

    const value = row[header];
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
      if (h === 'TotalExtraHrs') return totals.totalExtraHours;
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
      const displayHeaders = filteredHeaders.map(h => this.headerLabel(h));

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
          filteredHeaders.map(header => this.formatCellValue(header, row))
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
          const displayHeader = this.headerLabel(header);
          formattedRow[displayHeader] = this.formatCellValue(header, row);
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
        const displayHeader = this.headerLabel(h);
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