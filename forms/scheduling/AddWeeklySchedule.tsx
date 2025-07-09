"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@/icons/icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOrgScheduleRequest, editOrgScheduleRequest, getScheduleByOrganization } from "@/lib/apiHandler";

const formSchema = z.object({
  from_date: z.date().nullable().optional(),
  to_date: z.date().nullable().optional(),
  organization_id: z.coerce.number().optional(),
  schedule_id: z.coerce.number().optional(),
  sunday_schedule_id: z.coerce.number().optional(),
  monday_schedule_id: z.coerce.number().optional(),
  tuesday_schedule_id: z.coerce.number().optional(),
  wednesday_schedule_id: z.coerce.number().optional(),
  thursday_schedule_id: z.coerce.number().optional(),
  friday_schedule_id: z.coerce.number().optional(),
  saturday_schedule_id: z.coerce.number().optional(),
  attachment: z.custom<any>(
    (value) => {
      if (!(value instanceof File)) {
        return false; // Ensure the value is a File object
      }
      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (value.size > maxSize) {
        return false;
      }

      // Validate file type (e.g., allow only images)
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(value.type)) {
        return false;
      }

      return true;
    },
    {
      message:
        "Invalid file. Ensure it's an image (JPEG/PNG) and less than 5MB.",
    }
  ).optional(),
});

export default function AddWeeklySchedule({
  selectedRowData,
  onSave,
}: {
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {

  const {language } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_date: null,
      to_date: null,
      organization_id: undefined,
      schedule_id: undefined,
      sunday_schedule_id: undefined,
      monday_schedule_id: undefined,
      tuesday_schedule_id: undefined,
      wednesday_schedule_id: undefined,
      thursday_schedule_id: undefined,
      friday_schedule_id: undefined,
      saturday_schedule_id: undefined,
    },
  });

  const scheduleId = form.watch("schedule_id");

  useEffect(() => {
    if (!scheduleId) return;

    const currentValues = form.getValues();

    const updatedFields: Partial<typeof currentValues> = {};

    const days: (keyof typeof currentValues)[] = [
      "monday_schedule_id",
      "tuesday_schedule_id",
      "wednesday_schedule_id",
      "thursday_schedule_id",
      "friday_schedule_id",
      "saturday_schedule_id",
      "sunday_schedule_id",
    ];

    let shouldUpdate = false;

    days.forEach((dayKey) => {
      if (!currentValues[dayKey]) {
        updatedFields[dayKey] = scheduleId;
        shouldUpdate = true;
      }
    });

    if (shouldUpdate) {
      form.setValue("monday_schedule_id", updatedFields.monday_schedule_id ?? currentValues.monday_schedule_id);
      form.setValue("tuesday_schedule_id", updatedFields.tuesday_schedule_id ?? currentValues.tuesday_schedule_id);
      form.setValue("wednesday_schedule_id", updatedFields.wednesday_schedule_id ?? currentValues.wednesday_schedule_id);
      form.setValue("thursday_schedule_id", updatedFields.thursday_schedule_id ?? currentValues.thursday_schedule_id);
      form.setValue("friday_schedule_id", updatedFields.friday_schedule_id ?? currentValues.friday_schedule_id);
      form.setValue("saturday_schedule_id", updatedFields.saturday_schedule_id ?? currentValues.saturday_schedule_id);
      form.setValue("sunday_schedule_id", updatedFields.sunday_schedule_id ?? currentValues.sunday_schedule_id);
    }
  }, [scheduleId]);

  const organizationId = form.watch("organization_id");

  const { data: organizations } = useFetchAllEntity("organization");
  // const { data: schedules } = useFetchAllEntity("schedule");

  const { data: schedules } = useQuery({
    queryKey: ["schedules", organizationId],
    queryFn: () => getScheduleByOrganization(organizationId!),
    enabled: !!organizationId, // only run if organizationId is truthy
  });

  const addMutation = useMutation({
    mutationFn: addOrgScheduleRequest,
    onSuccess: (data) => {
      toast.success("Weekly schedule added successfully!");
      onSave(null, data.data);
      queryClient.invalidateQueries({ queryKey: ["organizationSchedule"] });
      router.push("/scheduling/weekly-schedule");
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editOrgScheduleRequest,
    onSuccess: (_data, variables) => {
      toast.success("Weekly schedule updated successfully!");
      onSave(variables.organization_schedule_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["organizationSchedule"] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload: any = {
        from_date: values.from_date
          ? format(values.from_date, "yyyy-MM-dd")
          : null,
        to_date: values.to_date
          ? format(values.to_date, "yyyy-MM-dd")
          : null,
        organization_id: values.organization_id,
        schedule_id: values.schedule_id,
        sunday_schedule_id: values.sunday_schedule_id,
        monday_schedule_id: values.monday_schedule_id,
        tuesday_schedule_id: values.tuesday_schedule_id,
        wednesday_schedule_id: values.wednesday_schedule_id,
        thursday_schedule_id: values.thursday_schedule_id,
        friday_schedule_id: values.friday_schedule_id,
        saturday_schedule_id: values.saturday_schedule_id,
      };

      // If attachment is provided, append it (e.g., convert to Base64 or use FormData depending on API)
      if (values.attachment) {
        payload.attachment = values.attachment;
      }

      if (selectedRowData) {
        editMutation.mutate({
          organizationSchedule_id: selectedRowData.id,
          ...payload,
        });
      } else {
        addMutation.mutate(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    form.setValue("schedule_id", undefined);
    form.setValue("monday_schedule_id", undefined);
    form.setValue("tuesday_schedule_id", undefined);
    form.setValue("wednesday_schedule_id", undefined);
    form.setValue("thursday_schedule_id", undefined);
    form.setValue("friday_schedule_id", undefined);
    form.setValue("saturday_schedule_id", undefined);
    form.setValue("sunday_schedule_id", undefined);
  }, [organizationId]);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
        <h1 className="text-primary text-lg font-bold">Organization Schedule</h1>
        <div className="flex flex-col gap-6 px-5">
          <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-20">
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    From Date <Required />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
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
                        selected={field.value ? field.value : undefined}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          // Get today's date at start of day for comparison
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          // Disable dates before today
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    To Date <Required />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
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
                        selected={field.value ? field.value : undefined}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const orgScheduleStartDate = form.getValues("from_date");
                          
                          if (!orgScheduleStartDate) {
                            // If no start date is selected, disable all dates
                            return true;
                          }
                          
                          // Create a new date for comparison to avoid time issues
                          const startDate = new Date(orgScheduleStartDate);
                          startDate.setHours(0, 0, 0, 0);
                          
                          const compareDate = new Date(date);
                          compareDate.setHours(0, 0, 0, 0);
                          return compareDate <= startDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Organization <Required/> </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(organizations?.data || []).map((item: any) => {
                        if (!item.organization_id || item.organization_id.toString().trim() === '') return null;
                        return (
                          <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
                            {item.organization_eng}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Schedule <Required/> </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(schedules?.data || []).map((item: any) => {
                        if (!item.schedule_id || item.schedule_id.toString().trim() === '') return null;
                        return (
                          <SelectItem key={item.schedule_id} value={item.schedule_id.toString()}>
                            {item.schedule_code}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Monday </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(schedules?.data || []).map((item: any) => {
                        if (!item.schedule_id || item.schedule_id.toString().trim() === '') return null;
                        return (
                          <SelectItem key={item.schedule_id} value={item.schedule_id.toString()}>
                            {item.schedule_code}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tuesday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Tuesday </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(schedules?.data || []).map((item: any) => {
                        if (!item.schedule_id || item.schedule_id.toString().trim() === '') return null;
                        return (
                          <SelectItem key={item.schedule_id} value={item.schedule_id.toString()}>
                            {item.schedule_code}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wednesday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Wednesday </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(schedules?.data || []).map((item: any) => {
                        if (!item.schedule_id || item.schedule_id.toString().trim() === '') return null;
                        return (
                          <SelectItem key={item.schedule_id} value={item.schedule_id.toString()}>
                            {item.schedule_code}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thursday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Thursday </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(schedules?.data || []).map((item: any) => {
                        if (!item.schedule_id || item.schedule_id.toString().trim() === '') return null;
                        return (
                          <SelectItem key={item.schedule_id} value={item.schedule_id.toString()}>
                            {item.schedule_code}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="friday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Friday </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(schedules?.data || []).map((item: any) => {
                        if (!item.schedule_id || item.schedule_id.toString().trim() === '') return null;
                        return (
                          <SelectItem key={item.schedule_id} value={item.schedule_id.toString()}>
                            {item.schedule_code}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saturday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Saturday </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(schedules?.data || []).map((item: any) => {
                        if (!item.schedule_id || item.schedule_id.toString().trim() === '') return null;
                        return (
                          <SelectItem key={item.schedule_id} value={item.schedule_id.toString()}>
                            {item.schedule_code}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sunday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">Sunday </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(schedules?.data || []).map((item: any) => {
                        if (!item.schedule_id || item.schedule_id.toString().trim() === '') return null;
                        return (
                          <SelectItem key={item.schedule_id} value={item.schedule_id.toString()}>
                            {item.schedule_code}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage className="mt-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attachment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Attachment
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="border-0 p-0 rounded-none h-auto text-text-secondary"
                      type="file"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 items-center pt-2 py-5 px-5">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => router.push("/scheduling/weekly-schedule")}
            >
              Cancel
            </Button>
            <Button type="submit" size={"lg"} className="w-full">
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}