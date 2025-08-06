"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import { RefreshIcon } from "@/icons/icons";
import { IoMdRefresh } from "react-icons/io";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "@/lib/apiHandler";
import { useLanguage } from "@/providers/LanguageProvider";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import loadingAnimation from "@/animations/hourglass-blue.json";

export const useFormSchema = () => {
  const { translations } = useLanguage();

  const t = (key: string, fallback: string) =>
    translations?.formErrors?.[key] || fallback;

  return z.object({
    username: z
      .string()
      .trim()
      .min(1, { message: t("username_required", "Username is required.") })
      .max(100, { message: t("username_max", "Username must be at most 100 characters.") }),

    password: z
      .string()
      .min(1, { message: t("password_required", "Password is required.") })
      .max(100, { message: t("password_max", "Password must be at most 100 characters.") }),

    captcha_result: z
      .string()
      .min(1, { message: t("captcha_invalid", "CAPTCHA is invalid. Please try again.") }),

    captcha_1: z.number({
      required_error: t("captcha_missing", "CAPTCHA question is missing."),
    }),

    captcha_2: z.number({
      required_error: t("captcha_missing", "CAPTCHA question is missing."),
    }),

    remember_me: z.boolean().optional(),
  });
};

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { translations, language } = useLanguage();
  const formSchema = useFormSchema();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      captcha_result: "",
      captcha_1: 0,
      captcha_2: 0,
      remember_me: false,
    },
  });

  useEffect(() => {
    form.setValue("captcha_1", getRandomInt(0, 9));
    form.setValue("captcha_2", getRandomInt(0, 9));
  }, [form]);
  
  const router = useRouter();

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
          message: translations?.formErrors?.invalid_credentials || "Invalid credentials"
        });
      }
    },
    onError: (error: any) => {
      form.setError("username", {
        type: "manual",
        message: translations?.formErrors?.login_error || "An error occurred. Please try again."
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate CAPTCHA
    if (values.captcha_1 + values.captcha_2 !== Number(values.captcha_result)) {
      form.setError("captcha_result", {
        type: "custom",
        message: translations?.formErrors?.captcha_wrong_result || "Incorrect CAPTCHA result",
      });
      return;
    }
    loginMutation.mutate({
      username: values.username,
      password: values.password,
      remember_me: values.remember_me ?? false,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h1 className="text-center text-xl font-bold">{translations.modules.login.login}</h1>
            <p className="text-center text-sm font-semibold text-text-secondary">{translations.modules.login.welcome_text}</p>
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {translations.modules.login.username} <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={translations.modules.login.placeholder_username}
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
                  {translations.modules.login.password} <Required />
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder={translations.modules.login.placeholder_password}
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

          <FormField
            control={form.control}
            name="captcha_result"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {translations.modules.login.captcha} <Required />
                </FormLabel>

                <div className="flex justify-between items-center">
                  <div className="flex justify-center items-center gap-4 text-sm">
                    <div className="border border-border-grey rounded-lg flex items-center justify-center w-10 h-10">
                      <h1 className="">{form.watch("captcha_1") ?? "0"}</h1>
                    </div>
                    <h1>+</h1>
                    <div className="border border-border-grey rounded-lg flex items-center justify-center w-10 h-10">
                      <h1>{form.watch("captcha_2") ?? "0"}</h1>
                    </div>
                  </div>
                  <IoMdRefresh
                    onClick={() => {
                      form.setValue("captcha_1", getRandomInt(0, 9));
                      form.setValue("captcha_2", getRandomInt(0, 9));
                    }}
                    className="text-primary text-2xl"
                  />
                </div>
                <FormControl>
                  <Input placeholder={translations.modules.login.placeholder_captcha} type="number" {...field} />
                </FormControl>
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
                      <FormLabel htmlFor="remember_me" className="text-sm text-text-primary font-semibold">{translations.modules.login.remember_me}</FormLabel>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            {/* <Link
              className="text-sm text-primary font-bold"
              href={"/forgot-password"}
            >
              {translations.modules.login.forgot_password}
            </Link> */}
          </div>

          <Button type="submit" size={"lg"} className="w-auto min-w-[200px] mx-auto mt-4" disabled={loginMutation.status === "pending"}>
            {loginMutation.status === "pending"
              ? translations?.buttons?.logging_in || "Logging in..."
              : translations?.buttons?.login || "Login"}          
          </Button>
        </div>
      </form>
    </Form>
  );
}
