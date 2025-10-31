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
import ApplyMissingPunch from "@/src/components/custom/modules/self-services/ApplyMissingPunch";

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
  size,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: "small" | "medium" | "large" | "extraLarge"; 
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload: any = {
        to: values.to,
        subject: values.subject,
        body: values.body,
      };
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
      <ResponsiveModalContent size={size}>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Apply Missing Punch</ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <ApplyMissingPunch/>

      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
