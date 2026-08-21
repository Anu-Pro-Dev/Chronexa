import { format } from "date-fns";
import { apiRequest } from "@/src/lib/apiHandler";

// ─────────────────────────────────────────────────────────────────────────────
// Policy constants — kept in step with ExcelExporter, CSVExporter and the
// backend cron job (jobs/dailyAttendanceReportExcelJob). Change all together.
// ─────────────────────────────────────────────────────────────────────────────
const LATE_CHECKIN_HOUR = 8;
const LATE_CHECKIN_MINUTE = 30;
const EARLY_CHECKOUT_HOUR = 17;
const EARLY_CHECKOUT_MINUTE = 30;

/** Technical employees are excluded from Late/Early tracking. */
const TECHNICAL_EMPLOYEE_TYPE_ID = 26;

/**
 * Header label overrides. These rename COLUMN TITLES ONLY — the underlying
 * data keys are unchanged, so no lookup or filter logic is affected:
 *
 *   BusinessUnit   -> "Department"  (business-unit values sit under Department)
 *   Department     -> "Division"    (department values sit under Division)
 *   LocationIn/Out -> "Location In/Out"
 */
const HEADER_OVERRIDES: Record<string, string> = {
  BusinessUnit: "Department",
  Department: "Division",
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
  // Unknown id -> Professional, matching the job's `id !== 26` rule.
  return getEmployeeTypeId(row) !== TECHNICAL_EMPLOYEE_TYPE_ID;
}

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
    if (!this.logoUrl) return null;
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
        reader.onloadend = () => resolve(reader.result as string);
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

  // ── Report title per type ──
  private getReportTitle(): string {
    const rt = this.formValues.report_type;
    if (rt === 'weekly') return 'EMPLOYEE WEEKLY ATTENDANCE REPORT';
    if (rt === 'monthly') return 'EMPLOYEE MONTHLY ATTENDANCE REPORT';
    if (rt === 'summary') return 'EMPLOYEE ATTENDANCE SUMMARY REPORT';
    return 'EMPLOYEE DAILY MOVEMENT REPORT';
  }

  // ── Columns per report type (mirrors the on-screen view headers) ──
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

  /** Display label for a column key: override first, then headerMap, then key. */
  private headerLabel(key: string): string {
    return HEADER_OVERRIDES[key] ?? this.headerMap[key] ?? key;
  }

  private getColumnWidth(header: string): string {
    const widthMap: Record<string, string> = {
      // daily — 21 columns; these sum to 100% because the table uses
      // table-layout: fixed, where over-allocating squeezes every column.
      'EmployeeNo': '4%', 'Name': '6%', 'ParentOrganization': '5%', 'Organization': '5%',
      'Department': '5%', 'BusinessUnit': '5%', 'EmployeeType': '5%',
      'WorkDate': '5%', 'WorkDay': '3%', 'Shift': '3%',
      'PunchIn': '4%', 'LocationIn': '7%', 'PunchOut': '4%', 'LocationOut': '7%',
      'DailyWorkedHrs': '5%', 'DailyMissedHrs': '5%',
      'LateCheckIn': '4%', 'EarlyCheckOut': '4%',
      'IsAbsent': '4%', 'MissedPunch': '4%', 'EmployeeStatus': '6%',
      // aggregated
      'WeekStart': '12%', 'WeekEnd': '12%', 'Month': '12%', 'Year': '8%',
      'TotalWorkedHrs': '13%', 'TotalMissedHrs': '13%', 'TotalExtraHrs': '13%', 'TotalAbsents': '10%',
    };
    return widthMap[header] || '5%';
  }

  private formatCellValue(header: string, row: Record<string, any>): string {
    // Derived columns are computed, not read off the row.
    if (header === 'LateCheckIn') {
      return isProfessional(row) ? formatMinutesToHHMM(getMinutesLate(row.PunchIn)) : '';
    }
    if (header === 'EarlyCheckOut') {
      return isProfessional(row) ? formatMinutesToHHMM(getMinutesEarly(row.PunchOut)) : '';
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

    // Already-formatted "HH:MM"/"HH:MM:SS" strings
    if ([
      'DailyWorkedHrs', 'DailyMissedHrs', 'DailyExtraWork',
      'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs',
    ].includes(header)) {
      return value || '';
    }

    return String(value);
  }

  private buildQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};

    if (this.formValues.from_date) params.from_date = format(this.formValues.from_date, 'yyyy-MM-dd');
    if (this.formValues.to_date) params.to_date = format(this.formValues.to_date, 'yyyy-MM-dd');
    if (this.formValues.manager_id) params.manager_id = this.formValues.manager_id.toString();
    if (this.formValues.organization) params.organization_id = this.formValues.organization.toString();
    if (this.formValues.company) params.organization_id = this.formValues.company.toString();
    if (this.formValues.department) params.department_id = this.formValues.department.toString();
    if (this.formValues.vertical) params.parent_orgid = this.formValues.vertical.toString();
    if (this.formValues.report_type && this.formValues.report_type !== 'daily') {
      params.type = this.formValues.report_type;
    }

    return params;
  }

  private buildUrl(params: Record<string, string>): string {
    const queryParts: string[] = [];

    if (this.formValues.employee_ids && this.formValues.employee_ids.length > 0) {
      queryParts.push(`employee_ids=${this.formValues.employee_ids.join(',')}`);
    }
    if (this.formValues.employee_type_ids && this.formValues.employee_type_ids.length > 0) {
      queryParts.push(`employee_type_ids=${this.formValues.employee_type_ids.join(',')}`);
    }

    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });

    const queryString = queryParts.join('&');
    return `/report/attendance${queryString ? `?${queryString}` : ''}`;
  }

  // Page through results (offset is a ROW offset, matching the backend)
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

        if (offset === 0 && total > 0) apiTotal = total;

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        allData.push(...batch);
        fetchedRecords += batch.length;
        offset += BATCH_SIZE;

        hasMore = batch.length === BATCH_SIZE;

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
    const isSpecificEmployee = this.formValues.employee_ids?.length > 0;
    if (isSpecificEmployee && data.length > 0) {
      const firstRow = data[0];
      return {
        employeeId: firstRow?.EmployeeID || this.formValues.employee_ids[0] || '',
        employeeName: firstRow?.Name || '',
        employeeNo: firstRow?.EmployeeNo || '',
      };
    }
    return { employeeId: 'All Employees', employeeName: 'All Employees', employeeNo: '' };
  }

  private generateHTMLContent(displayData: any[], allData?: any[], logoBase64?: string | null): string {
    const dataForSummary = allData || displayData;
    const { employeeId, employeeName, employeeNo } = this.getEmployeeDetails(dataForSummary);
    const filteredHeaders = this.getFilteredHeaders();
    const summaryTotals = this.calculateSummaryTotals(dataForSummary);
    const reportTitle = this.getReportTitle();

    const MAX_PDF_ROWS = 1000;
    const showingLimitedData = allData && allData.length > MAX_PDF_ROWS;
    const dataArray = [...displayData];

    // Only show the employee name/no block for a single selected employee.
    const isSingleEmployee =
      Array.isArray(this.formValues.employee_ids) &&
      this.formValues.employee_ids.length === 1;

    const metaEmployeeLabel = isSingleEmployee
      ? `<strong>Employee ID:</strong> ${employeeId}`
      : this.formValues.employee_ids && this.formValues.employee_ids.length > 1
      ? `<strong>Employees:</strong> ${this.formValues.employee_ids.length} selected`
      : `<strong>Employee:</strong> All`;

    return `
      <div style="padding: 10px; font-family: Arial, sans-serif; width: 100%; font-size: 7px;">
        ${showingLimitedData ? `
          <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 8px; margin-bottom: 10px; font-size: 9px;">
            <strong>Note:</strong> PDF showing first ${MAX_PDF_ROWS.toLocaleString()} of ${allData!.length.toLocaleString()} records.
            Summary totals reflect all ${allData!.length.toLocaleString()} records. Use CSV export for complete dataset.
          </div>
        ` : ''}

        ${logoBase64 ? `
          <div style="text-align: center; margin-bottom: 8px;">
            <img src="${logoBase64}" alt="Logo" style="height: 40px;" />
          </div>
        ` : ''}

        <h1 style="text-align: center; font-size: 14px; font-weight: bold; margin: 8px 0;">
          ${reportTitle}
        </h1>

        <table style="width: 100%; margin-bottom: 8px; font-size: 9px;">
          <tr>
            <td>${metaEmployeeLabel}</td>
            <td style="text-align: right;"><strong>Generated On:</strong> ${format(new Date(), 'dd/MM/yyyy')}</td>
          </tr>
        </table>

        ${isSingleEmployee ? `
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
              <td style="border: 1px solid black; padding: 5px;">${this.formValues.from_date ? format(this.formValues.from_date, 'dd/MM/yyyy') : '-'}</td>
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center;">TO DATE</td>
              <td style="border: 1px solid black; padding: 5px;">${this.formValues.to_date ? format(this.formValues.to_date, 'dd/MM/yyyy') : '-'}</td>
            </tr>`
          : ''}
        </table>
        ` : (this.formValues.from_date || this.formValues.to_date ? `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px;">
          <tr>
            <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center; width: 25%;">FROM DATE</td>
            <td style="border: 1px solid black; padding: 5px; width: 25%;">${this.formValues.from_date ? format(this.formValues.from_date, 'dd/MM/yyyy') : '-'}</td>
            <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center; width: 25%;">TO DATE</td>
            <td style="border: 1px solid black; padding: 5px; width: 25%;">${this.formValues.to_date ? format(this.formValues.to_date, 'dd/MM/yyyy') : '-'}</td>
          </tr>
        </table>
        ` : '')}

        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; table-layout: fixed;">
          <thead>
            <tr style="background-color: #0078D4;">
              ${filteredHeaders.map(header => `
                <th style="border: 1px solid black; padding: 4px; text-align: center; color: white; font-weight: bold; font-size: 7px; width: ${this.getColumnWidth(header)}; word-wrap: break-word; overflow: hidden;">${this.headerLabel(header).toUpperCase()}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${dataArray.map((row: Record<string, any>) => `
              <tr>
                ${filteredHeaders.map(header => {
                  const cellValue = this.formatCellValue(header, row);
                  const isAbsentOrMissed = (header === 'IsAbsent' && cellValue && cellValue !== '') ||
                                           (header === 'MissedPunch' && cellValue && cellValue !== '');
                  const textColor = isAbsentOrMissed ? 'color: red;' : '';
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
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center; width: 25%;">Total Worked Hours</td>
              <td style="border: 1px solid black; padding: 5px; text-align: center; width: 25%;">${summaryTotals.totalWorkedHours}</td>
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center; width: 25%;">Total Missed Hours</td>
              <td style="border: 1px solid black; padding: 5px; text-align: center; width: 25%;">${summaryTotals.totalMissedHours}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center;">Total Extra Hours</td>
              <td style="border: 1px solid black; padding: 5px; text-align: center;">${summaryTotals.totalExtraHours}</td>
              <td style="border: 1px solid black; padding: 5px; background-color: #0078D4; color: white; font-weight: bold; text-align: center;">Total Absents</td>
              <td style="border: 1px solid black; padding: 5px; text-align: center;">${summaryTotals.totalAbsents}</td>
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
      const dataToExport = allData.length > MAX_PDF_ROWS ? allData.slice(0, MAX_PDF_ROWS) : allData;

      if (allData.length > MAX_PDF_ROWS) {
        this.showToast('loading', 'pdf_limited_rows', {
          count: allData.length.toLocaleString(),
          limit: MAX_PDF_ROWS.toLocaleString(),
        });
      }

      const html2pdf = await import('html2pdf.js').then(module => module.default);

      this.onProgress?.(allData.length, allData.length, 'generating');

      const logoBase64 = await this.loadLogoAsBase64();

      const htmlContent = allData.length > MAX_PDF_ROWS
        ? this.generateHTMLContent(dataToExport, allData, logoBase64)
        : this.generateHTMLContent(dataToExport, undefined, logoBase64);

      await this.yieldToMain();

      const rt = this.formValues.report_type || 'daily';
      const opt = {
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: `report_${rt}_${
          this.formValues.employee_ids?.length > 0
            ? this.formValues.employee_ids.length === 1
              ? 'employee_' + this.formValues.employee_ids[0]
              : this.formValues.employee_ids.length + '_employees'
            : 'all'
        }_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
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
          total: allData.length.toLocaleString(),
        });
      } else {
        this.showToast('success', 'pdf_export_success', { count: allData.length.toLocaleString() });
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      if (error instanceof Error && error.message.includes('Session expired')) {
        // already toasted
      } else {
        this.showToast('error', 'pdf_export_error');
      }
      throw error;
    }
  }
}