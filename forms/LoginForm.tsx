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
import { USER_TOKEN } from "@/lib/Instance";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  password: z
    .string()
    .min(1, {
      message: "Required",
    })
    .max(100),
  captcha_result: z.string().min(1, {
    message: "Captcha is Required",
  }),
  captcha_1: z.number(),
  captcha_2: z.number(),
  remember_me: z.boolean().optional(),
});

export default function LoginForm() {
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
    form.setValue("captcha_1", getRandomInt(1, 9));
    form.setValue("captcha_2", getRandomInt(1, 9));
  }, []);
  const router = useRouter();
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (
        values.captcha_1 + values.captcha_2 !==
        Number(values.captcha_result)
      ) {
        form.setError("captcha_result", {
          type: "custom",
          message: "Incorrect Captcha Result",
        });
        return;
      }

      const token = "something bro";
      if (values.remember_me === true) {
        localStorage.setItem(USER_TOKEN, token);
      } else {
        sessionStorage.setItem(USER_TOKEN, token);
      }
      console.log(values);
      router.push("/dashboard");
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-center">Login</h1>
            <p className="text-center">Welcome Back! Please Login to access.</p>
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your password"
                    type="password"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="captcha_result"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Captcha</FormLabel>
                <div className="flex justify-center items-center gap-4">
                  <div className="border rounded-md flex items-center justify-center  w-10 h-10">
                    <h1 className="">{form.watch("captcha_1") ?? "0"}</h1>
                  </div>
                  <h1>+</h1>
                  <div className="border rounded-md flex items-center justify-center  w-10 h-10">
                    <h1>{form.watch("captcha_2") ?? "0"}</h1>
                  </div>
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
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel htmlFor="remember_me">Remember me</FormLabel>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <Link className="text-sm" href={"/forgot-password"}>
              Forgot Password ?
            </Link>
          </div>

          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
