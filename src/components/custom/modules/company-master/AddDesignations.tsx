"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDesignationRequest, editDesignationRequest } from "@/src/lib/apiHandler";

const formSchema = z.object({
  designation_code: z.string().default("").transform((val) => val.toUpperCase()),
  designation_name: z.string().default(""),
});

export default function AddDesignations({
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
  const t = translations?.modules?.companyMaster || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      designation_code:"",
      designation_name: "",
    },
  });

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        designation_code: selectedRowData.designation_code ?? "",
        designation_name:
          language === "en"
            ? selectedRowData.designation_eng ?? ""
            : selectedRowData.designation_arb ?? "",
      });
    } else {
      form.reset(); // clears on add
    }
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addDesignationRequest,
    onSuccess: (data) => {
      toast.success("Designation added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["designation"] });
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
    mutationFn: editDesignationRequest,
    onSuccess: (_data, variables) => {
      toast.success("Designation updated successfully!");
      onSave(variables.designation_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["designation"] });
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
        designation_code: values.designation_code,
      };

      // Add only the language-specific name being edited
      if (language === "en") {
        payload.designation_eng = values.designation_name;
      } else {
        payload.designation_arb = values.designation_name;
      }

      if (selectedRowData) {
        editMutation.mutate({
          designation_id: selectedRowData.id,
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div className="grid gap-16 gap-y-4">
            <FormField
              control={form.control}
              name="designation_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.designation_code}<Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter designation code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation_name"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                    {language === "ar"
                      ? "Designation name (العربية) "
                      : "Designation name (English) "}
                    <Required />
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="Enter designation name" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
            />
          </div>
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
            <Button type="submit" size={"lg"} className="w-full" disabled={isSubmitting}>
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
      </form>
    </Form>
  );
}