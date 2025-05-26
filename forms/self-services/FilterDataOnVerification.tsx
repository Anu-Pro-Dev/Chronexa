"use client";
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
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  verification: z.string().optional(),
  status: z.string().optional(),
  to_date: z.date().optional(),
  from_date: z.date().optional(),
});

export default function FilterDataOnVerification({
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
      return
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-8">
          <div>
            <FormField 
              control={form.control}
              name="verification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verifications</FormLabel>
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
                      <SelectItem value="1">1 </SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
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
                      <SelectItem value="1">1 </SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormField
                control={form.control}
                name="from_date"
                render={({ field }) => (
                    <FormItem className="">
                    <FormLabel>
                        From Date
                    </FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button size={"lg"} variant={"outline"}
                            className="w-full bg-accent px-3 flex justify-between text-text-primary"
                            >
                            {field.value ? (
                                format(field.value, "dd/MM/yy")
                            ) : (
                                <span className="font-normal text-sm text-text-secondary">Choose date</span>
                            )}
                            <CalendarIcon />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
              />
          </div>
          <div>
            <FormField
                control={form.control}
                name="to_date"
                render={({ field }) => (
                    <FormItem className="">
                    <FormLabel>
                        To Date
                    </FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button size={"lg"} variant={"outline"}
                            className="w-full bg-accent px-3 flex justify-between text-text-primary"
                            >
                            {field.value ? (
                                format(field.value, "dd/MM/yy")
                            ) : (
                                <span className="font-normal text-sm text-text-secondary">Choose date</span>
                            )}
                            <CalendarIcon />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
              />
          </div>

          <div className="w-full flex gap-2 justify-between">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => on_open_change(false)}
            >
              Clear filter
            </Button>
            <Button type="submit" size={"lg"} className="w-full">
              Apply
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
