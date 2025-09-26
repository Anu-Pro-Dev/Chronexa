"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce"; 

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.organization || {};
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });
  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  const stripHtmlTags = useCallback((html: string): string => {
    if (!html) return "";
    
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      
      const cleanText = tempDiv.textContent || tempDiv.innerText || "";
      
      return cleanText.replace(/\s+/g, ' ').trim();
    } catch (error) {
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
  }, []);

  const truncateText = useCallback((text: string, maxLength: number = 100): string => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  }, []);

  useEffect(() => {
    setColumns([
      { field: "to_text", headerName: "Email" },
      { field: "subject_text", headerName: "Subject" },
      { field: "body_text", headerName: "Body" },
      { field: "email_status", headerName: "Status"},
      { field: "cc_email", headerName: "CC Email" },
      { field: "bcc_email", headerName: "BCC Email" },
    ]);
  }, [language]);

  const { data: taEmailData, isLoading, refetch } = useFetchAllEntity("ta-emails",{
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const data = useMemo(() => {
    if (Array.isArray(taEmailData?.data)) {
      return taEmailData.data.map((taEmail: any) => {
        const cleanBodyText = stripHtmlTags(taEmail.body_text || "");
        const truncatedBodyText = truncateText(cleanBodyText, 150);

        return {
          ...taEmail,
          id: taEmail.ta_email_id,
          body_text: truncatedBodyText,
          original_body_text: taEmail.body_text,
          subject_text: stripHtmlTags(taEmail.subject_text || ""),
          to_text: stripHtmlTags(taEmail.to_text || ""),
          cc_email: stripHtmlTags(taEmail.cc_email || ""),
          bcc_email: stripHtmlTags(taEmail.bcc_email || ""),
        };
      });
    }
    return [];
  }, [taEmailData, stripHtmlTags, truncateText]);

  useEffect(() => {
    if (!open) {
      setSelectedRowData(null);
    }
  }, [open]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [currentPage, refetch]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    if (refetch) {
      setTimeout(() => refetch(), 100);
    }
  }, [rowsPerPage, refetch]);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

  const props = {
    Data: data,
    Columns: columns,
    open,
    on_open_change: setOpen,
    selectedRows,
    setSelectedRows,
    isLoading,
    SortField: sortField,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: taEmailData?.total || 0,
    hasNext: taEmailData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange, 
  };
 
  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["taEmail"] });
  };
 
  const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    setOpen(true);
  }, []);
 
  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        disableAdd
        selectedRows={selectedRows}
        items={modules?.alerts.items}
        entityName="ta-emails"
        disableDelete
        isExport
        enableExcel
      />
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
            <PopoverTrigger asChild>
              <Button 
                size={"lg"} 
                variant={"outline"}
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    From Date :
                  </Label>
                  <span className="px-1 text-sm text-text-primary">
                    {fromDate ? format(fromDate, "dd/MM/yy") : "Choose date"}
                  </span>
                </p>
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
            <PopoverTrigger asChild>
              <Button 
                size={"lg"} 
                variant={"outline"}
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">
                    To Date :
                  </Label>
                  <span className="px-1 text-sm text-text-primary">
                    {toDate ? format(toDate, "dd/MM/yy") : "Choose date"}
                  </span>
                </p>
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar 
                mode="single" 
                selected={toDate} 
                onSelect={setToDate} 
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <PowerTable
        props={props}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
        customColDef={{
          flex: 0,
        }}
      />
    </div>
  );
}