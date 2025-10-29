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
import { loginRequest } from "@/src/lib/apiHandler";
import { useLanguage } from "@/src/providers/LanguageProvider";
import toast from "react-hot-toast";
import ThreeDotsLoader from "@/src/animations/ThreeDotsLoader";
import { UserAxiosInstance } from "@/src/lib/axios";

export const useFormSchema = () => {
  const { translations } = useLanguage();
  const t = translations?.modules?.login || {};

  return z.object({
    username: z
      .string()
      .trim()
      .min(1, { message: t.error_username }),

    password: z
      .string()
      .min(1, { message: t.error_password }),

    remember_me: z.boolean().optional(),
  });
};

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const { translations, language } = useLanguage();
  const formSchema = useFormSchema();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      remember_me: false,
    },
  });
  const router = useRouter();
  const t = translations?.modules?.login || {};

  const loginMutation = useMutation({
    mutationFn: (values: { username: string; password: string; remember_me: boolean }) =>
      loginRequest(values.username, values.password, values.remember_me),
    onSuccess: (response) => {
      if (response?.token) {
        toast.success(translations?.toastNotifications?.login_success || "Login successful!");
        router.push("/dashboard");
      } else {
        form.setError("username", {
          type: "manual",
          message: t.error_login
        });
      }
    },
    onError: (error: any) => {
      form.setError("username", {
        type: "manual",
        message: t.error_login
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate({
      username: values.username,
      password: values.password,
      remember_me: values.remember_me ?? false,
    });
  }

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotPasswordModalOpen(true);
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="">
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.username || "Username"} <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.placeholder_username || "Enter Your username"}
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.password || "Password"} <Required />
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder={t.placeholder_password || "Enter Your password"}
                        type={showPassword ? "text" : "password"}
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

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="remember_me"
                render={({ field }) => (
                  <FormItem className="">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember_me"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                        <FormLabel htmlFor="remember_me" className="text-sm text-text-primary font-semibold">
                          {t.remember_me || "Remember Me"}
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
              >
                {t.forgot_password || "Forgot Password ?"}
              </button>
            </div>

            <Button
              type="submit"
              size={"lg"}
              className="w-full min-w-[300px] mx-auto mt-2"
              disabled={loginMutation.status === "pending"}
            >
              {loginMutation.status === "pending" ? (
                <div className="flex items-center gap-2">
                  {translations?.buttons?.logging_in || "Logging in"}
                  <ThreeDotsLoader />
                </div>
              ) : (
                translations?.buttons?.login || "Login"
              )}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border-grey" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-fullpage px-2 text-muted-foreground">
                  {t.or || "Or"}
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
                <path d="M0 0H10.9091V10.9091H0V0Z" fill="#F25022"/>
                <path d="M12.0909 0H23V10.9091H12.0909V0Z" fill="#7FBA00"/>
                <path d="M0 12.0909H10.9091V23H0V12.0909Z" fill="#00A4EF"/>
                <path d="M12.0909 12.0909H23V23H12.0909V12.0909Z" fill="#FFB900"/>
              </svg>
              {t.login_with_azure || "Sign in with Azure AD"}
            </Button>
          </div>
        </form>
      </Form>

      <ResponsiveModal open={forgotPasswordModalOpen} onOpenChange={setForgotPasswordModalOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader className="flex">
            <ResponsiveModalTitle>
              {t.forgot_password || "Forgot Password"}
            </ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {t.forgot_password_msg || "Please connect with IT Department"}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <div className="w-full flex gap-2 items-center justify-center mt-5">
            <Button
              onClick={() => setForgotPasswordModalOpen(false)}
              size="lg"
              className="w-3/6"
            >
              {translations?.buttons?.ok || "OK"}
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}
