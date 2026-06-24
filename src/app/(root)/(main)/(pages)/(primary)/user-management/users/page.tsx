"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import AddUser from "@/src/components/custom/modules/user-management/AddUser";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { editSecUserRequest, adminResetPasswordRequest, licenseToggleRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import CustomButton from "@/src/components/ui/CustomButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { ChevronDown } from "lucide-react";
import PasswordResetSuccessModal from "@/src/components/custom/modules/user-management/Passwordresetsuccessmodal";
import ActivateLicenseModal from "@/src/components/custom/modules/user-management/ActivateLicenseModal";

type Column = {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  cellRenderer?: (row: any) => React.ReactNode;
};

function LicenseToggle({
  value,
  rowId,
  licenseStatus,
  licenseId,
  status,
  onActivate,
  onToggleSuccess,
}: {
  value: string | null;
  rowId: number | null;
  licenseStatus: string | null;
  licenseId: number | null;
  status: string | null;
  onActivate: () => void;
  onToggleSuccess: (rowId: number | null, newVal: boolean) => void;
}) {
  const active = String(value) === "1" || String(value).toLowerCase() === "enabled";
  const [saving, setSaving] = useState(false);

  // 1. license_status (from secuser payload) === INACTIVE -> Activate button.
  // Clicking it ONLY opens the activate modal; no toggle call happens here.
  if (String(licenseStatus).toUpperCase() === "INACTIVE") {
    return (
      <button
        onClick={onActivate}
        className="inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-regular border bg-success/10 text-success border-success/30 cursor-pointer hover:opacity-75 select-none"
      >
        Activate
      </button>
    );
  }

  // 2. status (from license table) === EXPIRED -> static red chip, not clickable.
  if (String(status).toUpperCase() === "EXPIRED") {
    return (
      <span className="inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-regular border bg-destructive/10 text-destructive border-destructive/30 select-none">
        Expired
      </span>
    );
  }

  // 3. license_status === ACTIVE -> Enabled/Disabled toggle (same as original behavior).
  const handleToggle = async () => {
    if (!licenseId || rowId == null) return;
    setSaving(true);
    const newVal = !active;
    onToggleSuccess(rowId, newVal);
    try {
      await licenseToggleRequest(licenseId, newVal);
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
  const [activeTab, setActiveTab] = useState<"ad-user" | "local-users">("ad-user");
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

  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [activateUserId, setActivateUserId] = useState<number | null>(null);

  const handleLicenseToggle = useCallback((rowId: number | null, newVal: boolean) => {
    if (rowId == null) return;
    setLicenseOverrides(prev => ({ ...prev, [rowId]: newVal }));
  }, []);

  const [selectedLicense, setSelectedLicense] = useState<string>("all");
  const [selectedAppType, setSelectedAppType] = useState<string>("all");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [empNoFilter, setEmpNoFilter] = useState<string>("");
  const [popoverStates, setPopoverStates] = useState({ empNo: false, organization: false });

  const closePopover = useCallback((key: "empNo" | "organization") => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const debouncedSearchValue = useDebounce(searchValue, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const t = translations?.modules?.userManagement || {};

  const orgSearchParams = useMemo(() => ({ limit: "1000" }), []);

  const { data: organizationData } = useFetchAllEntity("organization", {
    searchParams: orgSearchParams,
  });

  const organizationsData = useMemo(() => {
    return (organizationData?.data || []).filter(
      (item: any) => item.organization_type_id !== 1 && item.organization_type_id !== 2
    );
  }, [organizationData]);

  const licenseToStatus = useMemo<Record<string, string | undefined>>(() => ({
    Activate: "INACTIVE",
    Enabled: "ENABLE",
    Disabled: "DISABLE",
    Expired: "EXPIRED",
  }), []);
  const licenseStatusFilter = useMemo(() => {
    const status = licenseToStatus[selectedLicense];
    return status ? { status } : undefined;
  }, [selectedLicense]);

  const showLicenseColumn = activeTab === "ad-user" ? true : selectedOrganization === "27";

  const licenseSearchParams = useMemo(() => ({
    ...(licenseStatusFilter || {}),
    limit: "10000",
  }), [licenseStatusFilter]);

  const { data: licenseData } = useFetchAllEntity(activeTab === "ad-user" ? "ad-license" : "license", {
    searchParams: licenseSearchParams,
    enabled: showLicenseColumn,
  });

  const licenseMap = useMemo(() => {
    if (!licenseData?.data || !Array.isArray(licenseData.data)) return {};
    return (licenseData.data as any[]).reduce((acc: Record<number, any>, lic: any) => {
      if (lic.user_id != null) {
        acc[lic.user_id] = lic;
      }
      return acc;
    }, {});
  }, [licenseData]);

  const validLicenseUserIds = useMemo(() => {
    if (!licenseStatusFilter || !licenseData?.data || !Array.isArray(licenseData.data)) return null;
    const ids = new Set<number>();
    licenseData.data.forEach((lic: any) => {
      if (lic.user_id != null) ids.add(lic.user_id);
    });
    return ids.size ? ids : null;
  }, [licenseData, licenseStatusFilter]);

  const isLicenseFilterActive = !!licenseStatusFilter;

  const userSearchParams = useMemo(() => ({
    limit: isLicenseFilterActive ? "10000" : String(rowsPerPage),
    offset: String(currentPage),
    adUser: activeTab === "ad-user" ? "true" : "false",
    ...(debouncedSearchValue && { search: debouncedSearchValue }),
    ...(selectedAppType && selectedAppType !== "all" && { app_type: selectedAppType }),
    ...(selectedOrganization && { organization_id: selectedOrganization }),
    ...(empNoFilter && { emp_no: empNoFilter }),
  }), [isLicenseFilterActive, rowsPerPage, debouncedSearchValue, selectedAppType, selectedOrganization, empNoFilter, currentPage, activeTab]);

  const { data: userData, isLoading } = useFetchAllEntity("secuser", {
    endpoint: "/secuser/list",
    searchParams: userSearchParams,
  });

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleLicenseFilterChange = useCallback((value: string) => {
    setSelectedLicense(value);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleAppTypeFilterChange = useCallback((value: string) => {
    setSelectedAppType(value);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleOrganizationChange = useCallback((value: string) => {
    setSelectedOrganization(value);
    setSelectedLicense("all");
    closePopover("organization");
    handleFilterChange();
  }, [handleFilterChange, closePopover]);

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

  const handleLicenseActivationSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["license"] });
    queryClient.invalidateQueries({ queryKey: ["/secuser/list"] });
  }, [queryClient]);

  // Just opens the modal with the user_id — the modal resolves the license
  // record itself, so this no longer depends on the (possibly paginated)
  // licenseData list being complete. Accepts number | null since row.user_id
  // may be null, and guards before using it.
  const handleActivateClick = useCallback((userId: number | null) => {
    if (userId == null) {
      showToast("error", "No user ID found for this row");
      return;
    }
    setActivateUserId(userId);
    setActivateModalOpen(true);
  }, [showToast]);

  const columns: Column[] = useMemo(
    () => {
      const cols: Column[] = [
        { field: "emp_no", headerName: t.col_number || "Number", width: 90, flex: 0 },
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
          width: 160,
          flex: 0,
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
      ];

      if (showLicenseColumn) {
        cols.push({
          field: "user_license",
          headerName: t.col_license || "License",
          width: 130,
          flex: 0,
          cellRenderer: (row: any) => {
            const licInfo = licenseMap[row.user_id];
            if (activeTab === "ad-user") {
              return (
                <LicenseToggle
                  value={licInfo?.is_used ? "Enabled" : "Disabled"}
                  rowId={row.user_id}
                  licenseStatus={licInfo?.status}
                  licenseId={licInfo?.id ?? null}
                  status={licInfo?.status ?? null}
                  onActivate={() => handleActivateClick(row.user_id)}
                  onToggleSuccess={handleLicenseToggle}
                />
              );
            }
            return (
              <LicenseToggle
                value={row.user_license}
                rowId={row.user_id}
                licenseStatus={row.license_status}
                licenseId={licInfo?.id ?? null}
                status={licInfo?.status ?? null}
                onActivate={() => handleActivateClick(row.user_id)}
                onToggleSuccess={handleLicenseToggle}
              />
            );
          },
        });
      }

      return cols;
    },
    [language, t, handleResetSuccess, handleLicenseToggle, licenseMap, showLicenseColumn, handleActivateClick, activeTab]
  );

  const data = useMemo(() => {
    if (!Array.isArray(userData?.data)) return [];
    let items = userData.data.map((emp: any) => {
      const override = emp.user_id != null ? licenseOverrides[emp.user_id] : undefined;
      return {
        ...emp,
        id: emp.employee_id,
        user_license: override !== undefined ? (override ? "Enabled" : "Disabled") : emp.user_license,
      };
    });
    if (validLicenseUserIds) {
      items = items.filter((emp: any) => emp.user_id != null && validLicenseUserIds.has(emp.user_id));
    }
    return items;
  }, [userData, licenseOverrides, validLicenseUserIds]);

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
    },
    []
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      setCurrentPage(1);
    },
    []
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
      total: validLicenseUserIds ? (licenseData?.total ?? userData?.total ?? 0) : userData?.total || 0,
      hasNext: validLicenseUserIds ? (licenseData?.hasNext ?? userData?.hasNext) : userData?.hasNext,
      rowsPerPage,
      setRowsPerPage: handleRowsPerPageChange,
    }),
    [
      data, columns, open, selectedRows, isLoading, sortField, currentPage,
      sortDirection, searchValue, userData, rowsPerPage,
      handlePageChange, handleRowsPerPageChange, handleSearchChange,
      handleOpenChange, licenseOverrides, validLicenseUserIds, licenseData,
    ]
  );

  const tabs = [
    { key: "ad-user" as const, label: t.ad_users || "AD Users" },
    { key: "local-users" as const, label: t.local_users || "Local Users" },
  ];

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

      <div className="bg-accent rounded-2xl">
        <div className="flex items-center justify-between p-6 pb-6">
          <h1 className="font-medium text-xl text-primary">
            {t.user_management || "User Management"}
          </h1>

          {/* Organization filter */}
          <div className="w-[320px]">
            <Popover
              open={popoverStates.organization}
              onOpenChange={(open) =>
                setPopoverStates((prev) => ({ ...prev, organization: open }))
              }
            >
              <PopoverTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className={`w-full bg-accent px-4 flex justify-between border-grey ${language === "ar" ? "flex-row-reverse" : ""}`}
                >
                  <p className={`truncate w-full ${language === "ar" ? "text-right" : "text-left"}`}>
                    <Label className="font-normal text-secondary">
                      {t.filter_organization || "Organization"} :
                    </Label>
                    <span className="px-1 text-sm text-text-primary">
                      {selectedOrganization
                        ? organizationsData.find(
                          (item: any) => String(item.organization_id) === selectedOrganization
                        )?.display_name
                        : (t.choose_organization || "Choose organization")}
                    </span>
                  </p>
                  <ChevronDown className="ml-2 h-4 w-4 text-text-primary shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                <Command>
                  <CommandInput placeholder={`${translations?.search || "Search"} ${t.filter_organization || "Organization"}...`} />
                  <CommandGroup className="max-h-64 overflow-auto">
                    {organizationsData.map((item: any) => (
                      <CommandItem
                        key={item.organization_id}
                        onSelect={() => handleOrganizationChange(String(item.organization_id))}
                      >
                        {item.display_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
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

      {/* ─── Filters ──────────────────────────────────────────────────────── */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:max-w-[1050px] px-6 pt-6"> */}

        {/* App Type filter — commented out */}
        {/* <div>
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
        </div> */}

        {/* License filter — commented out for now */}
        {/* {showLicenseColumn && (
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
                <SelectItem value="Activate">{t.activate || "Activate"}</SelectItem>
                <SelectItem value="Enabled">{t.enabled || "Enabled"}</SelectItem>
                <SelectItem value="Disabled">{t.disabled || "Disabled"}</SelectItem>
                <SelectItem value="Expired">{t.expired || "Expired"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )} */}

      {/* </div> */}

      <div className="px-3 pb-6 pt-4">
        <PowerTable
          props={props}
          onEditClick={handleEditClick}
          onRowSelection={handleRowSelection}
          isLoading={isLoading}
        />
      </div>
      </div>

      <PasswordResetSuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        login={successModalLogin}
        newPassword={successModalPassword}
        size="medium"
      />

      <ActivateLicenseModal
        open={activateModalOpen}
        onOpenChange={setActivateModalOpen}
        userId={activateUserId}
        onSuccess={handleLicenseActivationSuccess}
        isAdLicense={activeTab === "ad-user"}
      />
    </div>
  );
}