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

export default function AddRole({ on_open_change }: { on_open_change: any }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name_en: "",
      name_ar: "",
    },
  });

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
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name(English) <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Type here..." type="text" {...field} />
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
                  Name [العربية] <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Type here..." type="text" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full flex gap-2 items-center">
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
