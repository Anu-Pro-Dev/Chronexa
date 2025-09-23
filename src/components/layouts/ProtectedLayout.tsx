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

// 'use client';
// import { ReactNode, useEffect, useState } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import { usePrivileges } from "@/src/providers/PrivilegeProvider";

// export default function ProtectedLayout({ children }: { children: ReactNode }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const { privilegeMap } = usePrivileges();

//   const [userLoaded, setUserLoaded] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       router.replace("/"); // redirect to login
//       return;
//     }

//     // Build privilegeMap from stored allowedModules if needed
//     const storedModules = JSON.parse(localStorage.getItem("allowedModules") || "[]");
//     if (storedModules.length === 0) {
//       router.replace("/no-access"); // redirect if no modules allowed
//     } else if (pathname === "/" || pathname === "/dashboard") {
//       // redirect to first allowed module/submodule
//       const firstModule = storedModules[0];
//       const firstSub = firstModule.subModules[0];
//       const modulePath = firstModule.module_name.replace(/\s+/g, "-").toLowerCase();
//       const subPath = firstSub.sub_module_name.replace(/\s+/g, "-").toLowerCase();
//       router.replace(`/${modulePath}/${subPath}`);
//     }

//     setUserLoaded(true);
//   }, [pathname, router]);

//   if (!userLoaded) return <div>Loading...</div>;
//   return <>{children}</>;
// }
