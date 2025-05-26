
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
import { USER_TOKEN } from "@/utils/constants";
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
const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  value: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  tap_number: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  description: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
});

export default function AddApplicationSettings({
  on_open_change,
}: {
  on_open_change: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: "",
      tap_number: "",
      description: "",
    },
  });

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
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your Name" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Value <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your value"
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
            name="tap_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tap number</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose any one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-2 ">Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter the description" {...field} rows={8} />
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
              onClick={() => {
                on_open_change(false);
              }}
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
