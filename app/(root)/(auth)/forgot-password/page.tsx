"use client";

import ForgotPassword from "@/forms/auth/ForgotPasswordForm";
import React from "react";

export default function Page() {
  return (
    <div dir="ltr">
      <div className="flex flex-col justify-center h-dvh">
        <div className=" w-11/12 lg:w-3/12  mx-auto">
          <ForgotPassword />
        </div>
      </div>
    </div>
  );
}
