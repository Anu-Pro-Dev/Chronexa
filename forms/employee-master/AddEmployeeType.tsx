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
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import { addEmployeeTypeRequest } from "@/lib/apiHandler"; // Import API request function
import { useLanguage } from "@/providers/LanguageProvider";

const formSchema = z.object({
    typeName: z.string().min(1, { message: "Required" }).max(100),
    descriptionEng: z.string().default(""),
    descriptionArb: z.string().default(""),
});

const getSchema = (lang: "en" | "ar") =>
    formSchema.refine((data) => {
        if (lang === "en") return !!data.descriptionEng;
        if (lang === "ar") return !!data.descriptionArb;
        return true;
    }, {
        message: "Required",
        path: [lang === "en" ? "descriptionEng" : "descriptionArb"],
});

export default function AddEmployeeType({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {

    const {language } = useLanguage();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            typeName: "",
            descriptionEng: "",
            descriptionArb: "",
        },
    });

    useEffect(() => {
      form.reset(form.getValues());
    }, [language]);
  
    useEffect(() => {
      if (!selectedRowData) {
        form.reset();
      } else {
        form.reset({
            typeName: selectedRowData.typeName,
            descriptionEng: selectedRowData.descriptionEng,
            descriptionArb: selectedRowData.descriptionArb,
        });
      }
    }, [selectedRowData, form]);
  
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
          const response = await addEmployeeTypeRequest(values.typeName, values.descriptionEng, values.descriptionArb);
          console.log("Employee type added successfully:", response);
          
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
            name="typeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                    Type Name <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter the name" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionEng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                    Type of Employee (English) <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter description here..." type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionArb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                    Type of Employee (العربية) <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter description here..." type="text" {...field} />
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
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}