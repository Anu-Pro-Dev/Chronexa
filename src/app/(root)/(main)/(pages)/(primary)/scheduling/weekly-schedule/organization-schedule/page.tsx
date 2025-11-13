"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce"; 
import { InlineLoading } from "@/src/app/loading";
import { useOrgScheduleEditStore } from "@/src/stores/orgScheduleEditStore";

type Column = {
  field: string;
  headerName: string;
  cellRenderer?: (row: any) => React.ReactNode;
};

export default function Page() {
    const router = useRouter();
    const { modules, language, translations } = useLanguage();
    const { isAuthenticated, isChecking, employeeId } = useAuthGuard();
    const [columns, setColumns] = useState<Column[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortField, setSortField] = useState<string>("organization_schedule_id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const queryClient = useQueryClient();
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const debouncedSearchValue = useDebounce(searchValue, 300);
    
    const t = translations?.modules?.scheduling || {};
    const commonT = translations || {};
    
    const setSelectedRowData = useOrgScheduleEditStore((state) => state.setSelectedRowData);

    const offset = useMemo(() => {
        return currentPage;
    }, [currentPage]);

    useEffect(() => {
        setColumns([
            { 
                field: "organization_name", 
                headerName: t.organization || "Organization",
            },
            { 
                field: "from_date", 
                headerName: t.from_date || "From" 
            },
            { 
                field: "to_date", 
                headerName: t.to_date || "To" 
            },
            { 
                field: "monday_schedule_id", 
                headerName: t.monday || "Mon",
                cellRenderer: (row: any) => (
                    <span style={{ color: row.monday_schedule_color }}>
                        {row.monday_schedule_id}
                    </span>
                ),
            },
            { 
                field: "tuesday_schedule_id", 
                headerName: t.tuesday || "Tue",
                cellRenderer: (row: any) => (
                    <span style={{ color: row.tuesday_schedule_color }}>
                        {row.tuesday_schedule_id}
                    </span>
                ),
            },
            { 
                field: "wednesday_schedule_id", 
                headerName: t.wednesday || "Wed",
                cellRenderer: (row: any) => (
                    <span style={{ color: row.wednesday_schedule_color }}>
                        {row.wednesday_schedule_id}
                    </span>
                ),
            },
            { 
                field: "thursday_schedule_id", 
                headerName: t.thursday || "Thu",
                cellRenderer: (row: any) => (
                    <span style={{ color: row.thursday_schedule_color }}>
                        {row.thursday_schedule_id}
                    </span>
                ),
            },
            { 
                field: "friday_schedule_id", 
                headerName: t.friday || "Fri",
                cellRenderer: (row: any) => (
                    <span style={{ color: row.friday_schedule_color }}>
                        {row.friday_schedule_id}
                    </span>
                ),
            },
        ]);
    }, [language, t]);

    const { data: organizationScheduleData, isLoading, refetch } = useFetchAllEntity("organizationSchedule", {
        searchParams: {
            limit: String(rowsPerPage),
            offset: String(offset),
            ...(debouncedSearchValue && { search: debouncedSearchValue }),
        },
    });

    const { data: scheduleData } = useFetchAllEntity("schedule");

    const scheduleMap = useMemo(() => {
        const map: Record<number, string> = {};
        if (Array.isArray(scheduleData?.data)) {
            scheduleData.data.forEach((schedule: any) => {
                map[schedule.schedule_id] = schedule.schedule_code;
            });
        }
        return map;
    }, [scheduleData]);

    const scheduleColorMap = useMemo(() => {
        const map: Record<number, string> = {};
        if (Array.isArray(scheduleData?.data)) {
            scheduleData.data.forEach((schedule: any) => {
                map[schedule.schedule_id] = schedule.sch_color;
            });
        }
        return map;
    }, [scheduleData]);

    const data = useMemo(() => {
        if (!Array.isArray(organizationScheduleData?.data)) return [];

        return organizationScheduleData.data.map((orgSch: any) => {
            const organizationName = language === 'ar' 
                ? orgSch.organizations?.organization_arb 
                : orgSch.organizations?.organization_eng;

            return {
                id: orgSch.organization_schedule_id,
                organization_schedule_id: orgSch.organization_schedule_id,
                from_date: new Date(orgSch.from_date).toISOString().split('T')[0],
                to_date: orgSch.to_date ? new Date(orgSch.to_date).toISOString().split('T')[0] : "-",
                monday_schedule_id: scheduleMap[orgSch.monday_schedule_id]?.trim() ?? "-",
                tuesday_schedule_id: scheduleMap[orgSch.tuesday_schedule_id]?.trim() ?? "-",
                wednesday_schedule_id: scheduleMap[orgSch.wednesday_schedule_id]?.trim() ?? "-",
                thursday_schedule_id: scheduleMap[orgSch.thursday_schedule_id]?.trim() ?? "-",
                friday_schedule_id: scheduleMap[orgSch.friday_schedule_id]?.trim() ?? "-",
                saturday_schedule_id: scheduleMap[orgSch.saturday_schedule_id]?.trim() ?? "-",
                sunday_schedule_id: scheduleMap[orgSch.sunday_schedule_id]?.trim() ?? "-",
                monday_schedule_color: scheduleColorMap[orgSch.monday_schedule_id] ?? "#000",
                tuesday_schedule_color: scheduleColorMap[orgSch.tuesday_schedule_id] ?? "#000",
                wednesday_schedule_color: scheduleColorMap[orgSch.wednesday_schedule_id] ?? "#000",
                thursday_schedule_color: scheduleColorMap[orgSch.thursday_schedule_id] ?? "#000",
                friday_schedule_color: scheduleColorMap[orgSch.friday_schedule_id] ?? "#000",
                saturday_schedule_color: scheduleColorMap[orgSch.saturday_schedule_id] ?? "#000",
                sunday_schedule_color: scheduleColorMap[orgSch.sunday_schedule_id] ?? "#000",
                organization_name: organizationName || "-",
                _original: orgSch,
            };
        });
    }, [organizationScheduleData, scheduleMap, scheduleColorMap, language]);

    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
        if (refetch) {
            setTimeout(() => refetch(), 100);
        }
    }, [refetch]);

    const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(1);
        if (refetch) {
            setTimeout(() => refetch(), 100);
        }
    }, [refetch]);

    const handleSearchChange = useCallback((newSearchValue: string) => {
        setSearchValue(newSearchValue);
        setCurrentPage(1);
    }, []);

    const props = {
        Data: data,
        Columns: columns,
        selectedRows,
        setSelectedRows,
        isLoading: isLoading || isChecking,
        SortField: sortField,
        CurrentPage: currentPage,
        SetCurrentPage: handlePageChange,
        SetSortField: setSortField,
        SortDirection: sortDirection,
        SetSortDirection: setSortDirection,
        SearchValue: searchValue,
        SetSearchValue: handleSearchChange,
        total: organizationScheduleData?.total || 0,
        hasNext: organizationScheduleData?.hasNext,
        rowsPerPage,
        setRowsPerPage: handleRowsPerPageChange,
    };

    const handleSave = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["organizationSchedule"] });
    }, [queryClient]);

    const handleEditClick = useCallback((row: any) => {
        const originalData = row._original;
        
        if (originalData) {
            setSelectedRowData({
                id: originalData.organization_schedule_id,
                organization_schedule_id: originalData.organization_schedule_id,
                organization_id: originalData.organization_id,
                schedule_id: originalData.schedule_id,
                from_date: originalData.from_date,
                to_date: originalData.to_date,
                monday_schedule_id: originalData.monday_schedule_id,
                tuesday_schedule_id: originalData.tuesday_schedule_id,
                wednesday_schedule_id: originalData.wednesday_schedule_id,
                thursday_schedule_id: originalData.thursday_schedule_id,
                friday_schedule_id: originalData.friday_schedule_id,
                saturday_schedule_id: originalData.saturday_schedule_id,
                sunday_schedule_id: originalData.sunday_schedule_id,
            });
        }
        
        router.push(`/scheduling/weekly-schedule/organization-schedule/edit?id=${row.id}`);
    }, [router, setSelectedRowData]);

    const handleRowSelection = useCallback((rows: any[]) => {
        setSelectedRows(rows);
    }, []);

    const renderPowerTable = () => {
        if (isChecking) {
            return (
                <div className="flex justify-center items-center p-8">
                    <InlineLoading />
                </div>
            );
        }

        if (!isAuthenticated || !employeeId) {
            return (
                <div className="p-8">
                    <div className="bg-backdrop rounded-md p-3">
                        <div className="text-center">
                            <p>{commonT.buttons?.loading || "Unable to load employee data. Please try logging in again."}</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <PowerTable
                props={props}
                onEditClick={handleEditClick}
                onRowSelection={handleRowSelection}
                isLoading={isLoading || isChecking}
            />
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <PowerHeader
                props={props}
                selectedRows={selectedRows}
                items={modules?.scheduling?.items}
                entityName="organizationSchedule"
                isAddNewPagePath="/scheduling/weekly-schedule/organization-schedule/add"
            />
            <div className="bg-accent rounded-2xl">
                <div className="col-span-2 p-6 pb-6">
                    <h1 className="font-bold text-xl text-primary">
                        {t.organization_schedule || "Organization Schedule"}
                    </h1>
                </div>
                <div className="px-6">
                    <PowerTabs />
                </div>
                {renderPowerTable()}
            </div>
        </div>
    );
}