"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
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
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  code: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  workflows: z
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
  need_approval: z.boolean(),
  offical: z.boolean(),
  attachment: z.boolean(),
  justification: z.boolean(),
});

export default function AddLeaveTypes({
  on_open_change,
}: {
  on_open_change?: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      descriptionEng: "",
      descriptionArb: "",
      workflows: "",
      need_approval: false,
      offical: false,
      attachment: false,
      justification: false,
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
        <div className="pb-3">
          <h1 className="font-bold text-xl text-primary">Manage Leaves</h1>
          {/* <h1 className="font-semibold text-sm text-text-secondary">
            Select the choices for leave types
          </h1> */}
        </div>
        <div className="flex flex-col gap-6">
          <div className="p-5">
            <div className="grid sm:grid-cols-2 gap-y-3 gap-x-16 md:px-5 [&>*]:max-w-[350px] [&>*:nth-child(2n)]:justify-self-end md:[&>*:nth-child(2n)]:min-w-[350px]">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Code <Required />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the code" type="text" {...field} className="max-w-[350px]"/>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workflows"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflows <Required /></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose workflows" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Leaves</SelectItem>
                        <SelectItem value="2">Permissions</SelectItem>
                        <SelectItem value="3">Missing movements</SelectItem>
                        <SelectItem value="4">Manual movements</SelectItem>
                      </SelectContent>
                    </Select>

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
                      <Input placeholder="Enter the description in english" type="text" {...field} />
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
                      Description (العربية) <Required />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the description in arabic" type="text" {...field} />
                    </FormControl>
    
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="px-5 pt-5 grid space-y-4">
              <Label>Leave  attributes</Label>
              <div className="flex gap-6">
                <FormField
                  control={form.control}
                  name="need_approval"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="need_approval"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="need_approval" className="text-sm font-semibold">Need approval</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="offical"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="offical"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="offical" className="text-sm font-semibold">Offical</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attachment"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="attachment"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="attachment" className="text-sm font-semibold">Allow attachment</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="justification"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="justification"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel htmlFor="justification" className="text-sm font-semibold">Mandatory Justification</FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 items-center px-5 pb-5">
            <div className="flex gap-4 px-5">
              <Button
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-full"
                onClick={() => router.push("/self-services/leaves/manage/")}
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
