"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  code: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  name_eng: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  name_arb: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  ip_address: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  port: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  building: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  location: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  enable: z.boolean(),
});

export default function AddDevicesStatus({
  on_open_change,
}: {
  on_open_change?: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name_eng: "",
      name_arb: "",
      ip_address: "",
      port: "",
      building: "",
      location: "",
      enable: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-accent">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  const router = useRouter();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
        {/* <div className="pb-3">
          <h1 className="font-bold text-xl text-primary">Readers</h1>
          <h1 className="font-semibold text-sm text-text-secondary">
            Select the choices for readers devices status
          </h1>
        </div> */}
        <div className="flex flex-col gap-6">
          <div className="p-5 flex flex-col">
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
                  name="name_eng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name(English) <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the name" type="text" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ip_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        IP Address <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter IP address" type="text" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Location <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the location" type="text" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enable"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="enable"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="enable" className="text-sm font-semibold">Enable</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col flex-1 max-w-[350px] gap-5">
                <FormField
                  control={form.control}
                  name="building"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buildings <Required/> </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose building" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">building 1</SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name_arb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name(العربي) <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the name" type="text" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Port <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the port" type="text" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 items-center pb-5">
            <div className="flex gap-4 px-5">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-full"
                onClick={() => router.push("/devices/devices-status")}
              >
                Cancel
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
