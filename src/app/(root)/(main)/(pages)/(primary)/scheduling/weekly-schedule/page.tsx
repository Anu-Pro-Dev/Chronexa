"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { InlineLoading } from "@/src/app/loading";

export default function SchedulesRedirectPage() {
  const router = useRouter();
  const { privilegeMap, isLoading } = usePrivileges();
  const { translations } = useLanguage();

  const t = translations?.modules?.scheduling || {};
  const commonT = translations?.buttons || {};

  const tabPathMapping: Record<string, string> = {
    'Organization Schedule': 'organization-schedule',
    'Employee Schedule': 'employee-schedule',
  };

  const getTabPath = (tabName: string): string => {
    if (tabPathMapping[tabName]) {
      return tabPathMapping[tabName];
    }
    
    const normalizedTabName = tabName.toLowerCase().trim();
    
    if (normalizedTabName === t.organization_schedule?.toLowerCase() || 
        normalizedTabName.includes('organization')) {
      return 'organization-schedule';
    }
    
    if (normalizedTabName === t.employee_schedule?.toLowerCase() || 
        normalizedTabName.includes('employee')) {
      return 'employee-schedule';
    }
    
    return tabName.toLowerCase().replace(/\s+/g, "-");
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
      const actualPath = getTabPath(firstAllowedTab.tab_name);
      
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
        <InlineLoading message={`${commonT.loading || "Loading"} ${t.weekly_schedule || "weekly schedule"}...`}/>
      </div>
    </div>
  );
}