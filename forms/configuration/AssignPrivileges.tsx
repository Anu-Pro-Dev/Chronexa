"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import {
  Form,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
import { addRolePrivilegeRequest } from "@/lib/apiHandler";

// Privilege keys mapping to API fields
const privilegeKeys = ["access", "view", "create", "edit", "delete"] as const;
type PrivilegeKey = typeof privilegeKeys[number];

const privilegeObject = z.object({
  access: z.boolean(),
  view: z.boolean(),
  create: z.boolean(),
  edit: z.boolean(),
  delete: z.boolean(),
});

function getEmptyPrivileges() {
  return {
    access: false,
    view: false,
    create: false,
    edit: false,
    delete: false,
  };
}

export default function AssignPrivileges({
  modal_props,
  roleName,
  roleId,
}: {
  modal_props: { open: boolean; on_open_change: (open: boolean) => void };
  roleName: string;
  roleId?: number;
}) {

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch data from APIs
  const { data: modulesData, isLoading: isLoadingModules } = useFetchAllEntity("secModule");
  const { data: subModulesData, isLoading: isLoadingSubModules } = useFetchAllEntity("sec-sub-module");
  const { data: rolePrivilegesData, isLoading: isLoadingPrivileges } = useFetchAllEntity("secRolePrivilege");

  // Process the API data to create section structure
  const sectionStructure = useMemo(() => {
    if (!modulesData?.data || !subModulesData?.data) return {};
    
    const structure: Record<string, string[]> = {};
    
    // Add all modules first
    modulesData.data.forEach((module: any) => {
      structure[module.module_name] = [];
    });
    
    // Add sub-modules to their parent modules
    subModulesData.data.forEach((subModule: any) => {
      const parentModule = modulesData.data.find(
        (module: any) => module.module_id === subModule.module_id
      );
      
      if (parentModule && !structure[parentModule.module_name].includes(subModule.sub_module_name)) {
        structure[parentModule.module_name].push(subModule.sub_module_name);
      }
    });
    
    return structure;
  }, [modulesData, subModulesData]);

  // Create dynamic schema based on section structure
  const privilegeSchema = useMemo(() => {
    const subItemSchema = z.record(privilegeObject);
    const schemaObject: any = {
      roleName: z.string().min(1),
    };

    Object.keys(sectionStructure).forEach((section) => {
      schemaObject[section] = subItemSchema;
    });

    return z.object(schemaObject);
  }, [sectionStructure]);

  type PrivilegeFormValues = z.infer<typeof privilegeSchema>;

  // Get existing privileges for this role
  const existingPrivileges = useMemo(() => {
    if (!rolePrivilegesData?.data || !roleId || !modulesData?.data || !subModulesData?.data) return {};
    
    const privileges: Record<string, Record<string, any>> = {};
    
    // Filter privileges for current role
    const currentRolePrivileges = rolePrivilegesData.data.filter(
      (priv: any) => priv.role_id === roleId
    );
        
    currentRolePrivileges.forEach((privilege: any) => {
      // Find the sub-module for this privilege
      const subModule = subModulesData.data.find(
        (subMod: any) => subMod.sub_module_id === privilege.sub_module_id
      );
      
      if (subModule) {
        // Find the parent module for this sub-module
        const module = modulesData.data.find(
          (mod: any) => mod.module_id === subModule.module_id
        );
        
        if (module) {
          const moduleName = module.module_name;
          const subModuleName = subModule.sub_module_name;
          
          if (!privileges[moduleName]) {
            privileges[moduleName] = {};
          }
          
          // Set privileges for this specific sub-module
          privileges[moduleName][subModuleName] = {
            access: privilege.access_flag || false,
            view: privilege.view_flag || false,
            create: privilege.create_flag || false,
            edit: privilege.edit_flag || false,
            delete: privilege.delete_flag || false,
          };
        }
      }
    });
    return privileges;
  }, [rolePrivilegesData, roleId, modulesData, subModulesData, sectionStructure]);
  
  // Generate default values
  const getDefaultValues = useMemo((): PrivilegeFormValues => {
    const values: any = { roleName: roleName || "" };

    Object.entries(sectionStructure).forEach(([section, subItems]) => {
      values[section] = {};
      subItems.forEach((sub) => {
        values[section][sub] = existingPrivileges[section]?.[sub] || getEmptyPrivileges();
      });
    });

    return values;
  }, [sectionStructure, roleName, existingPrivileges]);

  const form = useForm<PrivilegeFormValues>({
    resolver: zodResolver(privilegeSchema),
    defaultValues: getDefaultValues,
  });

  // Reset form when data changes
  useEffect(() => {
    if (Object.keys(sectionStructure).length > 0) {
      form.reset(getDefaultValues);
    }
  }, [getDefaultValues, form, sectionStructure]);

  const onSubmit = async (data: PrivilegeFormValues) => {    
    if (!roleId) {
      toast.error("Role ID is required");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const apiCalls: Promise<any>[] = [];
      
      // Process each module
      Object.entries(data).forEach(([moduleName, moduleData]) => {        
        if (moduleName === "roleName") {
          return;
        }
        
        // Find the module
        const module = modulesData?.data?.find((m: any) => m.module_name === moduleName);
        if (!module) {
          return;
        }
                
        // Check if any sub-module has privileges enabled
        const modulePrivileges = moduleData as Record<string, any>;        
        // Process each sub-module individually
        Object.entries(modulePrivileges).forEach(([subModuleName, subModulePrivs]: [string, any]) => {          
          // Find the sub-module to get its ID
          const subModule = subModulesData?.data?.find(
            (sm: any) => sm.sub_module_name === subModuleName && sm.module_id === module.module_id
          );
          
          if (!subModule) {
            return;
          }
                    
          // Check if this sub-module has any privileges
          const hasPrivileges = subModulePrivs.access || subModulePrivs.view || 
                              subModulePrivs.create || subModulePrivs.edit || subModulePrivs.delete;
                  
          if (hasPrivileges) {
            const privilegeData = {
              role_id: roleId,
              sub_module_id: subModule.sub_module_id, // Use sub_module_id as required
              access_flag: subModulePrivs.access || false,
              view_flag: subModulePrivs.view || false,
              create_flag: subModulePrivs.create || false,
              edit_flag: subModulePrivs.edit || false,
              delete_flag: subModulePrivs.delete || false,
            };
            
            apiCalls.push(addRolePrivilegeRequest(privilegeData));
          }
        });
      });

      if (apiCalls.length === 0) {
        toast.error("No privileges selected");
        return;
      }
      
      // Execute all API calls
      const results = await Promise.allSettled(apiCalls);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
            
      if (failed > 0) {
        console.error("Failed API calls:", results.filter(r => r.status === 'rejected'));
        toast.error(`Failed to save ${failed} privileges. ${successful} saved successfully.`);
      } else {
        toast.success(`Successfully saved ${successful} sub-module privileges!`);
        modal_props.on_open_change(false);
      }
      
    } catch (error) {
      console.error("Error saving privileges:", error);
      toast.error("Failed to save privileges");
    } finally {
      setIsSubmitting(false);
    }
  };

  function formatName(name: string) {
    return name
      .toLowerCase()
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Loading state
  if (isLoadingModules || isLoadingSubModules || isLoadingPrivileges) {
    return (
      <ResponsiveModal open={modal_props.open} onOpenChange={modal_props.on_open_change}>
        <ResponsiveModalContent size="extraLarge">
          <ResponsiveModalHeader className="text-left">
            <ResponsiveModalTitle className="text-primary">
              Loading {formatName(roleName || "Role")} Privileges...
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    );
  }

  // No data state
  if (!Object.keys(sectionStructure).length) {
    return (
      <ResponsiveModal open={modal_props.open} onOpenChange={modal_props.on_open_change}>
        <ResponsiveModalContent size="extraLarge">
          <ResponsiveModalHeader className="text-left">
            <ResponsiveModalTitle className="text-primary">
              {formatName(roleName || "Role")} Privileges
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="flex justify-center items-center py-8">
            <p className="text-secondary">No modules or sub-modules available.</p>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ResponsiveModal open={modal_props.open} onOpenChange={modal_props.on_open_change}>
          <ResponsiveModalContent size="extraLarge">
            <ResponsiveModalHeader className="text-left">
              <ResponsiveModalTitle className="text-primary">
                {roleName ? (
                  <><span>{formatName(roleName)}</span> Privileges</>
                ) : (
                  "Role Privileges"
                )}
              </ResponsiveModalTitle>
            </ResponsiveModalHeader>

            <Accordion type="multiple" className="mb-6">
              {Object.entries(sectionStructure).map(([section, subItems]) => (
                <AccordionItem key={section} value={section}>
                  <div className="border-b">
                    <AccordionTrigger className="text-base text-text-content font-semibold capitalize flex justify-between items-center w-full">
                      {formatName(section)}
                    </AccordionTrigger>

                    <AccordionContent className="pb-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border">
                          <thead className="border-b">
                            <tr className="text-secondary">
                              <th className="px-4 py-2 font-normal"></th>
                              {privilegeKeys.map((label) => (
                                <th key={label} className="px-4 py-2 text-center capitalize text-sm font-normal">
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
                                        form.setValue(`${section}.${sub}.${perm}` as any, !!checked);
                                      });
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>

                            {subItems.length === 0 ? (
                              <tr className="border-b">
                                <td colSpan={privilegeKeys.length + 1} className="px-4 py-8 text-center text-secondary">
                                  No sub-modules found for {formatName(section)}
                                </td>
                              </tr>
                            ) : (
                              subItems.map((sub) => (
                                <tr key={sub} className="border-b">
                                  <td className="px-4 py-2 text-sm font-normal text-secondary">
                                    {formatName(sub)}
                                  </td>
                                  {privilegeKeys.map((perm) => (
                                    <td key={perm} className="px-4 py-2 text-center">
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
                              ))
                            )}
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
              {/* <Button type="button" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button> */}
              <Button 
                type="button"
                size="lg" 
                disabled={isSubmitting}
                onClick={async () => {
                  const formValues = form.getValues();                  // Manually trigger validation
                  const isValid = await form.trigger();                  
                  if (isValid) {
                    await onSubmit(formValues);
                  }
                }}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </ResponsiveModalContent>
        </ResponsiveModal>
      </form>
    </Form>
  );
}