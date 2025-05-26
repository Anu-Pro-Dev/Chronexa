"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
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
import CountryDropdown from "@/components/custom/country-dropdown";
import { useCountries } from "@/hooks/use-countries";
import { useLanguage } from "@/providers/LanguageProvider";
import { addCitizenshipRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  citizenship_code: z.string().optional(),
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
      citizenship_code: "",
    },
  });

  const {language } = useLanguage();
  const { countries, getCountryByCode } = useCountries();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);

  const handleCountryChange = (country: any | null) => {
    if (country) {
      setSelectedCountry(country);
      form.setValue("citizenship_code", country.citizenship_code);
    } else {
      setSelectedCountry(null);
      form.setValue("citizenship_code", "");
    }
  };

  useEffect(() => {
    if (!selectedRowData) {
      form.reset();
      setSelectedCountry(null);
    } else {
      const matched = getCountryByCode(selectedRowData.code);
      form.reset({
        citizenship_code: selectedRowData.code,
      });
      setSelectedCountry(matched);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowData]);

  const handleSave = () => {
    const formData = form.getValues();
    if (selectedRowData) {
      onSave(selectedRowData.id, formData);
    } else {
      onSave(null, formData);
    }
    on_open_change(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!selectedCountry) {
        toast.error("Please select a country.");
        return;
      }

      const payload = {
        citizenship_code: selectedCountry.country_code,
        citizenship_eng: selectedCountry.country_eng,
        citizenship_arb: selectedCountry.country_arb,
      };

      if (!selectedRowData) {
        // Add new citizenship
        const response = await addCitizenshipRequest(payload);

        const newEntry = {
          id: response.citizenshipId,
          citizenship_code: selectedCountry.country_code,
          citizenship_eng: selectedCountry.country_eng,
          citizenship_arb: selectedCountry.country_arb,
        };

        toast.success("Citizenship added successfully!");
        onSave(null, newEntry);
      } else {
        // Editing existing, update UI with new payload only
        onSave(selectedRowData.id, payload);
      }

      on_open_change(false);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Something went wrong.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="citizenship_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Citizenship <Required />
                </FormLabel>
                <FormControl>
                  <CountryDropdown
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    countries={countries}
                    displayMode = "full"
                  />
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
