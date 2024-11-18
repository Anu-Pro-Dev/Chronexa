"use client";

import AutoPathMapper from "@/components/auto-path-mapper";
import { Spinner } from "@/components/ui/spinner";
import { UserContextProvider } from "@/contexts/UserContext";
import { USER_TOKEN } from "@/utils/Instance";

import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [Loading, SetLoading] = useState<boolean>(false);
  const [Render, SetRender] = useState<boolean>(false);
  useEffect(() => {
    const token = localStorage.getItem(USER_TOKEN);
    if (!token) {
      redirect("/sign-in");
    }
    SetRender(true);
  }, []);

  return (
    <>
      <UserContextProvider>
        {!Loading ? (
          <>
            {Render && (
              <div>
                <div className="w-11/12 py-10 mx-auto max-w-6xl">
                  <AutoPathMapper />
                  <div className="py-2">{Render && children}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-dvh">
            <Spinner />
          </div>
        )}
      </UserContextProvider>
    </>
  );
}
