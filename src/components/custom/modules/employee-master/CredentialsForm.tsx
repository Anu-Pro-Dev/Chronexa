"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import * as z from "zod"
import { Button } from "@/src/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import Required from "@/src/components/ui/required";
import { useRouter } from "next/navigation";
import { generateRandomPassword } from "@/src/utils/password";

export default function credentialsForm({
  Page, SetPage,credentialsFormSchema,credentialsForm, selectedRowData,
}: {
  Page?: any;
  SetPage?:any;
  credentialsFormSchema:any;
  credentialsForm:any
  selectedRowData?: any;
}) {
 
  const isEditing = !!selectedRowData;

  function onSubmit(values: z.infer<typeof credentialsFormSchema>) {
    try {
      SetPage("official-form");
      toast.success("Data Saved!");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <Form {...credentialsForm}>
      <form onSubmit={credentialsForm.handleSubmit(onSubmit)}>
        <div className="grid gap-y-5 px-8 pt-5">
          <FormField
            control={credentialsForm.control}
            name="username"
            render={({ field }) => (
                <FormItem className="flex gap-5 items-center">
                  <div className="">
                    <FormLabel className="">Username <Required /></FormLabel>
                  </div>
                  <div>
                    <FormControl>
                      <Input placeholder="Enter the username" type="text" {...field} disabled={isEditing}/>
                    </FormControl>
                    <FormMessage className="mt-1"/>
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
                  <FormLabel className="">Password <Required /></FormLabel>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3">
                    <FormControl>
                      <Input
                        placeholder="Click 'Create Password'"
                        type={isEditing ? "password" : "text"}
                        {...field}
                        readOnly
                        disabled={isEditing}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant={"gradient"}
                      className="text-sm"
                      disabled={isEditing}
                      onClick={() => {
                        const newPassword = generateRandomPassword();
                        credentialsForm.setValue("password", newPassword);
                        toast.success("Password generated!");
                      }}
                    >
                      Create Password
                    </Button>
                  </div>
                  <FormMessage className="mt-1" />
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
              onClick={() => setStep((prev) => prev - 1)}
            >
              Back
            </Button>
            <Button type="submit" size={"lg"} className="w-full">
              Next
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
