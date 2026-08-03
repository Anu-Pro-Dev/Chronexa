'use client'
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useAuthGuard } from '@/src/hooks/useAuthGuard';
import { getAuthToken } from '@/src/utils/authToken';
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
      // Only redirect to login when there is genuinely no session token
      // anywhere (storage or the tab-shared cookie). When the cookie is still
      // valid — e.g. a session-only login opened in a NEW tab, where
      // sessionStorage is empty — the middleware would immediately redirect
      // "/" back to this page, and the two layers would loop forever leaving a
      // blank white screen. In that case the async initialize() is still
      // rehydrating; keep the Loading state instead of redirecting.
      const hasToken = typeof window !== "undefined" && !!getAuthToken();
      if (!hasToken) {
        router.replace("/");
      }
    }
  }, [isChecking, userInfo, router, pathname, mounted]);

  if (!mounted || isChecking) {
    return (
      <Loading />
    );
  }

  // Never render a blank body. If userInfo is momentarily unresolved but a
  // session token still exists, hold the loading state until rehydration
  // completes instead of returning null (the direct cause of white screens).
  if (!userInfo) {
    return <Loading />;
  }

  return <>{children}</>;
}