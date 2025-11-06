"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/src/lib/utils";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { useLanguage } from "@/src/providers/LanguageProvider"

const formSchema = z.object({
  organization: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  employee: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  subject: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  body: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
});

export default function AddAnnoucement() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: "",
      employee: "",
      subject: "",
      body: "",
    },
  });
  const { translations } = useLanguage();
  const router = useRouter();
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      return;
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-6 bg-accent p-6 rounded-2xl">
          <div className="">
            <h1 className="font-bold text-xl text-primary">Email Settings</h1>
          </div>
          <div className="px-5 py-3 flex flex-col">
            <div className="flex justify-start items-center gap-10">
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-center flex-1">
                    <FormLabel className="flex gap-2">Organization <Required/> </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="max-w-[350px]">
                          <SelectValue placeholder="Choose organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">organization 1</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employee"
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-center flex-1">
                    <FormLabel className="flex gap-2">Employee <Required/> </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="max-w-[350px]">
                          <SelectValue placeholder="Choose employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1employee 12</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="flex items-center gap-12">
                  <FormLabel className="flex gap-2 pt-2">
                    Subject <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your subject"
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
              name="body"
              render={({ field }) => (
                <FormItem className="flex items-center gap-16">
                  <FormLabel className="flex gap-2 ">Body <Required /></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the context of the body" {...field} rows={8} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2 items-center py-3">
            <div className="flex gap-4 px-5">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-full"
                onClick={() => router.push("/settings/announcements")}
              >
                {translations.buttons.cancel}
              </Button>
              <Button type="submit" size={"lg"} className="w-full">
                Save
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
