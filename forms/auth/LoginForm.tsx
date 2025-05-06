"use client";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import { RefreshIcon } from "@/icons/icons";
import { IoMdRefresh } from "react-icons/io";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { loginRequest } from "@/lib/apiHandler";
import { USER_TOKEN } from "@/utils/constants";

const formSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "Username is required.",
    })
    .max(100),
  password: z
    .string()
    .min(1, {
      message: "Password is required.",
    })
    .max(100),
  captcha_result: z.string().min(1, {
    message: "CAPTCHA is invalid, please try again!",
  }),
  captcha_1: z.number(),
  captcha_2: z.number(),
  remember_me: z.boolean().optional(),
});

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Validate CAPTCHA
      if (values.captcha_1 + values.captcha_2 !== Number(values.captcha_result)) {
        form.setError("captcha_result", {
          type: "custom",
          message: "Incorrect Captcha Result",
        });
        return;
      }

      // const token = "something bro";
      // if (values.remember_me === true) {
      //   localStorage.setItem(USER_TOKEN, token);
      // } else {
      //   sessionStorage.setItem(USER_TOKEN, token);
      // }
      // router.push("/dashboard");
  
    // Uncomment the following lines to use the loginRequest function
      const response = await loginRequest(Number(values.username), values.password, values.remember_me ?? false);
  
      // Redirect only if login is successful and a token is received
      if (response?.token) {
        router.push("/dashboard");
      } else {
        console.error("Login failed: No token received.");
        form.setError("username", { type: "manual", message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      form.setError("username", { type: "manual", message: "An error occurred. Please try again." });
    }
  }  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h1 className="text-center text-xl font-bold">Login</h1>
            <p className="text-center text-sm font-semibold text-text-secondary">Welcome Back! Please Login to access.</p>
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Username <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your username"
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
                  Password <Required />
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-text-secondary"
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
                  Captcha <Required />
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
                  <Input placeholder="Enter captcha" type="number" {...field} />
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
                      <FormLabel htmlFor="remember_me" className="text-sm text-text-primary font-semibold">Remember me</FormLabel>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <Link
              className="text-sm text-primary font-bold"
              href={"/forgot-password"}
            >
              Forgot Password ?
            </Link>
          </div>

          <Button type="submit" size={"lg"} className="w-auto min-w-[200px] mx-auto mt-4">Login</Button>
        </div>
      </form>
    </Form>
  );
}
