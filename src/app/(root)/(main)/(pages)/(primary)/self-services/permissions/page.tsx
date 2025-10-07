"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import Lottie from "lottie-react";
import loadingAnimation from "@/src/animations/hourglass-blue.json";

export default function PermissionsRedirectPage() {
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

    const permissionsSubmodule = selfServicesModule.subModules?.find(
      (sm: any) => sm.path === 'permissions'
    );

    if (!permissionsSubmodule?.allowed) {
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

    const firstAllowedTab = permissionsSubmodule.tabs?.find((tab: any) => tab.allowed);
    
    if (firstAllowedTab) {
      const actualPath = tabPathMapping[firstAllowedTab.tab_name] || 
                         firstAllowedTab.tab_name.toLowerCase().replace(/\s+/g, "-");
      router.replace(`/self-services/permissions/${actualPath}`);
    } else {
      const firstAllowedSubmodule = selfServicesModule.subModules?.find(
        (sm: any) => sm.allowed && sm.path !== 'permissions'
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
        <div style={{ width: 50 }} className="mx-auto mb-4">
          <Lottie animationData={loadingAnimation} loop={true} />
        </div>
        <p className="text-text-secondary">Loading permissions...</p>
      </div>
    </div>
  );
}