"use client";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { addOrganizationRequest, editOrganizationRequest } from "@/src/lib/apiHandler";

const formSchema = z.object({
  parent_type: z.string().default("").optional(),
  parent_name: z.string().default("").optional(),
  organization_type: z.string().default(""),
  organization_code: z.string().default("").transform((val) => val.toUpperCase()),
  organization_name: z.string().default(""),
});

export default function AddOrganizationType({
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

  const { data: organizationTypesData } = useFetchAllEntity("organizationType");
  const { data: organizationsData } = useFetchAllEntity("organization");

  const parentTypeOrgs = useMemo(() => {
    if (!organizationsData?.data) return [];
    let orgs = organizationsData.data.filter(
      (org: any) =>
        org.organization_type_id?.toString() === form.watch("parent_type")
    );
    if (
      selectedRowData?.parent_id &&
      !orgs.some((org: any) => org.organization_id === selectedRowData.parent_id)
    ) {
      const parentOrg = organizationsData.data.find(
        (org: any) => org.organization_id === selectedRowData.parent_id
      );
      if (parentOrg) orgs = [parentOrg, ...orgs];
    }
    return orgs;
  }, [organizationsData, form.watch("parent_type"), selectedRowData]);

  const addMutation = useMutation({
    mutationFn: addOrganizationRequest,
    onSuccess: (data) => {
      toast.success("Organization added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editOrganizationRequest,
    onSuccess: (_data, variables) => {
      toast.success("Organization updated successfully!");
      onSave(variables.organization_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const selectedOrgType = organizationTypesData?.data?.find(
        (item: any) => item.organization_type_id.toString() === values.organization_type
      );

      const selectedParentOrg = organizationsData?.data?.find(
        (item: any) => item.organization_id.toString() === values.parent_name
      );

      const payload: any = {
        organization_type_id: selectedOrgType?.organization_type_id ?? null,
        organization_code: values.organization_code,
        parent_id: selectedParentOrg?.organization_id ?? null,
      };

      if (language === "en") {
        payload.organization_eng = values.organization_name;
      } else {
        payload.organization_arb = values.organization_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          organization_id: selectedRowData.id,
          ...payload,
        });
      } else {
        addMutation.mutate(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (selectedRowData && organizationsData?.data && organizationTypesData?.data) {
      const parentOrg = organizationsData.data.find(
        (org: any) => org.organization_id === selectedRowData.parent_id
      );

      const parentTypeId = parentOrg?.organization_type_id?.toString() || "";
      const parentOrgId = selectedRowData.parent_id?.toString() || "";
      const orgTypeId = selectedRowData.organization_type_id?.toString() || "";

      const parentTypeExists = organizationTypesData.data.some(
        (type: any) => type.organization_type_id.toString() === parentTypeId
      );
      const orgTypeExists = organizationTypesData.data.some(
        (type: any) => type.organization_type_id.toString() === orgTypeId
      );

      setTimeout(() => {
        form.setValue("parent_type", parentTypeId);
        form.setValue("organization_type", orgTypeId);
        form.setValue("parent_name", parentOrgId);
        form.setValue("organization_code", selectedRowData.code || "");
        form.setValue("organization_name", 
          language === "en"
            ? selectedRowData.organization_eng || ""
            : selectedRowData.organization_arb || ""
        );
      }, 100);
    } else if (!selectedRowData) {
      form.reset({
        parent_type: "",
        parent_name: "",
        organization_type: "",
        organization_code: "",
        organization_name: "",
      });
    }
  }, [selectedRowData, organizationsData?.data, organizationTypesData?.data, language, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "parent_type" && !selectedRowData) {
        form.setValue("parent_name", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form, selectedRowData]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 gap-y-4 min-w-0">
            {/* Parent Type Dropdown */}
            <FormField
              control={form.control}
              name="parent_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Parent Type</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    key={`parent_type_${selectedRowData?.id || 'new'}`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose parent type" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationTypesData?.data?.map((type: any) => (
                        <SelectItem
                          key={type.organization_type_id}
                          value={type.organization_type_id.toString()}
                        >
                          {type.organization_type_eng}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1" />
                </FormItem>
              )}
            />
            
            {/* Parent Dropdown */}
            <FormField
              control={form.control}
              name="parent_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Parent
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    key={`parent_name_${selectedRowData?.id || 'new'}_${form.watch("parent_type")}`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose parent" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentTypeOrgs.map((org: any) => (
                        <SelectItem key={org.organization_id} value={org.organization_id.toString()}>
                          {language === "ar" ? org.organization_arb : org.organization_eng}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Organization Type Dropdown */}
            <FormField
              control={form.control}
              name="organization_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Organization Type<Required /></FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    key={`org_type_${selectedRowData?.id || 'new'}`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationTypesData?.data?.map((type: any) => (
                        <SelectItem
                          key={type.organization_type_id}
                          value={type.organization_type_id.toString()}
                        >
                          {type.organization_type_eng}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1" />
                </FormItem>
              )}
            />
            
            {/* Organization Code */}
            <FormField
              control={form.control}
              name="organization_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Organization code<Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter organization code"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Organization Name */}
            <FormField
              control={form.control}
              name="organization_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "ar"
                      ? "organization name (العربية) "
                      : "Organization name (English) "}
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter organization"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end gap-2 items-center">
            <div className="flex gap-4">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-full"
                onClick={() => on_open_change(false)}
              >
                {translations.buttons.cancel}
              </Button>
              <Button type="submit" size={"lg"} className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? selectedRowData
                    ? "Updating..."
                    : "Saving..."
                  : selectedRowData
                    ? "Update"
                    : "Save"
                }
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}