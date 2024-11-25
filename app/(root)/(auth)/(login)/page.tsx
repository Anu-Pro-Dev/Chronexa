"use client";
import LoginForm from "@/forms/LoginForm";
import React from "react";

export default function Home() {
  return (
    <div dir="ltr" className="bg_main_login">
      <div className="flex flex-col justify-center h-dvh">
        <div className=" w-11/12 lg:w-4/12  mx-auto bg-white rounded-md p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
