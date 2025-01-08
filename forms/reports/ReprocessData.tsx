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
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "@/icons/icons";
import { ForwardIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  code: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  category: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  levels: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  manager_flag: z.boolean(),
});

export default function ReprocessData() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
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
        <div className="grid lg:grid-cols-3 gap-4 ">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Code <Required />
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="choose any one" />
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
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="choose any one" />
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
          <FormField
            control={form.control}
            name="manager_flag"
            render={({ field }) => (
              <FormItem className="">
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="manager_flag"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel
                      htmlFor="manager_flag"
                      className="text-sm text-text-primary font-semibold"
                    >
                      Manager Flag
                    </FormLabel>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <div className="w-full flex gap-2 justify-end col-span-3">
            <Button type="submit" size={"lg"} variant={"destructive"}>
              <ForwardIcon size={20} />
              Take Action
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
