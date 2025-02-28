// "use client";
// import React from "react";
// import { toast } from "sonner";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";



// import { cn } from "@/lib/utils";
// import {
//   ResponsiveModal,
//   ResponsiveModalContent,
//   ResponsiveModalDescription,
//   ResponsiveModalHeader,
//   ResponsiveModalTitle,
// } from "@/components/ui/responsive-modal";
// import {
//     Form,
//     FormControl,
//     FormDescription,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
//   } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { useLanguage } from "@/providers/LanguageProvider";

// const formSchema = z.object({
//   view_privilege: z.boolean(),
//   view_privilege_scope: z.string().optional(),
//   insert_privilege: z.boolean(),
//   insert_privilege_scope: z.string().optional(),
//   delete_privilege: z.boolean(),
//   delete_privilege_scope: z.string().optional(),
//   edit_privilege: z.boolean(),
//   edit_privilege_scope: z.string().optional(),
//   view_role: z.boolean(),
//   view_role_scope: z.string().optional(),
//   insert_role: z.boolean(),
//   insert_role_scope: z.string().optional(),
//   delete_role: z.boolean(),
//   delete_role_scope: z.string().optional(),
//   edit_role: z.boolean(),
//   edit_role_scope: z.string().optional(),
// });

// export default function AssignPriveleges({
//   modal_props,
//   rowData,
//   privelegesForm,
//   privelegesFormSchema
// }: {
//   modal_props: { open: boolean; on_open_change: (open: boolean) => void };
//   rowData: any;
//   privelegesForm: any;
//   privelegesFormSchema: any;
// }) {

//   const { dir } = useLanguage();

//   const form = useForm<z.infer<typeof formSchema>>({
//       resolver: zodResolver(formSchema),
//       defaultValues: {
//         view_privilege: true,
//         view_privilege_scope: "all",
//         insert_privilege: false,
//         insert_privilege_scope: "all",
//         delete_privilege: false,
//         delete_privilege_scope: "all",
//         edit_privilege: true,
//         edit_privilege_scope: "",
//         view_role: true,
//         view_role_scope: "OWN",
//         insert_role: false,
//         insert_role_scope: "",
//         delete_role: false,
//         delete_role_scope: "",
//         edit_role: true,
//         edit_role_scope: "",
         
//       },
//     });

//   function onSubmit(values: z.infer<typeof privelegesFormSchema>) {
//     try {
//       console.log(values);
//       toast(
//         <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
//           <code className="text-white">{JSON.stringify(values, null, 2)}</code>
//         </pre>
//       );
//     } catch (error) {
//       console.error("Form submission error", error);
//       toast.error("Failed to submit the form. Please try again.");
//     }
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="">
//         <div>
//             <ResponsiveModal open={modal_props.open} onOpenChange={modal_props.on_open_change}>
//                 <ResponsiveModalContent size="extraLarge">
//                     <ResponsiveModalHeader className="text-left">
//                         <ResponsiveModalTitle className="text-primary">Priveleges</ResponsiveModalTitle>
//                         <ResponsiveModalDescription>Select the priveleges for an employee</ResponsiveModalDescription>
//                     </ResponsiveModalHeader>
//                     <div className="flex flex-col gap-4 p-3 rounded-lg shadow-inner">
//                         <div className="flex gap-y-4 flex-col">
//                             <FormField
//                               control={form.control}
//                               name="view_privilege"
//                               render={({ field }) => (
//                                   <FormItem>
//                                       <FormControl>
//                                           <div className="flex justify-between items-center">
//                                               <div className="flex items-center gap-6">
//                                                   <Checkbox
//                                                       id="view_privilege"
//                                                       checked={field.value}
//                                                       onCheckedChange={(checked) => {
//                                                       field.onChange(checked);
//                                                       form.setValue("view_privilege_scope", checked ? "" : undefined);
//                                                       }}
//                                                   />
//                                                   <FormLabel htmlFor="view_privilege" className="text-sm font-bold text-text-content uppercase ">VIEW_PRIVILEGE</FormLabel>
//                                               </div>
//                                               <div className="w-full max-w-[250px]">
//                                                   <Select
//                                                       onValueChange={(value) => form.setValue("view_privilege_scope", value)}
//                                                       defaultValue={form.getValues("view_privilege_scope")}
//                                                   >
//                                                       <FormControl>
//                                                       <SelectTrigger>
//                                                           <SelectValue placeholder="Choose scope" />
//                                                       </SelectTrigger>
//                                                       </FormControl>
//                                                       <SelectContent>
//                                                       <SelectItem value="all">ALL</SelectItem>
//                                                       <SelectItem value="own">OWN</SelectItem>
//                                                       <SelectItem value="node">NODE</SelectItem>
//                                                       </SelectContent>
//                                                   </Select>
//                                                   <FormMessage className="mt-1"/>
//                                               </div>
//                                           </div>
//                                       </FormControl>
//                                   </FormItem>
//                               )}
//                             />
//                             <FormField
//                               control={form.control}
//                               name="insert_privilege"
//                               render={({ field }) => (
//                                   <FormItem>
//                                       <FormControl>
//                                           <div className="flex justify-between items-center">
//                                               <div className="flex items-center gap-6">
//                                                   <Checkbox
//                                                       id="insert_privilege"
//                                                       checked={field.value}
//                                                       onCheckedChange={(checked) => {
//                                                       field.onChange(checked);
//                                                       form.setValue("insert_privilege_scope", checked ? "" : undefined);
//                                                       }}
//                                                   />
//                                                   <FormLabel htmlFor="insert_privilege" className="text-sm font-bold text-text-content uppercase ">INSERT_PRIVILEGE</FormLabel>
//                                               </div>
//                                               <div className="w-full max-w-[250px]">
//                                                   <Select
//                                                       onValueChange={(value) => form.setValue("insert_privilege_scope", value)}
//                                                       defaultValue={form.getValues("insert_privilege_scope")}
//                                                   >
//                                                       <FormControl>
//                                                       <SelectTrigger>
//                                                           <SelectValue placeholder="Choose scope" />
//                                                       </SelectTrigger>
//                                                       </FormControl>
//                                                       <SelectContent>
//                                                       <SelectItem value="all">ALL</SelectItem>
//                                                       <SelectItem value="own">OWN</SelectItem>
//                                                       <SelectItem value="node">NODE</SelectItem>
//                                                       </SelectContent>
//                                                   </Select>
//                                                   <FormMessage className="mt-1"/>
//                                               </div>
//                                           </div>
//                                       </FormControl>
//                                   </FormItem>
//                               )}
//                             />
//                             <FormField
//                               control={form.control}
//                               name="delete_privilege"
//                               render={({ field }) => (
//                                   <FormItem>
//                                       <FormControl>
//                                           <div className="flex justify-between items-center">
//                                               <div className="flex items-center gap-6">
//                                                   <Checkbox
//                                                       id="delete_privilege"
//                                                       checked={field.value}
//                                                       onCheckedChange={(checked) => {
//                                                       field.onChange(checked);
//                                                       form.setValue("delete_privilege_scope", checked ? "" : undefined);
//                                                       }}
//                                                   />
//                                                   <FormLabel htmlFor="delete_privilege" className="text-sm font-bold text-text-content uppercase ">DELETE_PRIVILEGE</FormLabel>
//                                               </div>
//                                               <div className="w-full max-w-[250px]">
//                                                   <Select
//                                                       onValueChange={(value) => form.setValue("delete_privilege_scope", value)}
//                                                       defaultValue={form.getValues("delete_privilege_scope")}
//                                                   >
//                                                       <FormControl>
//                                                       <SelectTrigger>
//                                                           <SelectValue placeholder="Choose scope" />
//                                                       </SelectTrigger>
//                                                       </FormControl>
//                                                       <SelectContent>
//                                                       <SelectItem value="all">ALL</SelectItem>
//                                                       <SelectItem value="own">OWN</SelectItem>
//                                                       <SelectItem value="node">NODE</SelectItem>
//                                                       </SelectContent>
//                                                   </Select>
//                                                   <FormMessage className="mt-1"/>
//                                               </div>
//                                           </div>
//                                       </FormControl>
//                                   </FormItem>
//                               )}
//                             />
//                             <FormField
//                               control={form.control}
//                               name="edit_privilege"
//                               render={({ field }) => (
//                                   <FormItem>
//                                       <FormControl>
//                                           <div className="flex justify-between items-center">
//                                               <div className="flex items-center gap-6">
//                                                   <Checkbox
//                                                       id="edit_privilege"
//                                                       checked={field.value}
//                                                       onCheckedChange={(checked) => {
//                                                       field.onChange(checked);
//                                                       form.setValue("edit_privilege_scope", checked ? "" : undefined);
//                                                       }}
//                                                   />
//                                                   <FormLabel htmlFor="edit_privilege" className="text-sm font-bold text-text-content uppercase ">EDIT_PRIVILEGE</FormLabel>
//                                               </div>
//                                               <div className="w-full max-w-[250px]">
//                                                   <Select
//                                                       onValueChange={(value) => form.setValue("edit_privilege_scope", value)}
//                                                       defaultValue={form.getValues("edit_privilege_scope")}
//                                                   >
//                                                       <FormControl>
//                                                       <SelectTrigger>
//                                                           <SelectValue placeholder="Choose scope" />
//                                                       </SelectTrigger>
//                                                       </FormControl>
//                                                       <SelectContent>
//                                                       <SelectItem value="all">ALL</SelectItem>
//                                                       <SelectItem value="own">OWN</SelectItem>
//                                                       <SelectItem value="node">NODE</SelectItem>
//                                                       </SelectContent>
//                                                   </Select>
//                                                   <FormMessage className="mt-1"/>
//                                               </div>
//                                           </div>
//                                       </FormControl>
//                                   </FormItem>
//                               )}
//                             />
//                             <FormField
//                               control={form.control}
//                               name="view_role"
//                               render={({ field }) => (
//                                   <FormItem>
//                                       <FormControl>
//                                           <div className="flex justify-between items-center">
//                                               <div className="flex items-center gap-6">
//                                                   <Checkbox
//                                                       id="view_role"
//                                                       checked={field.value}
//                                                       onCheckedChange={(checked) => {
//                                                       field.onChange(checked);
//                                                       form.setValue("view_role_scope", checked ? "" : undefined);
//                                                       }}
//                                                   />
//                                                   <FormLabel htmlFor="view_role" className="text-sm font-bold text-text-content uppercase ">VIEW_role</FormLabel>
//                                               </div>
//                                               <div className="w-full max-w-[250px]">
//                                                   <Select
//                                                       onValueChange={(value) => form.setValue("view_role_scope", value)}
//                                                       defaultValue={form.getValues("view_role_scope")}
//                                                   >
//                                                       <FormControl>
//                                                       <SelectTrigger>
//                                                           <SelectValue placeholder="Choose scope" />
//                                                       </SelectTrigger>
//                                                       </FormControl>
//                                                       <SelectContent>
//                                                       <SelectItem value="all">ALL</SelectItem>
//                                                       <SelectItem value="own">OWN</SelectItem>
//                                                       <SelectItem value="node">NODE</SelectItem>
//                                                       </SelectContent>
//                                                   </Select>
//                                                   <FormMessage className="mt-1"/>
//                                               </div>
//                                           </div>
//                                       </FormControl>
//                                   </FormItem>
//                               )}
//                             />
//                             <FormField
//                               control={form.control}
//                               name="insert_role"
//                               render={({ field }) => (
//                                   <FormItem>
//                                       <FormControl>
//                                           <div className="flex justify-between items-center">
//                                               <div className="flex items-center gap-6">
//                                                   <Checkbox
//                                                       id="insert_role"
//                                                       checked={field.value}
//                                                       onCheckedChange={(checked) => {
//                                                       field.onChange(checked);
//                                                       form.setValue("insert_role_scope", checked ? "" : undefined);
//                                                       }}
//                                                   />
//                                                   <FormLabel htmlFor="insert_role" className="text-sm font-bold text-text-content uppercase ">INSERT_role</FormLabel>
//                                               </div>
//                                               <div className="w-full max-w-[250px]">
//                                                   <Select
//                                                       onValueChange={(value) => form.setValue("insert_role_scope", value)}
//                                                       defaultValue={form.getValues("insert_role_scope")}
//                                                   >
//                                                       <FormControl>
//                                                       <SelectTrigger>
//                                                           <SelectValue placeholder="Choose scope" />
//                                                       </SelectTrigger>
//                                                       </FormControl>
//                                                       <SelectContent>
//                                                       <SelectItem value="all">ALL</SelectItem>
//                                                       <SelectItem value="own">OWN</SelectItem>
//                                                       <SelectItem value="node">NODE</SelectItem>
//                                                       </SelectContent>
//                                                   </Select>
//                                                   <FormMessage className="mt-1"/>
//                                               </div>
//                                           </div>
//                                       </FormControl>
//                                   </FormItem>
//                               )}
//                             />
//                             <FormField
//                               control={form.control}
//                               name="delete_role"
//                               render={({ field }) => (
//                                   <FormItem>
//                                       <FormControl>
//                                           <div className="flex justify-between items-center">
//                                               <div className="flex items-center gap-6">
//                                                   <Checkbox
//                                                       id="delete_role"
//                                                       checked={field.value}
//                                                       onCheckedChange={(checked) => {
//                                                       field.onChange(checked);
//                                                       form.setValue("delete_role_scope", checked ? "" : undefined);
//                                                       }}
//                                                   />
//                                                   <FormLabel htmlFor="delete_role" className="text-sm font-bold text-text-content uppercase ">DELETE_role</FormLabel>
//                                               </div>
//                                               <div className="w-full max-w-[250px]">
//                                                   <Select
//                                                       onValueChange={(value) => form.setValue("delete_role_scope", value)}
//                                                       defaultValue={form.getValues("delete_role_scope")}
//                                                   >
//                                                       <FormControl>
//                                                       <SelectTrigger>
//                                                           <SelectValue placeholder="Choose scope" />
//                                                       </SelectTrigger>
//                                                       </FormControl>
//                                                       <SelectContent>
//                                                       <SelectItem value="all">ALL</SelectItem>
//                                                       <SelectItem value="own">OWN</SelectItem>
//                                                       <SelectItem value="node">NODE</SelectItem>
//                                                       </SelectContent>
//                                                   </Select>
//                                                   <FormMessage className="mt-1"/>
//                                               </div>
//                                           </div>
//                                       </FormControl>
//                                   </FormItem>
//                               )}
//                             />
//                             <FormField
//                               control={form.control}
//                               name="edit_role"
//                               render={({ field }) => (
//                                   <FormItem>
//                                       <FormControl>
//                                           <div className="flex justify-between items-center">
//                                               <div className="flex items-center gap-6">
//                                                   <Checkbox
//                                                       id="edit_role"
//                                                       checked={field.value}
//                                                       onCheckedChange={(checked) => {
//                                                       field.onChange(checked);
//                                                       form.setValue("edit_role_scope", checked ? "" : undefined);
//                                                       }}
//                                                   />
//                                                   <FormLabel htmlFor="edit_role" className="text-sm font-bold text-text-content uppercase ">EDIT_role</FormLabel>
//                                               </div>
//                                               <div className="w-full max-w-[250px]">
//                                                   <Select
//                                                       onValueChange={(value) => form.setValue("edit_role_scope", value)}
//                                                       defaultValue={form.getValues("edit_role_scope")}
//                                                   >
//                                                       <FormControl>
//                                                       <SelectTrigger>
//                                                           <SelectValue placeholder="Choose scope" />
//                                                       </SelectTrigger>
//                                                       </FormControl>
//                                                       <SelectContent>
//                                                       <SelectItem value="all">ALL</SelectItem>
//                                                       <SelectItem value="own">OWN</SelectItem>
//                                                       <SelectItem value="node">NODE</SelectItem>
//                                                       </SelectContent>
//                                                   </Select>
//                                                   <FormMessage className="mt-1"/>
//                                               </div>
//                                           </div>
//                                       </FormControl>
//                                   </FormItem>
//                               )}
//                             />
//                         </div>
//                         <div className="w-full flex gap-2 justify-end items-center py-3">
//                             <Button
//                                 variant={"outline"}
//                                 type="button"
//                                 size={"lg"}
//                                 onClick={() => modal_props?.on_open_change(false)}
//                             >
//                                 Cancel
//                             </Button>
//                             <Button
//                                 type="button"
//                                 size={"lg"}
//                                 onClick={() => modal_props?.on_open_change(false)}
//                             >
//                                 Save
//                             </Button>
//                         </div>
//                     </div>
//                 </ResponsiveModalContent>
//             </ResponsiveModal>
//         </div>
//       </form>
//     </Form>
//   );
// }

"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "@/lib/utils";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";

const formSchema = z.object({
  view_privilege: z.boolean(),
  view_privilege_scope: z.string().optional(),
  insert_privilege: z.boolean(),
  insert_privilege_scope: z.string().optional(),
  delete_privilege: z.boolean(),
  delete_privilege_scope: z.string().optional(),
  edit_privilege: z.boolean(),
  edit_privilege_scope: z.string().optional(),
  view_role: z.boolean(),
  view_role_scope: z.string().optional(),
  insert_role: z.boolean(),
  insert_role_scope: z.string().optional(),
  delete_role: z.boolean(),
  delete_role_scope: z.string().optional(),
  edit_role: z.boolean(),
  edit_role_scope: z.string().optional(),
  view_employee: z.boolean(),
  view_employee_scope: z.string().optional(),
  insert_employee: z.boolean(),
  insert_employee_scope: z.string().optional(),
  delete_employee: z.boolean(),
  delete_employee_scope: z.string().optional(),
  edit_employee: z.boolean(),
  edit_employee_scope: z.string().optional(),
});

const checkboxKeys = [
  "view_privilege",
  "insert_privilege",
  "delete_privilege",
  "edit_privilege",
  "view_role",
  "insert_role",
  "delete_role",
  "edit_role",
  "view_employee",
  "insert_employee",
  "delete_employee",
  "edit_employee",
] as const;

export default function AssignPriveleges({
  modal_props,
}: {
  modal_props: { open: boolean; on_open_change: (open: boolean) => void };
}) {

  const [selectAll, setSelectAll] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: checkboxKeys.reduce(
      (acc, key) => ({
        ...acc,
        [key]: false,
        [`${key}_scope`]: "",
      }),
      {} as Record<string, boolean | string>
    ),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    checkboxKeys.forEach((key) => {
      form.setValue(key, checked);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <ResponsiveModal open={modal_props.open} onOpenChange={modal_props.on_open_change}>
            <ResponsiveModalContent size="extraLarge">
              <ResponsiveModalHeader className="text-left">
                <ResponsiveModalTitle className="text-primary">Privileges</ResponsiveModalTitle>
                <ResponsiveModalDescription>Select the privileges for an employee</ResponsiveModalDescription>
              </ResponsiveModalHeader>
                <>
                  <div className="flex flex-col gap-4 p-3 rounded-lg shadow-inner">
                    <div className="flex justify-between items-center border-b pb-3">
                      <div className="flex items-center gap-6">
                        <Checkbox
                          id="select_all"
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          className=""
                        />
                        <FormLabel className="text-[15px] font-bold text-secondary">Name</FormLabel>
                      </div>
                      <div className="w-full max-w-[250px] text-left">
                        <FormLabel className="text-[15px] font-bold text-secondary">Scope</FormLabel>
                      </div>
                    </div>
                    <div className="flex gap-y-3 flex-col">
                      {checkboxKeys.map((list) => (
                        <FormField
                          key={list}
                          control={form.control}
                          name={list}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-6">
                                    <Checkbox id={list} checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                                    <FormLabel htmlFor={list} className="text-sm font-bold text-text-content uppercase">
                                      {list.replace("_", " ").toUpperCase()}
                                    </FormLabel>
                                  </div>
                                  <div className="w-full max-w-[250px]">
                                    <Select onValueChange={(value) => form.setValue(`${list}_scope`, value)} defaultValue={form.getValues(`${list}_scope`)}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Choose scope" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="all">ALL</SelectItem>
                                        <SelectItem value="own">OWN</SelectItem>
                                        <SelectItem value="node">NODE</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage className="mt-1" />
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="w-full flex gap-2 justify-end items-center py-3">
                    <Button variant="outline" type="button" size="lg" onClick={() => modal_props.on_open_change(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="lg">
                      Save
                    </Button>
                  </div>
                </>
            </ResponsiveModalContent>
          </ResponsiveModal>
        </div>
      </form>
    </Form>
  );
}
