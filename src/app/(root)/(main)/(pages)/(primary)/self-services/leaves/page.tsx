"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { InlineLoading } from "@/src/app/loading";

export default function LeavesRedirectPage() {
  const router = useRouter();
  const { privilegeMap, isLoading } = usePrivileges();

  const tabPathMapping: Record<string, string> = {
    'My Request': 'my-request',
    'Team Request': 'team-request', 
    'Manage': 'manage',
  };

  useEffect(() => {
    if (isLoading) return;

    const selfServicesModule = privilegeMap?.['Self Services'];
    if (!selfServicesModule?.allowed) {
      router.replace('/dashboard/my-attendance');
      return;
    }

    const leavesSubmodule = selfServicesModule.subModules?.find(
      (sm: any) => sm.path === 'leaves'
    );

    if (!leavesSubmodule?.allowed) {
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

    const firstAllowedTab = leavesSubmodule.tabs?.find((tab: any) => tab.allowed);
    
    if (firstAllowedTab) {
      const actualPath = tabPathMapping[firstAllowedTab.tab_name] || 
                         firstAllowedTab.tab_name.toLowerCase().replace(/\s+/g, "-");      
      router.replace(`/self-services/leaves/${actualPath}`);
    } else {
      const firstAllowedSubmodule = selfServicesModule.subModules?.find(
        (sm: any) => sm.allowed && sm.path !== 'leaves'
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
        <InlineLoading message="Loading leaves..."/>
      </div>
    </div>
  );
}