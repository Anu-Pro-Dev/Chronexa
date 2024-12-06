"use client";

import { Spinner } from "@/components/ui/spinner";
import { USER_TOKEN } from "@/lib/Instance";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: any }) {
  const [Loading, SetLoading] = useState<boolean>(false);
  const [Render, SetRender] = useState<boolean>(false);
  useEffect(() => {
    const token =
      localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);
    if (!token) {
      redirect("/");
    } else {
      SetRender(true);
    }
    SetLoading(false);
  }, []);
  return (
    <>
      {!Loading ? (
        <div className="">{Render && children}</div>
      ) : (
        <div className="flex flex-col justify-center items-center h-dvh">
          <Spinner />
        </div>
      )}
    </>
  );
}
