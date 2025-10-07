"use client";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/src/utils/utils";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label"
import { useRouter } from "next/navigation";
import Required from "@/src/components/ui/required";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";

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
  group: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
});

export default function FilterWeeklyScheduling() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: "",
      employee: "",
      group: "",
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
        <div className="grid grid-cols-3 gap-4 pb-4">
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-accent border-grey">
                      <Label className="font-normal text-secondary">
                        Organization :
                      </Label>
                      <SelectValue placeholder="Choose organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Organization 1 </SelectItem>
                    <SelectItem value="2">Organization 2</SelectItem>
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
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-accent border-grey">
                      <Label className="font-normal text-secondary">
                        Employee :
                      </Label>
                      <SelectValue placeholder="Choose user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Employee 1 </SelectItem>
                    <SelectItem value="2">Employee 2</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-accent border-grey">
                      <Label className="font-normal text-secondary">
                        Group :
                      </Label>
                      <SelectValue placeholder="Choose any group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Time Groups </SelectItem>
                    <SelectItem value="2">WorK Groups</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
