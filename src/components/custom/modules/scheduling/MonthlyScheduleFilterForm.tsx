"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/components/ui/command";
import Required from "@/src/components/ui/required";
import { filterMonthlyRosterRequest, getManagerEmployees, getScheduleByOrganization } from "@/src/lib/apiHandler";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/src/lib/utils";
import {
  FiltersIcon,
  DeleteIcon
} from "@/src/icons/icons";

const formSchema = z.object({
  organization: z.string().min(1, { message: "Required" }).max(100),
  version_no: z.string().optional(),
  manager: z.string().optional(),
  apply_version_filter: z.boolean().optional(),
  day: z.string().optional(),
  employee: z.string().optional(),
  month: z.string().min(1, { message: "Required" }).max(100),
  schedule: z.string().optional(),
  year: z.string().min(1, { message: "Required" }).max(100),
  group: z.string().optional(),
});

interface FilterFormProps {
  onFilterSubmit?: (data: any) => void;
}

const monthOptions = [
  { value: "1", label: "Jan" },
  { value: "2", label: "Feb" },
  { value: "3", label: "Mar" },
  { value: "4", label: "Apr" },
  { value: "5", label: "May" },
  { value: "6", label: "Jun" },
  { value: "7", label: "Jul" },
  { value: "8", label: "Aug" },
  { value: "9", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 16 }, (_, i) => {
  const year = currentYear - 5 + i;
  return { value: String(year), label: String(year) };
});

const dayOptions = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

export default function FilterForm({ onFilterSubmit }: FilterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [openOrganization, setOpenOrganization] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [openDay, setOpenDay] = useState(false);
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);
  const [openManager, setOpenManager] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apply_version_filter: false,
    },
  });

  const selectedOrganization = form.watch("organization");
  const selectedEmployee = form.watch("employee");
  const selectedManager = form.watch("manager");

  const { data: organizations, isLoading: loadingOrganizations } = useFetchAllEntity("organization", { removeAll: true });
  const { data: employees, isLoading: loadingEmployees } = useFetchAllEntity("employee/all", { removeAll: true });
  const { data: employeeGroups, isLoading: loadingGroups } = useFetchAllEntity("employeeGroup", { removeAll: true });
  
  const { data: managerEmployees, isLoading: loadingManagers } = useQuery({
    queryKey: ["managerEmployees"],
    queryFn: getManagerEmployees,
  });

  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ["schedules", selectedOrganization],
    queryFn: () => selectedOrganization ? getScheduleByOrganization(parseInt(selectedOrganization)) : Promise.resolve(null),
    enabled: !!selectedOrganization,
  });

  const getOrganizationsData = () => (organizations?.data || []).filter((item: any) => 
    item.organization_id && item.organization_id.toString().trim() !== ''
  );
  
  const getEmployeesData = () => (employees?.data || []).filter((item: any) => 
    item.employee_id && item.employee_id.toString().trim() !== ''
  );
  
  const getGroupsData = () => (employeeGroups?.data || []).filter((item: any) => 
    item.employee_group_id && item.employee_group_id.toString().trim() !== ''
  );
  
  const getManagersData = () => (managerEmployees?.data || []).filter((emp: any) => 
    emp.employee_id != null
  );

  const getSchedulesData = () => (schedules?.data || []).filter((item: any) => 
    item.schedule_id && item.schedule_id.toString().trim() !== ''
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const requestBody = {
        organization_id: parseInt(values.organization),
        month: parseInt(values.month),
        year: parseInt(values.year),
        ...(values.day && { day: parseInt(values.day) }),
        ...(values.employee && { employee_id: parseInt(values.employee) }),
        ...(values.manager && { manager_id: parseInt(values.manager) }),
        ...(values.group && { employee_group_id: parseInt(values.group) }),
        ...(values.schedule && { schedule_id: parseInt(values.schedule) }),
        finalize_flag: false,
      };

      const data = await filterMonthlyRosterRequest(requestBody);
      
      if (onFilterSubmit) {
        onFilterSubmit(data);
      }

      toast.success("Filters applied successfully");
      console.log('Filter results:', data);
      
    } catch (error: any) {
      console.error("Form submission error", error);
      const errorMessage = error?.response?.data?.message || "Failed to apply filters";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Organization <Required /></FormLabel>
                <Popover open={openOrganization} onOpenChange={setOpenOrganization}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openOrganization}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 max-w-[350px] justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingOrganizations}
                      >
                        <span className="truncate">
                          {field.value
                            ? getOrganizationsData().find((item: any) => String(item.organization_id) === field.value)?.organization_eng
                            : "Choose organization"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandInput placeholder="Search organization..." className="border-none" />
                      <CommandEmpty>No organization found</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getOrganizationsData().map((item: any) => (
                          <CommandItem
                            key={item.organization_id}
                            value={item.organization_eng}
                            onSelect={() => {
                              field.onChange(String(item.organization_id));
                              setOpenOrganization(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", field.value === String(item.organization_id) ? "opacity-100" : "opacity-0")} />
                            {item.organization_eng}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Month <Required /></FormLabel>
                <Popover open={openMonth} onOpenChange={setOpenMonth}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openMonth}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 max-w-[350px] justify-between",
                          !field.value && "text-text-secondary"
                        )}
                      >
                        <span className="truncate">
                          {field.value ? monthOptions.find((item) => item.value === field.value)?.label : "Choose month"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandGroup className="max-h-64 overflow-auto">
                        <div className="grid grid-cols-3 gap-1 p-2">
                          {monthOptions.map((item) => (
                            <div
                              key={item.value}
                              onClick={() => {
                                field.onChange(item.value);
                                setOpenMonth(false);
                              }}
                              className={cn(
                                "flex items-center justify-center cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                                field.value === item.value && "bg-primary text-primary-foreground hover:bg-primary"
                              )}
                            >
                              {item.label}
                            </div>
                          ))}
                        </div>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Year <Required /></FormLabel>
                <Popover open={openYear} onOpenChange={setOpenYear}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openYear}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 max-w-[350px] justify-between",
                          !field.value && "text-text-secondary"
                        )}
                      >
                        <span className="truncate">
                          {field.value || "Choose year"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandGroup className="max-h-64 overflow-auto">
                        <div className="grid grid-cols-2 gap-1 p-2">
                          {yearOptions.map((item) => (
                            <div
                              key={item.value}
                              onClick={() => {
                                field.onChange(item.value);
                                setOpenYear(false);
                              }}
                              className={cn(
                                "flex items-center justify-center cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                                field.value === item.value && "bg-primary text-primary-foreground hover:bg-primary"
                              )}
                            >
                              {item.label}
                            </div>
                          ))}
                        </div>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="day"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Day</FormLabel>
                <Popover open={openDay} onOpenChange={setOpenDay}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openDay}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 max-w-[350px] justify-between",
                          !field.value && "text-text-secondary"
                        )}
                      >
                        <span className="truncate">
                          {field.value || "Choose day"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandGroup className="max-h-64 overflow-auto">
                        <div className="grid grid-cols-7 gap-1 p-2">
                          {dayOptions.map((item) => (
                            <div
                              key={item.value}
                              onClick={() => {
                                field.onChange(item.value);
                                setOpenDay(false);
                              }}
                              className={cn(
                                "flex items-center justify-center cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                                field.value === item.value && "bg-primary text-primary-foreground hover:bg-primary"
                              )}
                            >
                              {item.label}
                            </div>
                          ))}
                        </div>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employee"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Employee</FormLabel>
                <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openEmployee}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 max-w-[350px] justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingEmployees || !!selectedManager}
                      >
                        <span className="truncate">
                          {field.value
                            ? getEmployeesData().find((item: any) => String(item.employee_id) === field.value)?.firstname_eng
                            : selectedManager ? "Manager selected" : "Choose employee"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandInput placeholder="Search employee..." className="border-none" />
                      <CommandEmpty>No employee found</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getEmployeesData().map((item: any) => (
                          <CommandItem
                            key={item.employee_id}
                            value={item.firstname_eng}
                            onSelect={() => {
                              field.onChange(String(item.employee_id));
                              setOpenEmployee(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", field.value === String(item.employee_id) ? "opacity-100" : "opacity-0")} />
                            {item.firstname_eng}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Group</FormLabel>
                <Popover open={openGroup} onOpenChange={setOpenGroup}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openGroup}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 max-w-[350px] justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingGroups}
                      >
                        <span className="truncate">
                          {field.value
                            ? getGroupsData().find((item: any) => String(item.employee_group_id) === field.value)?.group_name_eng
                            : "Choose group"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandInput placeholder="Search group..." className="border-none" />
                      <CommandEmpty>No group found</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getGroupsData().map((item: any) => (
                          <CommandItem
                            key={item.employee_group_id}
                            value={item.group_name_eng}
                            onSelect={() => {
                              field.onChange(String(item.employee_group_id));
                              setOpenGroup(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", field.value === String(item.employee_group_id) ? "opacity-100" : "opacity-0")} />
                            {item.group_name_eng}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="manager"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Manager</FormLabel>
                <Popover open={openManager} onOpenChange={setOpenManager}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openManager}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 max-w-[350px] justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingManagers || !!selectedEmployee}
                      >
                        <span className="truncate">
                          {field.value
                            ? getManagersData().find((emp: any) => String(emp.employee_id) === field.value)?.firstname_eng
                            : selectedEmployee ? "Employee selected" : "Choose manager"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandInput placeholder="Search manager..." className="border-none" />
                      <CommandEmpty>No manager found</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getManagersData().map((emp: any) => (
                          <CommandItem
                            key={emp.employee_id}
                            value={emp.firstname_eng}
                            onSelect={() => {
                              field.onChange(String(emp.employee_id));
                              setOpenManager(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", field.value === String(emp.employee_id) ? "opacity-100" : "opacity-0")} />
                            {emp.firstname_eng}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Schedule</FormLabel>
                <Popover open={openSchedule} onOpenChange={setOpenSchedule}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openSchedule}
                        className={cn(
                          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors hover:bg-transparent focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 max-w-[350px] justify-between",
                          !field.value && "text-text-secondary"
                        )}
                        disabled={loadingSchedules || !selectedOrganization}
                      >
                        <span className="truncate">
                          {field.value
                            ? getSchedulesData().find((item: any) => String(item.schedule_id) === field.value)?.schedule_code
                            : selectedOrganization ? "Choose schedule" : "Select organization first"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                    <Command>
                      <CommandInput placeholder="Search schedule..." className="border-none" />
                      <CommandEmpty>No schedule found</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {getSchedulesData().map((item: any) => (
                          <CommandItem
                            key={item.schedule_id}
                            value={item.schedule_code}
                            onSelect={() => {
                              field.onChange(String(item.schedule_id));
                              setOpenSchedule(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", field.value === String(item.schedule_id) ? "opacity-100" : "opacity-0")} />
                            {item.schedule_code}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2 items-center pt-4">
          <Button variant={"outline"} type="button" size={"sm"} onClick={() => form.reset()} disabled={isLoading}>
            Clear Filters
          </Button>
          <Button size={"sm"} type="submit" disabled={isLoading}>
            <FiltersIcon /> {isLoading ? "Filtering..." : "Apply Filters"}
          </Button>
        </div>
      </form>
    </Form>
  );
}