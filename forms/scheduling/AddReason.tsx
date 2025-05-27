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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { USER_TOKEN } from "@/utils/constants";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
const formSchema = z.object({
  code: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  descriptionEng: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  descriptionArb: z
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
  prompt_message: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  web_punch: z.boolean().optional(),
  geo_fence_required: z.boolean().optional(),
});

export default function AddHoliday({
  on_open_change,
}: {
  on_open_change: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      descriptionEng: "",
      descriptionArb: "",
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
        <div className="flex flex-col gap-6">
          <div className="p-5 pb-0 flex flex-col">
            <div className="flex justify-between items-start gap-10">
              <div className="flex flex-col flex-1 max-w-[350px] gap-5">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Code <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the code" type="text" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descriptionEng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description (English) <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description in english" type="text" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prompt_message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt message <Required/></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the prompt message" type="text" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col flex-1 max-w-[350px] gap-5">
                <FormField
                  control={form.control}
                  name="reason_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason mode <Required /></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 </SelectItem>
                          <SelectItem value="2">2</SelectItem>
                        </SelectContent>
                      </Select>

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
                        Description (العربية) <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description in arabic" type="text" {...field} />
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
                            <FormLabel htmlFor="web_punch">Web punch</FormLabel>
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
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 items-center pb-5">
            <div className="flex gap-4 px-5">
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
        </div>
      </form>
    </Form>
  );
}
