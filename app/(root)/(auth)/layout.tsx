"use client";

import { USER_TOKEN, ROUTES } from "@/utils/constants";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [render, setRender] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(USER_TOKEN);
    const sessionToken = sessionStorage.getItem(USER_TOKEN);

    if (token || sessionToken) {
      router.push(ROUTES.DASHBOARD);
    } else {
      setRender(true);
    }
  }, [router]);

  return (
    <>
      {render ? children : (
        <div className="flex flex-col justify-center items-center h-dvh">
          <Spinner />
        </div>
      )}
    </>
  );
}
