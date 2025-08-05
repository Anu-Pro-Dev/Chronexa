"use client";
import { USER_TOKEN, ROUTES } from "@/utils/constants";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import loadingAnimation from "@/animations/hourglass-blue.json";
import toast from "react-hot-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
  loadDashboardData?: () => Promise<void>;
  minLoadingTime?: number;
}

export default function Layout({ 
  children, 
  loadDashboardData,
  minLoadingTime = 1000 
}: DashboardLayoutProps) {
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check authentication
        const authToken = localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);

        if (!authToken) {
          router.push(ROUTES.LOGIN);
          return;
        }

        setAuthLoading(false);

        // If there's dashboard data to load
        if (loadDashboardData) {
          setDataLoading(true);

          const startTime = Date.now();
          
          try {
            await loadDashboardData();
          } catch (error) {
            toast.error("Failed to load dashboard data. Please try again.");
            console.error("Failed to load dashboard data:", error);
          }

          // Ensure minimum loading time for better UX
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime < minLoadingTime) {
            await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
          }

          setDataLoading(false);
        }
      } catch (error) {
        console.error("Dashboard initialization error:", error);
        router.push(ROUTES.LOGIN);
      }
    };

    initializeDashboard();
  }, [router, loadDashboardData, minLoadingTime]);

  // Show white screen with centered loader
  if (authLoading || dataLoading) {
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
