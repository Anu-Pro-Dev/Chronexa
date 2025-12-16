"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import {
  addOrganizationRequest,
  editOrganizationRequest,
} from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  parent_type: z.string().optional().or(z.literal("")),
  parent_name: z.string().optional().or(z.literal("")),
  organization_type: z.string().min(1, { message: "organization_type_required" }),
  organization_code: z
    .string()
    .min(1, { message: "organization_code_required" })
    .transform((val) => val.toUpperCase()),
  organization_name: z.string().min(1, { message: "organization_name_required" }),
});

export default function AddOrganization({
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
  const t = translations?.modules?.organization || {};
  const errT = translations?.formErrors || {};

  const [parentTypeSearch, setParentTypeSearch] = useState("");
  const [parentSearch, setParentSearch] = useState("");
  const [orgTypeSearch, setOrgTypeSearch] = useState("");

  const { data: organizationTypesData } = useFetchAllEntity("organizationType", {
    removeAll: true,
  });
  const { data: orgStructureData } = useFetchAllEntity("organization", {
    endpoint: `/organization/structure`,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parent_type: "",
      parent_name: "",
      organization_type: "",
      organization_code: "",
      organization_name: "",
    },
  });

  const flattenOrganizations = (orgs: any[]): any[] =>
    (orgs || []).reduce((acc: any[], org: any) => {
      const { children, ...rest } = org;
      acc.push(rest);
      if (children?.length) acc.push(...flattenOrganizations(children));
      return acc;
    }, []);
  const flatOrganizations = useMemo(
    () => flattenOrganizations(orgStructureData?.data || []),
    [orgStructureData]
  );

  const debouncedParentTypeSearch = useCallback(debounce((s) => setParentTypeSearch(s), 300), []);
  const debouncedParentSearch = useCallback(debounce((s) => setParentSearch(s), 300), []);
  const debouncedOrgTypeSearch = useCallback(debounce((s) => setOrgTypeSearch(s), 300), []);

  const getFilteredParentTypes = () => {
    let list = organizationTypesData?.data || [];
    if (parentTypeSearch) {
      const s = parentTypeSearch.toLowerCase();
      list = list.filter(
        (t: any) =>
          t.organization_type_eng?.toLowerCase().includes(s) ||
          t.organization_type_arb?.toLowerCase().includes(s)
      );
    }
    return list;
  };

  const getFilteredParents = () => {
    const parentTypeId = form.watch("parent_type");
    if (!parentTypeId) return [];
    let list = flatOrganizations.filter(
      (org: any) => org.organization_type_id?.toString() === parentTypeId.toString()
    );
    if (parentSearch) {
      const s = parentSearch.toLowerCase();
      list = list.filter(
        (o: any) =>
          o.organization_eng?.toLowerCase().includes(s) ||
          o.organization_arb?.toLowerCase().includes(s)
      );
    }
    return list;
  };

  const getFilteredOrgTypes = () => {
    let list = organizationTypesData?.data || [];
    const parentId = form.watch("parent_name");
    if (parentId) {
      const parentOrg = flatOrganizations.find(
        (o: any) => o.organization_id?.toString() === parentId
      );
      if (parentOrg) {
        const parentTypeId = parentOrg.organization_type_id;
        list = list.filter((t: any) => t.organization_type_id > parentTypeId);
      }
    }
    if (orgTypeSearch) {
      const s = orgTypeSearch.toLowerCase();
      list = list.filter(
        (t: any) =>
          t.organization_type_eng?.toLowerCase().includes(s) ||
          t.organization_type_arb?.toLowerCase().includes(s)
      );
    }
    return list;
  };

  const addMutation = useMutation({
    mutationFn: addOrganizationRequest,
    onSuccess: (data) => {
      showToast("success", "addorg_success");
      onSave(null, data.data);
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
    mutationFn: editOrganizationRequest,
    onSuccess: (_d, variables) => {
      showToast("success", "updateorg_success");
      onSave(variables.organization_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["organization"] });
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
      const selectedOrgType = organizationTypesData?.data?.find(
        (t: any) => t.organization_type_id.toString() === values.organization_type
      );

      const parentOrg = flatOrganizations.find(
        (o: any) => o.organization_id.toString() === values.parent_name
      );

      const payload: any = {
        organization_type_id: Number(selectedOrgType?.organization_type_id) || null,
        organization_code: values.organization_code,
      };

      if (parentOrg) payload.parent_id = Number(parentOrg.organization_id);

      if (language === "en") payload.organization_eng = values.organization_name;
      else payload.organization_arb = values.organization_name;

      if (selectedRowData) {
        editMutation.mutate({ organization_id: selectedRowData.id, ...payload });
      } else {
        addMutation.mutate(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  }
    useEffect(() => {
    setParentTypeSearch("");
    setParentSearch("");
    setOrgTypeSearch("");
    
    if (selectedRowData && organizationTypesData?.data && flatOrganizations?.length) {
      let parentOrg = null;
      
      if (selectedRowData.parent_id) {
        parentOrg = flatOrganizations.find(
          (o: any) => Number(o.organization_id) === Number(selectedRowData.parent_id)
        );
      }
      
      const formValues = {
        parent_type: parentOrg?.organization_type_id?.toString() || "",
        parent_name: selectedRowData.parent_id?.toString() || "",
        organization_type: selectedRowData.organization_type_id?.toString() || "",
        organization_code: selectedRowData.code || selectedRowData.organization_code || "",
        organization_name:
          language === "en"
            ? selectedRowData.organization_eng || ""
            : selectedRowData.organization_arb || "",
      };
      
      form.reset({
        parent_type: "",
        parent_name: "",
        organization_type: "",
        organization_code: "",
        organization_name: "",
      });
      
      setTimeout(() => {
        form.reset(formValues);
      }, 50);
      
    } else {
      form.reset({
        parent_type: "",
        parent_name: "",
        organization_type: "",
        organization_code: "",
        organization_name: "",
      });
    }
  }, [selectedRowData, organizationTypesData, flatOrganizations, language, form]);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-4 min-w-0">
            <FormField
              control={form.control}
              name="parent_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.parent_type}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="max-w-[350px] 3xl:max-w-[450px]">
                      <SelectValue placeholder={t.placeholder_parent_type} />
                    </SelectTrigger>
                    <SelectContent
                      showSearch
                      searchPlaceholder={t.search}
                      onSearchChange={debouncedParentTypeSearch}
                    >
                      {getFilteredParentTypes().map((p: any) => (
                        <SelectItem
                          key={p.organization_type_id}
                          value={p.organization_type_id.toString()}
                        >
                          {language === "ar" ? p.organization_type_arb : p.organization_type_eng}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TranslatedError fieldError={form.formState.errors.parent_type} translations={errT} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.parent}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="max-w-[350px] 3xl:max-w-[450px]">
                      <SelectValue placeholder={t.placeholder_parent} />
                    </SelectTrigger>
                    <SelectContent
                      showSearch
                      searchPlaceholder={t.search}
                      onSearchChange={debouncedParentSearch}
                    >
                      {getFilteredParents().map((o: any) => (
                        <SelectItem key={o.organization_id} value={o.organization_id.toString()}>
                          {language === "ar" ? o.organization_arb : o.organization_eng}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TranslatedError fieldError={form.formState.errors.parent_name} translations={errT} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.org_type}
                    <Required />
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="max-w-[350px] 3xl:max-w-[450px]">
                      <SelectValue placeholder={t.placeholder_org_type} />
                    </SelectTrigger>
                    <SelectContent
                      showSearch
                      searchPlaceholder={t.search}
                      onSearchChange={debouncedOrgTypeSearch}
                    >
                      {getFilteredOrgTypes().map((t: any) => (
                        <SelectItem
                          key={t.organization_type_id}
                          value={t.organization_type_id.toString()}
                        >
                          {language === "ar" ? t.organization_type_arb : t.organization_type_eng}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TranslatedError
                    fieldError={form.formState.errors.organization_type}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.org_code}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t.placeholder_org_code} />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.organization_code}
                    translations={errT}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "ar"
                      ? `${t.org_name} (العربية)`
                      : `${t.org_name} (English)`}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t.placeholder_org}
                      className={language === "ar" ? "text-right" : "text-left"}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.organization_name}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
        </div>

        <div className="flex justify-end gap-2 items-center py-2">
          <div className="flex gap-4">
            <Button
              variant="outline"
              type="button"
              size="lg"
              className="w-full"
              onClick={() => on_open_change(false)}
            >
              {translations.buttons.cancel}
            </Button>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? selectedRowData
                  ? translations.buttons.updating
                  : translations.buttons.saving
                : selectedRowData
                ? translations.buttons.update
                : translations.buttons.save}
            </Button>
          </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
