"use client";
import React, { useState, useRef, useEffect } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import FilterForm from "@/src/components/custom/modules/scheduling/MonthlyScheduleFilterForm";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import MonthlyScheduleTable from "./schedule-table";
import AddMonthlySchedule from "@/src/components/custom/modules/scheduling/AddMonthlySchedule";
import {
  CopyIcon,
  ExportIcon,
  ImportIcon,
  PasteIcon,
} from "@/src/icons/icons";
import { useShowToast } from "@/src/utils/toastHelper";
import { 
  importMonthlyScheduleRequest, 
  filterMonthlyScheduleRequest, 
  getAllMonthlySchedules,
  exportMonthlyScheduleRequest 
} from "@/src/lib/apiHandler";

export default function Page() {
  const { translations, modules } = useLanguage();
  const showToast = useShowToast();
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [filterData, setFilterData] = useState<any>(null);
  const [filterParams, setFilterParams] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const props = {
    SearchValue,
    SetSearchValue,
    open,
    on_open_change: setOpen,
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await getAllMonthlySchedules();
        setFilterData(data);
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error loading initial data:", error);
        setIsInitialLoad(false);
      }
    };

    if (isInitialLoad) {
      loadInitialData();
    }
  }, [isInitialLoad]);

  const handleFilterSubmit = async (data: any) => {
    if (data === null) {
      try {
        const allData = await getAllMonthlySchedules();
        setFilterData(allData);
        setFilterParams(null);
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error("Error loading all data:", error);
        showToast("error", "Failed to load data");
      }
    } else {
      setFilterData(data);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleFilterParamsChange = (params: any) => {
    setFilterParams(params);
  };

  const handleSave = async () => {
    setOpen(false);
    
    try {
      if (filterParams) {
        const data = await filterMonthlyScheduleRequest(filterParams);
        setFilterData(data);
      } else {
        const data = await getAllMonthlySchedules();
        setFilterData(data);
      }
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Refresh error:", error);
      showToast("error", "Failed to refresh data");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        showToast("error", "invalid_file_format");
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
      const result = await importMonthlyScheduleRequest(file);
      showToast("success", "import_schedule_success");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (filterParams) {
        const data = await filterMonthlyScheduleRequest(filterParams);
        setFilterData(data);
      } else {
        const data = await getAllMonthlySchedules();
        setFilterData(data);
      }
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      showToast("error", "import_schedule_error");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        showToast("error", "invalid_file_format");
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
      const selectedIdsArray = Array.from(selectedRowIds);
      
      await exportMonthlyScheduleRequest(
        selectedIdsArray.length > 0 ? null : filterParams,
        selectedIdsArray
      );

      showToast(
        "success", 
        selectedRowIds.size > 0 ? "export_selected_success" : "export_schedule_success"
      );
    } catch (error) {
      console.error('Export error:', error);
      showToast("error", "export_schedule_error");
    }
  };
  
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.scheduling?.items}
        modal_title={translations?.modules?.scheduling?.add_monthly_schedule|| "Add Monthly Schedule"}
        modal_component={
          <AddMonthlySchedule
            on_open_change={setOpen}
            selectedRowData={selectedRowData}
            onSave={handleSave}
          />
        }
        size="large"
      />

      <div className="flex flex-col justify-between bg-accent rounded-[15px] items-center px-5 py-3">
        <div className="w-full py-3">
          <FilterForm 
            onFilterSubmit={handleFilterSubmit}
            onFilterParamsChange={handleFilterParamsChange}
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