"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  addOrganizationTypeRequest,
  editOrganizationTypeRequest,
} from "@/lib/apiHandler";
import { toast } from "react-hot-toast";

// Zod schema: allow 0 as valid hierarchy
const formSchema = z.object({
  hierarchyLimit: z
    .coerce.number({ required_error: "Hierarchy limit is required" })
    .min(1, { message: "Must be at least 1" })
    .max(99, { message: "Must be less than 100" }),

  hierarchy: z
    .number({ required_error: "Hierarchy is required" })
    .min(0, { message: "Must be 0 or higher" }),
  organizationTypeNameEng: z.string().default(""),
  organizationTypeNameArb: z.string().default(""),
});

// Language-aware refinement
const getSchema = (lang: "en" | "ar") =>
  formSchema.refine((data) => {
    if (lang === "en") return !!data.organizationTypeNameEng;
    if (lang === "ar") return !!data.organizationTypeNameArb;
    return true;
  }, {
    message: "Required",
    path: [lang === "en" ? "organizationTypeNameEng" : "organizationTypeNameArb"],
  });

export default function AddOrganizationType({
  on_open_change,
  selectedRowData,
  onSave,
  existingRows = [],
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
  existingRows: any[];
}) {
  const { language } = useLanguage();
  const [usedHierarchyOptions, setUsedHierarchyOptions] = useState<number[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hierarchyLimit: 0,
      hierarchy: undefined,
      organizationTypeNameEng: "",
      organizationTypeNameArb: "",
    },
  });

  const hierarchyLimitValue = form.watch("hierarchyLimit") || 0;
  const allHierarchyOptions = Array.from(
    { length: hierarchyLimitValue },
    (_, i) => i
  );

  // Track used hierarchy values as numbers
  useEffect(() => {
    const used = existingRows
      .filter((row) => row.hierarchy !== undefined && row.hierarchy !== null)
      .map((row) => Number(row.hierarchy));
    setUsedHierarchyOptions(used);
  }, [existingRows]);

  // Reset form when language changes (to trigger validation)
  useEffect(() => {
    form.reset(form.getValues());
  }, [language]);

  // Populate form on edit mode
  useEffect(() => {
    if (!selectedRowData) {
      form.reset();
    } else {
      form.reset({
        hierarchy:
          typeof selectedRowData.hierarchy === "number"
            ? selectedRowData.hierarchy
            : undefined,
        organizationTypeNameEng: selectedRowData.organizationTypeNameEng,
        organizationTypeNameArb: selectedRowData.organizationTypeNameArb,
      });
    }
  }, [selectedRowData, form]);

  // Exclude used options unless editing
  const availableHierarchyOptions = selectedRowData
    ? allHierarchyOptions
    : allHierarchyOptions.filter((opt) => !usedHierarchyOptions.includes(opt));

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (selectedRowData) {
        const response = await editOrganizationTypeRequest(
          selectedRowData.id,
          values.hierarchy,
          values.organizationTypeNameEng,
          values.organizationTypeNameArb
        );
        toast.success("Organization type updated successfully!");
        onSave(selectedRowData.id, values);
      } else {
        const response = await addOrganizationTypeRequest(
          values.hierarchy,
          values.organizationTypeNameEng,
          values.organizationTypeNameArb
        );
        toast.success("Organization type added successfully!");
        onSave(null, response);
      }

      on_open_change(false);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="hierarchyLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hierarchy Limit <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter hierarchy limit"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         <FormField
            control={form.control}
            name="hierarchy"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1">
                  Hierarchy <Required />
                </FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))} // convert back to number
                  value={
                    field.value !== undefined
                      ? field.value.toString().padStart(2, "0") // ensure padded string match
                      : ""
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose hierarchy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableHierarchyOptions.map((value) => (
                      <SelectItem key={value} value={value.toString().padStart(2, "0")}>
                        {value.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="mt-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="organizationTypeNameEng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Organization type (English) {language === "en" && <Required />}
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
          <FormField
            control={form.control}
            name="organizationTypeNameArb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Organization type (العربية) {language === "ar" && <Required />}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل نوع المنظمة"
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
              variant="outline"
              type="button"
              size="lg"
              className="w-full"
              onClick={() => on_open_change(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" className="w-full">
              {selectedRowData ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
