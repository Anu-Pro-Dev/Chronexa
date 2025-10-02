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
    'Organization Schedule': 'organization-schedule',
    'Employee Schedule': 'employee-schedule',
  };

  useEffect(() => {
    if (isLoading) return;

    const schedulingModule = privilegeMap?.['Scheduling'];
    if (!schedulingModule?.allowed) {
      router.replace('/dashboard/my-attendance');
      return;
    }

    const weeklyscheduleSubmodule = schedulingModule.subModules?.find(
      (sm: any) => sm.path === 'weekly-schedule'
    );

    if (!weeklyscheduleSubmodule?.allowed) {
      const firstAllowedSubmodule = schedulingModule.subModules?.find(
        (sm: any) => sm.allowed
      );
      if (firstAllowedSubmodule) {
        router.replace(`/scheduling/${firstAllowedSubmodule.path}`);
      } else {
        router.replace('/dashboard/my-attendance');
      }
      return;
    }

    const firstAllowedTab = weeklyscheduleSubmodule.tabs?.find((tab: any) => tab.allowed);
    
    if (firstAllowedTab) {
      const actualPath = tabPathMapping[firstAllowedTab.tab_name] || 
                         firstAllowedTab.tab_name.toLowerCase().replace(/\s+/g, "-");
      
      router.replace(`/scheduling/weekly-schedule/${actualPath}`);
    } else {
      const firstAllowedSubmodule = schedulingModule.subModules?.find(
        (sm: any) => sm.allowed && sm.path !== 'weekly-schedule'
      );
      if (firstAllowedSubmodule) {
        router.replace(`/scheduling/${firstAllowedSubmodule.path}`);
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
        <p className="text-text-secondary">Loading weekly schedule...</p>
      </div>
    </div>
  );
}