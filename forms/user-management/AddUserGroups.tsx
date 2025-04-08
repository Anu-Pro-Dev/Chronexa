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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import { addUserGroupRequest } from "@/lib/apiHandler"; // Import API request function
import { useLanguage } from "@/providers/LanguageProvider";

const formSchema = z.object({
    groupName: z.string().min(1, { message: "Required" }).max(100),
    descriptionEng: z.string().default(""),
    descriptionArb: z.string().default(""),
    from_date: z.date({
      required_error: "From Date is required.",
    }),
    to_date: z.date({
      required_error: "To Date is required.",
    }),
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

export default function AddUserGroups({
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
      groupName: "",
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
        groupName: selectedRowData.groupName,
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
        const response = await addUserGroupRequest(values.groupName, values.descriptionEng, values.descriptionArb);
        console.log("User group added successfully:", response);
        
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
        <div className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="descriptionEng"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                      Group name (English) {language === "en" && <Required />}
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="Enter group name" type="text" {...field} />
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
                    Group name (العربية) {language === "ar" && <Required />}
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="أدخل اسم الموقع" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    From Date <Required />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-white px-3 flex justify-between text-text-primary"
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yy")
                          ) : (
                            <span className="font-normal text-sm text-text-secondary">Choose date</span>
                          )}
                          <CalendarIcon />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    To Date <Required />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-white px-3 flex justify-between text-text-primary"
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yy")
                          ) : (
                            <span className="font-normal text-sm text-text-secondary">Choose date</span>
                          )}
                          <CalendarIcon />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>
                    Grouping <Required />
                  </FormLabel>
                  <FormControl>
                      <Input placeholder="Enter the group name" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />
          </div>
          <div className="w-full flex gap-2 items-center justify-end py-3">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-auto"
                onClick={() => on_open_change(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size={"lg"} className="w-auto">
                {selectedRowData ? "Update" : "Save"}
              </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}