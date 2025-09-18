"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z }from "zod";
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
              className="w-full min-w-[300px] mx-auto mt-4" 
              disabled={loginMutation.status === "pending"}
            >
              {loginMutation.status === "pending" ? (
                <div className="flex items-center gap-2">
                  {/* <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> */}
                  {translations?.buttons?.logging_in || "Logging in"}
                  <ThreeDotsLoader />
                </div>
              ) : (
                translations?.buttons?.login || "Login"
              )}          
            </Button>
          </div>
        </form>
      </Form>

      {/* Forgot Password Modal */}
      <ResponsiveModal open={forgotPasswordModalOpen} onOpenChange={setForgotPasswordModalOpen}>
        <ResponsiveModalContent side="center">
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