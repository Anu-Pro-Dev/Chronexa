"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import { addRegionRequest } from "@/lib/apiHandler"; // Import API request function

const formSchema = z.object({
  code: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  descriptionEng: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  descriptionArb: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
});

export default function AddCompanyMaster({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      descriptionEng: "",
      descriptionArb: "",
    },
  });

  const [selectedNationality, setSelectedNationality] = useState<string>("");

  // Reset form when modal is opened for Add or when selectedRowData is null
  useEffect(() => {
    if (!selectedRowData) {
      form.reset(); // Reset the form values when in "Add" mode
    } else {
      form.reset({
        code: selectedRowData.code,
        descriptionEng: selectedRowData.descriptionEng,
        descriptionArb: selectedRowData.descriptionArb,
      }); // Pre-fill the form when in "Edit" mode
    }
  }, [selectedRowData, form]);

  const handleSave = () => {
    const formData = form.getValues(); // Get the form data directly from the hook
    if (selectedRowData) {
      // Update existing row
      onSave(selectedRowData.id, formData);
    } else {
      // Add new row
      onSave(null, formData);
    }
    on_open_change(false); // Close modal after saving
  };

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Submitting:", values);

      if (selectedRowData) {
        // Update logic (edit mode)
        onSave(selectedRowData.id, values);
        console.log("Updating region:", values);
      } else {
        // Add logic (create mode) - Call API
        const response = await addRegionRequest(values.code, values.descriptionArb, values.descriptionEng);
        console.log("Region added successfully:", response);
        
        onSave(null, response); // Use response data if needed
      }

      on_open_change(false); // Close the modal after submission
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Code <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter the code" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionEng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description (English) <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter description here..." type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionArb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description (العربية) <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter description here..." type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full flex gap-2 items-center py-3">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => on_open_change(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size={"lg"} className="w-full">
              {selectedRowData ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
