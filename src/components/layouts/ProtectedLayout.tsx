'use client'
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuthGuard } from '@/src/hooks/useAuthGuard';
import Lottie from "lottie-react";
import loadingAnimation from "@/src/animations/hourglass-blue.json";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { userInfo, isChecking } = useAuthGuard();
  const router = useRouter();

  useEffect(() => {
    if (!isChecking && !userInfo) {
      router.replace("/");
    }
  }, [isChecking, userInfo, router]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div style={{ width: 50 }} className="mx-auto mb-4">
            <Lottie animationData={loadingAnimation} loop={true} />
          </div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  };

  if (!userInfo) return null;

  return <>{children}</>;
}