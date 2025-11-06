'use client'
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useAuthGuard } from '@/src/hooks/useAuthGuard';
import Loading from '@/src/app/loading';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { userInfo, isChecking } = useAuthGuard();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isChecking) return;

    if (pathname?.includes('/auth/azure/success')) return;

    if (!userInfo) {
      router.replace("/");
    }
  }, [isChecking, userInfo, router, pathname, mounted]);

  if (!mounted || isChecking) {
    return (
      <Loading />
    );
  }

  if (!userInfo) return null;

  return <>{children}</>;
}