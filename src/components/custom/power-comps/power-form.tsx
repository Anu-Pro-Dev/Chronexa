"use client";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { useLanguage } from "@/src/providers/LanguageProvider"
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Required from "@/src/components/ui/required";
import { Calendar } from "@/src/components/ui/calendar";
import { useRouter } from "next/navigation";

export default function PowerForm({
  fields,
  form,
  onSubmit,
  state_route,
  input_width = "w-10/12 sm:w-[25em]",
  form_class,
  next_route,
  setPage,
}: {
  fields: any;
  form: any;
  onSubmit: any;
  state_route: any;
  input_width?: any;
  form_class?: any;
  next_route?: any;
  setPage?: any;
}) {
  const router = useRouter();
  const { translations } = useLanguage();
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className={form_class}>
          {fields.map((item: any, index: number) => (
            <div
              key={index}
              className={item.state_route === state_route ? "block" : "hidden"}
            >
              {item.state_route === state_route && (
                <FormField
                  control={form.control}
                  name={item.name}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      {item.type === "checkbox" && (
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={item.name}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <FormLabel
                              className="text-nowrap"
                              htmlFor={item.name}
                            >
                              {item.label}
                            </FormLabel>
                          </div>
                        </FormControl>
                      )}

                      {item.type === "input" && (
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <FormLabel
                              className="text-nowrap"
                              htmlFor={item.name}
                            >
                              {item.label}
                            </FormLabel>
                            <Input
                              type={item.input_type}
                              id={item.name}
                              {...field}
                              className={input_width}
                            />
                          </div>
                        </FormControl>
                      )}

                      {item.type === "select" && (
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <FormLabel
                              className="text-nowrap"
                              htmlFor={item.name}
                            >
                              {item.label}
                            </FormLabel>
                            <Select
                              {...field}
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose option" />
                              </SelectTrigger>
                              <SelectContent>
                                {item.items.map((option: any) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </FormControl>
                      )}

                      {item.type === "date" && (
                        <FormField
                          control={form.control}
                          name={item.name}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex gap-2 items-center">
                                <FormLabel className="text-nowrap">
                                  {item.label} {item.required && <Required />}
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full pl-3 text-left font-normal"
                                    >
                                      {field.value ? (
                                        format(new Date(field.value), "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </FormItem>
                          )}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          ))}

          <div className="w-full flex gap-2 items-center col-span-2 justify-end">
            <Button
              variant="outline"
              type="button"
              size="lg"
              onClick={() => {
                router.push("/employee-master");
              }}
            >
              {translations.buttons.cancel}
            </Button>
            {!next_route ? (
              <Button size="lg" type="submit">
                Save
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => {
                  setPage(next_route);
                }}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
