"use client";
import LoginForm from "@/forms/LoginForm";
import Image from "next/image";
import React from "react";

export default function Home() {
  return (
    <div dir="ltr" className="relative">
      <Image
        style={{ zIndex: -1 }}
        src="/bg_main.svg"
        alt="Time Management"
        objectFit="cover"
        layout="fill"
      />
      <div className="flex flex-col justify-center h-dvh">
        <div className=" w-11/12 lg:w-4/12  mx-auto bg-white rounded-md p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
