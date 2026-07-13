"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
type Column = {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  cellRenderer?: (row: any) => React.ReactNode;
};

export default function Page() {
  const { modules, translations } = useLanguage();
  const [activeTab, setActiveTab] = useState<"local-license" | "ad-license">("local-license");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const debouncedSearchValue = useDebounce(searchValue, 300);

  const t = translations?.modules?.userManagement || {};

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const entityName = activeTab === "ad-license" ? "ad-license" : "license";

  const searchParams = useMemo(() => ({
    limit: String(rowsPerPage),
    offset: String(currentPage),
    ...(debouncedSearchValue && { search: debouncedSearchValue }),
  }), [rowsPerPage, debouncedSearchValue, currentPage]);

  const { data: licenseData, isLoading } = useFetchAllEntity(entityName, {
    searchParams,
  });

  const columns: Column[] = useMemo(() => {
    const cols: Column[] = [
      {
        field: "id",
        headerName: t.col_id || "ID",
        width: 90,
        flex: 0,
      },
      {
        field: "user_id",
        headerName: t.col_user_id || "User ID",
        width: 150,
        flex: 0,
      },
      {
        field: "key_value",
        headerName: t.col_license_key || "License Key",
        flex: 1,
        cellRenderer: (row: any) => (
          <span className="font-mono text-xs tracking-wider">
            {row.key_value || <span className="text-text-secondary">—</span>}
          </span>
        ),
      },
      ...(activeTab === "local-license"
        ? [{
            field: "license_type",
            headerName: t.col_license_type || "License Type",
            width: 140,
            flex: 0,
            cellRenderer: (row: any) => (
              <span>{row.license_type || <span className="text-text-secondary">—</span>}</span>
            ),
          }]
        : []),
      {
        field: "status",
        headerName: t.col_status || "License Status",
        width: 200,
        flex: 0,
        cellRenderer: (row: any) => {
          const status = String(row.status || "").toUpperCase();
          let className = "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-regular border select-none";
          if (status === "ACTIVE") {
            className += " bg-success/10 text-success border-success/30";
          } else if (status === "INACTIVE") {
            className += " bg-muted/30 text-muted border-muted/50";
          } else if (status === "EXPIRED") {
            className += " bg-destructive/10 text-destructive border-destructive/30";
          } else {
            className += " bg-muted/10 text-muted border-muted/30";
          }
          return <span className={className}>{status || "—"}</span>;
        },
      },
      {
        field: activeTab === "ad-license" ? "is_used" : "in_use",
        headerName: t.col_in_use || "In Use",
        width: 150,
        flex: 0,
        cellRenderer: (row: any) => {
          const inUse = activeTab === "ad-license" ? row.is_used : row.in_use;
          return inUse ? (
            <span className="inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-regular border bg-success/10 text-success border-success/30 select-none">
              {t.yes || "Yes"}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-regular border bg-destructive/10 text-destructive border-destructive/30 select-none">
              {t.no || "No"}
            </span>
          );
        },
      },
    ];

    return cols;
  }, [t, activeTab]);

  const data = useMemo(() => {
    if (!Array.isArray(licenseData?.data)) return [];
    return licenseData.data.map((item: any) => ({
      ...item,
      id: item.id,
    }));
  }, [licenseData]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
  }, []);

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

  const props = useMemo(() => ({
    Data: data,
    Columns: columns,
    open,
    on_open_change: handleOpenChange,
    filter_open: false,
    filter_on_open_change: () => {},
    selectedRows,
    setSelectedRows,
    isLoading,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: licenseData?.total || 0,
    hasNext: licenseData?.hasNext,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
  }), [
    data, columns, open, selectedRows, isLoading, sortField, currentPage,
    sortDirection, searchValue, licenseData, rowsPerPage,
    handlePageChange, handleRowsPerPageChange, handleSearchChange, handleOpenChange,
  ]);

  const tabs = [
    { key: "local-license" as const, label: t.local_license || "Local License" },
    { key: "ad-license" as const, label: t.ad_license || "AD License" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.userManagement?.items}
        entityName={entityName}
        size="medium"
      />

      <div className="bg-accent rounded-2xl">
        <div className="flex items-center justify-between p-6 pb-6">
          <h1 className="font-medium text-xl text-primary">
            {t.user_license || "User License"}
          </h1>
        </div>
        <div className="px-6">
          <div className="flex gap-20 items-center border-b pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={
                  activeTab === tab.key
                    ? "text-primary text-base underline underline-offset-[14px] font-medium"
                    : "text-text-secondary font-regular hover:text-primary transition-colors duration-200"
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="px-3 pb-6 pt-4">
          <PowerTable
            props={props}
            onRowSelection={handleRowSelection}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
