"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOpenLocationRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

const formSchema = z.object({
  employee_id: z.string().min(1, { message: "employee_required" }),
  employee_number: z.string().optional(),
  employee_name: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const getEmployeeNumber = (employee: any) =>
  (employee?.emp_no ?? employee?.employee_number ?? employee?.EmployeeNumber ?? "")
    .toString()
    .trim();

const getEmployeeNameEng = (employee: any) =>
  [employee?.firstname_eng, employee?.lastname_eng]
    .filter(Boolean)
    .join(" ")
    .trim();

const getEmployeeDisplay = (employee: any) => {
  const employeeNumber = getEmployeeNumber(employee);
  const name = getEmployeeNameEng(employee);
  return name ? `${employeeNumber} - ${name}` : employeeNumber;
};

export default function AddOpenLocation({
  on_open_change,
  onSave,
}: {
  on_open_change: (open: boolean) => void;
  onSave: () => void;
}) {
  const { translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const debouncedEmployeeSearch = useDebounce(employeeSearch, 300);
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const t = translations?.modules?.workload || {};
  const errT = translations?.formErrors || {};

  const { data: employeesResponse, isLoading: isLoadingEmployees } = useFetchAllEntity(
    "employee",
    {
      searchParams: {
        limit: "100",
        offset: "1",
        ...(debouncedEmployeeSearch && { search: debouncedEmployeeSearch }),
      },
    }
  );

  const employeesList = Array.isArray(employeesResponse?.data)
    ? employeesResponse.data
    : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      employee_number: "",
      employee_name: "",
      is_active: true,
    },
  });

  const addMutation = useMutation({
    mutationFn: addOpenLocationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-location"] });
      showToast("success", "add_open_location_success");
      on_open_change(false);
      onSave();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create open location";
      showToast("error", message);
    },
  });

  async function onSubmit(values: FormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const employeeNumber = (values.employee_number || "").trim();
      const employeeName = (values.employee_name || "").trim();

      addMutation.mutate({
        employee_id: Number(values.employee_id),
        ...(employeeNumber && { employee_number: employeeNumber }),
        ...(employeeName && { employee_name: employeeName }),
        is_active: values.is_active,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => {
              const currentEmployee =
                employeesList.find(
                  (employee: any) =>
                    String(employee.employee_id) === String(field.value)
                ) ||
                (selectedEmployee &&
                String(selectedEmployee.employee_id) === String(field.value)
                  ? selectedEmployee
                  : undefined);

              let triggerLabel =
                t.placeholder_employee_number || "Select employee";
              if (currentEmployee) {
                triggerLabel = getEmployeeDisplay(currentEmployee);
              }

              return (
                <FormItem className="flex flex-col min-w-0">
                  <FormLabel>
                    {t.employee || "Employee"}
                    <Required />
                  </FormLabel>
                  <Popover
                    open={employeeOpen}
                    onOpenChange={(open) => {
                      setEmployeeOpen(open);
                      if (!open) setEmployeeSearch("");
                    }}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={employeeOpen}
                          disabled={isLoadingEmployees}
                          className={cn(
                            "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 justify-between",
                            !field.value && "text-text-secondary"
                          )}
                        >
                          <span className="truncate">{triggerLabel}</span>
                          <ChevronDown className="ml-2 h-4 w-4 text-text-primary shrink-0" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[300px] sm:w-[380px] p-0 border-none shadow-dropdown bg-accent z-[100]"
                      align="start"
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                    >
                      <Command shouldFilter={false} className="w-full">
                        <CommandInput
                          value={employeeSearch}
                          onValueChange={setEmployeeSearch}
                          placeholder={
                            t.search_employees || "Search employee name or number..."
                          }
                          className="border-none"
                        />
                        <CommandList
                          className="max-h-60 overflow-y-auto [scrollbar-width:auto] pr-1"
                          onWheel={(e) => e.stopPropagation()}
                          onTouchMove={(e) => e.stopPropagation()}
                        >
                          <CommandEmpty className="p-4 text-sm text-text-secondary text-center">
                            {isLoadingEmployees
                              ? t.searching || "Searching..."
                              : t.no_employees_found || "No employees found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {employeesList.map((employee: any) => {
                              if (!employee.employee_id) return null;
                              const employeeId = String(employee.employee_id);
                              const isSelected = String(field.value) === employeeId;
                              return (
                                <CommandItem
                                  key={employeeId}
                                  value={employeeId}
                                  onSelect={() => {
                                    field.onChange(employeeId);
                                    form.setValue(
                                      "employee_number",
                                      getEmployeeNumber(employee)
                                    );
                                    form.setValue(
                                      "employee_name",
                                      getEmployeeNameEng(employee)
                                    );
                                    setSelectedEmployee(employee);
                                    setEmployeeOpen(false);
                                    setEmployeeSearch("");
                                  }}
                                  className="cursor-pointer flex items-center justify-between py-2 px-3 hover:bg-backdrop"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <Check
                                      className={cn(
                                        "h-4 w-4 text-primary shrink-0",
                                        isSelected ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="truncate font-medium">
                                      {getEmployeeDisplay(employee)}
                                    </span>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <TranslatedError
                    fieldError={form.formState.errors.employee_id}
                    translations={errT}
                  />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal">
                  {t.active_flag || "Active"}
                </FormLabel>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 items-center py-2">
            <div className="flex gap-4">
              <Button
                variant="outline"
                type="button"
                size="lg"
                className="w-full"
                onClick={() => on_open_change(false)}
              >
                {translations?.buttons?.cancel || "Cancel"}
              </Button>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? translations?.buttons?.saving || "Saving..."
                  : translations?.buttons?.save || "Save"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
