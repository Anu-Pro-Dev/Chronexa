"use client";

import { Spinner } from "@/components/ui/spinner";
import { USER_TOKEN, ROUTES } from "@/utils/constants";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authToken = localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);

    if (!authToken) {
      router.push(ROUTES.LOGIN);  // Navigate to login
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-dvh">
        <Spinner />
      </div>
    );
  }

  return <div>{children}</div>;
}
