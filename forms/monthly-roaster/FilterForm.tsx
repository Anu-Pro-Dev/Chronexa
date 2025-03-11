"use client";

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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { USER_TOKEN } from "@/lib/Instance";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";

import { CopyIcon } from "@/icons/icons";
import {
  SelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  organization: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  version_no: z
    .string()
    .optional(),
  manager: z
    .string()
    .optional(),
  apply_version_filter: z.boolean(),
  day: z
    .string()
    .optional(),
  employee: z
    .string()
    .optional(),

  month: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  schedule: z
    .string()
    .optional(),
  year: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  group: z
    .string()
    .optional(),
});

export default function FilterForm({
  on_open_change,
}: {
  on_open_change: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
        <div className="flex justify-between">
          <div className="pb-6">
              <h1 className="font-bold text-xl text-primary pb-2">Filter</h1>
              <h1 className="font-semibold text-sm text-text-secondary pb-2">
                Select the Filters for further process
              </h1>
          </div>
          </div>
        <div className="grid lg:grid-cols-2 gap-10">
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Organization <Required />
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose any one" />
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
            name="version_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Version No 
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose any one" />
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
            name="manager"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Manager 
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose any one" />
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
            name="apply_version_filter"
            render={({ field }) => (
              <FormItem className="">
                <FormControl>
                  <div className="flex items-center gap-2 pt-4">
                    <Checkbox
                      id="apply_version_filter"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel
                      htmlFor="apply_version_filter"
                      className="text-sm text-text-primary font-semibold"
                    >
                      Apply version filter
                    </FormLabel>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Employee 
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose any one" />
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
            name="day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Day 
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose any one" />
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
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Month <Required />
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose any one" />
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
            name="schedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Schedule 
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose any one" />
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
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Year <Required />
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose any one" />
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
            name="group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Group
                </FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose any one" />
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
        <div className="flex justify-end gap-2 items-center py-5">
          <div className="flex gap-4 px-1">
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
