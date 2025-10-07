"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/src/utils/utils";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import Link from "next/link";
import { USER_TOKEN } from "@/src/utils/constants";
import { useRouter } from "next/navigation";
import Required from "@/src/components/ui/required";
import { RefreshIcon } from "@/src/icons/icons";
import { IoMdRefresh } from "react-icons/io";
import { Textarea } from "@/src/components/ui/textarea";
import toast from "react-hot-toast";

const formSchema = z.object({
  name_en: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  name_ar: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
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
  const { translations } = useLanguage();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name_en: "",
      name_ar: "",
    },
  });

  useEffect(() => {
    if (!selectedRowData) {
      form.reset();
    } else {
      form.reset({
        name_en: selectedRowData.name_en,
        name_ar: selectedRowData.name_ar,
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (selectedRowData) {
        onSave(selectedRowData.id, values);
        toast.success("Updating region!");
      } else {
        onSave(null, values);
        toast.success("Creating region!");
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
            name="name_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name (English) <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter the name in english" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name (العربية) <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter the name in arabic" type="text" {...field} />
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
              {translations.buttons.cancel}
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
