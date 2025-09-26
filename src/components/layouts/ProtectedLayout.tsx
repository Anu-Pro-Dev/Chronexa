'use client'
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuthGuard } from '@/src/hooks/useAuthGuard';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { userInfo, isChecking } = useAuthGuard();
  const router = useRouter();

  useEffect(() => {
    console.log(userInfo);
    if (!isChecking && !userInfo) {
      router.replace("/"); // redirect only once
    }
  }, [isChecking, userInfo, router]);

  if (isChecking) return <div>Loading...</div>; // optional spinner
  if (!userInfo) return null;

  return <>{children}</>;
}