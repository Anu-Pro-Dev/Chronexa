"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/ui/responsive-modal";
import {
  Form,
  FormField,
  FormItem,
} from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { addRolePrivilegeRequest, editRolePrivilegeRequest, addRoleTabPrivilegeRequest, editRoleTabPrivilegeRequest } from "@/src/lib/apiHandler";
import { useLanguage } from "@/src/providers/LanguageProvider";

const privilegeKeys = ["view", "create", "edit", "delete"] as const;
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

interface CombinedStructure {
  [moduleName: string]: {
    subModules: {
      [subModuleName: string]: {
        tabs: string[];
      };
    };
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
  const { translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: modulesData, isLoading: modulesLoading } = useFetchAllEntity("secModule", {
    removeAll: true,
  });
  
  const { data: subModulesData, isLoading: subModulesLoading } = useFetchAllEntity("secSubModule", {
    removeAll: true,
  });

  const { data: tabsData, isLoading: tabsLoading } = useFetchAllEntity("secTab", {
    removeAll: true,
  });

  const { data: rolePrivilegesData, isLoading: rolePrivilegesLoading } = useFetchAllEntity("secRolePrivilege", {
    removeAll: true,
  });

  const { data: roleTabPrivilegesData, isLoading: roleTabPrivilegesLoading } = useFetchAllEntity("secRoleTabPrivilege", {
    removeAll: true,
  });

  const addSubModuleMutation = useMutation({
    mutationFn: addRolePrivilegeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secRolePrivilege"] });
    },
  });

  const editSubModuleMutation = useMutation({
    mutationFn: editRolePrivilegeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secRolePrivilege"] });
    },
  });

  const addTabMutation = useMutation({
    mutationFn: addRoleTabPrivilegeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secRoleTabPrivilege"] });
    },
  });

  const editTabMutation = useMutation({
    mutationFn: editRoleTabPrivilegeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secRoleTabPrivilege"] });
    },
  });

  const sectionStructure = useMemo((): CombinedStructure => {
    if (!modulesData?.data || !subModulesData?.data) return {};
    
    const structure: CombinedStructure = {};
    
    modulesData.data.forEach((module: any) => {
      const moduleName = module.module_name;
      structure[moduleName] = { subModules: {} };
      
      const moduleSubModules = subModulesData.data.filter(
        (subModule: any) => subModule.module_id === module.module_id
      );
      
      moduleSubModules.forEach((subModule: any) => {
        const subModuleName = subModule.sub_module_name;
        
        const subModuleTabs = tabsData?.data?.filter(
          (tab: any) => tab.sub_module_id === subModule.sub_module_id
        ) || [];
        
        structure[moduleName].subModules[subModuleName] = {
          tabs: subModuleTabs.map((tab: any) => tab.tab_name),
        };
      });
    });
    
    return structure;
  }, [modulesData, subModulesData, tabsData]);

  const privilegeSchema = useMemo(() => {
    const tabSchema = z.record(privilegeObject);
    const subModuleSchema = z.record(z.object({
      subModule: privilegeObject,
      tabs: tabSchema,
    }));
    const schemaObject: any = {
      roleName: z.string().min(1),
    };

    Object.keys(sectionStructure).forEach((module) => {
      schemaObject[module] = subModuleSchema;
    });

    return z.object(schemaObject);
  }, [sectionStructure]);

  type PrivilegeFormValues = z.infer<typeof privilegeSchema>;

  const existingPrivileges = useMemo(() => {
    if (!roleId || !modulesData?.data || !subModulesData?.data) return { subModules: {}, tabs: {} };
    
    const subModulePrivs: Record<string, Record<string, any>> = {};
    const tabPrivs: Record<string, Record<string, Record<string, any>>> = {};
    
    if (rolePrivilegesData?.data) {
      rolePrivilegesData.data
        .filter((priv: any) => priv.role_id === roleId)
        .forEach((privilege: any) => {
          const subModule = subModulesData.data.find(
            (sm: any) => sm.sub_module_id === privilege.sub_module_id
          );
          
          if (subModule) {
            const module = modulesData.data.find(
              (m: any) => m.module_id === subModule.module_id
            );
            
            if (module) {
              if (!subModulePrivs[module.module_name]) {
                subModulePrivs[module.module_name] = {};
              }
              
              subModulePrivs[module.module_name][subModule.sub_module_name] = {
                role_privilege_id: privilege.role_privilege_id,
                access: privilege.access_flag || false,
                view: privilege.view_flag || false,
                create: privilege.create_flag || false,
                edit: privilege.edit_flag || false,
                delete: privilege.delete_flag || false,
              };
            }
          }
        });
    }
    
    if (roleTabPrivilegesData?.data && tabsData?.data) {
      roleTabPrivilegesData.data
        .filter((priv: any) => priv.role_id === roleId)
        .forEach((privilege: any) => {
          const tab = tabsData.data.find((t: any) => t.tab_id === privilege.tab_id);
          
          if (tab) {
            const subModule = subModulesData.data.find(
              (sm: any) => sm.sub_module_id === tab.sub_module_id
            );
            
            if (subModule) {
              const module = modulesData.data.find(
                (m: any) => m.module_id === subModule.module_id
              );
              
              if (module) {
                if (!tabPrivs[module.module_name]) {
                  tabPrivs[module.module_name] = {};
                }
                if (!tabPrivs[module.module_name][subModule.sub_module_name]) {
                  tabPrivs[module.module_name][subModule.sub_module_name] = {};
                }
                tabPrivs[module.module_name][subModule.sub_module_name][tab.tab_name] = {
                  role_tab_privilege_id: privilege.role_tab_privilege_id,
                  access: privilege.access_flag === true,
                  view: privilege.view_flag === true,
                  create: privilege.create_flag === true,
                  edit: privilege.edit_flag === true,
                  delete: privilege.delete_flag === true,
                };
              }
            }
          }
        });
    }
    
    return { subModules: subModulePrivs, tabs: tabPrivs };
  }, [rolePrivilegesData, roleTabPrivilegesData, roleId, modulesData, subModulesData, tabsData]);
  
  const getDefaultValues = useMemo((): PrivilegeFormValues => {
    const values: any = { roleName: roleName || "" };

    Object.entries(sectionStructure).forEach(([module, { subModules }]) => {
      values[module] = {};
      Object.entries(subModules).forEach(([subModule, { tabs }]) => {
        values[module][subModule] = {
          subModule: existingPrivileges.subModules[module]?.[subModule] || getEmptyPrivileges(),
          tabs: {},
        };
        
        tabs.forEach((tab) => {
          values[module][subModule].tabs[tab] = 
            existingPrivileges.tabs[module]?.[subModule]?.[tab] || getEmptyPrivileges();
        });
      });
    });

    return values;
  }, [sectionStructure, roleName, existingPrivileges]);

  const form = useForm<PrivilegeFormValues>({
    resolver: zodResolver(privilegeSchema),
    defaultValues: getDefaultValues,
  });

  useEffect(() => {
    if (Object.keys(sectionStructure).length > 0) {
      form.reset(getDefaultValues);
    }
  }, [getDefaultValues, form, sectionStructure]);

  const hasPrivilegesChanged = (currentPrivs: any, existingPrivs: any) => {
    if (!existingPrivs) return true;
    
    return privilegeKeys.some(key => 
      currentPrivs[key] !== (existingPrivs[key] || false)
    );
  };

  const getScope = (privileges: any) => {
    const enabledCount = privilegeKeys.filter(key => privileges[key]).length;
    return enabledCount === privilegeKeys.length ? "ALL" : "OWN";
  };
  
  const onSubmit = async (data: PrivilegeFormValues) => {    
    if (!roleId) {
      toast.error("Role ID is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const operations: Promise<any>[] = [];

      Object.entries(data).forEach(([moduleName, moduleData]) => {
        if (moduleName === "roleName") return;

        const module = modulesData?.data?.find((m: any) => m.module_name === moduleName);
        if (!module) return;

        Object.entries(moduleData as any).forEach(([subModuleName, subModuleData]: [string, any]) => {
          const subModule = subModulesData?.data?.find(
            (sm: any) => sm.sub_module_name === subModuleName && sm.module_id === module.module_id
          );

          if (!subModule) return;

          const subModulePrivs = subModuleData.subModule;
          const existingSubModulePrivs = existingPrivileges.subModules[moduleName]?.[subModuleName];

          if (hasPrivilegesChanged(subModulePrivs, existingSubModulePrivs)) {
            const hasAnyPrivilege = privilegeKeys.some(key => subModulePrivs[key]);
            
            if (hasAnyPrivilege || existingSubModulePrivs?.role_privilege_id) {
              const privilegeData = {
                role_id: roleId,
                scope: getScope(subModulePrivs),
                sub_module_id: subModule.sub_module_id,
                access_flag: subModulePrivs.access || false,
                view_flag: subModulePrivs.view || false,
                create_flag: subModulePrivs.create || false,
                edit_flag: subModulePrivs.edit || false,
                delete_flag: subModulePrivs.delete || false,
              };

              if (existingSubModulePrivs?.role_privilege_id) {
                operations.push(editSubModuleMutation.mutateAsync({
                  ...privilegeData,
                  role_privilege_id: existingSubModulePrivs.role_privilege_id,
                }));
              } else if (hasAnyPrivilege) {
                operations.push(addSubModuleMutation.mutateAsync(privilegeData));
              }
            }
          }

          const tabsData_local = subModuleData.tabs;
          Object.entries(tabsData_local).forEach(([tabName, tabPrivs]: [string, any]) => {
            const tab = tabsData?.data?.find(
              (t: any) => t.tab_name === tabName && t.sub_module_id === subModule.sub_module_id
            );

            if (!tab) return;

            const existingTabPrivs = existingPrivileges.tabs[moduleName]?.[subModuleName]?.[tabName];

            if (hasPrivilegesChanged(tabPrivs, existingTabPrivs)) {
              const hasAnyPrivilege = privilegeKeys.some(key => tabPrivs[key]);
              
              if (hasAnyPrivilege || existingTabPrivs?.role_tab_privilege_id) {
                const privilegeData = {
                  role_id: roleId,
                  tab_id: tab.tab_id,
                  sub_module_id: subModule.sub_module_id,
                  access_flag: tabPrivs.access || false,
                  view_flag: tabPrivs.view || false,
                  create_flag: tabPrivs.create || false,
                  edit_flag: tabPrivs.edit || false,
                  delete_flag: tabPrivs.delete || false,
                };

                if (existingTabPrivs?.role_tab_privilege_id) {
                  operations.push(editTabMutation.mutateAsync({
                    ...privilegeData,
                    role_tab_privilege_id: existingTabPrivs.role_tab_privilege_id,
                  }));
                } else if (hasAnyPrivilege) {
                  operations.push(addTabMutation.mutateAsync(privilegeData));
                }
              }
            }
          });
        });
      });

      if (operations.length === 0) {
        toast.error("No changes to save");
        setIsSubmitting(false);
        return;
      }

      const results = await Promise.allSettled(operations);

      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      if (failed > 0) {
        console.error("Failed operations:", results.filter(r => r.status === "rejected"));
        toast.error(`Failed to save ${failed} privileges. ${successful} saved successfully.`);
      } else {
        toast.success(`Successfully saved ${successful} privileges!`);
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
      .split(/[_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  if (modulesLoading || subModulesLoading || tabsLoading || rolePrivilegesLoading || roleTabPrivilegesLoading) {
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
              {Object.entries(sectionStructure).map(([module, { subModules }]) => (
                <AccordionItem key={module} value={module}>
                  <div className="border-b">
                    <AccordionTrigger className="text-base text-text-content font-semibold capitalize">
                      {formatName(module)}
                    </AccordionTrigger>

                    <AccordionContent className="pb-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border">
                          <thead className="border-b bg-gray-50">
                            <tr className="text-secondary">
                              <th className="px-4 py-2 font-medium">Sub-Module / Tab</th>
                              {privilegeKeys.map((label) => (
                                <th key={label} className="px-4 py-2 text-center capitalize text-sm font-medium">
                                  {label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b bg-blue-50">
                              <td className="px-4 py-2 text-text-primary text-sm font-bold">Select All</td>
                              {privilegeKeys.map((perm) => (
                                <td key={perm} className="px-4 py-2 text-center">
                                  <Checkbox
                                    onCheckedChange={(checked) => {
                                      Object.entries(subModules).forEach(([subModule, { tabs }]) => {
                                        form.setValue(`${module}.${subModule}.subModule.${perm}` as any, !!checked);
                                        tabs.forEach((tab) => {
                                          form.setValue(`${module}.${subModule}.tabs.${tab}.${perm}` as any, !!checked);
                                        });
                                      });
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>

                            {Object.entries(subModules).map(([subModule, { tabs }]) => (
                              <React.Fragment key={subModule}>
                                <tr className="border-b bg-gray-100">
                                  <td className="px-4 py-2 text-sm font-semibold text-text-content">
                                    {formatName(subModule)}
                                  </td>
                                  {privilegeKeys.map((perm) => (
                                    <td key={perm} className="px-4 py-2 text-center">
                                      <FormField
                                        control={form.control}
                                        name={`${module}.${subModule}.subModule.${perm}` as any}
                                        render={({ field }) => {
                                          const subModuleView = form.getValues(`${module}.${subModule}.subModule.view` as any);
                                          const isDisabled = perm !== 'view' && !subModuleView;
                                          
                                          return (
                                            <FormItem>
                                              <Checkbox
                                                checked={field.value}
                                                disabled={isDisabled}
                                                onCheckedChange={(checked) => {
                                                  field.onChange(checked);
                                                  
                                                  if (perm === 'view' && checked) {
                                                    tabs.forEach((tab) => {
                                                      form.setValue(`${module}.${subModule}.tabs.${tab}.view` as any, true);
                                                    });
                                                  }
                                                  else if (checked) {
                                                    tabs.forEach((tab) => {
                                                      form.setValue(`${module}.${subModule}.tabs.${tab}.${perm}` as any, true);
                                                    });
                                                  }
                                                  else if (!checked) {
                                                    tabs.forEach((tab) => {
                                                      form.setValue(`${module}.${subModule}.tabs.${tab}.${perm}` as any, false);
                                                    });
                                                  }
                                                }}
                                              />
                                            </FormItem>
                                          );
                                        }}
                                      />
                                    </td>
                                  ))}
                                </tr>

                                {tabs.length > 0 && tabs.map((tab) => (
                                  <tr key={tab} className="border-b hover:bg-gray-50">
                                    <td className="px-8 py-2 text-sm font-normal text-secondary">
                                      ↳ {formatName(tab)}
                                    </td>
                                    {privilegeKeys.map((perm) => (
                                      <td key={perm} className="px-4 py-2 text-center">
                                        <FormField
                                          control={form.control}
                                          name={`${module}.${subModule}.tabs.${tab}.${perm}` as any}
                                          render={({ field }) => {
                                            const tabView = form.getValues(`${module}.${subModule}.tabs.${tab}.view` as any);
                                            const isDisabled = perm !== 'view' && !tabView;
                                            
                                            return (
                                              <FormItem>
                                                <Checkbox
                                                  checked={field.value}
                                                  disabled={isDisabled}
                                                  onCheckedChange={(checked) => {
                                                    field.onChange(checked);
                                                    
                                                    if (checked) {
                                                      form.setValue(`${module}.${subModule}.subModule.${perm}` as any, true);
                                                    } else {
                                                      const hasOtherTabWithPerm = tabs.some((t) => {
                                                        if (t === tab) return false;
                                                        return form.getValues(`${module}.${subModule}.tabs.${t}.${perm}` as any) === true;
                                                      });
                                                      
                                                      if (!hasOtherTabWithPerm) {
                                                        form.setValue(`${module}.${subModule}.subModule.${perm}` as any, false);
                                                      }
                                                    }
                                                  }}
                                                />
                                              </FormItem>
                                            );
                                          }}
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </React.Fragment>
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
                {translations.buttons.cancel}
              </Button>
              <Button 
                type="button"
                size="lg" 
                disabled={isSubmitting}
                onClick={async () => {
                  const formValues = form.getValues();
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