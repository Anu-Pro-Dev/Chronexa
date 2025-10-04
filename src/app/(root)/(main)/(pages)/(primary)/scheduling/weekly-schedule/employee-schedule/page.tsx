"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import PowerTabs from "@/src/components/custom/power-comps/power-tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useDebounce } from "@/src/hooks/useDebounce"; 
import Lottie from "lottie-react";
import loadingAnimation from "@/src/animations/hourglass-blue.json";

type Column = {
  field: string;
  headerName: string;
  cellRenderer?: (row: any) => React.ReactNode;
};

export default function Page() {
    const router = useRouter();
    const { modules, language, translations } = useLanguage();
    const { isAuthenticated, isChecking, employeeId, userInfo } = useAuthGuard();
    const [columns, setColumns] = useState<Column[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortField, setSortField] = useState<string>("employee_schedule_id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const queryClient = useQueryClient();
    const [open, setOpen] = useState<boolean>(false);
    const [filter_open, filter_on_open_change] = useState<boolean>(false);
    const [selectedRowData, setSelectedRowData] = useState<any>(null);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
    const [toDate, setToDate] = useState<Date | undefined>(undefined);
    const [selectedOption, setSelectedOption] = useState<string>("all");
    const debouncedSearchValue = useDebounce(searchValue, 300);
    const t = translations?.modules?.scheduling || {};
    const [popoverStates, setPopoverStates] = useState({
        fromDate: false,
        toDate: false,
    });

    const closePopover = (key: string) => {
        setPopoverStates(prev => ({ ...prev, [key]: false }));
    };

    const offset = useMemo(() => {
        return currentPage;
    }, [currentPage]);

    useEffect(() => {
        setColumns([
        { field: "from_date", headerName: "From date" },
        { field: "to_date", headerName: "To date" },
        { 
            field: "monday_schedule_id", 
            headerName: "Monday",
            cellRenderer: (row: any) => (
            <span style={{ color: row.monday_schedule_color }}>
                {row.monday_schedule_id}
            </span>
            ),
        },
        { 
            field: "tuesday_schedule_id", 
            headerName: "Tuesday",
            cellRenderer: (row: any) => (
            <span style={{ color: row.tuesday_schedule_color }}>
                {row.tuesday_schedule_id}
            </span>
            ),
        },
        { 
            field: "wednesday_schedule_id", 
            headerName: "Wednesday",
            cellRenderer: (row: any) => (
            <span style={{ color: row.wednesday_schedule_color }}>
                {row.wednesday_schedule_id}
            </span>
            ),
        },
        { 
            field: "thursday_schedule_id", 
            headerName: "Thursday",
            cellRenderer: (row: any) => (
            <span style={{ color: row.thursday_schedule_color }}>
                {row.thursday_schedule_id}
            </span>
            ),
        },
        { 
            field: "friday_schedule_id", 
            headerName: "Friday",
            cellRenderer: (row: any) => (
            <span style={{ color: row.friday_schedule_color }}>
                {row.friday_schedule_id}
            </span>
            ),
        },
        // { 
        //     field: "saturday_schedule_id", 
        //     headerName: "Saturday",
        //     cellRenderer: (row: any) => (
        //     <span style={{ color: row.saturday_schedule_color }}>
        //         {row.saturday_schedule_id}
        //     </span>
        //     ),
        // },
        ]);
    }, [language]);

    
    const formatDateForAPI = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const { data: employeeScheduleData, isLoading, refetch } = useFetchAllEntity("employeeSchedule",{
        searchParams: {
        limit: String(rowsPerPage),
        offset: String(offset),
        ...(fromDate && { from_date: formatDateForAPI(fromDate) }),
        ...(toDate && { to_date: formatDateForAPI(toDate) }),
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
        if (!Array.isArray(employeeScheduleData?.data)) return [];

            return employeeScheduleData.data.map((orgSch: any) => ({
                id: orgSch.employee_schedule_id,
                from_date: new Date(orgSch.from_date).toISOString().split('T')[0],
                to_date: orgSch.to_date ? new Date(orgSch.to_date).toISOString().split('T')[0] : "-",
                monday_schedule_id: scheduleMap[orgSch.monday_schedule_id]?.trim() ?? "-",
                tuesday_schedule_id: scheduleMap[orgSch.tuesday_schedule_id]?.trim() ?? "-",
                wednesday_schedule_id: scheduleMap[orgSch.wednesday_schedule_id]?.trim() ?? "-",
                thursday_schedule_id: scheduleMap[orgSch.thursday_schedule_id]?.trim() ?? "-",
                friday_schedule_id: scheduleMap[orgSch.friday_schedule_id]?.trim() ?? "-",
                saturday_schedule_id: scheduleMap[orgSch.saturday_schedule_id]?.trim() ?? "-",
                sunday_schedule_id: scheduleMap[orgSch.sunday_schedule_id]?.trim() ?? "-",
                // monday_schedule_color: scheduleColorMap[orgSch.monday_schedule_id] ?? "#000",
                // tuesday_schedule_color: scheduleColorMap[orgSch.tuesday_schedule_id] ?? "#000",
                // wednesday_schedule_color: scheduleColorMap[orgSch.wednesday_schedule_id] ?? "#000",
                // thursday_schedule_color: scheduleColorMap[orgSch.thursday_schedule_id] ?? "#000",
                // friday_schedule_color: scheduleColorMap[orgSch.friday_schedule_id] ?? "#000",
                // saturday_schedule_color: scheduleColorMap[orgSch.saturday_schedule_id] ?? "#000",
                // sunday_schedule_color: scheduleColorMap[orgSch.sunday_schedule_id] ?? "#000",
            }));
        }, [employeeScheduleData, scheduleMap, scheduleColorMap]);

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

        const handleFilterChange = useCallback(() => {
        setCurrentPage(1);
        if (refetch) {
            setTimeout(() => refetch(), 100);
        }
        }, [refetch]);

        const handleFromDateChange = (date: Date | undefined) => {
            setFromDate(date);
            handleFilterChange();
        };

        const handleToDateChange = (date: Date | undefined) => {
            setToDate(date);
            handleFilterChange();
        };


    const props = {
        Data: data,
        Columns: columns,
        open,
        on_open_change: setOpen,
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
        total: employeeScheduleData?.total || 0,
        hasNext: employeeScheduleData?.hasNext,
        rowsPerPage,
        setRowsPerPage: handleRowsPerPageChange,
        filter_open,
        filter_on_open_change,
    };

    const handleSave = () => {
        queryClient.invalidateQueries({ queryKey: ["employeeSchedule"] });
    };

    const handleEditClick = useCallback(
        (row: any) => {
        setSelectedRowData(row);
        router.push("/scheduling/weekly-schedule/employee-schedule/add");
        },
        [router, setSelectedRowData]
    );

    const handleRowSelection = useCallback((rows: any[]) => {
        setSelectedRows(rows);
    }, []);

    const renderPowerTable = () => {
        if (isChecking) {
        return (
            <div className="flex justify-center items-center p-8">
            <div style={{ width: 50}}>
                <Lottie animationData={loadingAnimation} loop={true} />
            </div>
            </div>
        );
        }

        if (!isAuthenticated || !employeeId) {
        return (
            <div className="p-8">
            <div className="bg-backdrop rounded-md p-3">
                <div className="text-center">
                <p>Unable to load employee data. Please try logging in again.</p>
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
                entityName="employeeSchedule"
                isAddNewPagePath="/scheduling/weekly-schedule/employee-schedule/add"
            />
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
                        <PopoverTrigger asChild>
                        <Button size={"lg"} variant={"outline"}
                            className="w-full bg-accent px-4 flex justify-between border-grey"
                        >
                            <p>
                            <Label className="font-normal text-secondary">
                                {t.from_date || "From Date"} :
                            </Label>
                            <span className="px-1 text-sm text-text-primary"> 
                                {fromDate ? format(fromDate, "dd/MM/yy") : (t.placeholder_date || "Choose date")}
                            </span>
                            </p>
                            <CalendarIcon />
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={fromDate}
                            onSelect={(date) => {
                                handleFromDateChange(date);
                                closePopover('fromDate');
                            }}
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
                        <PopoverTrigger asChild>
                        <Button size={"lg"} variant={"outline"}
                            className="w-full bg-accent px-4 flex justify-between border-grey"
                        >
                            <p>
                            <Label className="font-normal text-secondary">
                                {t.to_date || "To Date"} : 
                            </Label>
                            <span className="px-1 text-sm text-text-primary"> 
                                {toDate ? format(toDate, "dd/MM/yy") : (t.placeholder_date || "Choose date")}
                            </span>
                            </p>
                            <CalendarIcon />
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={toDate} onSelect={(date) => {
                            handleToDateChange(date);
                            closePopover('toDate');
                            }} 
                        />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="bg-accent rounded-2xl">
                <div className="col-span-2 p-6 pb-6">
                    <h1 className="font-bold text-xl text-primary">
                        Employee Schedule
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