"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddUser from "@/src/components/custom/modules/user-management/AddUser";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { editSecUserRequest, adminResetPasswordRequest } from "@/src/lib/apiHandler";
import CustomButton from "@/src/components/ui/CustomButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { ChevronDown } from "lucide-react";
import PasswordResetSuccessModal from "@/src/components/custom/modules/user-management/Passwordresetsuccessmodal";

type Column = {
  field: string;
  headerName: string;
  cellRenderer?: (row: any) => React.ReactNode;
};

function LicenseToggle({
  value,
  rowId,
  onToggleSuccess,
}: {
  value: string | null;
  rowId: number | null;
  onToggleSuccess: (rowId: number, newVal: boolean) => void;
}) {
  const active = String(value) === "1" || String(value).toLowerCase() === "enabled";
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    if (!rowId) return;
    setSaving(true);
    const newVal = !active;
    onToggleSuccess(rowId, newVal);
    try {
      await editSecUserRequest({ user_id: rowId, access_mobile_app: newVal });
    } catch {
      onToggleSuccess(rowId, active);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={saving}
      title={active ? "Click to disable" : "Click to enable"}
      className={`
        inline-flex items-center justify-center rounded-full px-3 py-0.5
        text-xs font-regular transition-all duration-150 select-none border
        ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-75"}
        ${active
          ? "bg-success/10 text-success border-success/30"
          : "bg-destructive/10 text-destructive border-destructive/30"
        }
      `}
    >
      {saving ? "..." : active ? "Enabled" : "Disabled"}
    </button>
  );
}

function PasswordCell({
  login,
  userId,
  password,
  onResetSuccess,
  onListRefresh,
}: {
  login: string | null;
  userId: number | null;
  password: string | null;
  onResetSuccess: (login: string, newPassword: string) => void;
  onListRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUpdate = async () => {
    if (!login) return;
    setLoading(true);
    try {
      const res = await adminResetPasswordRequest(login);
      // refresh list so new password shows immediately
      onListRefresh();
      onResetSuccess(res?.login ?? login, res?.newPassword ?? "");
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (!userId || password === null) {
    return <span className="text-xs italic text-text-secondary">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="font-mono text-xs text-text-primary cursor-copy select-all"
        title={copied ? "Copied!" : "Click to copy"}
        onClick={handleCopy}
      >
        {copied ? (
          <span className="text-success text-[11px] font-sans">Copied!</span>
        ) : (
          password
        )}
      </span>
      <CustomButton
        variant="primaryoutline"
        borderRadius="md"
        height="24px"
        className="px-2 text-[11px] min-w-0"
        onClick={handleUpdate}
        disabled={loading}
        btnText={loading ? "Sending..." : "Update"}
      />
    </div>
  );
}

export default function Page() {
  const { modules, language, translations } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [licenseOverrides, setLicenseOverrides] = useState<Record<number, boolean>>({});

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalLogin, setSuccessModalLogin] = useState("");
  const [successModalPassword, setSuccessModalPassword] = useState("");

  const handleLicenseToggle = useCallback((rowId: number, newVal: boolean) => {
    setLicenseOverrides(prev => ({ ...prev, [rowId]: newVal }));
  }, []);

  const [selectedLicense, setSelectedLicense] = useState<string>("all");
  const [selectedAppType, setSelectedAppType] = useState<string>("all");
  const [empNoFilter, setEmpNoFilter] = useState<string>("");
  const [popoverStates, setPopoverStates] = useState({ empNo: false });

  const closePopover = useCallback((key: "empNo") => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);

  const t = translations?.modules?.userManagement || {};

  const offset = useMemo(() => currentPage, [currentPage]);

  const { data: userData, isLoading, refetch } = useFetchAllEntity("secuser", {
    endpoint: "/secuser/list",
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
      ...(selectedLicense && selectedLicense !== "all" && { user_license: selectedLicense }),
      ...(selectedAppType && selectedAppType !== "all" && { app_type: selectedAppType }),
      ...(empNoFilter && { emp_no: empNoFilter }),
    },
  });

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
    if (refetch) setTimeout(() => refetch(), 100);
  }, [refetch]);

  const handleLicenseFilterChange = useCallback((value: string) => {
    setSelectedLicense(value);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleAppTypeFilterChange = useCallback((value: string) => {
    setSelectedAppType(value);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleEmpNoChange = useCallback((value: string) => {
    setEmpNoFilter(value);
    closePopover("empNo");
    handleFilterChange();
  }, [handleFilterChange, closePopover]);

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/secuser/list"] });
  }, [queryClient]);

  const handleResetSuccess = useCallback((login: string, newPassword: string) => {
    setSuccessModalLogin(login);
    setSuccessModalPassword(newPassword);
    setSuccessModalOpen(true);
  }, []);

  const handleListRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/secuser/list"] });
  }, [queryClient]);

  const columns: Column[] = useMemo(
    () => [
      { field: "emp_no", headerName: t.col_number || "Number" },
      {
        field: language === "ar" ? "firstname_arb" : "name",
        headerName: t.col_name || "Name",
        cellRenderer: (row: any) => (
          <span>{(language === "ar" ? row.firstname_arb : row.name) || "—"}</span>
        ),
      },
      {
        field: "email",
        headerName: t.col_email || "Email",
        cellRenderer: (row: any) => (
          <span className="lowercase">
            {row.email || <span className="text-text-secondary">—</span>}
          </span>
        ),
      },
      {
        field: "login",
        headerName: t.col_username || "Username",
        cellRenderer: (row: any) =>
          row.login ? (
            <span>{row.login}</span>
          ) : (
            <span className="italic text-text-secondary text-xs">No username</span>
          ),
      },
      {
        field: "password",
        headerName: t.col_password || "Password",
        cellRenderer: (row: any) => (
          <PasswordCell
            login={row.login}
            userId={row.user_id}
            password={row.password}
            onResetSuccess={handleResetSuccess}
            onListRefresh={handleListRefresh}
          />
        ),
      },
      {
        field: "user_license",
        headerName: t.col_license || "License",
        cellRenderer: (row: any) => (
          <LicenseToggle
            value={row.user_license}
            rowId={row.user_id}
            onToggleSuccess={handleLicenseToggle}
          />
        ),
      },
    ],
    [language, t, handleResetSuccess, handleLicenseToggle]
  );

  const data = useMemo(() => {
    if (!Array.isArray(userData?.data)) return [];
    return userData.data.map((emp: any) => {
      const override = emp.user_id != null ? licenseOverrides[emp.user_id] : undefined;
      return {
        ...emp,
        id: emp.employee_id,
        user_license: override !== undefined ? (override ? "Enabled" : "Disabled") : emp.user_license,
      };
    });
  }, [userData, licenseOverrides]);

  // When the modal opens via the Add button (open=true, no row selected),
  // ensure selectedRowData is null so AddUser starts with a blank form.
  // When it closes, also clear it.
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setSelectedRowData(null);
    setOpen(isOpen);
  }, []);

  const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    handleOpenChange(true);
  }, [handleOpenChange]);

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      if (refetch) setTimeout(() => refetch(), 100);
    },
    [refetch]
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      setCurrentPage(1);
      if (refetch) setTimeout(() => refetch(), 100);
    },
    [refetch]
  );

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

  const modalComponent = useMemo(
    () => (
      <AddUser
        on_open_change={handleOpenChange}
        selectedRowData={selectedRowData}
        onSave={handleSave}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedRowData, handleSave, open]
  );

  const props = useMemo(
    () => ({
      Data: data,
      Columns: columns,
      open,
      on_open_change: handleOpenChange,
      filter_open: false,
      filter_on_open_change: () => { },
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
      total: userData?.total || 0,
      hasNext: userData?.hasNext,
      rowsPerPage,
      setRowsPerPage: handleRowsPerPageChange,
    }),
    [
      data, columns, open, selectedRows, isLoading, sortField, currentPage,
      sortDirection, searchValue, userData, rowsPerPage,
      handlePageChange, handleRowsPerPageChange, handleSearchChange,
      handleOpenChange, licenseOverrides,
    ]
  );

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.userManagement?.items}
        entityName="secuser"
        modal_title={selectedRowData ? (t.edit_user || "Edit User") : (t.create_user || "Create User")}
        modal_component={modalComponent}
        size="medium"
      />

      {/* ─── Filters ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:max-w-[1050px]">

        {/* License filter */}
        <div>
          <Select onValueChange={handleLicenseFilterChange} value={selectedLicense}>
            <SelectTrigger className="bg-accent border-grey">
              <p className={`truncate w-full ${language === "ar" ? "text-right" : "text-left"}`}>
                <Label className="font-normal text-secondary">
                  {t.filter_license || "License"} :
                </Label>
                <span className="px-1 text-sm text-text-primary">
                  <SelectValue placeholder={t.choose_license || "Choose license"} />
                </span>
              </p>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all || "All"}</SelectItem>
              <SelectItem value="Enabled">{t.enabled || "Enabled"}</SelectItem>
              <SelectItem value="Disabled">{t.disabled || "Disabled"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* App Type filter */}
        <div>
          <Select onValueChange={handleAppTypeFilterChange} value={selectedAppType}>
            <SelectTrigger className="bg-accent border-grey">
              <p className={`truncate w-full ${language === "ar" ? "text-right" : "text-left"}`}>
                <Label className="font-normal text-secondary">
                  {t.app_type || "App Type"} :
                </Label>
                <span className="px-1 text-sm text-text-primary">
                  <SelectValue placeholder={t.choose_app_type || "Choose app type"} />
                </span>
              </p>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all || "All"}</SelectItem>
              <SelectItem value="ontime">{t.ontime || "Ontime"}</SelectItem>
              <SelectItem value="fieldtrack">{t.fieldtrack || "Field Track"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      <PowerTable
        props={props}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />

      <PasswordResetSuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        login={successModalLogin}
        newPassword={successModalPassword}
        size="medium"
      />
    </div>
  );
}