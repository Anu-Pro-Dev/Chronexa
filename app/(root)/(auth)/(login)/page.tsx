"use client";
import LoginForm from "@/forms/LoginForm";
import React from "react";

export default function Home() {
  return (
    <div dir="ltr">
      <div className="flex flex-col justify-center h-dvh">
        <div className=" w-11/12 lg:w-3/12  mx-auto">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
