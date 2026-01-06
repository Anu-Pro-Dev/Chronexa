"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
import Required from "@/src/components/ui/required";
import { useLiteLanguage } from "@/src/providers/LiteLanguageProvider";
import { PublicAxiosInstance } from "@/src/lib/axios";
import TranslatedError from "@/src/utils/translatedError";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useShowToast } from "@/src/utils/toastHelper";

const formSchema = z.object({
  new_password: z
    .string()
    .min(6, { message: "password_min_length" }),
  confirm_password: z.string().min(1, { message: "confirm_password_required" }),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "passwords_dont_match",
  path: ["confirm_password"],
});

export default function ResetPasswordPage() {
  const { translations, language } = useLiteLanguage();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const loginId = searchParams?.get("loginId") || "";
  const router = useRouter();
  const showToast = useShowToast();

  const [valid, setValid] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const t = translations?.modules?.auth || {};
  const errT = translations?.formErrors || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const isJwtExpired = (t: string) => {
    try {
      const parts = t.split(".");
      if (parts.length !== 3) return true;
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      if (!payload.exp) return true;
      return Date.now() / 1000 >= payload.exp;
    } catch (err) {
      return true;
    }
  };

  useEffect(() => {
    if (!token) {
      setValid(false);
      return;
    }
    const expired = isJwtExpired(token);
    setValid(!expired);
  }, [token]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await PublicAxiosInstance.post(
        "/auth/reset-password",
        { newPassword: values.new_password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.status === 200 || res.status === 201) {
        showToast("success", "reset_password_success");
        timeoutRef.current = window.setTimeout(
          () => router.push("/"),
          2000
        ) as unknown as number;
      }
    } catch (err: any) {
      showToast("error", "reset_password_error");
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative z-50 h-screen w-full grid place-items-center">
      <Image
        src="/AppBG.jpg"
        alt="Time Management"
        fill
        priority
        unoptimized
        className="object-cover"
      />
      
      <div className="bg-backdrop bg-opacity-50 backdrop-blur-sm relative z-10 w-full h-full flex flex-col justify-center items-center p-4">
        <div className="flex flex-col gap-5">
          <div className="w-10/12 max-w-[400px] sm:w-[400px] z-50 bg-accent p-6 shadow-popup rounded-[20px] flex flex-col gap-5">
            <div className="flex flex-col text-center gap-2">
              <div className="text-lg font-bold text-text-primary uppercase">
                {t.reset_password || "RESET PASSWORD"}
              </div>
              <div className="text-base font-semibold text-text-secondary">
                {valid === null
                  ? t.checking_reset_link || "Checking reset link..."
                  : valid
                  ? t.reset_password_for || `Reset password for ${loginId || "your account"}`
                  : t.reset_link_invalid || "Reset link is invalid or expired"}
              </div>
            </div>
            {valid && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-16 gap-y-4">
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
                                  placeholder={t.placeholder_new_password || "Enter new password"}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className={`absolute top-1/2 text-text-secondary -translate-y-1/2 ${language === 'ar' ? 'left-3' : 'right-3'}`}
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
                                  placeholder={t.placeholder_confirm_password || "Confirm new password"}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className={`absolute top-1/2 text-text-secondary -translate-y-1/2 ${language === 'ar' ? 'left-3' : 'right-3'}`}
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
                        onClick={() => router.push("/")}
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
            )}

            {valid === false && (
              <div className="text-center">
                <div className="text-sm text-destructive mb-4">
                  {t.reset_link_invalid || "Reset link is invalid or expired"}
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/")}
                >
                  {t.back_to_login || "Back to Login"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}