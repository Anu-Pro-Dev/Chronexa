"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { debounce } from "lodash";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { Checkbox } from "@/src/components/ui/checkbox";
import { apiRequest, getAllCostCentersMaster } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { PDFExporter } from './PDFExporter';
import { ExcelExporter } from './ExcelExporter';
import { CSVExporter } from './CSVExporter';
import { CalendarIcon } from "@/src/icons/icons";
import { Eye, Download, Trash2Icon } from "lucide-react";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Separator } from "@/src/components/ui/separator";

const formSchema = z.object({
  vertical: z.array(z.string()).optional(),
  company: z.array(z.string()).optional(),
  department: z.array(z.string()).optional(),
  division: z.array(z.string()).optional(),
  cost_center: z.array(z.string()).optional(),
  employee_type: z.array(z.string()).optional(),
  manager_id: z.array(z.string()).optional(),
  employee: z.array(z.string()).optional(),
  from_date: z.date().optional(),
  to_date: z.date().optional(),
});

export default function EmployeeReports() {
  const { language, translations } = useLanguage();
  const t = translations?.modules?.reports || {};
  const showToast = useShowToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vertical: [],
      company: [],
      department: [],
      division: [],
      cost_center: [],
      employee_type: [],
      manager_id: [],
      employee: [],
    },
  });

  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'summary'>('daily');
  const [popoverStates, setPopoverStates] = useState({ fromDate: false, toDate: false, weekDate: false, monthDate: false });
  const [weekDate, setWeekDate] = useState<Date | undefined>(undefined);
  const [monthDate, setMonthDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<'excel' | 'pdf' | 'csv' | null>(null);
  const [verticalSearchTerm, setVerticalSearchTerm] = useState("");
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [divisionSearchTerm, setDivisionSearchTerm] = useState("");
  const [costCenterSearchTerm, setCostCenterSearchTerm] = useState("");
  const [employeeTypeSearchTerm, setEmployeeTypeSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [managerSearchTerm, setManagerSearchTerm] = useState("");
  const [showReportView, setShowReportView] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loadingReportData, setLoadingReportData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showExportButtons, setShowExportButtons] = useState(false);
  const [showViewButton, setShowViewButton] = useState(true);
  const rowsPerPage = 50;

  const { employeeId: authEmployeeId, userRole } = useAuthStore();
  const isEmployee = userRole?.toLowerCase() === "employee";
  const isManager = userRole?.toLowerCase() === "manager";

  useEffect(() => {
    if (isEmployee && authEmployeeId) {
      form.setValue("employee", [authEmployeeId.toString()]);
    }
    if (isManager && authEmployeeId) {
      form.setValue("manager_id", [authEmployeeId.toString()]);
    }
  }, [isEmployee, isManager, authEmployeeId, form]);

  const [progressDetails, setProgressDetails] = useState({
    current: 0,
    total: 0,
    phase: 'initializing' as 'initializing' | 'fetching' | 'processing' | 'generating' | 'complete',
  });

  const closePopover = (key: string) =>
    setPopoverStates(prev => ({ ...prev, [key]: false }));

  const getWeekRange = (date: Date) => {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday, end: sunday };
  };

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  };

  const formatWeekLabel = (date: Date) => {
    const { start, end } = getWeekRange(date);
    return `${format(start, 'dd/MM/yy')} - ${format(end, 'dd/MM/yy')}`;
  };

  const formatMonthLabel = (date: Date) => {
    return format(date, 'MMMM yyyy');
  };

  const selectedVerticals = form.watch("vertical") || [];
  const selectedCompanies = form.watch("company") || [];
  const selectedDepartments = form.watch("department") || [];
  const selectedManagerIds = form.watch("manager_id") || [];
  const selectedEmployeeIds = form.watch("employee") || [];
  const selectedDivisions = form.watch("division") || [];
  const selectedCostCenters = form.watch("cost_center") || [];
  const selectedEmployeeTypes = form.watch("employee_type") || [];

  const { data: organizations } = useFetchAllEntity("organization", {
    searchParams: { limit: "1000" },
  });

  const { data: departmentsByOrg, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departmentsByOrg", selectedCompanies],
    queryFn: async () => {
      if (selectedCompanies.length === 0) return null;
      const allDepartments = await Promise.all(
        selectedCompanies.map(companyId =>
          apiRequest(`/dept-org-mapping/by-organization/${companyId}`, "GET")
        )
      );
      return { data: allDepartments.flatMap(r => r?.data || []) };
    },
    enabled: selectedCompanies.length > 0,
  });

  const getManagerSearchParams = () => {
    const params: any = { manager_flag: "true", limit: "1000", offset: "1" };
    if (selectedCompanies.length > 0) params.organization_ids = selectedCompanies.join(',');
    if (selectedDepartments.length > 0) params.department_ids = selectedDepartments.join(',');
    if (selectedDivisions.length > 0) params.business_unit_ids = selectedDivisions.join(',');
    if (selectedCostCenters.length > 0) params.cost_center_ids = selectedCostCenters.join(',');
    return { searchParams: params };
  };

  const { data: managers } = useFetchAllEntity("employee", getManagerSearchParams());

  const getEmployeeSearchParams = () => {
    const params: any = { limit: "1000", offset: "1" };
    if (selectedVerticals.length > 0) params.parent_orgids = selectedVerticals.join(',');
    if (selectedCompanies.length > 0) params.organization_ids = selectedCompanies.join(',');
    if (selectedDepartments.length > 0) params.department_ids = selectedDepartments.join(',');
    if (selectedManagerIds.length > 0) params.manager_ids = selectedManagerIds.join(',');
    if (selectedDivisions.length > 0) params.business_unit_ids = selectedDivisions.join(',');
    if (selectedCostCenters.length > 0) params.cost_center_ids = selectedCostCenters.join(',');
    if (selectedEmployeeTypes.length > 0) params.employee_type_ids = selectedEmployeeTypes.join(',');
    return { searchParams: params };
  };

  const { data: employees } = useFetchAllEntity("employee", getEmployeeSearchParams());
  const { data: employeeTypes } = useFetchAllEntity("employeeType", { removeAll: true });

  // Cost Center is scoped the same way as the other cascading filters:
  //  - if a company is selected, use those company org IDs directly
  //  - else if only a vertical is selected, resolve the companies under that
  //    vertical (organization-cost-center only filters by a single organization_id,
  //    which maps to a company, not a vertical) and use those
  //  - if neither is selected, fall back to the full unscoped master list
  const costCenterOrgIds = selectedCompanies.length > 0
    ? selectedCompanies
    : (organizations?.data || [])
        .filter((item: any) => selectedVerticals.includes(String(item.parent_id)))
        .map((item: any) => item.organization_id?.toString())
        .filter(Boolean);

  const { data: costCentersMaster } = useQuery({
    queryKey: ["costCentersMaster"],
    queryFn: () => getAllCostCentersMaster(),
    enabled: costCenterOrgIds.length === 0,
  });

  const { data: costCentersByOrg, isLoading: isCostCentersByOrgLoading } = useQuery({
    queryKey: ["costCentersByOrg", costCenterOrgIds],
    queryFn: async () => {
      const results = await Promise.all(
        costCenterOrgIds.map((orgId: string) =>
          apiRequest(`/organization-cost-center/?organization_id=${orgId}`, "GET")
        )
      );
      // Merge + dedupe across organizations by cost_center_id, and normalize
      // field names to match the shape the rest of this component expects
      // (the org-scoped API returns cost_code/cost_center rather than the
      // bilingual cost_center_eng/cost_center_arb/cost_center_code fields the
      // master API uses; it has no separate Arabic name, so we reuse the
      // single name for both).
      const map = new Map<string, any>();
      results.forEach(r => {
        (r?.data || []).forEach((cc: any) => {
          if (cc?.cost_center_id != null) {
            map.set(cc.cost_center_id.toString(), {
              cost_center_id: cc.cost_center_id,
              cost_center_code: cc.cost_code,
              cost_center_eng: cc.cost_center,
              cost_center_arb: cc.cost_center,
              active_flag: cc.active_flag,
            });
          }
        });
      });
      return { data: Array.from(map.values()) };
    },
    enabled: costCenterOrgIds.length > 0,
  });

  const costCenters = costCenterOrgIds.length > 0 ? costCentersByOrg : costCentersMaster;

  // "Division" (business unit) is scoped to the selected department(s).
  // /business-unit/by-department/:id returns the full business-unit records
  // mapped to that department, so the dropdown only lists relevant divisions.
  const { data: divisions } = useQuery({
    queryKey: ["businessUnitsByDepartment", selectedDepartments],
    queryFn: async () => {
      if (selectedDepartments.length === 0) return { data: [] };
      const results = await Promise.all(
        selectedDepartments.map(departmentId =>
          apiRequest(`/business-unit/by-department/${departmentId}`, "GET")
        )
      );
      // Merge + dedupe across departments by business_unit_id.
      const map = new Map<string, any>();
      results.forEach(r => {
        (r?.data || []).forEach((bu: any) => {
          if (bu?.business_unit_id != null) {
            map.set(bu.business_unit_id.toString(), bu);
          }
        });
      });
      return { data: Array.from(map.values()) };
    },
    enabled: selectedDepartments.length > 0,
  });

  const debouncedVerticalSearch = useCallback(debounce((v: string) => setVerticalSearchTerm(v), 300), []);
  const debouncedCompanySearch = useCallback(debounce((v: string) => setCompanySearchTerm(v), 300), []);
  const debouncedDepartmentSearch = useCallback(debounce((v: string) => setDepartmentSearchTerm(v), 300), []);
  const debouncedDivisionSearch = useCallback(debounce((v: string) => setDivisionSearchTerm(v), 300), []);
  const debouncedCostCenterSearch = useCallback(debounce((v: string) => setCostCenterSearchTerm(v), 300), []);
  const debouncedEmployeeTypeSearch = useCallback(debounce((v: string) => setEmployeeTypeSearchTerm(v), 300), []);
  const debouncedEmployeeSearch = useCallback(debounce((v: string) => setEmployeeSearchTerm(v), 300), []);
  const debouncedManagerSearch = useCallback(debounce((v: string) => setManagerSearchTerm(v), 300), []);

  const { data: searchedEmployees, isLoading: isSearchingEmployees } = useQuery({
    queryKey: ["employeeSearch", employeeSearchTerm, selectedVerticals, selectedCompanies, selectedDepartments, selectedDivisions, selectedCostCenters, selectedManagerIds, selectedEmployeeTypes],
    queryFn: async () => {
      let url = `/employee/search?search=${encodeURIComponent(employeeSearchTerm)}`;
      if (selectedVerticals.length > 0) url += `&parent_orgids=${selectedVerticals.join(',')}`;
      if (selectedCompanies.length > 0) url += `&organization_ids=${selectedCompanies.join(',')}`;
      if (selectedDepartments.length > 0) url += `&department_ids=${selectedDepartments.join(',')}`;
      if (selectedManagerIds.length > 0) url += `&manager_ids=${selectedManagerIds.join(',')}`;
      if (selectedDivisions.length > 0) url += `&business_unit_ids=${selectedDivisions.join(',')}`;
      if (selectedCostCenters.length > 0) url += `&cost_center_ids=${selectedCostCenters.join(',')}`;
      if (selectedEmployeeTypes.length > 0) url += `&employee_type_ids=${selectedEmployeeTypes.join(',')}`;
      return apiRequest(url, "GET");
    },
    enabled: employeeSearchTerm.length > 0,
  });

  const { data: searchedManagers, isLoading: isSearchingManagers } = useQuery({
    queryKey: ["managerSearch", managerSearchTerm, selectedCompanies, selectedDepartments, selectedDivisions, selectedCostCenters],
    queryFn: async () => {
      let url = `/employee/search?search=${encodeURIComponent(managerSearchTerm)}&manager_flag=true`;
      if (selectedCompanies.length > 0) url += `&organization_ids=${selectedCompanies.join(',')}`;
      if (selectedDepartments.length > 0) url += `&department_ids=${selectedDepartments.join(',')}`;
      if (selectedDivisions.length > 0) url += `&business_unit_ids=${selectedDivisions.join(',')}`;
      if (selectedCostCenters.length > 0) url += `&cost_center_ids=${selectedCostCenters.join(',')}`;
      return apiRequest(url, "GET");
    },
    enabled: managerSearchTerm.length > 0,
  });

  const getVerticalData = () => {
    if (!organizations?.data) return [];
    const parentMap = new Map();
    organizations.data.forEach((item: any) => {
      if (item.organizations) {
        parentMap.set(item.organizations.organization_id, {
          organization_id: item.organizations.organization_id,
          organization_eng: item.organizations.organization_eng,
          organization_arb: item.organizations.organization_arb,
        });
      }
    });

    const verticals = Array.from(parentMap.values()).filter(
      (item: any) => item.organization_id !== 1
    );

    if (verticalSearchTerm) {
      return verticals.filter((item: any) =>
        item.organization_eng?.toLowerCase().includes(verticalSearchTerm.toLowerCase()) ||
        item.organization_arb?.toLowerCase().includes(verticalSearchTerm.toLowerCase())
      );
    }

    return verticals;
  };

  const getCompanyData = () => {
    if (!organizations?.data || selectedVerticals.length === 0) return [];
    const companies = organizations.data.filter(
      (item: any) => selectedVerticals.includes(String(item.parent_id))
    );
    if (!companySearchTerm) return companies;
    return companies.filter((item: any) =>
      item.display_name?.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
      item.organization_eng?.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
      item.organization_arb?.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  };

  const getDepartmentData = () => {
    if (!departmentsByOrg?.data || selectedCompanies.length === 0) return [];
    const departmentsMap = new Map();
    const mappings = Array.isArray(departmentsByOrg.data) ? departmentsByOrg.data : [departmentsByOrg.data];
    mappings.forEach((mapping: any) => {
      if (mapping.departments && mapping.departments.department_id && mapping.is_active) {
        departmentsMap.set(mapping.departments.department_id, {
          department_id: mapping.departments.department_id,
          department_code: mapping.departments.department_code,
          department_name_eng: mapping.departments.department_name_eng,
          department_name_arb: mapping.departments.department_name_arb,
        });
      }
    });
    const departments = Array.from(departmentsMap.values());
    if (!departmentSearchTerm) return departments;
    return departments.filter((item: any) =>
      item.department_name_eng?.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
      item.department_name_arb?.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
      item.department_code?.toLowerCase().includes(departmentSearchTerm.toLowerCase())
    );
  };

  const getCostCenterData = () => {
    if (!costCenters?.data) return [];
    const centers = costCenters.data.filter((item: any) => item.cost_center_id);
    if (!costCenterSearchTerm) return centers;
    const q = costCenterSearchTerm.toLowerCase();
    return centers.filter((item: any) =>
      item.cost_center_eng?.toLowerCase().includes(q) ||
      item.cost_center_arb?.toLowerCase().includes(q) ||
      item.cost_center_code?.toLowerCase().includes(q)
    );
  };

  const getDivisionData = () => {
    // Division (business unit) cascades from the selected department(s):
    // show nothing until at least one department is chosen.
    if (selectedDepartments.length === 0) return [];
    if (!divisions?.data) return [];
    const units = divisions.data.filter((item: any) => item.business_unit_id);
    if (!divisionSearchTerm) return units;
    const q = divisionSearchTerm.toLowerCase();
    return units.filter((item: any) =>
      item.business_unit_name_eng?.toLowerCase().includes(q) ||
      item.business_unit_name_arb?.toLowerCase().includes(q) ||
      item.business_unit_code?.toLowerCase().includes(q)
    );
  };

  const getEmployeeTypesData = () => {
    if (!employeeTypes?.data) return [];
    const types = employeeTypes.data.filter((item: any) => item.employee_type_id);
    if (!employeeTypeSearchTerm) return types;
    return types.filter((item: any) =>
      item.employee_type_eng?.toLowerCase().includes(employeeTypeSearchTerm.toLowerCase()) ||
      item.employee_type_arb?.toLowerCase().includes(employeeTypeSearchTerm.toLowerCase())
    );
  };

  const getManagerData = () => {
    if (managerSearchTerm.length > 0) {
      return (searchedManagers?.data || []).filter(
        (item: any) => item.employee_id && item.employee_id.toString().trim() !== ''
      );
    }
    return (managers?.data || []).filter(
      (item: any) =>
        item.employee_id &&
        item.employee_id.toString().trim() !== '' &&
        item.manager_flag === true
    );
  };

  const getFilteredEmployees = () => {
    const baseData = employeeSearchTerm.length > 0
      ? searchedEmployees?.data || []
      : employees?.data || [];
    return baseData.filter(
      (item: any) => item.employee_id && item.employee_id.toString().trim() !== ''
    );
  };

  const handleVerticalToggle = (verticalId: string) => {
    form.setValue("vertical", selectedVerticals.includes(verticalId)
      ? selectedVerticals.filter(id => id !== verticalId)
      : [...selectedVerticals, verticalId]);
    form.setValue("company", []);
    form.setValue("department", []);
    form.setValue("division", []);
    form.setValue("cost_center", []);
    form.setValue("manager_id", []);
    form.setValue("employee", []);
  };

  const handleCompanyToggle = (companyId: string) => {
    const newCompanies = selectedCompanies.includes(companyId)
      ? selectedCompanies.filter(id => id !== companyId)
      : [...selectedCompanies, companyId];
    form.setValue("company", newCompanies);
    form.setValue("department", []);
    form.setValue("division", []);
    form.setValue("cost_center", []);
    form.setValue("manager_id", []);
    form.setValue("employee", []);
  };

  const handleDepartmentToggle = (departmentId: string) => {
    const newDepartments = selectedDepartments.includes(departmentId)
      ? selectedDepartments.filter(id => id !== departmentId)
      : [...selectedDepartments, departmentId];
    form.setValue("department", newDepartments);
    form.setValue("division", []);
    form.setValue("manager_id", []);
    form.setValue("employee", []);
  };

  const handleDivisionToggle = (divisionId: string) => {
    const newDivisions = selectedDivisions.includes(divisionId)
      ? selectedDivisions.filter(id => id !== divisionId)
      : [...selectedDivisions, divisionId];
    form.setValue("division", newDivisions);
  };

  const handleCostCenterToggle = (costCenterId: string) => {
    const newCostCenters = selectedCostCenters.includes(costCenterId)
      ? selectedCostCenters.filter(id => id !== costCenterId)
      : [...selectedCostCenters, costCenterId];
    form.setValue("cost_center", newCostCenters);
  };

  const handleManagerToggle = (managerId: string) => {
    const newManagers = selectedManagerIds.includes(managerId)
      ? selectedManagerIds.filter(id => id !== managerId)
      : [...selectedManagerIds, managerId];
    form.setValue("manager_id", newManagers);
    form.setValue("employee", []);
  };

  const handleEmployeeToggle = (employeeId: string) => {
    form.setValue("employee", selectedEmployeeIds.includes(employeeId)
      ? selectedEmployeeIds.filter(id => id !== employeeId)
      : [...selectedEmployeeIds, employeeId]);
  };

  const handleEmployeeTypeToggle = (employeeTypeId: string) => {
    const newTypes = selectedEmployeeTypes.includes(employeeTypeId)
      ? selectedEmployeeTypes.filter(type => type !== employeeTypeId)
      : [...selectedEmployeeTypes, employeeTypeId];
    if (showReportView) { resetButtons(); setShowReportView(false); }
    form.setValue("employee_type", newTypes);
  };

  const headerMap: Record<string, string> = {
    EmployeeNo: "Emp No",
    Name: "Employee Name",
    ParentOrganization: "Parent Organization",
    Organization: "Organization",
    Department: "Division",
    BusinessUnit: "Department",
    EmployeeType: "Employee Type",
    WorkDate: "Work Date",
    WorkDay: "Work Day",
    Shift: "Shift",
    PunchIn: "Punch In",
    GeoLocationIn: "GeoLocation In",
    PunchOut: "Punch Out",
    GeoLocationOut: "GeoLocation Out",
    DailyWorkedHrs: "Daily Worked Hrs",
    DailyMissedHrs: "Daily Missed Hrs",
    DailyExtraWork: "Daily Extra Work",
    IsAbsent: "Day Status",
    MissedPunch: "Missed Punch",
    EmployeeStatus: "Employee Status",
    ManagerName: "Manager Name",
    CostCode: "Cost Code",
    CostCenter: "Cost Center",
    WeekStart: "Week Start",
    WeekEnd: "Week End",
    TotalWorkedHrs: "Total Worked Hrs",
    TotalMissedHrs: "Total Missed Hrs",
    TotalExtraHrs: "Total Extra Hrs",
    TotalAbsents: "Total Absents",
    EmployeeCount: "Employee Count",
    Month: "Month",
    Year: "Year",
  };

  const isSingleEmployee = selectedEmployeeIds.length === 1;

  const getViewHeaders = () => {
    if (reportType === 'weekly') {
      if (isSingleEmployee) {
        return ['WeekStart', 'WeekEnd', 'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs', 'TotalAbsents'];
      }
      return ['EmployeeNo', 'Name', 'WeekStart', 'WeekEnd', 'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs', 'TotalAbsents'];
    }
    if (reportType === 'monthly') {
      if (isSingleEmployee) {
        return ['Month', 'Year', 'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs', 'TotalAbsents'];
      }
      return ['EmployeeNo', 'Name', 'Month', 'Year', 'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs', 'TotalAbsents'];
    }
    if (reportType === 'summary') {
      if (isSingleEmployee) {
        return ['TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs', 'TotalAbsents'];
      }
      return ['EmployeeNo', 'Name', 'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs', 'TotalAbsents'];
    }
    if (isSingleEmployee) {
      return [
        'WorkDate', 'WorkDay', 'Shift', 'PunchIn', 'PunchOut',
        'DailyWorkedHrs', 'DailyMissedHrs', 'DailyExtraWork', 'IsAbsent', 'MissedPunch',
      ];
    }
    return [
      'EmployeeNo', 'Name', 'ParentOrganization', 'Organization',
      'Department', 'BusinessUnit', 'EmployeeType', 'WorkDate', 'WorkDay', 'Shift',
      'PunchIn', 'PunchOut', 'DailyWorkedHrs', 'DailyMissedHrs',
      'DailyExtraWork', 'IsAbsent', 'MissedPunch', 'EmployeeStatus',
    ];
  };

  const viewHeaders = getViewHeaders();

  const formatCellValue = (header: string, value: any): string => {
    if (value === null || value === undefined || value === '') return '-';
    if (header === 'WorkDate' || header === 'WeekStart' || header === 'WeekEnd') {
      try {
        const date = new Date(value);
        return format(date, 'dd-MM-yyyy');
      } catch {
        return value;
      }
    }
    if (header === 'PunchIn' || header === 'PunchOut') return value || '-';
    if (['DailyWorkedHrs', 'DailyMissedHrs', 'DailyExtraWork', 'TotalWorkedHrs', 'TotalMissedHrs', 'TotalExtraHrs'].includes(header)) return value || '-';
    if (header === 'IsAbsent') {
      if (!value || value === '') return 'Present';
      return value;
    }
    if (header === 'MissedPunch') {
      if (!value || value === '') return '-';
      return value;
    }
    return String(value);
  };

  const calculateSummaryTotals = (dataArray: any[]) => {
    const parseTimeToMinutes = (value: any) => {
      if (!value || value === '-') return 0;
      const strValue = String(value).trim();
      if (strValue.includes(':')) {
        const parts = strValue.split(':').map(Number);
        return (parts[0] || 0) * 60 + (parts[1] || 0) + ((parts[2] || 0) / 60);
      }
      return (parseFloat(strValue) || 0) * 60;
    };
    const totals = {
      totalWorkedMinutes: 0,
      totalMissedMinutes: 0,
      totalExtraMinutes: 0,
    };
    dataArray.forEach((row: any) => {
      if (reportType === 'daily') {
        totals.totalWorkedMinutes += parseTimeToMinutes(row.DailyWorkedHrs);
        totals.totalMissedMinutes += parseTimeToMinutes(row.DailyMissedHrs);
        totals.totalExtraMinutes += parseTimeToMinutes(row.DailyExtraWork);
      } else {
        totals.totalWorkedMinutes += parseTimeToMinutes(row.TotalWorkedHrs);
        totals.totalMissedMinutes += parseTimeToMinutes(row.TotalMissedHrs);
        totals.totalExtraMinutes += parseTimeToMinutes(row.TotalExtraHrs);
      }
    });
    const fmt = (mins: number) => {
      const h = Math.floor(Math.abs(mins) / 60);
      const m = Math.round(Math.abs(mins) % 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    return {
      totalWorkedHours: fmt(totals.totalWorkedMinutes),
      totalMissedHours: fmt(totals.totalMissedMinutes),
      totalExtraHours: fmt(totals.totalExtraMinutes),
      totalLateInHours: "00:00",
      totalEarlyOutHours: "00:00",
      totalAbsents: reportType === 'daily'
        ? dataArray.filter(row => row.IsAbsent === 'Absent').length.toString()
        : dataArray.reduce((sum, row) => sum + (parseInt(row.TotalAbsents) || 0), 0).toString(),
    };
  };

  const handleProgressUpdate = (current: number, total: number, phase: string) => {
    setProgressDetails({ current, total, phase: phase as any });
    let percentage = 0;
    if (phase === 'initializing') percentage = 0;
    else if (phase === 'fetching') percentage = total > 0 ? Math.min(Math.round((current / total) * 70), 70) : 0;
    else if (phase === 'processing') percentage = 85;
    else if (phase === 'generating') percentage = 95;
    else if (phase === 'complete') percentage = 100;
    setExportProgress(percentage);
  };

  const buildQueryParams = (): Record<string, string> => {
    const params: Record<string, string> = {};
    const values = form.getValues();
    if (values.vertical && values.vertical.length > 0) params.parent_orgids = values.vertical.join(',');
    if (values.company && values.company.length > 0) params.organization_ids = values.company.join(',');
    if (values.department && values.department.length > 0) params.department_ids = values.department.join(',');
    if (values.division && values.division.length > 0) params.business_unit_ids = values.division.join(',');
    if (values.cost_center && values.cost_center.length > 0) params.cost_center_ids = values.cost_center.join(',');
    if (values.manager_id && values.manager_id.length > 0) params.manager_id = values.manager_id.join(',');
    if (reportType === 'weekly' && weekDate) {
      const { start, end } = getWeekRange(weekDate);
      params.from_date = format(start, 'yyyy-MM-dd');
      params.to_date = format(end, 'yyyy-MM-dd');
    } else if (reportType === 'monthly' && monthDate) {
      const { start, end } = getMonthRange(monthDate);
      params.from_date = format(start, 'yyyy-MM-dd');
      params.to_date = format(end, 'yyyy-MM-dd');
    } else {
      if (values.from_date) params.from_date = format(values.from_date, 'yyyy-MM-dd');
      if (values.to_date) params.to_date = format(values.to_date, 'yyyy-MM-dd');
    }
    if (reportType !== 'daily') params.type = reportType;
    return params;
  };

  const buildUrl = (params: Record<string, string>, page?: number): string => {
    const queryParts: string[] = [];
    if (selectedDivisions.length > 0) {
      queryParts.push(`business_unit_ids=${selectedDivisions.join(',')}`);
    }
    if (selectedCostCenters.length > 0) {
      queryParts.push(`cost_center_ids=${selectedCostCenters.join(',')}`);
    }
    if (selectedEmployeeTypes.length > 0) {
      queryParts.push(`employee_type_ids=${selectedEmployeeTypes.join(',')}`);
    }
    if (selectedEmployeeIds.length > 0) {
      queryParts.push(`employee_ids=${selectedEmployeeIds.join(',')}`);
    }
    if (page !== undefined && (reportType === 'daily' || reportType === 'weekly' || reportType === 'monthly')) {
      queryParts.push(`limit=${rowsPerPage}`);
      queryParts.push(`offset=${(page - 1) * rowsPerPage}`);
    }
    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });
    const queryString = queryParts.join('&');
    return `/report/attendance${queryString ? `?${queryString}` : ''}`;
  };

  const fetchReportData = async (page: number = 1) => {
    setLoadingReportData(true);
    try {
      const params = buildQueryParams();
      const url = buildUrl(params, page);
      const response = await apiRequest(url, "GET");
      const data = response?.data || [];
      const total = response?.total || data.length;
      setReportData(data);
      setTotalRecords(total);
      setCurrentPage(page);
      if (data.length === 0) showToast("error", "no_data_found");
    } catch (error) {
      console.error("Error fetching report data:", error);
      showToast("error", "fetch_report_error");
      setReportData([]);
      setTotalRecords(0);
    } finally {
      setLoadingReportData(false);
    }
  };

  const handleViewReport = async () => {
    try {
      setShowReportView(true);
      setShowExportButtons(true);
      setShowViewButton(false);
      await fetchReportData(1);
    } catch (error) {
      console.error("Error in handleViewReport:", error);
      setShowReportView(false);
      setShowExportButtons(false);
      setShowViewButton(true);
    }
  };

  const resetButtons = () => {
    setShowExportButtons(false);
    setShowViewButton(true);
  };

  const handlePageChange = (newPage: number) => {
    if (isServerPaginated) {
      fetchReportData(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const getExportFormValues = () => ({
    ...form.getValues(),
    employee_ids: selectedEmployeeIds,
    employee_type_ids: selectedEmployeeTypes,
    report_type: reportType,
  });

  const handleExportCSV = async () => {
    setLoading(true); setExportProgress(0); setExportType('csv');
    setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
    try {
      const exporter = new CSVExporter({
        formValues: getExportFormValues(), headerMap, calculateSummaryTotals,
        onProgress: handleProgressUpdate, showToast,
      });
      await exporter.exportStreaming();
    } catch (error) {
      console.error("CSV export error:", error);
    } finally {
      setTimeout(() => {
        setLoading(false); setExportProgress(0); setExportType(null);
        resetButtons(); setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
      }, 500);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true); setExportProgress(0); setExportType('excel');
    setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
    try {
      const exporter = new ExcelExporter({
        formValues: getExportFormValues(), headerMap, calculateSummaryTotals,
        onProgress: handleProgressUpdate, showToast,
      });
      await exporter.export();
    } catch (error) {
      console.error("Excel export error:", error);
    } finally {
      setTimeout(() => {
        setLoading(false); setExportProgress(0); setExportType(null);
        resetButtons(); setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
      }, 500);
    }
  };

  const handleShowReport = async () => {
    setLoading(true); setExportProgress(0); setExportType('pdf');
    setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
    try {
      const exporter = new PDFExporter({
        formValues: getExportFormValues(), headerMap, calculateSummaryTotals,
        logoUrl: '/Logo.png', onProgress: handleProgressUpdate, showToast,
      });
      await exporter.export();
    } catch (error) {
      console.error("PDF export error:", error);
    } finally {
      setTimeout(() => {
        setLoading(false); setExportProgress(0); setExportType(null);
        resetButtons(); setProgressDetails({ current: 0, total: 0, phase: 'initializing' });
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      debouncedVerticalSearch.cancel(); debouncedCompanySearch.cancel();
      debouncedDepartmentSearch.cancel(); debouncedDivisionSearch.cancel(); debouncedCostCenterSearch.cancel();
      debouncedEmployeeTypeSearch.cancel();
      debouncedEmployeeSearch.cancel(); debouncedManagerSearch.cancel();
    };
  }, [
    debouncedVerticalSearch, debouncedCompanySearch, debouncedDepartmentSearch,
    debouncedDivisionSearch, debouncedCostCenterSearch, debouncedEmployeeTypeSearch,
    debouncedEmployeeSearch, debouncedManagerSearch,
  ]);

  useEffect(() => {
    if (showReportView) {
      resetButtons();
      setShowReportView(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedVerticals, selectedCompanies, selectedDepartments, selectedManagerIds,
    selectedEmployeeIds, selectedEmployeeTypes,
    form.watch('from_date'), form.watch('to_date'), reportType, weekDate, monthDate,
  ]);

  function onSubmit(_values: z.infer<typeof formSchema>) { return; }

  const getProgressMessage = () => {
    const { current, total, phase } = progressDetails;
    switch (phase) {
      case 'initializing': return t.initializing_export || 'Initializing export...';
      case 'fetching':
        return total > 0
          ? `${t.fetching_data || 'Fetching data from server'}... (${current.toLocaleString()} ${t.of || 'of'} ${total.toLocaleString()} ${t.records || 'records'})`
          : `${t.fetching_data || 'Fetching data from server'}...`;
      case 'processing': return `${t.processing || 'Processing'} ${total.toLocaleString()} ${t.records || 'records'}...`;
      case 'generating':
        if (exportType === 'csv') return t.generating_csv || 'Generating CSV file...';
        if (exportType === 'excel') return t.generating_excel || 'Generating Excel file...';
        if (exportType === 'pdf') return t.generating_pdf || 'Generating PDF file...';
        return t.generating_file || 'Generating file...';
      case 'complete': return t.export_complete || 'Export complete!';
      default: return t.processing || 'Processing...';
    }
  };

  const getProgressTip = () => {
    const { total } = progressDetails;
    if (exportType === 'csv') return t.csv_fastest || 'CSV exports are fastest for large datasets';
    if (exportType === 'excel') {
      return total > 10000
        ? `${t.processing || 'Processing'} ${total.toLocaleString()} ${t.records || 'records'}... ${t.may_take_moment || 'This may take a moment'}`
        : t.excel_includes_formatting || 'Excel export includes formatting and formulas';
    }
    if (exportType === 'pdf') {
      return total > 1000
        ? t.large_dataset_pdf || 'Large dataset detected. Showing last 1,000 records in PDF'
        : t.pdf_includes_charts || 'PDF includes charts and summary statistics';
    }
    return '';
  };

  const getPlaceholderText = () => {
    if (selectedEmployeeIds.length === 0) return t.choose_employee || "Choose employee";
    return `${selectedEmployeeIds.length} ${t.employee || 'employee'}${selectedEmployeeIds.length > 1 ? 's' : ''} ${t.selected || 'selected'}`;
  };

  const getEmployeeTypePlaceholderText = () => {
    if (selectedEmployeeTypes.length === 0) return t.placeholder_employee_type || "Choose type";
    return `${selectedEmployeeTypes.length} ${t.type || 'type'}${selectedEmployeeTypes.length > 1 ? 's' : ''} ${t.selected || 'selected'}`;
  };

  const getVerticalPlaceholderText = () => {
    if (selectedVerticals.length === 0) return t.placeholder_vertical || "Choose vertical";
    return `${selectedVerticals.length} ${t.vertical || 'vertical'}${selectedVerticals.length > 1 ? 's' : ''} ${t.selected || 'selected'}`;
  };

  const getCompanyPlaceholderText = () => {
    if (selectedCompanies.length === 0) return t.placeholder_company || "Choose company";
    return `${selectedCompanies.length} ${t.company || 'company'}${selectedCompanies.length > 1 ? 'ies' : ''} ${t.selected || 'selected'}`;
  };

  const getDepartmentPlaceholderText = () => {
    if (selectedDepartments.length === 0) return t.placeholder_division || "Choose division";
    return `${selectedDepartments.length} ${t.division || 'division'}${selectedDepartments.length > 1 ? 's' : ''} ${t.selected || 'selected'}`;
  };

  const getDivisionPlaceholderText = () => {
    if (selectedDepartments.length === 0) return t.select_division_first || "Select a division first";
    if (selectedDivisions.length === 0) return t.placeholder_department || "Choose department";
    return `${selectedDivisions.length} ${t.department || 'department'}${selectedDivisions.length > 1 ? 's' : ''} ${t.selected || 'selected'}`;
  };

  const getCostCenterPlaceholderText = () => {
    if (selectedCostCenters.length === 0) return t.placeholder_cost_center || "Choose cost center";
    return `${selectedCostCenters.length} ${t.cost_center || 'cost center'}${selectedCostCenters.length > 1 ? 's' : ''} ${t.selected || 'selected'}`;
  };

  const getManagerPlaceholderText = () => {
    if (selectedManagerIds.length === 0) return t.placeholder_manager || "Choose manager";
    return `${selectedManagerIds.length} ${t.manager || 'manager'}${selectedManagerIds.length > 1 ? 's' : ''} ${t.selected || 'selected'}`;
  };

  const isServerPaginated = reportType === 'daily' || reportType === 'weekly' || reportType === 'monthly';
  const displayData = isServerPaginated
    ? reportData
    : reportData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const summaryTotals = reportData.length > 0 ? calculateSummaryTotals(reportData) : null;

  const singleEmployeeInfo = isSingleEmployee && reportData.length > 0
    ? {
      name: reportData[0]?.Name,
      empNo: reportData[0]?.EmployeeNo,
      company: reportData[0]?.ParentOrganizationDisplayName || reportData[0]?.ParentOrganization,
      division: reportData[0]?.OrganizationDisplayName || reportData[0]?.Organization,
      department: reportData[0]?.Department,
      businessUnit: reportData[0]?.BusinessUnit,
      type: reportData[0]?.EmployeeType,
      status: reportData[0]?.EmployeeStatus,
    }
    : null;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative bg-accent p-6 rounded-2xl">
          <div className="col-span-2 px-4 py-6 flex items-center justify-between">
            <h1 className="font-medium text-xl text-primary">
              {t.employee_time_attendance_report || 'Employee Time Attendance Report'}
            </h1>
            <div className="flex gap-2 bg-backdrop rounded-lg p-1">
              {(['daily', 'weekly', 'monthly', 'summary'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setReportType(type); setShowReportView(false); resetButtons(); setReportData([]); setWeekDate(undefined); setMonthDate(undefined); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${reportType === type
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-primary'
                    }`}
                >
                  {t[type === 'daily' ? 'daily' : type === 'weekly' ? 'weekly' : type === 'monthly' ? 'monthly' : 'summary'] || type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p
              className={`text-xs text-primary rounded-md px-2 py-2 font-semibold bg-backdrop absolute -top-[50px] ${language === "ar" ? "left-0" : "right-0"}`}
            >
              <strong>{t.tip || 'Tip'}:</strong>{' '}
              {t.view_before_export || 'View the report on-screen first, then export to PDF, or CSV as needed.'}
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="p-5 flex flex-col">
              {/* ── DATE RANGE SECTION ─────────── */}
              <div className="col-span-2">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {t.date_range || 'Date Range'}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-10">
                {/* ── DATE FIELDS ──────────────── */}
                {reportType === 'weekly' ? (
                  /* ── WEEK DATE ────────────────── */
                  <FormItem className={isEmployee ? "col-span-2" : ""}>
                    <FormLabel>{t.week || 'Week'}</FormLabel>
                    <Popover
                      open={popoverStates.weekDate}
                      onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, weekDate: open }))}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            size="lg" variant="outline"
                            className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                          >
                            {weekDate
                              ? <span>{formatWeekLabel(weekDate)}</span>
                              : <span className="font-normal text-sm text-text-secondary">{t.placeholder_week || 'Choose week'}</span>}
                            <CalendarIcon />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={weekDate}
                          onSelect={(date) => { setWeekDate(date); closePopover('weekDate'); }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                ) : reportType === 'monthly' ? (
                  /* ── MONTH DATE ───────────────── */
                  <FormItem className={isEmployee ? "col-span-2" : ""}>
                    <FormLabel>{t.month || 'Month'}</FormLabel>
                    <Popover
                      open={popoverStates.monthDate}
                      onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, monthDate: open }))}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            size="lg" variant="outline"
                            className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                          >
                            {monthDate
                              ? <span>{formatMonthLabel(monthDate)}</span>
                              : <span className="font-normal text-sm text-text-secondary">{t.placeholder_month || 'Choose month'}</span>}
                            <CalendarIcon />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={monthDate}
                          onSelect={(date) => { setMonthDate(date); closePopover('monthDate'); }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                ) : (
                  /* ── FROM DATE / TO DATE (daily & summary) ── */
                  <>
                    <FormField
                      control={form.control}
                      name="from_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.from_date || 'From Date'}</FormLabel>
                          <Popover
                            open={popoverStates.fromDate}
                            onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  size="lg" variant="outline"
                                  className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                                >
                                  {field.value && field.value instanceof Date && !isNaN(field.value.getTime())
                                    ? format(field.value, "dd/MM/yy")
                                    : <span className="font-normal text-sm text-text-secondary">{t.placeholder_date || 'Choose date'}</span>}
                                  <CalendarIcon />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => { field.onChange(date); closePopover('fromDate'); }}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="to_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.to_date || 'To Date'}</FormLabel>
                          <Popover
                            open={popoverStates.toDate}
                            onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  size="lg" variant="outline"
                                  className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] 3xl:max-w-[450px] text-sm font-normal"
                                >
                                  {field.value && field.value instanceof Date && !isNaN(field.value.getTime())
                                    ? format(field.value, "dd/MM/yy")
                                    : <span className="font-normal text-sm text-text-secondary">{t.placeholder_date || 'Choose date'}</span>}
                                  <CalendarIcon />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => { field.onChange(date); closePopover('toDate'); }}
                                disabled={(date) => date > new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {/* ── FILTERS SECTION ──────────── */}
              {!isEmployee && !isManager && (
                <>
                  <div className="col-span-2 mb-3">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                      {t.filters || 'Filters'}
                    </h3>
                  </div>
                </>
              )}
              {!isEmployee && (
                <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
                {!isEmployee && !isManager && (
                  <>
                    {/* ── VERTICAL ──────────────────── */}
                    <FormField
                      control={form.control}
                      name="vertical"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex gap-1">{t.vertical || 'Vertical'}</FormLabel>
                          <Select>
                            <FormControl>
                              <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                                <SelectValue placeholder={getVerticalPlaceholderText()} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              showSearch={true}
                              searchPlaceholder={t.search_verticals || "Search verticals..."}
                              onSearchChange={debouncedVerticalSearch}
                              className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                            >
                              {getVerticalData().length === 0 && verticalSearchTerm && (
                                <div className="p-3 text-sm text-text-secondary">
                                  {t.no_verticals_found || "No verticals found"}
                                </div>
                              )}
                              {getVerticalData().map((item: any) => {
                                const verticalId = item.organization_id.toString();
                                const isChecked = selectedVerticals.includes(verticalId);
                                return (
                                  <div
                                    key={verticalId}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVerticalToggle(verticalId); }}
                                  >
                                    <Checkbox checked={isChecked} className="mr-2" />
                                    <span>{language === 'ar' ? item.organization_arb : item.organization_eng}</span>
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ── COMPANY ───────────────────── */}
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex gap-1">{t.company || 'Company'}</FormLabel>
                          <Select>
                            <FormControl>
                              <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                                <SelectValue placeholder={getCompanyPlaceholderText()} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              showSearch={true}
                              searchPlaceholder={t.search_companies || "Search companies..."}
                              onSearchChange={debouncedCompanySearch}
                              className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                            >
                              {getCompanyData().length === 0 && companySearchTerm && (
                                <div className="p-3 text-sm text-text-secondary">
                                  {t.no_companies_found || "No companies found"}
                                </div>
                              )}
                              {getCompanyData().map((item: any) => {
                                const companyId = item.organization_id.toString();
                                const isChecked = selectedCompanies.includes(companyId);
                                return (
                                  <div
                                    key={companyId}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCompanyToggle(companyId); }}
                                  >
                                    <Checkbox checked={isChecked} className="mr-2" />
                                    <span>{item.display_name || (language === 'ar' ? item.organization_arb : item.organization_eng)}</span>
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ── DEPARTMENT ────────────────── */}
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex gap-1">{t.division || 'Division'}</FormLabel>
                          <Select>
                            <FormControl>
                              <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                                <SelectValue placeholder={
                                  isDepartmentsLoading
                                    ? (t.loading_divisions || "Loading divisions...")
                                    : getDepartmentPlaceholderText()
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              showSearch={true}
                              searchPlaceholder={t.search_divisions || "Search divisions..."}
                              onSearchChange={debouncedDepartmentSearch}
                              className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                            >
                              {getDepartmentData().length === 0 && departmentSearchTerm && (
                                <div className="p-3 text-sm text-text-secondary">
                                  {t.no_divisions_found || "No divisions found"}
                                </div>
                              )}
                              {getDepartmentData().map((item: any) => {
                                const departmentId = item.department_id.toString();
                                const isChecked = selectedDepartments.includes(departmentId);
                                return (
                                  <div
                                    key={departmentId}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDepartmentToggle(departmentId); }}
                                  >
                                    <Checkbox checked={isChecked} className="mr-2" />
                                    <span>{language === 'ar'
                                      ? (item.department_name_arb || item.department_code)
                                      : (item.department_name_eng || item.department_code)}</span>
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ── DIVISION (Business Unit) ──────────────────── */}
                    <FormField
                      control={form.control}
                      name="division"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex gap-1">{t.department || 'Department'}</FormLabel>
                          <Select>
                            <FormControl>
                              <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                                <SelectValue placeholder={getDivisionPlaceholderText()} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              showSearch={true}
                              searchPlaceholder={t.search_department || "Search department..."}
                              onSearchChange={debouncedDivisionSearch}
                              className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                            >
                              {selectedDepartments.length === 0 && (
                                <div className="p-3 text-sm text-text-secondary">
                                  {t.select_division_first || "Select a division first"}
                                </div>
                              )}
                              {selectedDepartments.length > 0 && getDivisionData().length === 0 && (
                                <div className="p-3 text-sm text-text-secondary">
                                  {divisionSearchTerm
                                    ? (t.no_results || "No results found")
                                    : (t.no_department_for_division || "No departments mapped to the selected division")}
                                </div>
                              )}
                              {getDivisionData().map((item: any) => {
                                const divisionId = item.business_unit_id.toString();
                                const isChecked = selectedDivisions.includes(divisionId);
                                return (
                                  <div
                                    key={divisionId}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDivisionToggle(divisionId); }}
                                  >
                                    <Checkbox checked={isChecked} className="mr-2" />
                                    <span>{language === 'ar'
                                      ? (item.business_unit_name_arb || item.business_unit_code)
                                      : (item.business_unit_name_eng || item.business_unit_code)}</span>
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ── COST CENTER ────────────────── */}
                    <FormField
                      control={form.control}
                      name="cost_center"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex gap-1">{t.cost_center || 'Cost Center'}</FormLabel>
                          <Select>
                            <FormControl>
                              <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                                <SelectValue placeholder={
                                  isCostCentersByOrgLoading
                                    ? (t.loading_cost_centers || "Loading cost centers...")
                                    : getCostCenterPlaceholderText()
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              showSearch={true}
                              searchPlaceholder={t.search_cost_center || "Search cost center..."}
                              onSearchChange={debouncedCostCenterSearch}
                              className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                            >
                              {getCostCenterData().length === 0 && costCenterSearchTerm && (
                                <div className="p-3 text-sm text-text-secondary">
                                  {t.no_results || "No results found"}
                                </div>
                              )}
                              {getCostCenterData().map((item: any) => {
                                const costCenterId = item.cost_center_id.toString();
                                const isChecked = selectedCostCenters.includes(costCenterId);
                                return (
                                  <div
                                    key={costCenterId}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCostCenterToggle(costCenterId); }}
                                  >
                                    <Checkbox checked={isChecked} className="mr-2" />
                                    <span>{item.cost_center_code || (language === 'ar'
                                      ? item.cost_center_arb
                                      : item.cost_center_eng)}</span>
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ── EMPLOYEE TYPE ─────────────── */}
                    <FormField
                      control={form.control}
                      name="employee_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex gap-1">{t.employee_type || 'Employee Type'}</FormLabel>
                          <Select>
                            <FormControl>
                              <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                                <SelectValue placeholder={getEmployeeTypePlaceholderText()} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              showSearch={true}
                              searchPlaceholder={t.search_employee_types || "Search employee types..."}
                              onSearchChange={debouncedEmployeeTypeSearch}
                              className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                            >
                              {getEmployeeTypesData().length === 0 && employeeTypeSearchTerm && (
                                <div className="p-3 text-sm text-text-secondary">
                                  {t.no_employee_types_found || "No employee types found"}
                                </div>
                              )}
                              {getEmployeeTypesData().map((item: any) => {
                                const typeValue = item.employee_type_id.toString();
                                const isChecked = selectedEmployeeTypes.includes(typeValue);
                                return (
                                  <div
                                    key={item.employee_type_id}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEmployeeTypeToggle(typeValue); }}
                                  >
                                    <Checkbox checked={isChecked} className="mr-2" />
                                    <span>
                                      {language === 'ar' ? item.employee_type_arb : item.employee_type_eng}
                                    </span>
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ── MANAGER ───────────────────── */}
                    <FormField
                      control={form.control}
                      name="manager_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex gap-1">{t.manager || 'Manager'}</FormLabel>
                          <Select>
                            <FormControl>
                              <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                                <SelectValue placeholder={getManagerPlaceholderText()} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              showSearch={true}
                              searchPlaceholder={t.search_managers || "Search managers..."}
                              onSearchChange={debouncedManagerSearch}
                              className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                            >
                              {isSearchingManagers && managerSearchTerm.length > 0 && (
                                <div className="p-3 text-sm text-text-secondary">
                                  {t.searching || "Searching..."}
                                </div>
                              )}
                              {getManagerData().length === 0 && managerSearchTerm.length > 0 && !isSearchingManagers && (
                                <div className="p-3 text-sm text-text-secondary">
                                  {t.no_managers_found || "No managers found"}
                                </div>
                              )}
                              {getManagerData().map((item: any) => {
                                const managerId = item.employee_id.toString();
                                const isChecked = selectedManagerIds.includes(managerId);
                                return (
                                  <div
                                    key={managerId}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleManagerToggle(managerId); }}
                                  >
                                    <Checkbox checked={isChecked} className="mr-2" />
                                    <span>{language === 'ar'
                                      ? `${item.firstname_arb || item.firstname_eng} ${item.lastname_arb || item.lastname_eng || ''} ${item.emp_no ? `(${item.emp_no})` : ''}`
                                      : `${item.firstname_eng} ${item.lastname_eng || ''} ${item.emp_no ? `(${item.emp_no})` : ''}`}</span>
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </>
              )}

              {/* ── EMPLOYEE ──────────────────── */}
              <FormField
                control={form.control}
                name="employee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1">{t.employee || 'Employee'}</FormLabel>
                    <Select>
                      <FormControl>
                        <SelectTrigger className="w-full max-w-[350px] 3xl:max-w-[450px]">
                          <SelectValue placeholder={getPlaceholderText()} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        showSearch={true}
                        searchPlaceholder={t.search_employees || "Search employees..."}
                        onSearchChange={debouncedEmployeeSearch}
                        className="mt-5 w-full max-w-[350px] 3xl:max-w-[450px]"
                      >
                        {isSearchingEmployees && employeeSearchTerm.length > 0 && (
                          <div className="p-3 text-sm text-text-secondary">
                            {t.searching || "Searching..."}
                          </div>
                        )}
                        {getFilteredEmployees().length === 0 && employeeSearchTerm.length > 0 && !isSearchingEmployees && (
                          <div className="p-3 text-sm text-text-secondary">
                            {t.no_employees_found || "No employees found"}
                          </div>
                        )}
                        {getFilteredEmployees().map((item: any) => {
                          const empId = item?.employee_id?.toString();
                          const isChecked = selectedEmployeeIds.includes(empId);
                          return (
                            <div
                              key={empId}
                              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEmployeeToggle(empId); }}
                            >
                              <Checkbox checked={isChecked} className="mr-2" />
                              <span>{language === 'ar'
                                ? `${item.firstname_arb || item.firstname_eng} ${item.emp_no ? `(${item.emp_no})` : ''}`
                                : `${item.firstname_eng} ${item.emp_no ? `(${item.emp_no})` : ''}`}</span>
                            </div>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              </div>
              )}

            </div>

            {/* ── Progress Bar ─────────────────────────────────────────── */}
            {loading && exportProgress >= 0 && (
              <div className="px-8 pb-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-regular text-blue-900">{getProgressMessage()}</span>
                    <span className="text-sm font-medium text-blue-900">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-2">{getProgressTip()}</p>
                </div>
              </div>
            )}

            {/* ── Action Buttons ───────────────────────────────────────── */}
            <div className="flex justify-center gap-2 items-center pb-5">
              <div className="flex gap-4 px-5">
                <Button
                  type="button" size="sm" variant="secondary"
                  className="flex items-center gap-2"
                  onClick={() => {
                    form.reset();
                    setShowReportView(false);
                    setReportData([]);
                    setWeekDate(undefined);
                    setMonthDate(undefined);
                    resetButtons();
                  }}
                  disabled={loading}
                >
                  <Trash2Icon />
                  {translations?.buttons?.clear || 'Clear Filters'}
                </Button>

                {showViewButton && (
                  <Button
                    type="button" size="sm"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    onClick={handleViewReport}
                    disabled={loading || loadingReportData}
                  >
                    <Eye className="w-4 h-4" />
                    {translations?.buttons?.view_report || 'View Report'}
                  </Button>
                )}

                {showExportButtons && reportData.length > 0 && (
                  <>
                    <Button
                      type="button" size="sm"
                      className="flex items-center gap-2 bg-[#0073C6]"
                      onClick={() => { handleExportCSV(); setShowReportView(false); }}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4" />
                      {translations?.buttons?.export_csv || 'Export CSV'}
                    </Button>
                    <Button
                      type="button" size="sm"
                      className="flex items-center gap-2 bg-[#217346] hover:bg-[#2e8c57]"
                      onClick={() => { handleExportExcel(); setShowReportView(false); }}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4" />
                      {translations?.buttons?.export_excel || 'Export Excel'}
                    </Button>
                    <Button
                      type="button" size="sm"
                      className="flex items-center gap-2 bg-[#B11C20] hover:bg-[#e41c23]"
                      onClick={() => { handleShowReport(); setShowReportView(false); }}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4" />
                      {translations?.buttons?.export_pdf || 'Export PDF'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>

      {/* ── Report Preview Table ─────────────────────────────────────────── */}
      {showReportView && (
        <div className="mt-6 bg-accent p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-lg text-primary">
              {t.report_preview || "Report Preview"} ({totalRecords.toLocaleString()} {t.records || "records"})
            </h2>
            <Button
              variant="outline" size="sm"
              onClick={() => { setShowReportView(false); resetButtons(); }}
            >
              {translations?.buttons?.close || "Close"}
            </Button>
          </div>
          {loadingReportData ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              {t.no_data_found || "No data found for the selected criteria"}
            </div>
          ) : (
            <>
              <div className="w-full">
                {isSingleEmployee && singleEmployeeInfo && (
                  <div className="mb-6 p-4 bg-backdrop rounded-lg border border-grey">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-text-secondary">{t.employee_name || "Employee Name"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.emp_no || "Emp No"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.empNo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.employee_type || "Employee Type"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.status || "Status"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.parent_organization || "Parent Organization"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.company}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.organization || "Organization"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.division}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.division || "Division"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">{t.department || "Department"}</p>
                        <p className="font-semibold text-primary">{singleEmployeeInfo.businessUnit || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-primary">
                        {viewHeaders.map((header) => (
                          <th
                            key={header}
                            className="border border-grey px-3 py-2 text-left text-xs font-semibold text-white"
                          >
                            {headerMap[header] || header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-backdrop">
                          {viewHeaders.map((header) => {
                            const cellValue = formatCellValue(header, row[header]);
                            const isAbsent = header === "IsAbsent" && cellValue !== 'Present' && cellValue !== '-';
                            const isMissedPunch = header === "MissedPunch" && cellValue !== '-';
                            return (
                              <td
                                key={header}
                                className={`border border-grey px-3 py-2 text-xs ${isAbsent || isMissedPunch ? "text-red-600 font-semibold" : ""}`}
                              >
                                {cellValue}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {summaryTotals && (
                    <div className="mt-8 border-t border-grey pt-6">
                      <h3 className="font-medium text-md text-primary mb-4">
                        {t.summary_totals || "Summary Totals"} ({t.current_page || "Current Page"})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: t.total_worked_hours || "Total Worked Hours", value: summaryTotals.totalWorkedHours },
                          { label: t.total_missed_hours || "Total Missed Hours", value: summaryTotals.totalMissedHours },
                          { label: t.total_extra_hours || "Total Extra Hours", value: summaryTotals.totalExtraHours },
                          { label: t.total_absents || "Total Absents", value: summaryTotals.totalAbsents },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-backdrop p-4 rounded-lg">
                            <p className="text-xs text-text-secondary mb-1">{label}</p>
                            <p className="text-lg font-semibold text-primary">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loadingReportData}
                  >
                    {translations?.buttons?.previous || "Previous"}
                  </Button>
                  <span className="text-sm text-text-secondary">
                    {t.page || "Page"} {currentPage} {t.of || "of"} {totalPages}
                  </span>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loadingReportData}
                  >
                    {translations?.buttons?.next || "Next"}
                  </Button>
                  <span className="text-xs text-text-secondary ml-4">
                    ({t?.limit || "Limit"}: {rowsPerPage})
                  </span>
                </div>
              )}
              {totalPages <= 1 && (
                <div className="flex justify-center mt-6">
                  <span className="text-xs text-text-secondary">
                    ({t?.limit || "Limit"}: {rowsPerPage})
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}