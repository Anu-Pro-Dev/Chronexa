"use client";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/lib/utils";
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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { USER_TOKEN } from "@/lib/Instance";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import { RefreshIcon } from "@/icons/icons";
import { IoMdRefresh } from "react-icons/io";
import { Textarea } from "@/components/ui/textarea";

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name_en: "",
      name_ar: "",
    },
  });

  useEffect(() => {
    if (!selectedRowData) {
      form.reset(); // Reset the form values when in "Add" mode
    } else {
      form.reset({
        name_en: selectedRowData.name_en,
        name_ar: selectedRowData.name_ar,
      }); // Pre-fill the form when in "Edit" mode
    }
  }, [selectedRowData, form]);

  const handleSave = () => {
    const formData = form.getValues(); // Get the form data directly from the hook
    if (selectedRowData) {
      // Update existing row
      onSave(selectedRowData.id, formData);
    } else {
      // Add new row
      onSave(null, formData);
    }
    on_open_change(false); // Close modal after saving
  };

  const router = useRouter();

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      // Handle form submission: Add or Update logic based on whether it's edit mode or not
      if (selectedRowData) {
        // Update logic (edit mode)
        onSave(selectedRowData.id, values);
        console.log("Updating region:", values);
      } else {
        // Add logic (create mode)
        onSave(null, values);
        console.log("Creating region:", values);
      }
      on_open_change(false); // Close the modal after submission
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
