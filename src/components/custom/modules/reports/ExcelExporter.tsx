import { format } from "date-fns";
import { apiRequest } from "@/src/lib/apiHandler";

export interface ExcelExporterProps {
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
  onProgress?: (current: number, total: number, phase: string) => void;
  showToast: (type: 'success' | 'error', messageKey: string, params?: Record<string, any>) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Policy constants — kept in step with the backend cron job
// (jobs/dailyAttendanceReportExcelJob). Change both together.
// ─────────────────────────────────────────────────────────────────────────────
const LATE_CHECKIN_HOUR = 8;
const LATE_CHECKIN_MINUTE = 30;
const EARLY_CHECKOUT_HOUR = 17;
const EARLY_CHECKOUT_MINUTE = 30;

/** Technical employees are excluded from Late/Early tracking. */
const TECHNICAL_EMPLOYEE_TYPE_ID = 26;

// ─────────────────────────────────────────────────────────────────────────────
// Styling palette — same ARGB values the job uses, so a report exported from
// the UI is visually identical to the one that arrives by email.
// ─────────────────────────────────────────────────────────────────────────────
const COLOR = {
  red: "FFE91D26",
  darkBg: "FF1A1A1A",
  lightGrey: "FFF5F5F5",
  white: "FFFFFFFF",
  flagYes: "FFFFF3CD",
  flagText: "FF856404",
  headerText: "FFFFFFFF",
  bodyText: "FF1A1A1A",
  border: "FFD0D0D0",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Time helpers (ported from the job)
// ─────────────────────────────────────────────────────────────────────────────

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

function timeToMinutes(s: string): number {
  if (!s) return 0;
  const p = s.split(":").map(Number);
  return (p[0] || 0) * 60 + (p[1] || 0) + (p[2] || 0) / 60;
}

function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * The API returns the type id under different casings depending on the
 * endpoint, so check every spelling before deciding.
 */
function getEmployeeTypeId(row: any): number {
  const raw =
    row?.EmployeeTypeID ?? row?.EmployeeTypeId ?? row?.employee_type_id ?? row?.EmployeeType_ID;
  return Number(raw);
}

function isProfessional(row: any): boolean {
  const id = getEmployeeTypeId(row);
  // Unknown id -> treat as Professional, matching the job's `id !== 26` rule.
  return id !== TECHNICAL_EMPLOYEE_TYPE_ID;
}

/**
 * Header label overrides. These rename COLUMN TITLES ONLY — the underlying
 * data keys are unchanged, so no lookup or filter logic is affected:
 *
 *   BusinessUnit  -> "Department"   (business-unit values sit under Department)
 *   Department    -> "Division"     (department values sit under Division)
 *   LocationIn/Out    -> "Location In/Out"
 */
/**
 * Column widths by data key. Every column previously used a flat 16, which cut
 * off lat/long pairs and long organisation names. Anything not listed falls
 * back to DEFAULT_WIDTH.
 */
const COLUMN_WIDTHS: Record<string, number> = {
  EmployeeNo: 12,
  Name: 28,
  ParentOrganization: 22,
  Organization: 22,
  Department: 22,
  BusinessUnit: 22,
  EmployeeType: 16,
  WorkDate: 14,
  WorkDay: 12,
  Shift: 14,
  PunchIn: 12,
  PunchOut: 12,
  LocationIn: 24,
  LocationOut: 24,
  DailyWorkedHrs: 14,
  DailyMissedHrs: 14,
  LateCheckIn: 14,
  EarlyCheckOut: 15,
  IsAbsent: 12,
  MissedPunch: 13,
  EmployeeStatus: 16,
  WeekStart: 14,
  WeekEnd: 14,
  Month: 12,
  Year: 10,
  TotalWorkedHrs: 16,
  TotalMissedHrs: 16,
  TotalExtraHrs: 16,
  TotalAbsents: 14,
}

const DEFAULT_WIDTH = 16

const HEADER_OVERRIDES: Record<string, string> = {
  BusinessUnit: "Department",
  Department: "Division",
  LocationIn: "Location In",
  LocationOut: "Location Out",
}

interface Summary {
  totalEmployees: number;
  present: number;
  absent: number;
  lateCheckins: number;
  earlyCheckouts: number;
  missedPunches: number;
  totalWorkedHours: string;
  totalMissedHours: string;
}

function computeJobSummary(rows: any[]): Summary {
  let present = 0, absent = 0, late = 0, early = 0, missed = 0;
  let workedMins = 0, missedMins = 0;

  for (const r of rows) {
    const status = String(r.IsAbsent ?? "").trim().toLowerCase();
    if (status === "") present++;
    else if (status === "absent" || status === "1" || status === "true") absent++;

    if (isProfessional(r)) {
      if (getMinutesLate(r.PunchIn) > 0) late++;
      if (getMinutesEarly(r.PunchOut) > 0) early++;
    }

    if (String(r.MissedPunch ?? "").trim() !== "") missed++;
    workedMins += timeToMinutes(String(r.DailyWorkedHrs ?? ""));
    missedMins += timeToMinutes(String(r.DailyMissedHrs ?? ""));
  }

  return {
    totalEmployees: rows.length,
    present,
    absent,
    lateCheckins: late,
    earlyCheckouts: early,
    missedPunches: missed,
    totalWorkedHours: minutesToHHMM(workedMins),
    totalMissedHours: minutesToHHMM(missedMins),
  };
}

export class ExcelExporter {
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  private onProgress?: (current: number, total: number, phase: string) => void;
  private showToast: (type: 'success' | 'error', messageKey: string, params?: Record<string, any>) => void;

  constructor({ formValues, headerMap, calculateSummaryTotals, onProgress, showToast }: ExcelExporterProps) {
    this.formValues = formValues;
    this.headerMap = headerMap;
    this.calculateSummaryTotals = calculateSummaryTotals;
    this.onProgress = onProgress;
    this.showToast = showToast;
  }

  /** Display label for a column key: override first, then headerMap, then key. */
  private headerLabel(key: string): string {
    return HEADER_OVERRIDES[key] ?? this.headerMap[key] ?? key
  }

  private colLetter(n: number): string {
    let s = '';
    while (n > 0) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }

  private getReportTitle(): string {
    const rt = this.formValues.report_type;
    if (rt === 'weekly') return 'EMPLOYEE WEEKLY ATTENDANCE REPORT';
    if (rt === 'monthly') return 'EMPLOYEE MONTHLY ATTENDANCE REPORT';
    if (rt === 'summary') return 'EMPLOYEE ATTENDANCE SUMMARY REPORT';
    return 'EMPLOYEE DAILY MOVEMENT REPORT';
  }

  /** True when exactly one employee was selected. Drives which layout is used. */
  private get isSingleEmployee(): boolean {
    return (
      Array.isArray(this.formValues.employee_ids) &&
      this.formValues.employee_ids.length === 1
    );
  }

  private get isDaily(): boolean {
    const rt = this.formValues.report_type;
    return !rt || rt === 'daily';
  }

  // ── Columns ────────────────────────────────────────────────────────────────
  // Daily mirrors the job: DailyExtraWork excluded, Late/Early added as HH:MM.
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
      // swapped so the labels read in that order (see HEADER_OVERRIDES).
      'ParentOrganization', 'Organization', 'Department', 'BusinessUnit',
      'EmployeeType', 'WorkDate', 'WorkDay', 'Shift',
      'PunchIn', 'LocationIn', 'PunchOut', 'LocationOut',
      'DailyWorkedHrs', 'DailyMissedHrs',
      'LateCheckIn', 'EarlyCheckOut',
      'IsAbsent', 'MissedPunch', 'EmployeeStatus',
    ];
  }

  private getEmployeeDetails(data: any[]) {
    const hasSpecificEmployees = this.formValues.employee_ids && this.formValues.employee_ids.length > 0;
    if (hasSpecificEmployees && data.length > 0) {
      const firstRow = data[0];
      return {
        employeeId: firstRow?.EmployeeID || this.formValues.employee_ids[0] || '',
        employeeName: firstRow?.Name || '',
        employeeNo: firstRow?.EmployeeNo || '',
      };
    }
    return { employeeId: 'All Employees', employeeName: 'All Employees', employeeNo: '' };
  }

  private getTextWidth(text: string): number {
    const wideCount = (text.match(/[MW]/g) || []).length;
    return text.length + wideCount * 0.5;
  }

  private formatCellValue(header: string, row: Record<string, any>): string {
    // Derived columns are computed, not read off the row.
    if (header === 'LateCheckIn') {
      return isProfessional(row) ? formatMinutesToHHMM(getMinutesLate(row.PunchIn)) : '';
    }
    if (header === 'EarlyCheckOut') {
      return isProfessional(row) ? formatMinutesToHHMM(getMinutesEarly(row.PunchOut)) : '';
    }

    // Location In/Out read ONLY the LocationIn/LocationOut keys. The previous
    // fallback to GeoLocationIn/Out is removed on purpose: those hold raw
    // lat/long pairs, and this column must show the location name instead.
    const value = row[header];

    if (value === null || value === undefined || value === '') return '';

    if (header === 'WorkDate' || header === 'WeekStart' || header === 'WeekEnd') {
      try {
        const datePart = String(value).split(' ')[0].split('T')[0];
        const [year, month, day] = datePart.split('-');
        if (year && month && day) return `${day}-${month}-${year}`;
        return String(value);
      } catch {
        return String(value);
      }
    }

    if (header === 'PunchIn' || header === 'PunchOut') return String(value || '');

    if ([
      'DailyWorkedHrs', 'DailyMissedHrs', 'DailyExtraWork',
      'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs',
    ].includes(header)) {
      return String(value || '');
    }

    return String(value);
  }

  private applyCellStyle(cell: any, styleType: 'header' | 'data' | 'title' | 'label' | 'value') {
    const border = {
      top: { style: 'thin' as const },
      left: { style: 'thin' as const },
      bottom: { style: 'thin' as const },
      right: { style: 'thin' as const },
    };

    switch (styleType) {
      case 'header':
        cell.font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: COLOR.headerText } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.red } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        break;
      case 'data':
        cell.font = { name: "Nunito Sans", size: 8, color: { argb: COLOR.bodyText } };
        cell.alignment = { vertical: "middle", wrapText: true };
        break;
      case 'title':
        cell.font = { name: "Nunito Sans", bold: true, size: 12, color: { argb: COLOR.bodyText } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        break;
      case 'label':
        cell.font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: COLOR.headerText } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.red } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        break;
      case 'value':
        cell.font = { name: "Nunito Sans", size: 9, color: { argb: COLOR.bodyText } };
        cell.alignment = { vertical: "middle" };
        break;
    }

    cell.border = border;
  }

  private async yieldToMain(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
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

    if (this.formValues.employee_ids?.length > 0) {
      queryParts.push(`employee_ids=${this.formValues.employee_ids.join(',')}`);
    }
    if (this.formValues.employee_type_ids?.length > 0) {
      queryParts.push(`employee_type_ids=${this.formValues.employee_type_ids.join(',')}`);
    }

    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });

    const queryString = queryParts.join('&');
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
        const params = {
          ...this.buildQueryParams(),
          limit: BATCH_SIZE.toString(),
          offset: offset.toString(),
        };

        const response = await apiRequest(this.buildUrl(params), "GET");
        const batch = Array.isArray(response) ? response : (response.data || []);
        const total = response?.total || 0;

        if (offset === 0 && total > 0) apiTotal = total;
        if (batch.length === 0) { hasMore = false; break; }

        allData.push(...batch);
        fetchedRecords += batch.length;
        offset += BATCH_SIZE;
        hasMore = batch.length === BATCH_SIZE;

        this.onProgress?.(fetchedRecords, apiTotal || fetchedRecords, 'fetching');
        await this.yieldToMain();
      } catch (error) {
        console.error('Error fetching batch:', error);
        if (error && typeof error === 'object' && 'requireLogin' in error) {
          this.showToast('error', 'excel_session_expired');
          throw new Error('Session expired. Please login again.');
        }
        this.showToast('error', 'excel_fetch_error');
        throw new Error('Failed to fetch data from server');
      }
    }

    return allData;
  }

  // ── Summary sheet (job layout) ─────────────────────────────────────────────
  private buildSummarySheet(workbook: any, rows: any[]) {
    const sheet = workbook.addWorksheet("Summary", {
      properties: { tabColor: { argb: COLOR.red } },
    });

    const summary = computeJobSummary(rows);

    sheet.mergeCells("A1:B1");
    const titleCell = sheet.getCell("A1");
    const label = this.isSingleEmployee
      ? this.getEmployeeDetails(rows).employeeName || 'Employee'
      : 'All Employees';
    titleCell.value = `Attendance Summary — ${label} — ${format(new Date(), "dd/MM/yyyy")}`;
    titleCell.font = { name: "Nunito Sans", bold: true, size: 14, color: { argb: COLOR.headerText } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.red } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(1).height = 30;

    const summaryRows: [string, string | number][] = [
      ["Total Employees", summary.totalEmployees],
      ["Present", summary.present],
      ["Absent", summary.absent],
      ["Late Check-Ins", summary.lateCheckins],
      ["Early Check-Outs", summary.earlyCheckouts],
      ["Missed Punches", summary.missedPunches],
      ["Total Worked Hrs", summary.totalWorkedHours],
      ["Total Missed Hrs", summary.totalMissedHours],
    ];

    summaryRows.forEach(([rowLabel, value], i) => {
      const row = sheet.getRow(i + 2);
      const isHourRow = i >= summaryRows.length - 2;

      row.getCell(1).value = rowLabel;
      row.getCell(1).font = { name: "Nunito Sans", bold: true, color: { argb: COLOR.bodyText } };
      row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.lightGrey } };
      row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(2).value = value;
      row.getCell(2).font = { name: "Nunito Sans", bold: isHourRow, color: { argb: COLOR.bodyText } };
      row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.white } };
      row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };

      [1, 2].forEach((col) => {
        row.getCell(col).border = {
          top: { style: "thin", color: { argb: COLOR.border } },
          bottom: { style: "thin", color: { argb: COLOR.border } },
          left: { style: "thin", color: { argb: COLOR.border } },
          right: { style: "thin", color: { argb: COLOR.border } },
        };
      });

      row.height = 22;
    });

    sheet.getColumn(1).width = 36;
    sheet.getColumn(2).width = 36;
  }

  /**
   * A data sheet in the job's style: red header, alternating row bands, and
   * amber highlighting on any non-zero Late/Early cell.
   */
  private buildDataSheet(workbook: any, name: string, rows: any[], headers: string[]) {
    const sheet = workbook.addWorksheet(name, {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    sheet.columns = headers.map((h) => ({
      header: this.headerLabel(h).toUpperCase(),
      key: h,
      width: COLUMN_WIDTHS[h] ?? DEFAULT_WIDTH,
    }));

    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell: any) => this.applyCellStyle(cell, 'header'));

    const lateIdx = headers.indexOf('LateCheckIn') + 1;
    const earlyIdx = headers.indexOf('EarlyCheckOut') + 1;

    rows.forEach((r, idx) => {
      const values: Record<string, string> = {};
      headers.forEach((h) => { values[h] = this.formatCellValue(h, r); });

      const row = sheet.addRow(values);
      row.height = 20;

      const rowIsLate = values['LateCheckIn'] !== undefined && values['LateCheckIn'] !== '' && values['LateCheckIn'] !== '00:00';
      const rowIsEarly = values['EarlyCheckOut'] !== undefined && values['EarlyCheckOut'] !== '' && values['EarlyCheckOut'] !== '00:00';
      const rowBg = idx % 2 === 0 ? COLOR.white : COLOR.lightGrey;

      row.eachCell({ includeEmpty: true }, (cell: any, colNum: number) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
        cell.font = { name: "Nunito Sans", size: 10, color: { argb: COLOR.bodyText } };
        cell.alignment = { vertical: "middle" };
        cell.border = { bottom: { style: "hair", color: { argb: COLOR.border } } };

        if ((colNum === lateIdx && rowIsLate) || (colNum === earlyIdx && rowIsEarly)) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.flagYes } };
          cell.font = { name: "Nunito Sans", bold: true, color: { argb: COLOR.flagText } };
        }
      });
    });

    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
    return sheet;
  }

  async export(): Promise<void> {
    try {
      this.onProgress?.(0, 0, 'initializing');

      const allData = await this.fetchDataInBatches();
      if (allData.length === 0) {
        this.showToast('error', 'excel_no_data_error');
        return;
      }

      this.onProgress?.(allData.length, allData.length, 'processing');

      const excel = await import("exceljs");
      const ExcelJS = excel.default ?? excel;
      const fs = await import("file-saver");
      const { saveAs } = fs.default ?? fs;

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Chronexa";
      workbook.created = new Date();

      const filteredHeaders = this.getFilteredHeaders();

      if (this.isSingleEmployee) {
        // ── SINGLE EMPLOYEE ────────────────────────────────────────────────
        // One sheet with the branded letterhead block (brand, title, meta,
        // employee name/no, date range), then the table and summary totals.
        // No Professional/Technical split — it is one person.
        const worksheet = workbook.addWorksheet("Report");
        const lastCol = this.colLetter(filteredHeaders.length);
        const noLabelCol = this.colLetter(Math.max(filteredHeaders.length - 1, 1));
        const { employeeId, employeeName, employeeNo } = this.getEmployeeDetails(allData);
        let currentRow = 1;

        worksheet.mergeCells(`A${currentRow}:${lastCol}${currentRow}`);
        const brandCell = worksheet.getCell(`A${currentRow}`);
        brandCell.value = "CHRONEXA";
        brandCell.font = { name: "Nunito Sans", bold: true, size: 18, color: { argb: COLOR.red } };
        brandCell.alignment = { vertical: "middle", horizontal: "center" };
        worksheet.getRow(currentRow).height = 35;
        currentRow += 2;

        worksheet.mergeCells(`A${currentRow}:${lastCol}${currentRow}`);
        const titleCell = worksheet.getCell(`A${currentRow}`);
        titleCell.value = this.getReportTitle();
        titleCell.font = { name: "Nunito Sans", bold: true, size: 14, color: { argb: COLOR.red } };
        titleCell.alignment = { vertical: "middle", horizontal: "center" };
        worksheet.getRow(currentRow).height = 30;
        currentRow += 2;

        worksheet.getCell(`A${currentRow}`).value = `Employee ID: ${employeeId}`;
        worksheet.getCell(`A${currentRow}`).font = { name: "Nunito Sans", size: 10 };
        worksheet.getCell(`${lastCol}${currentRow}`).value = `Generated On: ${format(new Date(), "dd/MM/yyyy")}`;
        worksheet.getCell(`${lastCol}${currentRow}`).font = { name: "Nunito Sans", size: 10 };
        worksheet.getCell(`${lastCol}${currentRow}`).alignment = { horizontal: "right" };
        currentRow += 2;

        const nameCell = worksheet.getCell(`A${currentRow}`);
        nameCell.value = 'EMPLOYEE NAME';
        this.applyCellStyle(nameCell, 'label');
        const nameValueCell = worksheet.getCell(`B${currentRow}`);
        nameValueCell.value = employeeName;
        this.applyCellStyle(nameValueCell, 'value');
        const empNoCell = worksheet.getCell(`${noLabelCol}${currentRow}`);
        empNoCell.value = 'EMPLOYEE NO';
        this.applyCellStyle(empNoCell, 'label');
        const empNoValueCell = worksheet.getCell(`${lastCol}${currentRow}`);
        empNoValueCell.value = employeeNo;
        this.applyCellStyle(empNoValueCell, 'value');
        currentRow++;

        if (this.formValues.from_date || this.formValues.to_date) {
          const fromDateCell = worksheet.getCell(`A${currentRow}`);
          fromDateCell.value = 'FROM DATE';
          this.applyCellStyle(fromDateCell, 'label');
          const fromDateValueCell = worksheet.getCell(`B${currentRow}`);
          fromDateValueCell.value = this.formValues.from_date ? format(this.formValues.from_date, 'dd/MM/yyyy') : '-';
          this.applyCellStyle(fromDateValueCell, 'value');
          const toDateCell = worksheet.getCell(`${noLabelCol}${currentRow}`);
          toDateCell.value = 'TO DATE';
          this.applyCellStyle(toDateCell, 'label');
          const toDateValueCell = worksheet.getCell(`${lastCol}${currentRow}`);
          toDateValueCell.value = this.formValues.to_date ? format(this.formValues.to_date, 'dd/MM/yyyy') : '-';
          this.applyCellStyle(toDateValueCell, 'value');
          currentRow++;
        }

        currentRow += 1;

        filteredHeaders.forEach((header, index) => {
          const cell = worksheet.getCell(currentRow, index + 1);
          cell.value = this.headerLabel(header).toUpperCase();
          this.applyCellStyle(cell, 'header');
        });
        currentRow++;

        this.onProgress?.(allData.length, allData.length, 'generating');

        const CHUNK_SIZE = 500;
        let processedRows = 0;
        const lateIdx = filteredHeaders.indexOf('LateCheckIn') + 1;
        const earlyIdx = filteredHeaders.indexOf('EarlyCheckOut') + 1;

        for (let i = 0; i < allData.length; i += CHUNK_SIZE) {
          const chunk = allData.slice(i, i + CHUNK_SIZE);

          chunk.forEach((row: Record<string, any>) => {
            filteredHeaders.forEach((header, index) => {
              const cell = worksheet.getCell(currentRow, index + 1);
              const cellValue = this.formatCellValue(header, row);
              cell.value = cellValue;
              this.applyCellStyle(cell, 'data');

              const isFlagCol = index + 1 === lateIdx || index + 1 === earlyIdx;
              if (isFlagCol && cellValue !== '' && cellValue !== '00:00') {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.flagYes } };
                cell.font = { name: "Nunito Sans", bold: true, size: 8, color: { argb: COLOR.flagText } };
              }
              if ((header === 'IsAbsent' || header === 'MissedPunch') && cellValue !== '') {
                cell.font = { ...cell.font, color: { argb: 'FFFF0000' } };
              }
            });
            currentRow++;
            processedRows++;
          });

          this.onProgress?.(processedRows, allData.length, 'generating');
          await this.yieldToMain();
        }

        // Summary totals block
        currentRow += 2;
        const summaryTotals = this.calculateSummaryTotals(allData);

        worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
        const summaryTitleCell = worksheet.getCell(`A${currentRow}`);
        summaryTitleCell.value = 'SUMMARY TOTALS';
        this.applyCellStyle(summaryTitleCell, 'title');
        worksheet.getRow(currentRow).height = 25;
        currentRow += 2;

        const summaryData = [
          ['Total Worked Hours', summaryTotals.totalWorkedHours, 'Total Missed Hours', summaryTotals.totalMissedHours, 'Total Extra Hours', summaryTotals.totalExtraHours],
          ['Total Absents', summaryTotals.totalAbsents, '', '', '', ''],
        ];

        summaryData.forEach((rowData) => {
          for (let i = 0; i < rowData.length; i += 2) {
            if (!rowData[i]) continue;
            const labelCell = worksheet.getCell(`${this.colLetter(i + 1)}${currentRow}`);
            labelCell.value = rowData[i];
            this.applyCellStyle(labelCell, 'label');
            const valueCell = worksheet.getCell(`${this.colLetter(i + 2)}${currentRow}`);
            valueCell.value = rowData[i + 1];
            this.applyCellStyle(valueCell, 'value');
          }
          currentRow++;
        });

        // Column widths — set per column WITHOUT reassigning worksheet.columns,
        // which would shift the merged title rows above.
        filteredHeaders.forEach((_h, index) => {
          const colIndex = index + 1;
          let maxWidth = 0;
          for (let rowIndex = 1; rowIndex <= currentRow; rowIndex++) {
            const cell = worksheet.getCell(rowIndex, colIndex);
            if (cell.value) maxWidth = Math.max(maxWidth, this.getTextWidth(String(cell.value)));
          }
          worksheet.getColumn(colIndex).width = Math.min(Math.max(maxWidth + 1, 6), 40);
        });
      } else {
        // ── MULTIPLE EMPLOYEES ─────────────────────────────────────────────
        // The job's workbook shape: Summary + Attendance Data, plus the
        // Professional / Technical split when the daily columns are in play.
        this.buildSummarySheet(workbook, allData);
        this.buildDataSheet(workbook, "Attendance Data", allData, filteredHeaders);

        if (this.isDaily) {
          const profRows = allData.filter((r) => isProfessional(r));
          const techRows = allData.filter((r) => !isProfessional(r));
          if (profRows.length > 0) this.buildDataSheet(workbook, "Professional", profRows, filteredHeaders);
          if (techRows.length > 0) this.buildDataSheet(workbook, "Technical", techRows, filteredHeaders);
        }

        this.onProgress?.(allData.length, allData.length, 'generating');
        await this.yieldToMain();
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const rt = this.formValues.report_type || 'daily';
      const who = this.formValues.employee_ids?.length > 0
        ? (this.isSingleEmployee ? `employee_${this.formValues.employee_ids[0]}` : `${this.formValues.employee_ids.length}_employees`)
        : 'all';
      const filename = `report_${rt}_${who}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      this.onProgress?.(allData.length, allData.length, 'complete');
      saveAs(blob, filename);

      this.showToast('success', 'excel_export_success', { count: allData.length.toLocaleString() });
    } catch (error) {
      console.error("Excel export error:", error);
      if (error instanceof Error && error.message.includes('Session expired')) {
        // already toasted
      } else {
        this.showToast('error', 'excel_export_error');
      }
      throw error;
    }
  }
}