"use client";
import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Privilege keys
const privilegeKeys = ["access", "view", "create", "edit", "delete"] as const;
type PrivilegeKey = typeof privilegeKeys[number];

// Sections and sub-items
const sectionStructure = {
    dashboard: ["My Attendance", "Team Attendance", "Geo Fence"],
    company_master: ["Locations", "Citizenship", "Designations", "Grades"],
    organization: ["Organization Types","Organization","Department","Organization Structure"],
    employee_master: ["Employee Type", "Employee Group", "Employee"],
    scheduling: ["Schedules", "Weekly Schedule","Monthly Schedule", "Holidays", "Set Ramadan Dates"],
    self_services: ["Permissions", "Leaves", "Punches", "Approval Workflow", "Team Requests", "Approvals" ],
    devices: ["Devices"],
    reports: ["Reports"],
    configuration: ["Roles", "Privileges", "Reprocess"],
    settings: ["Application Settings", "DB Settings", "Master Upload", "Email Settings"],
    alerts: ["Email", "SMS"]
} as const;

type Section = keyof typeof sectionStructure;
type SubItem = typeof sectionStructure[Section][number];

const privilegeObject = z.object({
  access: z.boolean(),
  view: z.boolean(),
  create: z.boolean(),
  edit: z.boolean(),
  delete: z.boolean(),
});

const subItemSchema = z.record(privilegeObject);
const privilegeSchema = z.object({
  roleName: z.string().min(1),
  ...Object.fromEntries(
    Object.entries(sectionStructure).map(([section]) => [
      section,
      subItemSchema,
    ])
  ),
});

type PrivilegeFormValues = z.infer<typeof privilegeSchema>;

function getEmptyPrivileges() {
  return {
    access: false,
    view: false,
    create: false,
    edit: false,
    delete: false,
  };
}

function getDefaultValues(): PrivilegeFormValues {
  const values: any = {
    roleName: "",
  };

  for (const [section, subItems] of Object.entries(sectionStructure)) {
    values[section] = {};
    for (const sub of subItems) {
      values[section][sub] = getEmptyPrivileges();
    }
  }

  return values;
}

export default function AssignPrivileges({
  modal_props,
  roleName,
}: {
  modal_props: { open: boolean; on_open_change: (open: boolean) => void };
  roleName: string;
}) {
  const form = useForm<PrivilegeFormValues>({
    resolver: zodResolver(privilegeSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (modal_props.open && roleName) {
        form.setValue("roleName", roleName);
    }
  }, [modal_props.open, roleName, form]);


  const onSubmit = (data: PrivilegeFormValues) => {
    toast.success("Privileges saved!");
    console.log("Submitted", data);
  };

  function formatRoleName(role: string) {
    return role
        .toLowerCase()
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ResponsiveModal
          open={modal_props.open}
          onOpenChange={modal_props.on_open_change}
        >
          <ResponsiveModalContent size="extraLarge">
            <ResponsiveModalHeader className="text-left">
              <ResponsiveModalTitle className="text-primary">
                <span>{formatRoleName(roleName)}</span> Privileges
              </ResponsiveModalTitle>
            </ResponsiveModalHeader>

            <Accordion type="multiple" className="mb-6">
              {Object.entries(sectionStructure).map(([section, subItems]) => (
                <AccordionItem key={section} value={section}>
                    <div className="border-b">
                        <AccordionTrigger className="text-base text-text-content font-semibold capitalize flex justify-between items-center w-full">
                        {formatRoleName(section)}
                        <span
                            className="transition-transform duration-200 ease-in-out"
                            data-state="closed"
                            data-state-open="rotate-180"
                        >
                            <svg
                            className="h-4 w-4 transition-transform duration-200"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            >
                            <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                            />
                            </svg>
                        </span>
                        </AccordionTrigger>

                        <AccordionContent className="pb-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border">
                                    <thead className="border-b">
                                    <tr className="text-secondary">
                                        <th className="px-4 py-2 font-normal"></th>
                                        {privilegeKeys.map((label) => (
                                        <th
                                            key={label}
                                            className="px-4 py-2 text-center capitalize text-sm font-normal"
                                        >
                                            {label}
                                        </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {/* Select All Row */}
                                    <tr className="border-b font-semibold">
                                        <td className="px-4 py-2 text-text-primary text-sm font-bold">Select All</td>
                                        {privilegeKeys.map((perm) => (
                                        <td key={perm} className="px-4 py-2 text-center">
                                            <Checkbox
                                            onCheckedChange={(checked) => {
                                                subItems.forEach((sub) => {
                                                form.setValue(
                                                    `${section}.${sub}.${perm}` as any,
                                                    !!checked
                                                );
                                                });
                                            }}
                                            />
                                        </td>
                                        ))}
                                    </tr>

                                    {subItems.map((sub) => (
                                        <tr key={sub} className="border-b">
                                        <td className="px-4 py-2 text-sm font-normal text-secondary">{sub}</td>
                                        {privilegeKeys.map((perm) => (
                                            <td
                                            key={perm}
                                            className="px-4 py-2 text-center"
                                            >
                                            <FormField
                                                control={form.control}
                                                name={`${section}.${sub}.${perm}` as any}
                                                render={({ field }) => (
                                                <FormItem>
                                                    <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    />
                                                </FormItem>
                                                )}
                                            />
                                            </td>
                                        ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </AccordionContent>
                    </div>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="w-full flex gap-2 justify-end items-center py-3">
              <Button
                variant="outline"
                type="button"
                size="lg"
                onClick={() => modal_props.on_open_change(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg">
                Save
              </Button>
            </div>
          </ResponsiveModalContent>
        </ResponsiveModal>
      </form>
    </Form>
  );
}
