"use client";
import { useState, useCallback, useEffect } from "react";
import * as z from "zod";
import { debounce } from "lodash";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import { Checkbox } from "@/src/components/ui/checkbox";
import Required from "@/src/components/ui/required";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getManagerEmployees } from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { cn } from "@/src/lib/utils";

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

  const [openEmployeeType, setOpenEmployeeType] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [openCitizenship, setOpenCitizenship] = useState(false);
  const [openDesignation, setOpenDesignation] = useState(false);
  const [openOrganization, setOpenOrganization] = useState(false);
  const [openGrade, setOpenGrade] = useState(false);
  const [openManager, setOpenManager] = useState(false);

  const { data: employeeTypes, isLoading: loadingEmployeeTypes } = useFetchAllEntity("employeeType", { removeAll: true });
  const { data: locations, isLoading: loadingLocations } = useFetchAllEntity("location", { removeAll: true });
  const { data: citizenships, isLoading: loadingCitizenships } = useFetchAllEntity("citizenship", { removeAll: true });
  const { data: designations, isLoading: loadingDesignations } = useFetchAllEntity("designation", { removeAll: true });
  const { data: organizations, isLoading: loadingOrganizations } = useFetchAllEntity("organization", { removeAll: true });
  const { data: grades, isLoading: loadingGrades } = useFetchAllEntity("grade", { removeAll: true });

  const { data: managerEmployees, isLoading: loadingManagers } = useQuery({
    queryKey: ["managerEmployees"],
    queryFn: getManagerEmployees,
  });

  const getEmployeeTypesData = () => (employeeTypes?.data || []).filter((item: any) =>
    item.employee_type_id && item.employee_type_id.toString().trim() !== ''
  );

  const getLocationsData = () => (locations?.data || []).filter((item: any) =>
    item.location_id && item.location_id.toString().trim() !== ''
  );

  const getCitizenshipsData = () => (citizenships?.data || []).filter((item: any) =>
    item.citizenship_id && item.citizenship_id.toString().trim() !== ''
  );

  const getDesignationsData = () => (designations?.data || []).filter((item: any) =>
    item.designation_id && item.designation_id.toString().trim() !== ''
  );

  const getOrganizationsData = () => (organizations?.data || []).filter((item: any) =>
    item.organization_id && item.organization_id.toString().trim() !== ''
  );

  const getGradesData = () => (grades?.data || []).filter((item: any) =>
    item.grade_id && item.grade_id.toString().trim() !== ''
  );

  const getManagersData = () => (managerEmployees?.data || []).filter((emp: any) =>
    emp.employee_id != null
  );

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
              <FormItem className="flex flex-col">
                <FormLabel className="flex gap-1">
                  {t.employee_type || "Employee Type"} <Required />
                </FormLabel>
                <Popover open={openEmployeeType} onOpenChange={setOpenEmployeeType}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openEmployeeType}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] 3xl:max-w-[450px] justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingEmployeeTypes}
                      >
                        <span className="truncate">
                          {field.value
                            ? getEmployeeTypesData().find(
                              (item: any) => item.employee_type_id === field.value
                            )?.employee_type_eng
                            : t.placeholder_emp_type || "Choose employee type"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandInput placeholder={t.search || "Search employee type..."} className="border-none" />
                      <CommandEmpty>{t.no_results || "No employee type found"}</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getEmployeeTypesData().map((item: any) => (
                          <CommandItem
                            key={item.employee_type_id}
                            value={item.employee_type_eng}
                            onSelect={() => {
                              field.onChange(item.employee_type_id);
                              setOpenEmployeeType(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === item.employee_type_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {item.employee_type_eng}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={officialForm.formState.errors.employee_type_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="location_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex gap-1">
                  {t.locations || "Location"} <Required />
                </FormLabel>
                <Popover open={openLocation} onOpenChange={setOpenLocation}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openLocation}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] 3xl:max-w-[450px]  justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingLocations}
                      >
                        <span className="truncate">
                          {field.value
                            ? getLocationsData().find(
                              (item: any) => item.location_id === field.value
                            )?.location_eng
                            : t.placeholder_location || "Choose location"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandInput placeholder={t.search || "Search location..."} className="border-none" />
                      <CommandEmpty>{t.no_results || "No location found"}</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getLocationsData().map((item: any) => (
                          <CommandItem
                            key={item.location_id}
                            value={item.location_eng}
                            onSelect={() => {
                              field.onChange(item.location_id);
                              setOpenLocation(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === item.location_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {item.location_eng}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={officialForm.formState.errors.location_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="citizenship_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex gap-1">
                  {t.citizenship || "Citizenship"} <Required />
                </FormLabel>
                <Popover open={openCitizenship} onOpenChange={setOpenCitizenship}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCitizenship}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] 3xl:max-w-[450px]  justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingCitizenships}
                      >
                        <span className="truncate">
                          {field.value
                            ? getCitizenshipsData().find(
                              (item: any) => item.citizenship_id === field.value
                            )?.citizenship_eng
                            : t.placeholder_citizenship || "Choose citizenship"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandInput placeholder={t.search || "Search citizenship..."} className="border-none" />
                      <CommandEmpty>{t.no_results || "No citizenship found"}</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getCitizenshipsData().map((item: any) => (
                          <CommandItem
                            key={item.citizenship_id}
                            value={item.citizenship_eng}
                            onSelect={() => {
                              field.onChange(item.citizenship_id);
                              setOpenCitizenship(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === item.citizenship_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {item.citizenship_eng}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={officialForm.formState.errors.citizenship_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="designation_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex gap-1">
                  {t.designation || "Designation"} <Required />
                </FormLabel>
                <Popover open={openDesignation} onOpenChange={setOpenDesignation}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openDesignation}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] 3xl:max-w-[450px]  justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingDesignations}
                      >
                        <span className="truncate">
                          {field.value
                            ? getDesignationsData().find(
                              (item: any) => item.designation_id === field.value
                            )?.designation_eng
                            : t.placeholder_designation || "Choose designation"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-[350px] 3xl:max-w-[450px]  p-0">
                    <Command>
                      <CommandInput placeholder={t.search || "Search designation..."} />
                      <CommandEmpty>{t.no_results || "No designation found"}</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getDesignationsData().map((item: any) => (
                          <CommandItem
                            key={item.designation_id}
                            value={item.designation_eng}
                            onSelect={() => {
                              field.onChange(item.designation_id);
                              setOpenDesignation(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === item.designation_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {item.designation_eng}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={officialForm.formState.errors.designation_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="organization_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex gap-1">
                  {t.organization || "Organization"} <Required />
                </FormLabel>
                <Popover open={openOrganization} onOpenChange={setOpenOrganization}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openOrganization}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] 3xl:max-w-[450px]  justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingOrganizations}
                      >
                        <span className="truncate">
                          {field.value
                            ? getOrganizationsData().find(
                              (item: any) => item.organization_id === field.value
                            )?.organization_eng
                            : t.placeholder_organization || "Choose organization"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-[350px] 3xl:max-w-[450px]  p-0">
                    <Command>
                      <CommandInput placeholder={t.search || "Search organization..."} />
                      <CommandEmpty>{t.no_results || "No organization found"}</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getOrganizationsData().map((item: any) => (
                          <CommandItem
                            key={item.organization_id}
                            value={item.organization_eng}
                            onSelect={() => {
                              field.onChange(item.organization_id);
                              setOpenOrganization(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === item.organization_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {item.organization_eng}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={officialForm.formState.errors.organization_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="grade_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex gap-1">{t.grade || "Grade"}</FormLabel>
                <Popover open={openGrade} onOpenChange={setOpenGrade}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openGrade}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] 3xl:max-w-[450px]  justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingGrades}
                      >
                        <span className="truncate">
                          {field.value
                            ? (getGradesData().find(
                              (item: any) => item.grade_id === field.value
                            )?.grade_eng || getGradesData().find(
                              (item: any) => item.grade_id === field.value
                            )?.grade_name)
                            : t.placeholder_grade || "Choose grade"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-[350px] 3xl:max-w-[450px]  p-0">
                    <Command>
                      <CommandInput placeholder={t.search || "Search grade..."} />
                      <CommandEmpty>{t.no_results || "No grade found"}</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getGradesData().map((item: any) => (
                          <CommandItem
                            key={item.grade_id}
                            value={item.grade_eng || item.grade_name}
                            onSelect={() => {
                              field.onChange(item.grade_id);
                              setOpenGrade(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === item.grade_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {item.grade_eng || item.grade_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={officialForm.formState.errors.grade_id} translations={errT} />
              </FormItem>
            )}
          />

          <FormField
            control={officialForm.control}
            name="manager_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex gap-1">{t.manager || "Manager"}</FormLabel>
                <Popover open={openManager} onOpenChange={setOpenManager}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openManager}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] 3xl:max-w-[450px]  justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingManagers}
                      >
                        <span className="truncate">
                          {field.value
                            ? getManagersData().find(
                              (emp: any) => emp.employee_id === field.value
                            )?.firstname_eng
                            : t.placeholder_manager || "Choose manager"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-[350px] 3xl:max-w-[450px]p-0">
                    <Command>
                      <CommandInput placeholder={t.search || "Search manager..."} />
                      <CommandEmpty>{t.no_results || "No manager found"}</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getManagersData().map((emp: any) => (
                          <CommandItem
                            key={emp.employee_id}
                            value={emp.firstname_eng}
                            onSelect={() => {
                              field.onChange(emp.employee_id);
                              setOpenManager(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === emp.employee_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {emp.firstname_eng}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <TranslatedError fieldError={officialForm.formState.errors.manager_id} translations={errT} />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 items-center py-5">
          <div className="flex gap-4 px-5">
            <Button variant="outline" type="button" size="lg" className="w-full" onClick={() => router.back()}>
              {translations.buttons?.back || "Back"}
            </Button>
            <Button type="submit" size="lg" className="w-full">
              {translations.buttons?.next || "Next"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}