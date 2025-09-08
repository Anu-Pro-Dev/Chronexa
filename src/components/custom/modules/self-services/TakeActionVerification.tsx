"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider"

const formSchema = z.object({
  verification_remarks: z.string().min(1,{
    message:"required"  
  }),
});

export default function TakeActionVerification({
  on_open_change,
}: {
  on_open_change: any;
}) {
  const { translations } = useLanguage();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
        <div className="flex flex-col gap-8 mt-5">
          <div>
          <FormField
              control={form.control}
              name="verification_remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Remarks <Required /> </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add the remarks here" {...field} rows={8} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full flex gap-2 justify-end">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className=""
              onClick={() => on_open_change(false)}
            >
              {translations.buttons.cancel}
            </Button>
            <Button
              variant={"destructive"}
              type="button"
              size={"lg"}
              className=""
              onClick={() => on_open_change(false)}
            >
              Reject
            </Button>
            <Button type="submit" variant={"success"} size={"lg"} className="">
              Approve
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
