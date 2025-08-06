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
    const checkAuth = async () => {
      try {
        const authToken = localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);

        if (!authToken) {
          router.push(ROUTES.LOGIN);
          return;
        }

        // Small delay to ensure smooth transition from login
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (error) {
        console.error("Authentication check error:", error);
        router.push(ROUTES.LOGIN);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex justify-center items-center">
        <div style={{ width: 80 }}>
          <Lottie animationData={loadingAnimation} loop={true} />
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
}