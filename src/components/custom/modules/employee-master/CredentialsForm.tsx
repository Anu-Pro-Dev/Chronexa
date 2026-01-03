"use client";
import { useState } from "react";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import Required from "@/src/components/ui/required";
import { useRouter } from "next/navigation";
import { generateRandomPassword } from "@/src/utils/password";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { Eye, EyeOff } from "lucide-react";

export default function CredentialsForm({
  Page, 
  SetPage, 
  credentialsFormSchema, 
  credentialsForm, 
  selectedRowData,
}: {
  Page?: any;
  SetPage?: any;
  credentialsFormSchema: any;
  credentialsForm: any;
  selectedRowData?: any;
}) {
 
  const isEditing = !!selectedRowData;
  const showToast = useShowToast();
  const { translations } = useLanguage();
  const t = translations?.modules?.employeeMaster || {};
  const errT = translations?.formErrors || {};
  const [showPassword, setShowPassword] = useState(false);

  function onSubmit(values: z.infer<typeof credentialsFormSchema>) {
    try {
      SetPage("official-form");
      if (!isEditing) {
        showToast("success", "data_saved");
      }
    } catch (error) {
      console.error("Form submission error", error);
      showToast("error", "formsubmission_error");
    }
  }

  const handleNext = () => {
    if (isEditing) {
      SetPage("official-form");
    } else {
      credentialsForm.handleSubmit(onSubmit)();
    }
  };

  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <Form {...credentialsForm}>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}>
        <div className="grid gap-y-5 px-8 pt-5">
          <FormField
            control={credentialsForm.control}
            name="username"
            render={({ field }) => (
              <FormItem className="flex gap-5 items-center">
                <div className="">
                  <FormLabel className="">
                    {t.username || "Username"} {!isEditing && <Required />}
                  </FormLabel>
                </div>
                <div>
                  <FormControl>
                    <Input 
                      placeholder={t.placeholder_username || "Enter the username"} 
                      type="text" 
                      {...field} 
                      disabled={isEditing}
                      className={isEditing ? "bg-gray-100 cursor-not-allowed" : ""}
                    />
                  </FormControl>
                  {!isEditing && (
                    <TranslatedError 
                      fieldError={credentialsForm.formState.errors.username} 
                      translations={errT} 
                    />
                  )}
                </div>
              </FormItem>
            )}
          />
  
          <FormField
            control={credentialsForm.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex gap-5 items-center">
                <div className="">
                  <FormLabel className="">
                    {t.password || "Password"} {!isEditing && <Required />}
                  </FormLabel>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <FormControl>
                        <Input
                          placeholder={isEditing ? "••••••••" : (t.placeholder_create_password || "Click 'Create Password'")}
                          type={showPassword ? "text" : "password"}
                          {...field}
                          readOnly
                          disabled={isEditing}
                          className={`pr-10 ${isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        />
                      </FormControl>
                      {!isEditing && field.value && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    {!isEditing && (
                      <Button
                        type="button"
                        variant={"gradient"}
                        className="text-sm"
                        onClick={() => {
                          const newPassword = generateRandomPassword();
                          credentialsForm.setValue("password", newPassword);
                          showToast("success", "password_generated");
                        }}
                      >
                        {translations.buttons.create_password || "Create Password"}
                      </Button>
                    )}
                  </div>
                  {!isEditing && (
                    <TranslatedError 
                      fieldError={credentialsForm.formState.errors.password} 
                      translations={errT} 
                    />
                  )}
                </div>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 items-center py-5">
          <div className="flex gap-4 px-5">
            <Button
              variant={"outline"}
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => SetPage("personal-form")}
            >
              {translations.buttons.back || "Back"}
            </Button>
            <Button 
              type="button" 
              size={"lg"} 
              className="w-full"
              onClick={handleNext}
            >
              {translations.buttons.next || "Next"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}