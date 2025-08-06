"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Required from "@/components/ui/required";
import CountryDropdown from "@/components/custom/country-dropdown";
import { useCountries } from "@/hooks/useCountries";
import { useLanguage } from "@/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCitizenshipRequest, editCitizenshipRequest } from "@/lib/apiHandler";

const formSchema = z.object({
  citizenship_code: z.string().optional(),
});

export default function AddCitizenship({
  on_open_change,
  selectedRowData,
  onSave,
}: {
  on_open_change: (val: boolean) => void;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
}) {

  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { countries, getCountryByCode } = useCountries();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      citizenship_code: "",
    },
  });

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
  }, [selectedRowData, language]);

  const addMutation = useMutation({
    mutationFn: addCitizenshipRequest,
    onSuccess: (data) => {
      toast.success("Citizenship added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["citizenship"] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editCitizenshipRequest,
    onSuccess: (_data, variables) => {
      toast.success("Citizenship updated successfully!");
      onSave(
        variables.citizenship_id?.toString() ?? null,
        variables
      );
      queryClient.invalidateQueries({ queryKey: ["citizenship"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    if (!selectedCountry) {
      toast.error("Please select a country.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        citizenship_code: selectedCountry.country_code,
        citizenship_eng: selectedCountry.country_eng,
        citizenship_arb: selectedCountry.country_arb,
      };

      addMutation.mutate(payload);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    displayMode="full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="w-full flex gap-2 items-center pt-8 py-3">
          <Button
            variant="outline"
            type="button"
            size="lg"
            className="w-full"
            onClick={() => on_open_change(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
