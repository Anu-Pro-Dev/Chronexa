"use client";
import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useForm } from "react-hook-form";
import { debounce } from "lodash";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import Required from "@/src/components/ui/required";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addRoleRequest, editRoleRequest } from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  role_name: z
    .string()
    .min(1, { message: "role_name_required" })
    .max(100, { message: "role_name_max_length" }),
  editable_flag: z.boolean().default(true),
  // Stored as arrays inside the form; serialized to CSV string on submit
  verticals: z.array(z.string()).optional(),
  companies: z.array(z.string()).optional(),
});

export default function AddRole({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {
  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.configurations || {};
  const tReports = translations?.modules?.reports || {};
  const errT = translations?.formErrors || {};

  // Search terms for the multi-select dropdowns
  const [verticalSearchTerm, setVerticalSearchTerm] = useState("");
  const [companySearchTerm, setCompanySearchTerm] = useState("");

  // Selected ids for multi-select (source of truth for UI)
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role_name: "",
      editable_flag: true,
      verticals: [],
      companies: [],
    },
  });

  // Fetch all organizations once (verticals + companies live here)
  const { data: organizations } = useFetchAllEntity("organization", {
    searchParams: { limit: "1000" },
  });

  // Hydrate the form when editing an existing row
  useEffect(() => {
    if (selectedRowData) {
      // Parse comma-separated strings back into arrays
      const verticalsArr = selectedRowData.parent_ids
        ? String(selectedRowData.parent_ids).split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
      const companiesArr = selectedRowData.organization_ids
        ? String(selectedRowData.organization_ids).split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      form.reset({
        role_name: selectedRowData.role_name || "",
        editable_flag: selectedRowData.editable_flag ?? true,
        verticals: verticalsArr,
        companies: companiesArr,
      });
      setSelectedVerticals(verticalsArr);
      setSelectedCompanies(companiesArr);
    } else {
      form.reset({
        role_name: "",
        editable_flag: true,
        verticals: [],
        companies: [],
      });
      setSelectedVerticals([]);
      setSelectedCompanies([]);
    }
  }, [selectedRowData, form]);

  // Debounced search handlers (same pattern as reports page)
  const debouncedVerticalSearch = useCallback(
    debounce((v: string) => setVerticalSearchTerm(v), 300),
    []
  );
  const debouncedCompanySearch = useCallback(
    debounce((v: string) => setCompanySearchTerm(v), 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedVerticalSearch.cancel();
      debouncedCompanySearch.cancel();
    };
  }, [debouncedVerticalSearch, debouncedCompanySearch]);

  // Build the verticals list: parents found inside the org tree
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
    if (!verticalSearchTerm) return verticals;
    return verticals.filter((item: any) =>
      item.organization_eng?.toLowerCase().includes(verticalSearchTerm.toLowerCase()) ||
      item.organization_arb?.toLowerCase().includes(verticalSearchTerm.toLowerCase())
    );
  };

  // Companies whose parent_id is in selectedVerticals
  const getCompanyData = () => {
    if (!organizations?.data || selectedVerticals.length === 0) return [];
    const companies = organizations.data.filter((item: any) =>
      selectedVerticals.includes(String(item.parent_id))
    );
    if (!companySearchTerm) return companies;
    return companies.filter((item: any) =>
      item.organization_eng?.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
      item.organization_arb?.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  };

  // Toggle handlers
  const handleVerticalToggle = (verticalId: string) => {
    setSelectedVerticals(prev => {
      const next = prev.includes(verticalId)
        ? prev.filter(id => id !== verticalId)
        : [...prev, verticalId];
      form.setValue("verticals", next);

      // If a vertical is removed, drop any of its companies from the selection too
      if (prev.includes(verticalId) && organizations?.data) {
        const removedVerticalCompanies = organizations.data
          .filter((o: any) => String(o.parent_id) === verticalId)
          .map((o: any) => String(o.organization_id));
        setSelectedCompanies(prevCompanies => {
          const filtered = prevCompanies.filter(c => !removedVerticalCompanies.includes(c));
          form.setValue("companies", filtered);
          return filtered;
        });
      }
      return next;
    });
  };

  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanies(prev => {
      const next = prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId];
      form.setValue("companies", next);
      return next;
    });
  };

  const getVerticalPlaceholder = () => {
    if (selectedVerticals.length === 0) return t.placeholder_vertical || tReports.placeholder_vertical || "Choose vertical";
    return `${selectedVerticals.length} ${t.vertical || tReports.vertical || "vertical"}${selectedVerticals.length > 1 ? "s" : ""} ${t.selected || tReports.selected || "selected"}`;
  };

  const getCompanyPlaceholder = () => {
    if (selectedCompanies.length === 0) return t.placeholder_company || tReports.placeholder_company || "Choose company";
    return `${selectedCompanies.length} ${t.company || tReports.company || "company"}${selectedCompanies.length > 1 ? "s" : ""} ${t.selected || tReports.selected || "selected"}`;
  };

  const addMutation = useMutation({
    mutationFn: addRoleRequest,
    onSuccess: (data) => {
      showToast("success", "addrole_success");
      queryClient.invalidateQueries({ queryKey: ["secRole"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editRoleRequest,
    onSuccess: () => {
      showToast("success", "updaterole_success");
      queryClient.invalidateQueries({ queryKey: ["secRole"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error");
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Serialize multi-select to CSV strings.
      // NULL when nothing selected — per requirements.
      const parent_ids = selectedVerticals.length > 0
        ? selectedVerticals.join(",")
        : null;

      const organization_ids = selectedCompanies.length > 0
        ? selectedCompanies.join(",")
        : null;

      const payload: any = {
        role_name: values.role_name,
        editable_flag: values.editable_flag,
        parent_ids,
        organization_ids,
      };

      if (selectedRowData) {
        const roleId = selectedRowData.role_id || selectedRowData.id;
        editMutation.mutate({ role_id: roleId, ...payload });
      } else {
        addMutation.mutate(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
          {/* Role name (unchanged) */}
          <FormField
            control={form.control}
            name="role_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t.role_name || "Role Name"} <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.placeholder_role_name || "Enter the role name"}
                    type="text"
                    {...field}
                  />
                </FormControl>
                <TranslatedError
                  fieldError={form.formState.errors.role_name}
                  translations={errT}
                />
              </FormItem>
            )}
          />

          {/* Vertical — multi-select */}
          <FormField
            control={form.control}
            name="verticals"
            render={() => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.vertical || tReports.vertical || "Vertical"}
                </FormLabel>
                <Select>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={getVerticalPlaceholder()} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    showSearch={true}
                    searchPlaceholder={tReports.search_verticals || "Search verticals..."}
                    onSearchChange={debouncedVerticalSearch}
                    className="mt-5 w-full"
                  >
                    {getVerticalData().length === 0 && verticalSearchTerm && (
                      <div className="p-3 text-sm text-text-secondary">
                        {tReports.no_verticals_found || "No verticals found"}
                      </div>
                    )}
                    {getVerticalData().map((item: any) => {
                      const verticalValue = String(item.organization_id);
                      const isChecked = selectedVerticals.includes(verticalValue);
                      return (
                        <div
                          key={item.organization_id}
                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleVerticalToggle(verticalValue);
                          }}
                        >
                          <Checkbox checked={isChecked} className="mr-2" />
                          <span>
                            {language === "ar" ? item.organization_arb : item.organization_eng}
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

          {/* Company — multi-select, depends on vertical selection */}
          <FormField
            control={form.control}
            name="companies"
            render={() => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  {t.company || tReports.company || "Company"}
                </FormLabel>
                <Select disabled={selectedVerticals.length === 0}>
                  <FormControl>
                    <SelectTrigger className="w-full" disabled={selectedVerticals.length === 0}>
                      <SelectValue
                        placeholder={
                          selectedVerticals.length === 0
                            ? (t.select_vertical_first || "Select vertical first")
                            : getCompanyPlaceholder()
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    showSearch={true}
                    searchPlaceholder={tReports.search_companies || "Search companies..."}
                    onSearchChange={debouncedCompanySearch}
                    className="mt-5 w-full"
                  >
                    {getCompanyData().length === 0 && companySearchTerm && (
                      <div className="p-3 text-sm text-text-secondary">
                        {tReports.no_companies_found || "No companies found"}
                      </div>
                    )}
                    {getCompanyData().length === 0 && !companySearchTerm && (
                      <div className="p-3 text-sm text-text-secondary">
                        {t.no_companies_available || "No companies available"}
                      </div>
                    )}
                    {getCompanyData().map((item: any) => {
                      const companyValue = String(item.organization_id);
                      const isChecked = selectedCompanies.includes(companyValue);
                      return (
                        <div
                          key={item.organization_id}
                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCompanyToggle(companyValue);
                          }}
                        >
                          <Checkbox checked={isChecked} className="mr-2" />
                          <span>
                            {language === "ar" ? item.organization_arb : item.organization_eng}
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

          {/* Editable flag (unchanged) */}
          <FormField
            control={form.control}
            name="editable_flag"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal px-2">
                  {t.editable || "Editable"}
                </FormLabel>
              </FormItem>
            )}
          />

          {/* Action buttons (unchanged) */}
          <div className="w-full flex gap-2 items-center py-3">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => on_open_change(false)}
            >
              {translations.buttons.cancel}
            </Button>
            <Button
              type="submit"
              size={"lg"}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? selectedRowData
                  ? translations.buttons.updating || "Updating..."
                  : translations.buttons.saving || "Saving..."
                : selectedRowData
                  ? translations.buttons.update || "Update"
                  : translations.buttons.save || "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}