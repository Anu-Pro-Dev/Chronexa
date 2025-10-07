'use client'
import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";

type Props = { children: ReactNode };

export default function PrivilegeGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { privilegeMap, isLoading } = usePrivileges();

  useEffect(() => {
    if (!isLoading) {
      if (!privilegeMap || Object.keys(privilegeMap).length === 0) {
        router.replace("/no-access");
        return;
      }

      let hasAccess = false;

      Object.values(privilegeMap).forEach((module: any) => {
        if (module.allowed) {
          module.subModules?.forEach((subModule: any) => {
            const expectedPath = `/sub/${subModule.path}`;
            if (pathname === expectedPath || pathname.startsWith(expectedPath + '/')) {
              if (subModule.allowed) {
                hasAccess = true;
              }
            }
          });
        }
      });

      if (!hasAccess) {
        router.replace("/no-access");
      }
    }
  }, [isLoading, pathname, privilegeMap, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></span>
      </div>
    );
  }

  return <>{children}</>;
}
