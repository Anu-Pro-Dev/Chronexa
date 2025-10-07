"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { CalendarIcon } from "@/src/icons/icons";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOrgScheduleRequest, editOrgScheduleRequest, getScheduleByOrganization } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  from_date: z.date({ required_error: "from_date_required" }).optional(),
  to_date: z.date({ required_error: "to_date_required" }).optional(),
  organization_id: z.coerce.number({ required_error: "organization_required" }).min(1, { message: "organization_required" }),
  schedule_id: z.coerce.number({ required_error: "schedule_required" }).min(1, { message: "schedule_required" }),
  sunday_schedule_id: z.coerce.number().optional(),
  monday_schedule_id: z.coerce.number().optional(),
  tuesday_schedule_id: z.coerce.number().optional(),
  wednesday_schedule_id: z.coerce.number().optional(),
  thursday_schedule_id: z.coerce.number().optional(),
  friday_schedule_id: z.coerce.number().optional(),
  saturday_schedule_id: z.coerce.number().optional(),
  attachment: z.custom<any>(
    (value) => {
      if (!value) return true;
      if (!(value instanceof File)) {
        return false;
      }
      const maxSize = 5 * 1024 * 1024;
      if (value.size > maxSize) {
        return false;
      }
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(value.type)) {
        return false;
      }
      return true;
    },
    {
      message: "attachment_invalid",
    }
  ).optional(),
});

export default function AddOrganizationSchedule({
  selectedRowData,
  onSave,
}: {
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {

  const { language, translations } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState("");
  const showToast = useShowToast();
  const t = translations?.modules?.schedulingModule || {};
  const errT = translations?.formErrors || {};
  const [popoverStates, setPopoverStates] = useState({
    fromDate: false,
    toDate: false,
  });

  const closePopover = (key: string) => {
    setPopoverStates(prev => ({ ...prev, [key]: false }));
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_date: undefined,
      to_date: undefined,
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
  const organizationId = form.watch("organization_id");
  const prevOrgIdRef = useRef(organizationId);

  useEffect(() => {
    if (selectedRowData) {
      form.reset({
        from_date: selectedRowData.from_date ? new Date(selectedRowData.from_date) : undefined,
        to_date: selectedRowData.to_date ? new Date(selectedRowData.to_date) : undefined,
        organization_id: selectedRowData.organization_id,
        schedule_id: selectedRowData.schedule_id,
        monday_schedule_id: selectedRowData.monday_schedule_id,
        tuesday_schedule_id: selectedRowData.tuesday_schedule_id,
        wednesday_schedule_id: selectedRowData.wednesday_schedule_id,
        thursday_schedule_id: selectedRowData.thursday_schedule_id,
        friday_schedule_id: selectedRowData.friday_schedule_id,
        saturday_schedule_id: selectedRowData.saturday_schedule_id,
        sunday_schedule_id: selectedRowData.sunday_schedule_id,
      });
    }
  }, [selectedRowData, form]);

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
  }, [scheduleId, form]);

  useEffect(() => {
    if (prevOrgIdRef.current !== organizationId && prevOrgIdRef.current !== undefined) {
      form.resetField("schedule_id");
      form.resetField("monday_schedule_id");
      form.resetField("tuesday_schedule_id");
      form.resetField("wednesday_schedule_id");
      form.resetField("thursday_schedule_id");
      form.resetField("friday_schedule_id");
      form.resetField("saturday_schedule_id");
      form.resetField("sunday_schedule_id");
    }
    prevOrgIdRef.current = organizationId;
  }, [organizationId, form]);

  const { data: organizations, isLoading: isSearchingOrganizations } = useFetchAllEntity("organization", {
    searchParams: {
      ...(organizationSearchTerm && { search: organizationSearchTerm }),
    },
    removeAll: true,
  });

  const { data: schedules, isLoading: isSearchingSchedules } = useFetchAllEntity("schedule", {
    searchParams: {
      ...(scheduleSearchTerm && { search: scheduleSearchTerm }),
    },
    removeAll: true,
  });

  const getFilteredOrganizations = () => {
    return (organizations?.data || []).filter((item: any) => 
      item.organization_id && item.organization_id.toString().trim() !== ''
    );
  };

  const getFilteredSchedules = () => {
    return (schedules?.data || []).filter((item: any) => 
      item.schedule_id && item.schedule_id.toString().trim() !== ''
    );
  };
  const addMutation = useMutation({
    mutationFn: addOrgScheduleRequest,
    onSuccess: (data) => {
      showToast("success", "addorgschedule_success");     
      onSave(null, data.data);
      queryClient.invalidateQueries({ queryKey: ["organizationSchedule"] });
      router.push("/scheduling/weekly-schedule/organization-schedule");
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error"); 
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editOrgScheduleRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updateorgschedule_success");
      onSave(variables.organization_schedule_id?.toString() ?? null, variables);
      queryClient.invalidateQueries({ queryKey: ["organizationSchedule"] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error"); 
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
          : undefined,
        to_date: values.to_date
          ? format(values.to_date, "yyyy-MM-dd")
          : undefined,
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

      if (values.attachment) {
        payload.attachment = values.attachment;
      }

      if (selectedRowData) {
        editMutation.mutate({
          organization_schedule_id: selectedRowData.id,
          ...payload,
        });
      } else {
        addMutation.mutate(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
        <h1 className="text-primary text-lg font-bold">{t.organization_schedule || "Organization Schedule"}</h1>
        <div className="flex flex-col gap-6 px-5">
          <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-20">
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    {t.from_date || "From Date"} <Required />
                  </FormLabel>
                  <Popover open={popoverStates.fromDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, fromDate: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yy")
                          ) : (
                            <span className="font-normal text-sm text-text-secondary">{t.placeholder_date || "Choose date"}</span>
                          )}
                          <CalendarIcon />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? field.value : undefined}
                        onSelect={(date) => {
                          field.onChange(date)
                          closePopover('fromDate')
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.from_date}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to_date"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>
                    {t.to_date || "To Date"} <Required />
                  </FormLabel>
                  <Popover open={popoverStates.toDate} onOpenChange={(open) => setPopoverStates(prev => ({ ...prev, toDate: open }))}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button size={"lg"} variant={"outline"}
                          className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yy")
                          ) : (
                            <span className="font-normal text-sm text-text-secondary">{t.placeholder_date || "Choose date"}</span>
                          )}
                          <CalendarIcon />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? field.value : undefined}
                        onSelect={(date) => {
                          field.onChange(date)
                          closePopover('toDate')
                        }}
                        disabled={(date) => {
                          const orgScheduleStartDate = form.getValues("from_date");
                          
                          if (!orgScheduleStartDate) {
                            return true;
                          }
                          
                          const startDate = new Date(orgScheduleStartDate);
                          startDate.setHours(0, 0, 0, 0);
                          
                          const compareDate = new Date(date);
                          compareDate.setHours(0, 0, 0, 0);
                          return compareDate <= startDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.to_date}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">{t.organization || "Organization"} <Required/> </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-[350px]">
                        <SelectValue placeholder={t.placeholder_organization || "Choose organization"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      showSearch={true}
                      searchPlaceholder={t.search_organizations || "Search organizations..."}
                      onSearchChange={setOrganizationSearchTerm}
                      className="mt-5"
                    >
                      {isSearchingOrganizations && organizationSearchTerm.length > 0 && (
                        <div className="p-3 text-sm text-text-secondary">
                          {t.searching || "Searching..."}
                        </div>
                      )}
                      {getFilteredOrganizations().length === 0 && organizationSearchTerm.length > 0 && !isSearchingOrganizations && (
                        <div className="p-3 text-sm text-text-secondary">
                          {t.no_organization_found || "No organization found"}
                        </div>
                      )}
                      {getFilteredOrganizations().map((item: any) => {
                        if (!item.organization_id || item.organization_id.toString().trim() === '') return null;
                        return (
                          <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
                            {item.organization_eng}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <TranslatedError
                    fieldError={form.formState.errors.organization_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">{t.schedule || "Schedule"} <Required/> </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-[350px]">
                        <SelectValue placeholder={t.placeholder_schedule || "Choose schedule"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      showSearch={true}
                      searchPlaceholder={t.search_schedules || "Search schedules..."}
                      onSearchChange={setScheduleSearchTerm}
                      className="mt-5"
                    >
                      {isSearchingSchedules && scheduleSearchTerm.length > 0 && (
                        <div className="p-3 text-sm text-text-secondary">
                          {t.searching || "Searching..."}
                        </div>
                      )}
                      {(schedules?.data || []).length === 0 && scheduleSearchTerm.length > 0 && !isSearchingSchedules && (
                        <div className="p-3 text-sm text-text-secondary">
                          {t.no_schedules_found || "No schedules found"}
                        </div>
                      )}
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
                  <TranslatedError
                    fieldError={form.formState.errors.schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">{t.monday || "Monday"} </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-[350px]">
                        <SelectValue placeholder={t.placeholder_schedule || "Choose schedule"} />
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
                  <TranslatedError
                    fieldError={form.formState.errors.monday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tuesday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">{t.tuesday || "Tuesday"} </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-[350px]">
                        <SelectValue placeholder={t.placeholder_schedule || "Choose schedule"} />
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
                  <TranslatedError
                    fieldError={form.formState.errors.tuesday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wednesday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">{t.wednesday || "Wednesday"} </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-[350px]">
                        <SelectValue placeholder={t.placeholder_schedule || "Choose schedule"} />
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
                  <TranslatedError
                    fieldError={form.formState.errors.wednesday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thursday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">{t.thursday || "Thursday"} </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-[350px]">
                        <SelectValue placeholder={t.placeholder_schedule || "Choose schedule"} />
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
                  <TranslatedError
                    fieldError={form.formState.errors.thursday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="friday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">{t.friday || "Friday"} </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-[350px]">
                        <SelectValue placeholder={t.placeholder_schedule || "Choose schedule"} />
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
                  <TranslatedError
                    fieldError={form.formState.errors.friday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saturday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">{t.saturday || "Saturday"} </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-[350px]">
                        <SelectValue placeholder={t.placeholder_schedule || "Choose schedule"} />
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
                  <TranslatedError
                    fieldError={form.formState.errors.saturday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sunday_schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">{t.sunday || "Sunday"} </FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-[350px]">
                        <SelectValue placeholder={t.placeholder_schedule || "Choose schedule"} />
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
                  <TranslatedError
                    fieldError={form.formState.errors.sunday_schedule_id}
                    translations={errT}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attachment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.attachment || "Attachment"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="border-0 p-0 rounded-none h-auto text-text-secondary"
                      type="file"
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError
                    fieldError={form.formState.errors.attachment}
                    translations={errT}
                  />
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
              onClick={() => router.push("/scheduling/weekly-schedule/organization-schedule")}
            >
              {translations.buttons.cancel}
            </Button>
            <Button 
              type="submit" 
              size={"lg"} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? selectedRowData
                  ? translations.buttons.updating
                  : translations.buttons.saving
                : selectedRowData
                ? translations.buttons.update
                : translations.buttons.save}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}