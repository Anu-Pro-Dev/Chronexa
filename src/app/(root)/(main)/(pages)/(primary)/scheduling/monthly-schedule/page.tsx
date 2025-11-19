"use client";
import React, { useState, useRef } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import FilterForm from "@/src/components/custom/modules/scheduling/MonthlyScheduleFilterForm";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import MonthlyScheduleTable from "./schedule-table";
import {
  CopyIcon,
  ExportIcon,
  ImportIcon,
  PasteIcon,
} from "@/src/icons/icons";
import toast from "react-hot-toast";
import { importMonthlyRosterRequest } from "@/src/lib/apiHandler";
import { getAuthToken } from "@/src/utils/authToken";

export default function Page() {
  const { translations, modules } = useLanguage();
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [filterData, setFilterData] = useState<any>(null);
  const [filterParams, setFilterParams] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const props = {
    SearchValue,
    SetSearchValue,
  };

  const handleFilterSubmit = (data: any) => {
    setFilterData(data);
    setRefreshKey(prev => prev + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (file: File) => {
    try {
      const result = await importMonthlyRosterRequest(file);
      toast.success('Import successful');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Import failed');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      await handleImport(file);
    }
  };

  const handleExport = async () => {
    try {
      const requestBody: any = {};
      if (selectedRowIds.size > 0) {
        requestBody.schedule_roster_ids = Array.from(selectedRowIds);
      } else {
        if (filterParams) {
          if (filterParams.organization_id) requestBody.organization_id = filterParams.organization_id;
          if (filterParams.month) requestBody.month = filterParams.month;
          if (filterParams.year) requestBody.year = filterParams.year;
          if (filterParams.day) requestBody.day = filterParams.day;
          if (filterParams.employee_id) requestBody.employee_id = filterParams.employee_id;
          if (filterParams.employee_group_id) requestBody.employee_group_id = filterParams.employee_group_id;
          if (filterParams.manager_id) requestBody.manager_id = filterParams.manager_id;
          if (filterParams.schedule_id) requestBody.schedule_id = filterParams.schedule_id;
          if (filterParams.finalize_flag !== undefined) requestBody.finalize_flag = filterParams.finalize_flag;
        }
      }

      const token = getAuthToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${API_URL}/employeeMonthlyRoster/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = selectedRowIds.size > 0 
        ? `selected_rosters_${Date.now()}.csv`
        : `employee_monthly_rosters_${Date.now()}.csv`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      const successMessage = selectedRowIds.size > 0
        ? `Exported ${selectedRowIds.size} selected roster(s)`
        : 'Export successful';
      toast.success(successMessage);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };
  
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.scheduling?.items}
      />

      <div className="flex flex-col justify-between bg-accent rounded-[15px] items-center px-5 py-3">
        <div className="w-full py-3">
          <FilterForm 
            onFilterSubmit={handleFilterSubmit}
            onFilterParamsChange={setFilterParams}
          />
        </div>
      </div>
      <div className="flex flex-col justify-between bg-accent rounded-[15px] items-center px-5 py-3">
        <div className="w-full flex py-3 justify-between items-center">
          <Input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
          />
          
          <div className="text-text-secondary text-sm">
            {selectedRowIds.size > 0 && (
              <span>{selectedRowIds.size} row(s) selected</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size={"sm"} 
              variant={"primaryoutline"} 
              type="button" 
              className="text-sm font-semibold"
              onClick={handleImportClick}
            >
              <ImportIcon /> {translations?.buttons?.import}
            </Button>
            <Button 
              size={"sm"} 
              variant={"primaryoutline"} 
              type="button" 
              className="text-sm font-semibold"
              onClick={handleExport}
              disabled={!filterParams && selectedRowIds.size === 0}
            >
              <ExportIcon /> {translations?.buttons?.export}
              {selectedRowIds.size > 0 && ` (${selectedRowIds.size})`}
            </Button>
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold">
              <CopyIcon /> {translations?.buttons?.copy_roster}
            </Button>
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold">
              <CopyIcon /> {translations?.buttons?.copy}
            </Button>
            <Button size={"sm"} variant={"primaryoutline"} type="button" className="text-sm font-semibold" disabled>
              <PasteIcon /> {translations?.buttons?.paste}
            </Button>
          </div>
        </div>
      </div>
      <div className="relative">
        <MonthlyScheduleTable 
          key={refreshKey}
          groupFilter={filterData?.employee_group_id} 
          filterData={filterData}
          onSelectionChange={setSelectedRowIds}
        />
      </div>
    </div>
  );
}