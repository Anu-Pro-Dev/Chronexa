"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/src/components/ui/responsive-modal";
import { useRouter } from "next/navigation";
import Required from "@/src/components/ui/required";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { loginRequest, forgotPasswordRequest } from "@/src/lib/apiHandler";
import { useLiteLanguage } from "@/src/providers/LiteLanguageProvider";
import { useShowToast } from "@/src/utils/toastHelper";
import ThreeDotsLoader from "@/src/animations/ThreeDotsLoader";

export const useLoginFormSchema = () => {
  const { t } = useLiteLanguage();

  return z.object({
    username: z
      .string()
      .trim()
      .min(1, { message: t('modules.login.error_username') }),

    password: z
      .string()
      .min(1, { message: t('modules.login.error_password') }),

    remember_me: z.boolean().optional(),
  });
};

const useForgotPasswordSchema = () => {
  const { t } = useLiteLanguage();
  
  return z.object({
    username: z.string().trim().min(1, { message: t('formErrors.username_required') }),
  });
};

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [apiResponseMessage, setApiResponseMessage] = useState("");
  const { t, language } = useLiteLanguage();
  const showToast = useShowToast();
  const loginFormSchema = useLoginFormSchema();
  const forgotPasswordSchema = useForgotPasswordSchema();

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
      remember_me: false,
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: "",
    },
  });

  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (values: { username: string; password: string; remember_me: boolean }) =>
      loginRequest(values.username, values.password, values.remember_me),
    onSuccess: (response) => {
      if (response?.token) {
        showToast("success", "login_success");
        router.push("/dashboard");
      } else {
        loginForm.setError("username", {
          type: "manual",
          message: t('modules.login.error_login')
        });
      }
    },
    onError: (error: any) => {
      loginForm.setError("username", {
        type: "manual",
        message: t('modules.login.error_login')
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (login: string) => forgotPasswordRequest(login),
    onSuccess: (data) => {
      setApiResponseMessage(data.message || t('toastNotifications.forgot_password_success') || "Reset password link has been sent to your email.");
      forgotPasswordForm.reset();
    },
    onError: (error: any) => {
      showToast("error", "forgot_password_error");
    },
  });

  async function onLoginSubmit(values: z.infer<typeof loginFormSchema>) {
    loginMutation.mutate({
      username: values.username,
      password: values.password,
      remember_me: values.remember_me ?? false,
    });
  }

  async function onForgotPasswordSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    forgotPasswordMutation.mutate(values.username);
  }

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setApiResponseMessage("");
    forgotPasswordForm.reset();
    setForgotPasswordModalOpen(true);
  };

  const handleCloseForgotPasswordModal = () => {
    setForgotPasswordModalOpen(false);
    setApiResponseMessage("");
    forgotPasswordForm.reset();
  };

  const handleAdLogin = () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      window.location.href = `${baseUrl}/auth/azure`;
    } catch (error) {
      console.error("Azure AD redirect failed:", error);
    }
  };

  return (
    <>
      <Form {...loginForm}>
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="">
          <div className="flex flex-col gap-4">
            {/* Username Field */}
            <FormField
              control={loginForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('modules.login.username')} <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('modules.login.placeholder_username')}
                      type="text"
                      suppressHydrationWarning
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('modules.login.password')} <Required />
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder={t('modules.login.placeholder_password')}
                        type={showPassword ? "text" : "password"}
                        suppressHydrationWarning
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      tabIndex={-1}
                      className={`absolute top-1/2 text-text-secondary -translate-y-1/2                           
                        ${language === 'ar' ? 'left-3' : 'right-3'}`}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <FormField
                control={loginForm.control}
                name="remember_me"
                render={({ field }) => (
                  <FormItem className="">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember_me"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          suppressHydrationWarning
                        />
                        <FormLabel htmlFor="remember_me" className="text-sm text-text-primary font-semibold">
                          {t('modules.login.remember_me')}
                        </FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <button
                type="button"
                className="text-sm text-primary font-bold"
                onClick={handleForgotPasswordClick}
                suppressHydrationWarning
              >
                {t('modules.login.forgot_password')}
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size={"lg"}
              className="w-full min-w-[300px] mx-auto mt-2"
              suppressHydrationWarning
              disabled={loginMutation.status === "pending"}
            >
              {loginMutation.status === "pending" ? (
                <div className="flex items-center gap-2">
                  {t('buttons.logging_in')}
                  <ThreeDotsLoader />
                </div>
              ) : (
                t('buttons.login')
              )}
            </Button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border-grey" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-fullpage px-2 text-muted-foreground">
                  {t('modules.login.or') || "Or"}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full min-w-[300px] mx-auto"
              onClick={handleAdLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0H10.9091V10.9091H0V0Z" fill="#F25022" />
                <path d="M12.0909 0H23V10.9091H12.0909V0Z" fill="#7FBA00" />
                <path d="M0 12.0909H10.9091V23H0V12.0909Z" fill="#00A4EF" />
                <path d="M12.0909 12.0909H23V23H12.0909V12.0909Z" fill="#FFB900" />
              </svg>
              {t('modules.login.login_with_azure') || "Sign in with Azure AD"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Forgot Password Modal */}
      <ResponsiveModal open={forgotPasswordModalOpen} onOpenChange={handleCloseForgotPasswordModal}>
        <ResponsiveModalContent size="medium">
          <ResponsiveModalHeader className="gap-1">
            <ResponsiveModalTitle>
              {t('modules.login.forgot_password')}
            </ResponsiveModalTitle>
            {apiResponseMessage ? (
              <ResponsiveModalDescription className="text-green-600">
                {apiResponseMessage}
              </ResponsiveModalDescription>
            ) : (
              <ResponsiveModalDescription>
                {t('modules.login.forgot_password_desc')}
              </ResponsiveModalDescription>
            )}
          </ResponsiveModalHeader>

          {!apiResponseMessage ? (
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)}>
                <div className="flex flex-col gap-4 mt-5">
                  <FormField
                    control={forgotPasswordForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('modules.login.username')} <Required />
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('modules.login.placeholder_username')}
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="w-full flex gap-2 items-center pt-4">
                    <Button
                      variant="outline"
                      type="button"
                      size="lg"
                      className="w-full"
                      onClick={handleCloseForgotPasswordModal}
                    >
                      {t('buttons.cancel') || "Cancel"}
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={forgotPasswordMutation.status === "pending"}
                    >
                      {forgotPasswordMutation.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          {t('buttons.sending') || "Sending"}
                          <ThreeDotsLoader />
                        </div>
                      ) : (
                        t('buttons.send') || "Send"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          ) : (
            <div className="w-full flex gap-2 items-center justify-center mt-5">
              <Button
                onClick={handleCloseForgotPasswordModal}
                size="lg"
                className="w-full"
              >
                {t('buttons.ok') || "OK"}
              </Button>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}