"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/providers/LanguageProvider";
import { Input } from "@/components/ui/input";

export default function FlagsForm({
  fields,
  form,
  onSubmit,
  state_route,
}: {
  fields: any;
  form: any;
  onSubmit: any;
  state_route: any;
}) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="lg:w-10/12 mx-auto pt-4"
      >
        <div className="grid lg:grid-cols-2 gap-10">
          {fields.map((field: any, index: number) => (
            <div key={index} className="flex gap-4 items-center">
              <>
                {field.state_route === state_route && (
                  <FormField
                    control={form.control}
                    name={field.name}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormControl>
                          {fields.type === "checkbox" && (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={field.name}
                                checked={formField.value}
                                onCheckedChange={formField.onChange}
                              />
                              <FormLabel htmlFor={field.name}>
                                {field.label}
                              </FormLabel>
                            </div>
                          )}
                          {fields.type === "input" && (
                            <div className="flex items-center gap-2">
                              <FormLabel htmlFor={field.name}>
                                {field.label}
                              </FormLabel>
                              <Input id={field.name} {...field} />
                            </div>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            </div>
          ))}
          <div className="w-full flex gap-2 items-center col-span-2 justify-end">
            <Button variant={"outline"} type="button" size={"lg"} className="">
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
