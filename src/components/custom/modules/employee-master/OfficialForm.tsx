"use client";
import { useState, useCallback, useEffect } from "react";
import * as z from "zod";
import { debounce } from "lodash";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import Required from "@/src/components/ui/required";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getManagerEmployees } from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { useLanguage } from "@/src/providers/LanguageProvider";

export default function OfficialForm({
  Page,
  SetPage,
  officialFormSchema,
  officialForm,
}: {
  Page?: any;
  SetPage?: any;
  officialFormSchema: any;
  officialForm: any;
}) {
  const router = useRouter();
  const showToast = useShowToast();
  const { language, translations } = useLanguage();
  const t = translations?.modules?.employeeMaster || {};
  const errT = translations?.formErrors || {};
  
  const managerFlagChecked = officialForm.watch("manager_flag");
  const [step, setStep] = useState(1);

  const [employeeTypeSearchTerm, setEmployeeTypeSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [citizenshipSearchTerm, setCitizenshipSearchTerm] = useState("");
  const [designationSearchTerm, setDesignationSearchTerm] = useState("");
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [gradeSearchTerm, setGradeSearchTerm] = useState("");
  const [managerSearchTerm, setManagerSearchTerm] = useState("");

  const [showEmployeeTypeSearch, setShowEmployeeTypeSearch] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [showCitizenshipSearch, setShowCitizenshipSearch] = useState(false);
  const [showDesignationSearch, setShowDesignationSearch] = useState(false);
  const [showOrganizationSearch, setShowOrganizationSearch] = useState(false);
  const [showGradeSearch, setShowGradeSearch] = useState(false);
  const [showManagerSearch, setShowManagerSearch] = useState(false);

  const { data: employeeTypes } = useFetchAllEntity("employeeType",{ removeAll: true });
  const { data: locations } = useFetchAllEntity("location",{ removeAll: true });
  const { data: citizenships } = useFetchAllEntity("citizenship",{ removeAll: true });
  const { data: designations } = useFetchAllEntity("designation",{ removeAll: true });
  const { data: organizations } = useFetchAllEntity("organization",{ removeAll: true });
  const { data: grades } = useFetchAllEntity("grade",{ removeAll: true });

  const { data: managerEmployees } = useQuery({
    queryKey: ["managerEmployees"],
    queryFn: getManagerEmployees,
  });

  const debouncedEmployeeTypeSearch = useCallback(
    debounce((searchTerm: string) => {
      setEmployeeTypeSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedLocationSearch = useCallback(
    debounce((searchTerm: string) => {
      setLocationSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedCitizenshipSearch = useCallback(
    debounce((searchTerm: string) => {
      setCitizenshipSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedDesignationSearch = useCallback(
    debounce((searchTerm: string) => {
      setDesignationSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedOrganizationSearch = useCallback(
    debounce((searchTerm: string) => {
      setOrganizationSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedGradeSearch = useCallback(
    debounce((searchTerm: string) => {
      setGradeSearchTerm(searchTerm);
    }, 300),
    []
  );

  const debouncedManagerSearch = useCallback(
    debounce((searchTerm: string) => {
      setManagerSearchTerm(searchTerm);
    }, 300),
    []
  );

  const getFilteredEmployeeTypes = () => {
    const baseData = employeeTypes?.data || [];
    
    if (employeeTypeSearchTerm.length === 0) return baseData;
    
    return baseData.filter((item: any) => 
      item.employee_type_id && 
      item.employee_type_id.toString().trim() !== '' &&
      item.employee_type_eng?.toLowerCase().includes(employeeTypeSearchTerm.toLowerCase())
    );
  };

  const getFilteredLocations = () => {
    const baseData = locations?.data || [];
    
    if (locationSearchTerm.length === 0) return baseData;
    
    return baseData.filter((item: any) => 
      item.location_id && 
      item.location_id.toString().trim() !== '' &&
      item.location_eng?.toLowerCase().includes(locationSearchTerm.toLowerCase())
    );
  };

  const getFilteredCitizenships = () => {
    const baseData = citizenships?.data || [];
    
    if (citizenshipSearchTerm.length === 0) return baseData;
    
    return baseData.filter((item: any) => 
      item.citizenship_id && 
      item.citizenship_id.toString().trim() !== '' &&
      item.citizenship_eng?.toLowerCase().includes(citizenshipSearchTerm.toLowerCase())
    );
  };

  const getFilteredDesignations = () => {
    const baseData = designations?.data || [];
    
    if (designationSearchTerm.length === 0) return baseData;
    
    return baseData.filter((item: any) => 
      item.designation_id && 
      item.designation_id.toString().trim() !== '' &&
      item.designation_eng?.toLowerCase().includes(designationSearchTerm.toLowerCase())
    );
  };

  const getFilteredOrganizations = () => {
    const baseData = organizations?.data || [];
    
    if (organizationSearchTerm.length === 0) return baseData;
    
    return baseData.filter((item: any) => 
      item.organization_id && 
      item.organization_id.toString().trim() !== '' &&
      item.organization_eng?.toLowerCase().includes(organizationSearchTerm.toLowerCase())
    );
  };

  const getFilteredGrades = () => {
    const baseData = grades?.data || [];
    
    if (gradeSearchTerm.length === 0) return baseData;
    
    return baseData.filter((item: any) => 
      item.grade_id && 
      item.grade_id.toString().trim() !== '' &&
      (item.grade_eng || item.grade_name)?.toLowerCase().includes(gradeSearchTerm.toLowerCase())
    );
  };

  const getFilteredManagers = () => {
    const baseData = managerEmployees?.data || [];
    
    if (managerSearchTerm.length === 0) return baseData;
    
    return baseData.filter((emp: any) => 
      emp.employee_id != null &&
      emp.firstname_eng?.toLowerCase().includes(managerSearchTerm.toLowerCase())
    );
  };

  useEffect(() => {
    return () => {
      debouncedEmployeeTypeSearch.cancel();
      debouncedLocationSearch.cancel();
      debouncedCitizenshipSearch.cancel();
      debouncedDesignationSearch.cancel();
      debouncedOrganizationSearch.cancel();
      debouncedGradeSearch.cancel();
      debouncedManagerSearch.cancel();
    };
  }, [
    debouncedEmployeeTypeSearch,
    debouncedLocationSearch,
    debouncedCitizenshipSearch,
    debouncedDesignationSearch,
    debouncedOrganizationSearch,
    debouncedGradeSearch,
    debouncedManagerSearch
  ]);

  function onSubmit(values: z.infer<typeof officialFormSchema>) {
    try {
      SetPage("flags-form");
      showToast("success", "data_saved");
    } catch (error) {
      console.error("Form submission error", error);
      showToast("error", "formsubmission_error");
    }
  }

  return (
    <Form {...officialForm}>
      <form onSubmit={officialForm.handleSubmit(onSubmit)}>
        <div className="p-8">
          <FormField
            control={officialForm.control}
            name="manager_flag"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="manager_flag"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel htmlFor="manager_flag" className="text-sm font-semibold">
                      {t.manager_flag || "Manager flag"}
                    </FormLabel>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
          <FormField
            control={officialForm.control}
            name="employee_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.employee_type || "Employee Type"} <Required />
                </FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                  onOpenChange={(open) => setShowEmployeeTypeSearch(open)}
                >
                  <FormControl>
                    <SelectTrigger className="max-w-[350px]">
                      <SelectValue placeholder={t.placeholder_emp_type || "Choose employee type"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    showSearch={true}
                    searchPlaceholder={t.search || "Search employee types..."}
                    onSearchChange={debouncedEmployeeTypeSearch}
                    className="mt-1"
                  >
                    {getFilteredEmployeeTypes().length === 0 && employeeTypeSearchTerm.length > 0 && (
                      <div className="p-3 text-sm text-text-secondary">
                        {t.no_results || "No employee types found"}
                      </div>
                    )}
                    {getFilteredEmployeeTypes().map((item: any) => {
                      if (!item.employee_type_id || item.employee_type_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.employee_type_id} value={item.employee_type_id.toString()}>
                          {item.employee_type_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <TranslatedError fieldError={officialForm.formState.errors.employee_type_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="location_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.locations || "Location"} <Required />
                </FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                  onOpenChange={(open) => setShowLocationSearch(open)}
                >
                  <FormControl>
                    <SelectTrigger className="max-w-[350px]">
                      <SelectValue placeholder={t.placeholder_location || "Choose location"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    showSearch={true}
                    searchPlaceholder={t.search || "Search locations..."}
                    onSearchChange={debouncedLocationSearch}
                    className="mt-1 max-w-[350px]"
                  >
                    {getFilteredLocations().length === 0 && locationSearchTerm.length > 0 && (
                      <div className="p-3 text-sm text-text-secondary">
                        {t.no_results || "No locations found"}
                      </div>
                    )}
                    {getFilteredLocations().map((item: any) => {
                      if (!item.location_id || item.location_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.location_id} value={item.location_id.toString()}>
                          {item.location_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <TranslatedError fieldError={officialForm.formState.errors.location_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="citizenship_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.citizenship || "Citizenship"} <Required />
                </FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                  onOpenChange={(open) => setShowCitizenshipSearch(open)}
                >
                  <FormControl>
                    <SelectTrigger className="max-w-[350px]">
                      <SelectValue placeholder={t.placeholder_citizenship || "Choose citizenship"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    showSearch={true}
                    searchPlaceholder={t.search || "Search citizenships..."}
                    onSearchChange={debouncedCitizenshipSearch}
                    className="mt-1"
                  >
                    {getFilteredCitizenships().length === 0 && citizenshipSearchTerm.length > 0 && (
                      <div className="p-3 text-sm text-text-secondary">
                        {t.no_results || "No citizenships found"}
                      </div>
                    )}
                    {getFilteredCitizenships().map((item: any) => {
                      if (!item.citizenship_id || item.citizenship_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.citizenship_id} value={item.citizenship_id.toString()}>
                          {item.citizenship_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <TranslatedError fieldError={officialForm.formState.errors.citizenship_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="designation_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.designation || "Designation"} <Required />
                </FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                  onOpenChange={(open) => setShowDesignationSearch(open)}
                >
                  <FormControl>
                    <SelectTrigger className="max-w-[350px]">
                      <SelectValue placeholder={t.placeholder_designation || "Choose designation"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    showSearch={true}
                    searchPlaceholder={t.search || "Search designations..."}
                    onSearchChange={debouncedDesignationSearch}
                    className="mt-1"
                  >
                    {getFilteredDesignations().length === 0 && designationSearchTerm.length > 0 && (
                      <div className="p-3 text-sm text-text-secondary">
                        {t.no_results || "No designations found"}
                      </div>
                    )}
                    {getFilteredDesignations().map((item: any) => {
                      if (!item.designation_id || item.designation_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.designation_id} value={item.designation_id.toString()}>
                          {item.designation_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <TranslatedError fieldError={officialForm.formState.errors.designation_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="organization_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.organization || "Organization"} <Required />
                </FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                  onOpenChange={(open) => setShowOrganizationSearch(open)}
                >
                  <FormControl>
                    <SelectTrigger className="max-w-[350px]">
                      <SelectValue placeholder={t.placeholder_organization || "Choose organization"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    showSearch={true}
                    searchPlaceholder={t.search || "Search organizations..."}
                    onSearchChange={debouncedOrganizationSearch}
                    className="mt-1"
                  >
                    {getFilteredOrganizations().length === 0 && organizationSearchTerm.length > 0 && (
                      <div className="p-3 text-sm text-text-secondary">
                        {t.no_results || "No organizations found"}
                      </div>
                    )}
                    {getFilteredOrganizations().map((item: any) => {
                      if (!item.organization_id || item.organization_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
                          {item.organization_eng}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <TranslatedError fieldError={officialForm.formState.errors.organization_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="grade_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.grade || "Grade"}</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                  onOpenChange={(open) => setShowGradeSearch(open)}
                >
                  <FormControl>
                    <SelectTrigger className="max-w-[350px]">
                      <SelectValue placeholder={t.placeholder_grade || "Choose grade"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    showSearch={true}
                    searchPlaceholder={t.search || "Search grades..."}
                    onSearchChange={debouncedGradeSearch}
                    className="mt-1"
                  >
                    {getFilteredGrades().length === 0 && gradeSearchTerm.length > 0 && (
                      <div className="p-3 text-sm text-text-secondary">
                        {t.no_results || "No grades found"}
                      </div>
                    )}
                    {getFilteredGrades().map((item: any) => {
                      if (!item.grade_id || item.grade_id.toString().trim() === '') return null;
                      return (
                        <SelectItem key={item.grade_id} value={item.grade_id.toString()}>
                          {item.grade_eng || item.grade_name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <TranslatedError fieldError={officialForm.formState.errors.grade_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="manager_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">{t.manager || "Manager"}</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value !== undefined ? String(field.value) : ""}
                  onOpenChange={(open) => setShowManagerSearch(open)}
                >
                  <FormControl>
                    <SelectTrigger className="max-w-[350px]">
                      <SelectValue placeholder={t.placeholder_manager || "Choose manager"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    showSearch={true}
                    searchPlaceholder={t.search || "Search managers..."}
                    onSearchChange={debouncedManagerSearch}
                    className="mt-1"
                  >
                    {getFilteredManagers().length === 0 && managerSearchTerm.length > 0 && (
                      <div className="p-3 text-sm text-text-secondary">
                        {t.no_results || "No managers found"}
                      </div>
                    )}
                    {getFilteredManagers()
                      .filter((emp: any) => emp.employee_id != null)
                      .map((emp: any) => (
                        <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                          {emp.firstname_eng}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <TranslatedError fieldError={officialForm.formState.errors.manager_id} translations={errT} />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 items-center py-5">
          <div className="flex gap-4 px-5">
            <Button variant="outline" type="button" size="lg" className="w-full" onClick={() => setStep((prev) => prev - 1)}>
              {translations.buttons.back || "Back"}
            </Button>
            <Button type="submit" size="lg" className="w-full">
              {translations.buttons.next || "Next"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}