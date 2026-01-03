import { format } from "date-fns";
import Papa from "papaparse";
import { apiRequest } from "@/src/lib/apiHandler";
import { formatInTimeZone } from "date-fns-tz";

export interface CSVExporterFGICProps {
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
  onProgress?: (current: number, total: number, phase: string) => void;
  showToast: (type: 'success' | 'error', messageKey: string, params?: Record<string, any>) => void;
}

export class CSVExporterFGIC {
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  private onProgress?: (current: number, total: number, phase: string) => void;
  private showToast: (type: 'success' | 'error', messageKey: string, params?: Record<string, any>) => void;

  constructor({ formValues, headerMap, calculateSummaryTotals, onProgress, showToast }: CSVExporterFGICProps) {
    this.formValues = formValues;
    this.headerMap = headerMap;
    this.calculateSummaryTotals = calculateSummaryTotals;
    this.onProgress = onProgress;
    this.showToast = showToast;
  }

  private getFilteredHeaders() {
    return [
      'employee_number',
      'firstname_eng',
      'parent_org_eng',
      'organization_eng',
      'employee_type',
      'schCode',
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
      'day_status'
    ];
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
      queryParts.push(`employee_id=[${ids}]`);
    }

    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });

    const queryString = queryParts.join('&');
    return `/report/new${queryString ? `?${queryString}` : ''}`;
  }

  async exportStreaming(): Promise<void> {
    try {
      this.onProgress?.(0, 0, 'initializing');

      const filteredHeaders = this.getFilteredHeaders();
      const displayHeaders = filteredHeaders.map(h => this.headerMap[h] || h);

      let csvContent = Papa.unparse([displayHeaders], { header: false }) + '\n';

      const BATCH_SIZE = 2000;
      let offset = 0;
      let hasMore = true;
      let totalRecords = 0;
      let apiTotal = 0;
      let fetchedRecords = 0;

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

          const formattedBatch = batch.map((row: any) => {
            return filteredHeaders.map(header =>
              this.formatCellValue(header, row[header])
            );
          });

          csvContent += Papa.unparse(formattedBatch, { header: false }) + '\n';

          totalRecords += batch.length;
          fetchedRecords += batch.length;
          offset += BATCH_SIZE;

          hasMore = hasNext && batch.length === BATCH_SIZE;

          this.onProgress?.(fetchedRecords, apiTotal || totalRecords, 'fetching');

          await this.yieldToMain();

        } catch (error) {
          console.error('Error fetching batch:', error);

          if (error && typeof error === 'object' && 'requireLogin' in error) {
            this.showToast('error', 'csv_session_expired');
            throw new Error('Session expired. Please login again.');
          }

          this.showToast('error', 'csv_fetch_error');
          throw new Error('Failed to fetch data from server');
        }
      }

      if (totalRecords === 0) {
        this.showToast('error', 'csv_no_data_error');
        return;
      }

      this.onProgress?.(totalRecords, totalRecords, 'processing');
      await this.yieldToMain();

      this.onProgress?.(totalRecords, totalRecords, 'generating');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      let identifier = 'all';
      if (this.formValues.employee_ids && this.formValues.employee_ids.length > 0) {
        identifier = this.formValues.employee_ids.length === 1
          ? `employee_${this.formValues.employee_ids[0]}`
          : `${this.formValues.employee_ids.length}_employees`;
      } else if (this.formValues.employee) {
        identifier = `employee_${this.formValues.employee}`;
      }

      link.setAttribute('href', url);
      link.setAttribute('download', `report_${identifier}_${format(new Date(), "yyyy-MM-dd")}.csv`);

      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      this.onProgress?.(totalRecords, totalRecords, 'complete');
      this.showToast('success', 'csv_export_success', { count: totalRecords.toLocaleString() });

    } catch (error) {
      console.error("CSV export error:", error);

      if (error instanceof Error && error.message.includes('Session expired')) {
      } else {
        this.showToast('error', 'csv_export_error');
      }
      throw error;
    }
  }
}