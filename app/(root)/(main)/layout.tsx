"use client";

import { USER_TOKEN, ROUTES } from "@/utils/constants";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import loadingAnimation from "@/animations/hourglass-blue.json";

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
        <div style={{ width: 50}}>
          <Lottie animationData={loadingAnimation} loop={true} />
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
}
