"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/ui/responsive-modal";
import Required from "@/src/components/ui/required";
import { useLiteLanguage } from "@/src/providers/LiteLanguageProvider";
import { useMutation } from "@tanstack/react-query";
import { changePasswordRequest } from "@/src/lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import TranslatedError from "@/src/utils/translatedError";
import { IoEye, IoEyeOff } from "react-icons/io5";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; 

const formSchema = z.object({
  old_password: z.string().min(1, { message: "old_password_required" }),
  new_password: z
    .string()
    .min(6, { message: "password_min_length" }),
  confirm_password: z.string().min(1, { message: "confirm_password_required" }),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "passwords_dont_match",
  path: ["confirm_password"],
});

export default function ChangePasswordModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { translations, language } = useLiteLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const showToast = useShowToast();
  const router = useRouter();
  const t = translations?.modules?.companyMaster || {};
  const errT = translations?.formErrors || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: () => {
      showToast("success", "password_changed_success");
      form.reset();
      onOpenChange(false);
      
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      sessionStorage.clear();
      
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      setTimeout(() => {
        router.push("/");
      }, 1000);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error ||
                          error?.message ||
                          "Failed to change password";
      
      toast.error(errorMessage);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: values.old_password,
        newPassword: values.new_password,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={handleClose}>
      <ResponsiveModalContent size="medium">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            {translations?.change_password || "Change Password"}
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4 mt-5">
              <div className="grid gap-16 gap-y-4">
                <FormField
                  control={form.control}
                  name="old_password"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>
                        {t.old_password || "Old Password"}
                        <Required />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showOldPassword ? "text" : "password"}
                            placeholder="Enter old password"
                            {...field}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className={`absolute top-1/2 text-text-secondary -translate-y-1/2                           
                              ${language === 'ar' ? 'left-3' : 'right-3'}`}
                          >
                            {showOldPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <TranslatedError
                        fieldError={form.formState.errors.old_password}
                        translations={errT}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>
                        {t.new_password || "New Password"}
                        <Required />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            {...field}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className={`absolute top-1/2 text-text-secondary -translate-y-1/2                           
                              ${language === 'ar' ? 'left-3' : 'right-3'}`}
                          >
                            {showNewPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <TranslatedError
                        fieldError={form.formState.errors.new_password}
                        translations={errT}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>
                        {t.confirm_password || "Confirm Password"}
                        <Required />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            {...field}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={`absolute top-1/2 text-text-secondary -translate-y-1/2                           
                              ${language === 'ar' ? 'left-3' : 'right-3'}`}
                          >
                            {showConfirmPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <TranslatedError
                        fieldError={form.formState.errors.confirm_password}
                        translations={errT}
                      />
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
                  onClick={handleClose}
                >
                  {translations?.buttons?.cancel || "Cancel"}
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? translations?.buttons?.saving || "Saving..."
                    : translations?.buttons?.save || "Save"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}