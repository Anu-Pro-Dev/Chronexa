"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import { GenerateIcon, AddIcon } from "@/icons/icons";
import { useLanguage } from "@/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDesignationRequest, editDesignationRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  code: z.string().min(1, { message: "Required" }).max(100),
  // levels: z.string().min(1, { message: "Required" }).max(100),
  workflows: z.string().min(1, { message: "Required" }).max(100),
  workflow_name: z.string().default(""),
});

export default function AddWorkflow() {
  const {language } = useLanguage();
  const router = useRouter();
  const [rows, setRows] = useState<number[]>([]);
  const [showTable, setShowTable] = useState(false);

  const [selectedLevels, setSelectedLevels] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "", workflows: "", workflow_name: "", },
  });

  // function onSubmit(values: z.infer<typeof formSchema>) {
  //   try {
  //     const levelsCount = Number(values.levels);
  //     setRows(Array.from({ length: levelsCount }, (_, i) => i + 1));
  //     setSelectedLevels(parseInt(values.levels));
  //   } catch (error) {
  //     console.error("Form submission error", error);
  //   }
  // }

  const addRowBelow = (index: number) => {
    if (rows.length >= 5) return; // Prevent adding more than 5 rows
    const newId = rows.length ? Math.max(...rows) + 1 : 1;
    const newRows = [...rows];
    newRows.splice(index + 1, 0, newId);
    setRows(newRows);
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setRows([1]); // One row initially
      setShowTable(true);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

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
            <h1 className="font-bold text-xl text-primary">Generate the workflows</h1>
          </div>
          <div className="grid lg:grid-cols-3 gap-10">
            <FormField
              control={form.control}
              name="code"
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
              name="workflows"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflows <Required/></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose workflows" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Leaves</SelectItem>
                      <SelectItem value="2">Permissions</SelectItem>
                      <SelectItem value="3">Missing movements</SelectItem>
                      <SelectItem value="4">Manual movements</SelectItem>
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
            {/* <FormField
              control={form.control}
              name="levels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Levels <Required/></FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose levels" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
          </div>
          <div className="w-full flex pt-8 gap-2 items-center justify-end">
            <Button type="submit" variant="success" size="sm">
              <GenerateIcon /> Generate
            </Button>
          </div>
        </div>

        {/* {rows.length > 0 && (
          <div className="bg-accent p-8 rounded-2xl">
            <div className="grid gap-4">
              <div className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr] gap-4 text-[15px] font-semibold text-text-content text-center">
                <div></div>
                <div>Type</div>
                <div>Value</div>
                <div>On Success</div>
                <div>On Failure</div>
                <div>Status Text</div>
              </div>

              {rows.map((level) => (
                <div key={level} className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr] gap-4">
                  <div className="flex items-center text-[15px] font-semibold text-text-content whitespace-nowrap">{`${level}`}</div>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose Workflows" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workflow1">Employee</SelectItem>
                      <SelectItem value="workflow2">Group</SelectItem>
                      <SelectItem value="workflow3">Organization</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="value1">Value 1</SelectItem>
                      <SelectItem value="value2">Value 2</SelectItem>
                      <SelectItem value="value3">Value 3</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose step" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOnSuccessOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input type="text" placeholder="Rejected" className="w-full" />
                  <Input type="text" placeholder="Enter sample text" className="w-full" />
                </div>
              ))}
            </div>
            {/* <div className="flex justify-end gap-2 items-center pt-7 py-5"> */}
            {/* <div className="flex justify-end gap-4 pt-8">
              <Button variant="outline" type="button" size="lg" onClick={() => router.push("/self-services/workflow")}>
                Cancel
              </Button>
              <Button type="submit" size="lg">
                Save
              </Button>
            </div>
            {/* </div> */}
          {/* </div> */}
        {/* )} */} 
        {showTable && (
          <div className="bg-accent px-6 py-8 rounded-2xl">
            <div className="grid gap-4">
              <div className="grid grid-cols-[40px,80px,1fr,1fr,1fr,1fr] gap-4 text-[15px] font-semibold text-text-content text-center">
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
                  className="grid grid-cols-[40px,80px,1fr,1fr,1fr,1fr] gap-4 items-center"
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

                  <Input type="text" placeholder="Enter step name" className="w-full" />

                  {/* <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                    </SelectContent>
                  </Select> */}

                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose Value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Value 1</SelectItem>
                      <SelectItem value="2">Value 2</SelectItem>
                      <SelectItem value="3">Value 3</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
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

                  <Input type="text" placeholder="Rejected" className="w-full" />

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
                  router.push("/self-services/workflow");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg">
                Save
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}