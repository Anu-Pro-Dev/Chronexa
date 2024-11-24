"use client";

import { Spinner } from "@/components/ui/spinner";
import { USER_TOKEN } from "@/lib/Instance";

import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [Loading, SetLoading] = useState<boolean>(false);
  const [Render, SetRender] = useState<boolean>(false);
  useEffect(() => {
    const token = localStorage.getItem(USER_TOKEN);
    const session_token = sessionStorage.getItem(USER_TOKEN);

    if (token || session_token) {
      redirect("/dashboard");
    }
    SetRender(true);
  }, []);

  return (
    <>
      {!Loading ? (
        <>{Render && children}</>
      ) : (
        <div className="flex flex-col justify-center items-center h-dvh">
          <Spinner />
        </div>
      )}
    </>
  );
}
