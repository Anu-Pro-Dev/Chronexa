import { format } from "date-fns";
import { toast } from "react-hot-toast";
import Papa from "papaparse";
import { apiRequest } from "@/src/lib/apiHandler";
import { formatInTimeZone } from "date-fns-tz";

export interface CSVExporterProps {
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
  onProgress?: (current: number, total: number, phase: string) => void;
}

export class CSVExporter {
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  private onProgress?: (current: number, total: number, phase: string) => void;
  
  constructor({ formValues, headerMap, calculateSummaryTotals, onProgress }: CSVExporterProps) {
    this.formValues = formValues;
    this.headerMap = headerMap;
    this.calculateSummaryTotals = calculateSummaryTotals;
    this.onProgress = onProgress;
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
  
  private formatCellValue(header: string, value: any): string {
    if (header === 'transdate' && value) {
      try {
        return formatInTimeZone(value, 'UTC', 'dd-MM-yyyy');
      } catch {
        return value;
      }
    }

    if ((header === 'punch_in' || header === 'punch_out') && value) {
      try {
        return formatInTimeZone(value, 'UTC', 'HH:mm:ss');
      } catch {
        return value;
      }
    }

    return value || '';
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

          // Handle API response structure: {success, data, total, hasNext}
          const batch = Array.isArray(response) ? response : (response.data || []);
          const total = response?.total || 0;
          const hasNext = response?.hasNext ?? (batch.length === BATCH_SIZE);

          // Set total from first API response
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
          
          // Update hasMore based on API response
          hasMore = hasNext && batch.length === BATCH_SIZE;

          // Report progress with actual values
          this.onProgress?.(fetchedRecords, apiTotal || totalRecords, 'fetching');

          await this.yieldToMain();

        } catch (error) {
          console.error('Error fetching batch:', error);
          
          if (error && typeof error === 'object' && 'requireLogin' in error) {
            throw new Error('Session expired. Please login again.');
          }
          
          throw new Error('Failed to fetch data from server');
        }
      }

      if (totalRecords === 0) {
        toast.error("No data available to export.");
        return;
      }

      // Processing phase
      this.onProgress?.(totalRecords, totalRecords, 'processing');
      await this.yieldToMain();

      // Generating phase
      this.onProgress?.(totalRecords, totalRecords, 'generating');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `report_${
        this.formValues.employee ? "employee_" + this.formValues.employee : "all"
      }_${format(new Date(), "yyyy-MM-dd")}.csv`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      this.onProgress?.(totalRecords, totalRecords, 'complete');
      toast.success(`CSV file generated successfully! (${totalRecords.toLocaleString()} records)`);
      
    } catch (error) {
      console.error("CSV export error:", error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        toast.error(error.message);
      } else {
        toast.error("Error generating CSV file. Please try again.");
      }
      throw error;
    }
  }

  async export(): Promise<void> {
    try {
      this.onProgress?.(0, 0, 'initializing');

      const allData = await this.fetchDataInBatches();

      if (allData.length === 0) {
        toast.error("No data available to export.");
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
      summaryHeader[this.headerMap['employee_number']] = 'SUMMARY TOTALS';
      formattedData.push(summaryHeader);
      
      formattedData.push({
        [this.headerMap['employee_number']]: 'Total Late In Hours',
        [this.headerMap['firstname_eng']]: summaryTotals.totalLateInHours,
        [this.headerMap['organization_eng']]: 'Total Early Out Hours',
        [this.headerMap['transdate']]: summaryTotals.totalEarlyOutHours,
        [this.headerMap['punch_in']]: 'Total Missed Hours',
        [this.headerMap['punch_out']]: summaryTotals.totalMissedHours,
      });
      
      formattedData.push({
        [this.headerMap['employee_number']]: 'Total Worked Hours',
        [this.headerMap['firstname_eng']]: summaryTotals.totalWorkedHours,
        [this.headerMap['organization_eng']]: 'Total Extra Hours',
        [this.headerMap['transdate']]: summaryTotals.totalExtraHours,
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
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `report_${
        this.formValues.employee
          ? "employee_" + this.formValues.employee
          : "all"
      }_${format(new Date(), "yyyy-MM-dd")}.csv`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      this.onProgress?.(allData.length, allData.length, 'complete');
      
      toast.success(`CSV file generated successfully! (${allData.length.toLocaleString()} records)`);
      
    } catch (error) {
      console.error("CSV export error:", error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        toast.error(error.message);
      } else {
        toast.error("Error generating CSV file. Please try again.");
      }
      throw error;
    }
  }

  private async fetchDataInBatches(): Promise<any[]> {
    const allData: any[] = [];
    const BATCH_SIZE = 2000;
    let offset = 0;
    let hasMore = true;
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

        // Handle API response structure: {success, data, total, hasNext}
        const batch = Array.isArray(response) ? response : (response.data || []);
        const total = response?.total || 0;
        const hasNext = response?.hasNext ?? (batch.length === BATCH_SIZE);

        // Set total from first API response
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
        
        // Update hasMore based on API response
        hasMore = hasNext && batch.length === BATCH_SIZE;

        // Report progress with actual values
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
}