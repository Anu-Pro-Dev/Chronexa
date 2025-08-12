"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import Required from "@/components/ui/required";
import toast from "react-hot-toast";
import { GenerateIcon, AddIcon } from "@/icons/icons";
import { useLanguage } from "@/providers/LanguageProvider";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  addWorkflowTypeRequest,
  editWorkflowTypeRequest,
  addWorkflowTypeStepRequest,
  editWorkflowTypeStepRequest,
} from "@/lib/apiHandler";

const formSchema = z.object({
  workflow_code: z.string().min(1, { message: "Required" }).max(100),
  workflow_category: z.string().min(1, { message: "Required" }).max(100),
  workflow_name: z.string().min(1, { message: "Required" }).max(100),
});

interface StepData {
  id: number;
  stepName: string;
  roleId: string;
  onSuccess: string;
  onFailure: string;
  workflow_steps_id?: number;
  step_order?: number;
}

export default function AddWorkflow() {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<number[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [stepData, setStepData] = useState<Record<number, StepData>>({});
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [existingWorkflowData, setExistingWorkflowData] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { workflow_code: "", workflow_category: "", workflow_name: "" },
  });

  useEffect(() => {
    const editData = sessionStorage.getItem('editWorkflowData');
    if (editData) {
      const workflowData = JSON.parse(editData);
      setSelectedRow(workflowData);
      setExistingWorkflowData(workflowData);
      setWorkflowId(workflowData.workflow_id?.toString());
      let categoryValue = '';
      const engCategory = workflowData.workflow_category_eng;
      const arbCategory = workflowData.workflow_category_arb;
      
      const validCategories = ['Permissions', 'Leaves', 'Punches'];
      if (validCategories.includes(engCategory)) {
        categoryValue = engCategory;
      } else if (validCategories.includes(arbCategory)) {
        categoryValue = arbCategory;
      } else {
        categoryValue = language === 'ar' ? (arbCategory || engCategory || '') : (engCategory || arbCategory || '');
      }

      setTimeout(() => {
        form.setValue('workflow_code', workflowData.workflow_code || '');
        form.setValue('workflow_category', categoryValue);
        form.setValue('workflow_name', 
          language === 'ar' 
            ? workflowData.workflow_name_arb || workflowData.workflow_name_eng || ''
            : workflowData.workflow_name_eng || workflowData.workflow_name_arb || ''
        );
      }, 100);

      if (workflowData.workflow_type_steps && workflowData.workflow_type_steps.length > 0) {
        setShowTable(true);
        const stepRows = workflowData.workflow_type_steps.map((_: any, index: number) => index + 1);
        setRows(stepRows);
        
        const stepDataMap: Record<number, StepData> = {};
        workflowData.workflow_type_steps.forEach((step: any, index: number) => {
          stepDataMap[index + 1] = {
            id: index + 1,
            stepName: language === 'ar' ? step.step_arb || '' : step.step_eng || '',
            roleId: step.role_id?.toString() || '',
            onSuccess: step.is_final_step ? 'approved' : `step${index + 2}`,
            onFailure: 'Rejected',
            workflow_steps_id: step.workflow_steps_id,
            step_order: step.step_order
          };
        });
        setStepData(stepDataMap);
      }

      sessionStorage.removeItem('editWorkflowData');
    }
  }, [form, language]);

  useEffect(() => {
    if (selectedRow && existingWorkflowData) {
      const nameValue = language === 'ar' 
        ? existingWorkflowData.workflow_name_arb || existingWorkflowData.workflow_name_eng || ''
        : existingWorkflowData.workflow_name_eng || existingWorkflowData.workflow_name_arb || '';
      
      form.setValue('workflow_name', nameValue);
    }
  }, [language, selectedRow, existingWorkflowData, form]);

  const addWorkflowMutation = useMutation({
    mutationFn: addWorkflowTypeRequest,
    onSuccess: (response) => {
      toast.success("Workflow added successfully!");
      queryClient.invalidateQueries({ queryKey: ["workflowType"] });
      const workflowId = response.data?.workflow_id || response.workflow_id;
      setWorkflowId(workflowId?.toString());
      setRows([1]);
      setShowTable(true);
      setStepData({
        1: {
          id: 1,
          stepName: "",
          roleId: "",
          onSuccess: "",
          onFailure: "Rejected"
        }
      });
    },
    onError: (error: any) => {
      toast.error("Failed to add workflow.");
    },
  });

  const editWorkflowMutation = useMutation({
    mutationFn: editWorkflowTypeRequest,
    onSuccess: (response) => {
      toast.success("Workflow updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["workflowType"] });
      if (!showTable) {
        setShowTable(true);
        if (rows.length === 0) {
          setRows([1]);
          setStepData({
            1: {
              id: 1,
              stepName: "",
              roleId: "",
              onSuccess: "",
              onFailure: "Rejected"
            }
          });
        }
      }
    },
    onError: (error: any) => {
      toast.error("Failed to update workflow.");
    },
  });

  const addRowBelow = (index: number) => {
    if (rows.length >= 5) return;
    const newId = rows.length ? Math.max(...rows) + 1 : 1;
    const newRows = [...rows];
    newRows.splice(index + 1, 0, newId);
    setRows(newRows);
    
    setStepData(prev => ({
      ...prev,
      [newId]: {
        id: newId,
        stepName: "",
        roleId: "",
        onSuccess: "",
        onFailure: "Rejected"
      }
    }));
  };

  const updateStepData = (rowId: number, field: keyof StepData, value: string) => {
    setStepData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value
      }
    }));
  };

  const addStepMutation = useMutation({
    mutationFn: addWorkflowTypeStepRequest,
    onSuccess: () => {
      toast.success("Step saved successfully!");
    },
    onError: (error: any) => {
      toast.error("Error saving step.");
    },
  });

  const editStepMutation = useMutation({
    mutationFn: editWorkflowTypeStepRequest,
    onSuccess: () => {
      toast.success("Step updated successfully!");},
    onError: (error: any) => {
      toast.error("Error updating step.");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload: any = {
        workflow_code: values.workflow_code,
      };

      if (language === "en") {
        payload.workflow_name_eng = values.workflow_name;
        payload.workflow_category_eng = values.workflow_category;
      } else {
        payload.workflow_name_arb = values.workflow_name;
        payload.workflow_category_arb = values.workflow_category;
      }

      if (selectedRow && workflowId) {
        payload.workflow_id = parseInt(workflowId);
        editWorkflowMutation.mutate(payload);
      } else {
        addWorkflowMutation.mutate(payload);
      }
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  const handleSaveSteps = async () => {
    try {
      const incompleteSteps = rows.filter(rowId => {
        const step = stepData[rowId];
        return !step?.stepName || !step?.roleId || !step?.onSuccess;
      });

      if (incompleteSteps.length > 0) {
        toast.error("Please fill in all required fields for all steps.");
        return;
      }

      const stepPromises = rows.map(async (rowId, index) => {
        const step = stepData[rowId];
        const stepOrder = index + 1;
        
        const stepPayload: any = {
          workflow_id: workflowId ? parseInt(workflowId) : undefined,
          step_order: stepOrder,
          role_id: parseInt(step.roleId),
          is_final_step: step.onSuccess === "approved",
        };

        if (language === "en") {
          stepPayload.step_eng = step.stepName;
        } else {
          stepPayload.step_arb = step.stepName;
        }

        if (step.workflow_steps_id) {
          stepPayload.workflow_steps_id = step.workflow_steps_id;
          return editStepMutation.mutateAsync(stepPayload);
        } else {
          return addStepMutation.mutateAsync(stepPayload);
        }
      });

      await Promise.all(stepPromises);
      
      toast.success(`All workflow steps ${selectedRow ? 'updated' : 'saved'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["workflowType"] });
      queryClient.invalidateQueries({ queryKey: ["workflowSteps"] });
      router.push("/self-services/workflow");
      
    } catch (error) {
      console.error("Error processing steps:", error);
      toast.error(`Failed to ${selectedRow ? 'update' : 'save'} some workflow steps.`);
    }
  };

  const getOnSuccessOptions = (currentIndex: number) => {
    const options = [];

    for (let i = currentIndex + 2; i <= rows.length; i++) {
      options.push({ value: `step${i}`, label: `Step ${i}` });
    }

    options.push({ value: "approved", label: "Approved" });
    return options;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="bg-accent p-6 rounded-2xl">
          <div className="pb-5">
            <h1 className="font-bold text-xl text-primary">
              {selectedRow ? "Edit Workflow" : "Generate the workflows"}
            </h1>
          </div>
          <div className="grid lg:grid-cols-3 gap-10">
            <FormField
              control={form.control}
              name="workflow_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code <Required/></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the code" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workflow_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflows <Required/></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} key={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose workflows category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Permissions">Permissions</SelectItem>
                      <SelectItem value="Leaves">Leaves</SelectItem>
                      <SelectItem value="Punches">Punches</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workflow_name"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>
                    {language === "ar"
                      ? "Workflow name (العربية) "
                      : "Workflow name (English) "}
                    <Required />
                  </FormLabel>
                  <FormControl>
                  <Input placeholder="Enter Workflow name" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
            />
          </div>
          <div className="w-full flex pt-8 gap-2 items-center justify-end">
            <Button
              type="submit"
              variant="success"
              size="sm"
              disabled={
                selectedRow
                  ? editWorkflowMutation.isPending
                  : addWorkflowMutation.isPending
              }
            >
              {selectedRow ? (
                editWorkflowMutation.isPending ? "Updating..." : "Update"
              ) : (
                <>
                  <GenerateIcon />
                  {addWorkflowMutation.isPending ? "Generating..." : "Generate"}
                </>
              )}
            </Button>
          </div>
        </div>

        {showTable && (
          <div className="bg-accent px-6 py-8 rounded-2xl">
            <div className="grid gap-4">
              <div className="grid grid-cols-[24px,80px,1fr,1fr,1fr,1fr] gap-4 text-[15px] font-semibold text-text-content text-center">
                <div></div>
                <div>Step Order</div>
                <div>Step Name</div>
                <div>Role</div>
                <div>On Success</div>
                <div>On Failure</div>
              </div>
              {rows.map((rowId, index) => (
                <div
                  key={rowId}
                  className="grid grid-cols-[24px,80px,1fr,1fr,1fr,1fr] gap-4 items-center"
                >
                  {index === rows.length - 1 && rows.length < 5 ? (
                    <button
                      type="button"
                      onClick={() => addRowBelow(index)}
                      className="text-text-content hover:text-primary text-center"
                    >
                      <AddIcon width="24px" height="24px" />
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="text-[15px] font-semibold text-center text-text-content whitespace-nowrap">
                    {index + 1}
                  </div>

                  <Input 
                    type="text" 
                    placeholder="Enter step name" 
                    className="w-full"
                    value={stepData[rowId]?.stepName || ""}
                    onChange={(e) => updateStepData(rowId, 'stepName', e.target.value)}
                  />

                  <Select 
                    value={stepData[rowId]?.roleId || ""}
                    onValueChange={(value) => updateStepData(rowId, 'roleId', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Role 1</SelectItem>
                      <SelectItem value="2">Role 2</SelectItem>
                      <SelectItem value="3">Role 3</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={stepData[rowId]?.onSuccess || ""}
                    onValueChange={(value) => updateStepData(rowId, 'onSuccess', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose Step" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOnSuccessOptions(index).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input 
                    type="text" 
                    placeholder="Rejected" 
                    className="w-full"
                    value={stepData[rowId]?.onFailure || "Rejected"}
                    onChange={(e) => updateStepData(rowId, 'onFailure', e.target.value)}
                  />

                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 pt-8">
              <Button
                variant="outline"
                type="button"
                size="lg"
                onClick={() => {
                  setShowTable(false);
                  setRows([]);
                  setStepData({});
                  router.push("/self-services/workflow");
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                size="lg"
                onClick={handleSaveSteps}
                disabled={addStepMutation.isPending || editStepMutation.isPending}
              >
                {editStepMutation.isPending
                  ? "Updating..."
                  : addStepMutation.isPending
                  ? "Saving..."
                  : selectedRow
                  ? "Update"
                  : "Save"}
              </Button>

            </div>
          </div>
        )}
      </form>
    </Form>
  );
}