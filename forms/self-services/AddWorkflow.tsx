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
import { GenerateIcon } from "@/icons/icons";

const formSchema = z.object({
  code: z.string().min(1, { message: "Required" }).max(100),
  levels: z.string().min(1, { message: "Required" }).max(100),
  workflows: z.string().min(1, { message: "Required" }).max(100),
});

export default function AddWorkflow() {
  const [rows, setRows] = useState<number[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "", levels: "", workflows: "" },
  });

  const router = useRouter();
  const [selectedLevels, setSelectedLevels] = useState(0);

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      const levelsCount = Number(values.levels);
      setRows(Array.from({ length: levelsCount }, (_, i) => i + 1));
      setSelectedLevels(parseInt(values.levels));
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  const getOnSuccessOptions = () => {
    let options = [];
    for (let i = 2; i <= selectedLevels; i++) {
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
            <h1 className="font-semibold text-sm text-text-secondary">
              Select the levels for further process
            </h1>
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
                  <Select onValueChange={field.onChange}>
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
            />
          </div>
          <div className="w-full flex pt-8 gap-2 items-center justify-end">
            <Button type="submit" variant="success" size="sm">
              <GenerateIcon /> Generate
            </Button>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="bg-accent p-6 rounded-2xl">
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
            <div className="flex justify-end gap-4 pt-6">
              <Button variant="outline" type="button" size="lg" onClick={() => router.push("/self-services/workflow")}>
                Cancel
              </Button>
              <Button type="submit" size="lg">
                Save
              </Button>
            </div>
            {/* </div> */}
          </div>
        )}
      </form>
    </Form>
  );
}
