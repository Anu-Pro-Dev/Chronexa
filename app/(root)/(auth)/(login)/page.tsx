"use client";
import LoginForm from "@/forms/auth/LoginForm";
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
        <div className="w-10/12 sm:w-[25em] mx-auto bg-white rounded-3xl shadow-popup p-6 ">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
