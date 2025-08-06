"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Required from "@/components/ui/required";
import { useLanguage } from "@/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOrganizationTypeRequest, editOrganizationTypeRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  hierarchy: z.coerce.number(),
  organization_type_name: z.string().default(""),
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
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hierarchy: undefined,
      organization_type_name: "",
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        hierarchy: selectedRowData.org_type_level ?? "",
        organization_type_name:
          language === "en"
            ? selectedRowData.organization_type_eng ?? ""
            : selectedRowData.organization_type_arb ?? "",
      });
    } else {
      form.reset(); // clears on add
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addOrganizationTypeRequest,
    onSuccess: (data) => {
      toast.success("Organization Type added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["organizationType"] });
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
    mutationFn: editOrganizationTypeRequest,
    onSuccess: (_data, variables) => {
      toast.success("Organization Type updated successfully!");
      onSave(variables.organization_type_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["organizationType"] });
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
      const payload: any = {
        org_type_level: values.hierarchy,
      };

      // Add only the language-specific name being edited
      if (language === "en") {
        payload.organization_type_eng = values.organization_type_name;
      } else {
        payload.organization_type_arb = values.organization_type_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          organization_type_id: selectedRowData.id,
          ...payload,
        });
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
          <FormField
            control={form.control}
            name="hierarchy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hierarchy</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter the hierarchy"
                    type="number"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="organization_type_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {language === "ar"
                    ? "organization type name (العربية) "
                    : "Organization type name (English) "}
                  <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter organization type"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full flex gap-2 items-center py-3">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => on_open_change(false)}
            >
              Cancel
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
      </form>
    </Form>
  );
}
