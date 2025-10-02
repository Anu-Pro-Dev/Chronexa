"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import CountryDropdown from "@/src/components/custom/common/country-dropdown";
import { useCountries } from "@/src/hooks/useCountries";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCitizenshipRequest, editCitizenshipRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";

const formSchema = z.object({
  citizenship_code: z.string().min(1, { message: "citizenship_code_select" }),
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

  const { language, translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { countries, getCountryByCode } = useCountries();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const queryClient = useQueryClient();
  const t = translations?.modules?.companyMaster || {};
  const errT = translations?.formErrors || {};
  const showToast = useShowToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      citizenship_code: "",
    },
  });

  const handleCountryChange = (country: any | null) => {
    if (country) {
      setSelectedCountry(country);
      form.setValue("citizenship_code", country.country_code);
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
      showToast("success", "addcitizenship_success");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["citizenship"] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error");
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: editCitizenshipRequest,
    onSuccess: (_data, variables) => {
      showToast("success", "updatecitizenship_success");
      onSave(
        variables.citizenship_id?.toString() ?? null,
        variables
      );
      queryClient.invalidateQueries({ queryKey: ["citizenship"] });
      on_open_change(false);
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        showToast("error", "findduplicate_error");
      } else {
        showToast("error", "formsubmission_error");
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

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
                  {t.citizenship} <Required />
                </FormLabel>
                <FormControl>
                  <CountryDropdown
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    countries={countries}
                    displayMode="full"
                  />
                </FormControl>
                <TranslatedError
                  fieldError={form.formState.errors.citizenship_code}
                  translations={errT}
                />
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
            {translations.buttons.cancel}
          </Button>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? selectedRowData
                ? translations.buttons.updating
                : translations.buttons.saving
              : selectedRowData
                ? translations.buttons.update
                : translations.buttons.save}
          </Button>
        </div>
      </form>
    </Form>
  );
}