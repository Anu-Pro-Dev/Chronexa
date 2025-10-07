"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import TranslatedError from "@/src/utils/translatedError";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation } from "@tanstack/react-query";
import { useShowToast } from "@/src/utils/toastHelper";
import { sendTestEmailRequest } from "@/src/lib/apiHandler";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/src/components/ui/responsive-modal";

const formSchema = z.object({
  to: z.string().min(1, { message: "email_required" }).email({ message: "email_invalid" }),
  subject: z.string().min(1, { message: "subject_required" }).max(200, { message: "subject_max_length" }),
  body: z.string().min(1, { message: "body_required" }),
  cc: z.string().email({ message: "email_invalid" }).optional().or(z.literal("")),
  bcc: z.string().email({ message: "email_invalid" }).optional().or(z.literal("")),
});

export default function TestEmailModal({
  open,
  onOpenChange,
  emailSettingId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailSettingId?: string | number;
}) {
  const { translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useShowToast();
  const errT = translations?.formErrors || {};
  const btnT = translations?.buttons || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: "",
      subject: "Email Configuration Test",
      body: "This is a test email to verify the email configuration is working correctly.",
      cc: "",
      bcc: "",
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: (payload: any) => sendTestEmailRequest({ ...payload, emailSettingId }),
    onSuccess: () => {
      showToast("success", "test_email_sent");
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error(error);
      showToast("error", "");
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload: any = {
        to: values.to,
        subject: values.subject,
        body: values.body,
      };
      if (values.cc) payload.cc = values.cc;
      if (values.bcc) payload.bcc = values.bcc;

      testEmailMutation.mutate(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Test Email Configuration</ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5">
            <div className="flex flex-col gap-4">
              <div className="grid gap-16 gap-y-4">
                <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>
                        To Email <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter recipient email" type="email" {...field} />
                      </FormControl>
                      <TranslatedError fieldError={form.formState.errors.to} translations={errT} />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full flex gap-2 items-center pt-4 py-2">
                <Button
                  variant="outline"
                  type="button"
                  size="lg"
                  className="w-full"
                  onClick={handleCancel}
                >
                  {btnT?.cancel || "Cancel"}
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Test Email"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
