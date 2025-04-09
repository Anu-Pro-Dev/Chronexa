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
import { addLocationRequest } from "@/lib/apiHandler"; // Import API request function
import { useLanguage } from "@/providers/LanguageProvider";

const formSchema = z.object({
    hierarchy: z.string().min(1, { message: "Required" }).max(100),
    organizationTypeEng: z.string().default(""),
    organizationTypeArb: z.string().default(""),
});

const getSchema = (lang: "en" | "ar") =>
    formSchema.refine((data) => {
        if (lang === "en") return !!data.organizationTypeEng;
        if (lang === "ar") return !!data.organizationTypeArb;
        return true;
    }, {
        message: "Required",
        path: [lang === "en" ? "organizationTypeEng" : "organizationTypeArb"],
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

  const {language } = useLanguage();
  const allHierarchyOptions = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"];
  const [usedHierarchyOptions, setUsedHierarchyOptions] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hierarchy: "",
      organizationTypeEng: "",
      organizationTypeArb: "",
    },
  });

  useEffect(() => {
    const used = existingRows
      .filter(row => row.hierarchy !== undefined && row.hierarchy !== null)
      .map(row => String(row.hierarchy)); // Ensure it's string
    setUsedHierarchyOptions(used);
  }, [existingRows]);

  useEffect(() => {
    form.reset(form.getValues());
  }, [language]);

  useEffect(() => {
    if (!selectedRowData) {
      form.reset();
    } else {
      form.reset({
        hierarchy: selectedRowData.hierarchy,
        organizationTypeEng: selectedRowData.organizationTypeEng,
        organizationTypeArb: selectedRowData.organizationTypeArb,
      });
    }
  }, [selectedRowData, form]);

  const availableHierarchyOptions = selectedRowData
  ? allHierarchyOptions
  : allHierarchyOptions.filter((opt) => !usedHierarchyOptions.includes(opt));

  const handleSave = () => {
    const formData = form.getValues();
    if (selectedRowData) {
      onSave(selectedRowData.id, formData);
    } else {
      onSave(null, formData);
    }
    on_open_change(false);
  };

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Submitting:", values);

      if (selectedRowData) {
        onSave(selectedRowData.id, values);
      } else {
        const response = await addLocationRequest(values.hierarchy, values.organizationTypeEng);
        console.log("Location added successfully:", response);
        
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
            name="hierarchy"
            render={({ field }) => (
            <FormItem>
                <FormLabel className="flex gap-1">Hierarchy <Required/> </FormLabel>
                <div>
                  <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose hierarchy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableHierarchyOptions.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
                </div>
            </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="organizationTypeEng"
            render={({ field }) => (
            <FormItem>
                <FormLabel>
                  Organization type (English) {language === "en" && <Required />}
                </FormLabel>
                <FormControl>
                <Input placeholder="Enter organization type" type="text" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="organizationTypeArb"
            render={({ field }) => (
            <FormItem>
                <FormLabel>
                  Organization type (العربية) {language === "ar" && <Required />}
                </FormLabel>
                <FormControl>
                <Input placeholder="أدخل نوع المنظمة" type="text" {...field} />
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
              <Button type="submit" size={"lg"} className="w-full">
                {selectedRowData ? "Update" : "Save"}
              </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}