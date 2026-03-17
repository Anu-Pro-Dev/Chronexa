"use client";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/src/components/ui/form";
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
} from "@/src/components/ui/command";
import Required from "@/src/components/ui/required";
import Switch from "@/src/components/ui/switch";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSecUserRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { ChevronsUpDown } from "lucide-react";

// ─── Schema ───────────────────────────────────────────────────────────────────
const formSchema = z.object({
    login: z.string().min(1, { message: "username_required" }),
    password: z.string().min(1, { message: "password_required" }),
    employee_id: z.number({ invalid_type_error: "employee_required" }).min(1, {
        message: "employee_required",
    }),
    access_mobile_app: z.boolean(),
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddUser({
    on_open_change,
    selectedRowData,
    onSave,
}: {
    on_open_change: (open: boolean) => void;
    selectedRowData?: any;
    onSave?: () => void;
}) {
    const { language, translations } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [empPopoverOpen, setEmpPopoverOpen] = useState(false);
    const queryClient = useQueryClient();
    const showToast = useShowToast();
    const t = translations?.modules?.userManagement || {};
    const btnT = translations?.buttons || {};
    const errT = translations?.formErrors || {};

    // ─── All employees ───────────────────────────────────────────────────────
    const { data: employeeData, isLoading: empLoading } = useFetchAllEntity(
        "employee",
        { removeAll: true }
    );

    // ─── Existing sec users — to filter out already-assigned employees ───────
    const { data: secUserData } = useFetchAllEntity("secuser/spark", {
        removeAll: true,
    });

    // ─── Set of employee_ids already linked to a sec user ───────────────────
    const assignedEmployeeIds = useMemo<Set<number>>(() => {
        const list = secUserData?.data ?? [];
        return new Set(
            list
                .map((u: any) => u.employee_id)
                .filter((id: any) => id != null)
        );
    }, [secUserData]);

    // ─── Only unassigned employees ───────────────────────────────────────────
    const employees = useMemo(
        () =>
            (employeeData?.data || []).filter(
                (e: any) => e.employee_id && !assignedEmployeeIds.has(e.employee_id)
            ),
        [employeeData, assignedEmployeeIds]
    );

    // ─── Form ────────────────────────────────────────────────────────────────
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            login: "",
            password: "",
            employee_id: undefined,
            access_mobile_app: false,
        },
    });

    const selectedEmpId = form.watch("employee_id");
    const selectedEmployee = useMemo(
        () => employees.find((e: any) => e.employee_id === selectedEmpId),
        [employees, selectedEmpId]
    );

    // ─── Mutation ────────────────────────────────────────────────────────────
    const addMutation = useMutation({
        mutationFn: addSecUserRequest,
        onSuccess: () => {
            showToast("success", "addsecuser_success");
            queryClient.invalidateQueries({ queryKey: ["secuser/spark"] });
            onSave?.();
            on_open_change(false);
        },
        onError: (error: any) => {
            if (error?.response?.status === 409) {
                showToast("error", "findduplicate_error");
            } else {
                showToast("error", "formsubmission_error");
            }
        },
    });

    // ─── Submit ──────────────────────────────────────────────────────────────
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            addMutation.mutate({
                login: values.login,
                password: values.password,
                employee_id: values.employee_id,
                access_control_panel: 0,
                is_aduser: 0,
                access_mobile_app: values.access_mobile_app ? 1 : 0,
            } as any);
        } finally {
            setIsSubmitting(false);
        }
    }

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <div className="flex flex-col gap-4">

                    <FormField
                        control={form.control}
                        name="login"
                        render={({ field }) => (
                            <FormItem className="min-w-0">
                                <FormLabel>
                                    {t.username || "Username"} <Required />
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder={t.placeholder_username || "Enter username"}
                                        {...field}
                                        className={language === "ar" ? "text-right" : "text-left"}
                                    />
                                </FormControl>
                                <TranslatedError
                                    fieldError={form.formState.errors.login}
                                    translations={errT}
                                />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="min-w-0">
                                <FormLabel>
                                    {t.password || "Password"} <Required />
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder={t.placeholder_password || "Enter password"}
                                        {...field}
                                        className={language === "ar" ? "text-right" : "text-left"}
                                    />
                                </FormControl>
                                <TranslatedError
                                    fieldError={form.formState.errors.password}
                                    translations={errT}
                                />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="employee_id"
                        render={({ field }) => (
                            <FormItem className="min-w-0">
                                <FormLabel>
                                    {t.employee || "Employee"} <Required />
                                </FormLabel>
                                <Popover open={empPopoverOpen} onOpenChange={setEmpPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            size="lg"
                                            variant="outline"
                                            className="w-full bg-accent px-4 flex justify-between border-grey"
                                        >
                                            <span className="text-sm truncate">
                                                {selectedEmployee ? (
                                                    <span className="text-text-primary">
                                                        {selectedEmployee.emp_no ?? ""} —{" "}
                                                        {language === "ar"
                                                            ? selectedEmployee.firstname_arb || selectedEmployee.name
                                                            : selectedEmployee.name || selectedEmployee.firstname_eng}
                                                    </span>
                                                ) : (
                                                    <span className="text-text-secondary">
                                                        {empLoading
                                                            ? "Loading employees..."
                                                            : t.placeholder_employee || "Choose employee"}
                                                    </span>
                                                )}
                                            </span>
                                            <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-dropdown">
                                        <Command>
                                            <CommandInput placeholder="Search by name or emp no..." />
                                            <CommandEmpty>No employee found.</CommandEmpty>
                                            <CommandGroup className="max-h-64 overflow-auto">
                                                {employees.map((emp: any) => (
                                                    <CommandItem
                                                        key={emp.employee_id}
                                                        value={`${emp.emp_no ?? ""} ${language === "ar"
                                                                ? emp.firstname_arb || emp.name || ""
                                                                : emp.name || emp.firstname_eng || ""
                                                            }`}
                                                        onSelect={() => {
                                                            field.onChange(emp.employee_id);
                                                            setEmpPopoverOpen(false);
                                                        }}
                                                    >
                                                        <span className="font-medium text-text-secondary mr-2">
                                                            {emp.emp_no}
                                                        </span>
                                                        {language === "ar"
                                                            ? emp.firstname_arb || emp.name
                                                            : emp.name || emp.firstname_eng}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <TranslatedError
                                    fieldError={form.formState.errors.employee_id}
                                    translations={errT}
                                />
                            </FormItem>
                        )}
                    />

                    {/* ── Row 3: License toggle — label inline right of switch ── */}
                    <FormField
                        control={form.control}
                        name="access_mobile_app"
                        render={({ field }) => (
                            <FormItem>
                                <div
                                    className={`flex items-center gap-1 mt-2 ${language === "ar" ? "flex-row-reverse justify-end" : ""
                                        }`}
                                >
                                    <FormControl>
                                        <Switch
                                            checked={!!field.value}
                                            onChange={(val: boolean) => field.onChange(val)}
                                        />
                                    </FormControl>
                                    <FormLabel className="!mt-0 cursor-pointer font-medium">
                                        {t.license || "License"}
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* ── Actions ── */}
                    <div className="w-full flex gap-2 items-center pt-2 pb-2">
                        <Button
                            variant="outline"
                            type="button"
                            size="lg"
                            className="w-full"
                            onClick={() => on_open_change(false)}
                        >
                            {btnT?.cancel || "Cancel"}
                        </Button>
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={isSubmitting || addMutation.isPending}
                        >
                            {isSubmitting || addMutation.isPending
                                ? btnT?.saving || "Saving..."
                                : btnT?.save || "Save"}
                        </Button>
                    </div>

                </div>
            </form>
        </Form>
    );
}