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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/providers/LanguageProvider";
const formSchema = z.object({
  code: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  description_en: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  description_ar: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  reason_mode: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  web_punch: z.boolean().optional(),
  geo_fence_required: z.boolean().optional(),
});

export default function AddReason({ on_open_change }: { on_open_change: any }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      description_en: "",
      description_ar: "",
    },
  });
  // const { dir } = useLanguage();
  const router = useRouter();
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="grid lg:grid-cols-2 gap-10">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Code <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your Code" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reason_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason Mode</FormLabel>
                <Select
                  // dir={dir}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose reason mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="m@example.com">Reason</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description (English) <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Type.." type="text" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Prompt message <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Type.." type="text" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description (العربية) <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Type.." type="text" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4 items-center">
            <FormField
              control={form.control}
              name="web_punch"
              render={({ field }) => (
                <FormItem className="">
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="web_punch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel htmlFor="web_punch">Web Punch</FormLabel>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="geo_fence_required"
              render={({ field }) => (
                <FormItem className="">
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="geo_fence_required"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel htmlFor="geo_fence_required">
                        Geo fence required
                      </FormLabel>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="w-full flex gap-2 items-center col-span-2 justify-end">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className=""
              onClick={() => on_open_change(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size={"lg"} className="">
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
