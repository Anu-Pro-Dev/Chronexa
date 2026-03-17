"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddOrganization from "@/src/components/custom/modules/organization/AddOrganization";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { editSecUserRequest, sparkForgotPasswordRequest } from "@/src/lib/apiHandler";
import CustomButton from "@/src/components/ui/CustomButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import PasswordResetSuccessModal from "@/src/components/custom/modules/user-management/Passwordresetsuccessmodal";

type Column = {
  field: string;
  headerName: string;
  cellRenderer?: (row: any) => React.ReactNode;
};

// ─── License Badge Toggle ──────────────────────────────────────────────────────
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
        text-xs font-medium transition-all duration-150 select-none border
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

// ─── Password Cell ─────────────────────────────────────────────────────────────
function PasswordCell({
  login,
  userId,
  password,
  onResetSuccess,
}: {
  login: string | null;
  userId: number | null;
  password: string | null;
  onResetSuccess: (email: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!login) return;
    setLoading(true);
    try {
      const res = await sparkForgotPasswordRequest(login);
      const displayEmail = res?.email ?? res?.newPassword ?? res?.message ?? login;
      onResetSuccess(displayEmail);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  };

  if (!userId || password === null) {
    return <span className="text-xs italic text-text-secondary">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs tracking-widest text-text-secondary">
        ••••••••
      </span>
      <CustomButton
        variant="primaryoutline"
        borderRadius="md"
        height="24px"
        className="px-2 text-[11px] min-w-0"
        onClick={handleUpdate}
        disabled={loading}
        btnText="Update"
        // btnText={
        //   loading ? (
        //     <span className="flex items-center gap-1">
        //       <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
        //         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        //         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        //       </svg>
        //       Sending...
        //     </span>
        //   ) : (
        //     "Update"
        //   )
        // }
      />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
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

  // ✅ Correct state for PasswordResetSuccessModal
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalEmail, setSuccessModalEmail] = useState("");

  const handleLicenseToggle = useCallback((rowId: number, newVal: boolean) => {
    setLicenseOverrides(prev => ({ ...prev, [rowId]: newVal }));
  }, []);

  const [selectedLicense, setSelectedLicense] = useState<string>("all");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState<string>("");
  const [empNoFilter, setEmpNoFilter] = useState<string>("");
  const [popoverStates, setPopoverStates] = useState({ employeeType: false, empNo: false });

  const closePopover = useCallback((key: "employeeType" | "empNo") => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const t = translations?.modules?.organization || {};

  const offset = useMemo(() => currentPage, [currentPage]);

  const { data: employeeTypeData } = useFetchAllEntity("employeeType", { removeAll: true });

  const employeeTypes = useMemo(() =>
    (employeeTypeData?.data || []).filter((item: any) => item.employee_type_id),
    [employeeTypeData]);

  const { data: sparkData, isLoading, refetch } = useFetchAllEntity("secuser/spark", {
    searchParams: {
      limit: String(rowsPerPage),
      offset: String(offset),
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
      ...(selectedLicense && selectedLicense !== "all" && { user_license: selectedLicense }),
      ...(selectedEmployeeType && { employee_type_id: selectedEmployeeType }),
      ...(empNoFilter && { emp_no: empNoFilter }),
    },
    removeAll: true,
  });

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
    if (refetch) setTimeout(() => refetch(), 100);
  }, [refetch]);

  const handleLicenseFilterChange = useCallback((value: string) => {
    setSelectedLicense(value);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleEmployeeTypeChange = useCallback((value: string) => {
    setSelectedEmployeeType(value);
    closePopover("employeeType");
    handleFilterChange();
  }, [handleFilterChange, closePopover]);

  const handleEmpNoChange = useCallback((value: string) => {
    setEmpNoFilter(value);
    closePopover("empNo");
    handleFilterChange();
  }, [handleFilterChange, closePopover]);

  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["secuser/spark"] });
  }, [queryClient]);

  // ✅ Sets both email and opens the modal
  const handleResetSuccess = useCallback((email: string) => {
    setSuccessModalEmail(email);
    setSuccessModalOpen(true);
  }, []);

  const columns: Column[] = useMemo(
    () => [
      {
        field: "emp_no",
        headerName: "Number",
      },
      {
        field: language === "ar" ? "firstname_arb" : "name",
        headerName: "Name",
        cellRenderer: (row: any) => (
          <span>{(language === "ar" ? row.firstname_arb : row.name) || "—"}</span>
        ),
      },
      {
        field: "email",
        headerName: "Email",
        cellRenderer: (row: any) => (
          <span className="lowercase">
            {row.email || <span className="text-text-secondary">—</span>}
          </span>
        ),
      },
      {
        field: "login",
        headerName: "Username",
        cellRenderer: (row: any) =>
          row.login ? (
            <span className="">{row.login}</span>
          ) : (
            <span className="italic text-text-secondary text-xs">No username</span>
          ),
      },
      {
        field: "password",
        headerName: "Password",
        cellRenderer: (row: any) => (
          <PasswordCell
            login={row.login}
            userId={row.user_id}
            password={row.password}
            onResetSuccess={handleResetSuccess}
          />
        ),
      },
      {
        field: "user_license",
        headerName: "License",
        cellRenderer: (row: any) => (
          <LicenseToggle
            value={row.user_license}
            rowId={row.user_id}
            onToggleSuccess={handleLicenseToggle}
          />
        ),
      },
    ],
    [language, handleResetSuccess, handleLicenseToggle]
  );

  const data = useMemo(() => {
    if (!Array.isArray(sparkData?.data)) return [];
    return sparkData.data.map((emp: any) => {
      const override = emp.user_id != null ? licenseOverrides[emp.user_id] : undefined;
      return {
        ...emp,
        id: emp.employee_id,
        user_license: override !== undefined ? (override ? "Enabled" : "Disabled") : emp.user_license,
      };
    });
  }, [sparkData, licenseOverrides]);

  useEffect(() => {
    if (!open) setSelectedRowData(null);
  }, [open]);

  const handleEditClick = useCallback((row: any) => {
    setSelectedRowData(row);
    setOpen(true);
  }, []);

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
      <AddOrganization
        on_open_change={setOpen}
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
      on_open_change: setOpen,
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
      total: sparkData?.total || 0,
      hasNext: sparkData?.hasNext,
      rowsPerPage,
      setRowsPerPage: handleRowsPerPageChange,
    }),
    [
      data, columns, open, selectedRows, isLoading, sortField, currentPage,
      sortDirection, searchValue, sparkData, rowsPerPage,
      handlePageChange, handleRowsPerPageChange, handleSearchChange,
      licenseOverrides,
    ]
  );

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        selectedRows={selectedRows}
        items={modules?.organization.items}
        entityName="secuser/spark"
        modal_title={t.organization}
        modal_component={modalComponent}
        size="large"
      />

      {/* ─── Filters ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:max-w-[1050px]">

        {/* License filter */}
        <div>
          <Select onValueChange={handleLicenseFilterChange} value={selectedLicense}>
            <SelectTrigger className="bg-accent border-grey">
              <Label className="font-normal text-secondary">License :</Label>
              <SelectValue placeholder="Choose license" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Enabled">Enabled</SelectItem>
              <SelectItem value="Disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Emp No filter */}
        <div>
          <Popover
            open={popoverStates.empNo}
            onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, empNo: open }))}
          >
            <PopoverTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">Emp No :</Label>
                  <span className="px-1 text-sm text-text-primary">
                    {empNoFilter || "Choose emp no"}
                  </span>
                </p>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
              <Command>
                <CommandInput placeholder="Search emp no..." />
                <CommandEmpty>No employee found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {Array.isArray(sparkData?.data) &&
                    sparkData.data
                      .filter((emp: any) => emp.emp_no)
                      .map((emp: any) => (
                        <CommandItem
                          key={emp.employee_id}
                          value={String(emp.emp_no)}
                          onSelect={() => handleEmpNoChange(String(emp.emp_no))}
                        >
                          {emp.emp_no} — {emp.name || ""}
                        </CommandItem>
                      ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Employee type filter */}
        <div>
          <Popover
            open={popoverStates.employeeType}
            onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, employeeType: open }))}
          >
            <PopoverTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="w-full bg-accent px-4 flex justify-between border-grey"
              >
                <p>
                  <Label className="font-normal text-secondary">Employee Type :</Label>
                  <span className="px-1 text-sm text-text-primary">
                    {selectedEmployeeType
                      ? employeeTypes.find((item: any) =>
                          String(item.employee_type_id) === selectedEmployeeType
                        )?.[language === "ar" ? "employee_type_arb" : "employee_type_eng"]
                      : "Choose type"}
                  </span>
                </p>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
              <Command>
                <CommandInput placeholder="Search employee type..." />
                <CommandEmpty>No type found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {employeeTypes.map((item: any) => (
                    <CommandItem
                      key={item.employee_type_id}
                      onSelect={() => handleEmployeeTypeChange(String(item.employee_type_id))}
                    >
                      {language === "ar" ? item.employee_type_arb : item.employee_type_eng}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <PowerTable
        props={props}
        onEditClick={handleEditClick}
        onRowSelection={handleRowSelection}
        isLoading={isLoading}
      />

      {/* ✅ Password Reset Success Modal — wired correctly */}
      <PasswordResetSuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        email={successModalEmail}
        autoCloseDelay={3000}
      />
    </div>
  );
}