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
import Required from "@/components/ui/required";
import { useRouter } from "next/navigation";
import NationalityDropdown from "@/components/custom/NationalityDropdown";
import { addCitizenshipRequest } from "@/lib/apiHandler"; 

// Country type definition
interface Country {
  code: string;
  name: string;
  nameAr: string;
  flag: string;
}

const formSchema = z.object({
  code: z.any().optional(),
});

export default function AddCitizenship({
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
    },
  });
  
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Handle the country selection
  const handleCountryChange = (country: Country | null) => {
    if (country) {
      setSelectedCountry(country);
      form.setValue("code", country.code);
    } else {
      setSelectedCountry(null);
      form.setValue("code", "");
    }
  };
  
  // Reset form when modal is opened for Add or when selectedRowData is null
  useEffect(() => {
    if (!selectedRowData) {
      form.reset();
    } else {
      form.reset({
        code: selectedRowData.code,
      });
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
      const { code } = values;
      const selectedNationality = selectedCountry;
      if (!selectedNationality) {
        console.error("No citizenship selected");
        return;
      }

      const countryCode = selectedNationality.code;
      const citizenshipEng = selectedNationality.name;
      const citizenshipArb = selectedNationality.nameAr;

      if (!selectedRowData) {
        await addCitizenshipRequest(countryCode, citizenshipEng, citizenshipArb);
      } else {
        onSave(selectedRowData.id, values);
      }

      on_open_change(false);
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
                  Citizenship <Required />
                </FormLabel>
                <FormControl>
                  <NationalityDropdown value={selectedCountry} onChange={handleCountryChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="w-full flex gap-2 items-center pt-8 py-3">
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
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
