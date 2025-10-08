import { format } from "date-fns";
import { toast } from "react-hot-toast";
import Papa from "papaparse";
import { apiRequest } from "@/src/lib/apiHandler";

export interface CSVExporterProps {
  formValues: any;
  headerMap: Record<string, string>;
  calculateSummaryTotals: (data: any[]) => any;
  onProgress?: (progress: number) => void;
}

export class CSVExporter {
  private formValues: any;
  private headerMap: Record<string, string>;
  private calculateSummaryTotals: (data: any[]) => any;
  private onProgress?: (progress: number) => void;
  
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
      'organization_eng',
      'transdate',
      'punch_in',
      'punch_out',
      'late',
      'early',
      'dailyworkhrs',
      'DailyMissedHrs',
      'dailyextrawork',
      'remarks',
      'isabsent'
    ];
  }

  private formatCellValue(header: string, value: any): string {
    if (header === 'transdate' && value) {
      try {
        const date = new Date(value);
        return format(date, 'dd-MM-yyyy');
      } catch {
        return value;
      }
    }
    
    if ((header === 'punch_in' || header === 'punch_out') && value) {
      try {
        const date = new Date(value);
        return format(date, 'HH:mm:ss');
      } catch {
        return value;
      }
    }
    
    return value || '';
  }

  private async yieldToMain(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  private async fetchDataInBatches(): Promise<any[]> {
    const allData: any[] = [];
    const BATCH_SIZE = 2000; 
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
          params.startDate = format(this.formValues.from_date, 'yyyy-MM-dd');
        }
        if (this.formValues.to_date) {
          params.endDate = format(this.formValues.to_date, 'yyyy-MM-dd');
        }
        if (this.formValues.employee) {
          params.employeeId = this.formValues.employee.toString();
        }
        if (this.formValues.organization) {
          params.organizationId = this.formValues.organization.toString();
        }

        const queryString = Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');

        const url = `/report/new${queryString ? `?${queryString}` : ''}`;
        const response = await apiRequest(url, "GET");

        const batch = Array.isArray(response) ? response : (response.data || []);

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        allData.push(...batch);
        offset += BATCH_SIZE;
        hasMore = batch.length === BATCH_SIZE;

        const progress = 5 + Math.min(Math.round((offset / 20000) * 40), 40);
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

    return allData;
  }

  async export(): Promise<void> {
    try {
      this.onProgress?.(0);

      const allData = await this.fetchDataInBatches();

      if (allData.length === 0) {
        toast.error("No data available to export.");
        return;
      }

      this.onProgress?.(50);

      const filteredHeaders = this.getFilteredHeaders();
      
      const formattedData = allData.map((row: any) => {
        const formattedRow: any = {};
        filteredHeaders.forEach(header => {
          const displayHeader = this.headerMap[header] || header;
          formattedRow[displayHeader] = this.formatCellValue(header, row[header]);
        });
        return formattedRow;
      });

      this.onProgress?.(70);

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

      this.onProgress?.(85);

      const csv = Papa.unparse(formattedData, {
        quotes: true,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ",",
        header: true,
        newline: "\r\n",
      });

      this.onProgress?.(95);

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

      this.onProgress?.(100);
      
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

  async exportStreaming(): Promise<void> {
    try {
      this.onProgress?.(0);

      const filteredHeaders = this.getFilteredHeaders();
      const displayHeaders = filteredHeaders.map(h => this.headerMap[h] || h);
      
      let csvContent = Papa.unparse([displayHeaders], { header: false }) + '\n';
      
      const BATCH_SIZE = 2000;
      let offset = 0;
      let hasMore = true;
      let totalRecords = 0;

      while (hasMore) {
        try {
          const params: Record<string, string> = {
            limit: BATCH_SIZE.toString(),
            offset: offset.toString(),
          };

          if (this.formValues.from_date) {
            params.startDate = format(this.formValues.from_date, 'yyyy-MM-dd');
          }
          if (this.formValues.to_date) {
            params.endDate = format(this.formValues.to_date, 'yyyy-MM-dd');
          }
          if (this.formValues.employee) {
            params.employeeId = this.formValues.employee.toString();
          }
          if (this.formValues.organization) {
            params.organizationId = this.formValues.organization.toString();
          }

          const queryString = Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

          const url = `/report/new${queryString ? `?${queryString}` : ''}`;
          const response = await apiRequest(url, "GET");

          const batch = Array.isArray(response) ? response : (response.data || []);

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
          offset += BATCH_SIZE;
          hasMore = batch.length === BATCH_SIZE;

          const progress = Math.min(Math.round((offset / 20000) * 90), 90);
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

      this.onProgress?.(95);

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

      this.onProgress?.(100);
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
}