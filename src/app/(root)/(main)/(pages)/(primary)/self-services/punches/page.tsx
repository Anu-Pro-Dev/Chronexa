"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { InlineLoading } from "@/src/app/loading";

export default function PunchesRedirectPage() {
  const router = useRouter();
  const { privilegeMap, isLoading } = usePrivileges();

  const tabPathMapping: Record<string, string> = {
    'My Request': 'my-requests',
    'Team Request': 'team-requests', 
    'Manage': 'manage',
  };

  useEffect(() => {
    if (isLoading) return;

    const selfServicesModule = privilegeMap?.['Self Services'];
    if (!selfServicesModule?.allowed) {
      router.replace('/dashboard/my-attendance');
      return;
    }

    const punchesSubmodule = selfServicesModule.subModules?.find(
      (sm: any) => sm.path === 'punches'
    );

    if (!punchesSubmodule?.allowed) {
      const firstAllowedSubmodule = selfServicesModule.subModules?.find(
        (sm: any) => sm.allowed
      );
      if (firstAllowedSubmodule) {
        router.replace(`/self-services/${firstAllowedSubmodule.path}`);
      } else {
        router.replace('/dashboard/my-attendance');
      }
      return;
    }

    const firstAllowedTab = punchesSubmodule.tabs?.find((tab: any) => tab.allowed);
    
    if (firstAllowedTab) {
      const actualPath = tabPathMapping[firstAllowedTab.tab_name] || 
                         firstAllowedTab.tab_name.toLowerCase().replace(/\s+/g, "-");      
      router.replace(`/self-services/punches/${actualPath}`);
    } else {
      const firstAllowedSubmodule = selfServicesModule.subModules?.find(
        (sm: any) => sm.allowed && sm.path !== 'punches'
      );
      if (firstAllowedSubmodule) {
        router.replace(`/self-services/${firstAllowedSubmodule.path}`);
      } else {
        router.replace('/dashboard/my-attendance');
      }
    }
  }, [privilegeMap, isLoading, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <InlineLoading message="Loading punches..."/>
      </div>
    </div>
  );
}