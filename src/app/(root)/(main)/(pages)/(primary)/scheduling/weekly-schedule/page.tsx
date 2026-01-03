"use client";
import { useEffect, useMemo, useCallback } from "react";
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

  const staticTabPathMapping: Record<string, string> = {
    'Organization Schedule': 'organization-schedule',
    'Employee Schedule': 'employee-schedule',
  };

  const translatedTabPathMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    
    if (t.organization_schedule) {
      mapping[t.organization_schedule] = 'organization-schedule';
      mapping[t.organization_schedule.toLowerCase()] = 'organization-schedule';
    }
    
    if (t.employee_schedule) {
      mapping[t.employee_schedule] = 'employee-schedule';
      mapping[t.employee_schedule.toLowerCase()] = 'employee-schedule';
    }
    
    return mapping;
  }, [t.organization_schedule, t.employee_schedule]);

  const getTabPath = useCallback((tabName: string): string => {
    if (staticTabPathMapping[tabName]) {
      return staticTabPathMapping[tabName];
    }
    
    if (translatedTabPathMapping[tabName]) {
      return translatedTabPathMapping[tabName];
    }
    
    const lowerTabName = tabName.toLowerCase().trim();
    if (translatedTabPathMapping[lowerTabName]) {
      return translatedTabPathMapping[lowerTabName];
    }
    
    if (lowerTabName.includes('organization') || lowerTabName.includes('organisasi')) {
      return 'organization-schedule';
    }
    
    if (lowerTabName.includes('employee') || lowerTabName.includes('karyawan') || lowerTabName.includes('pegawai')) {
      return 'employee-schedule';
    }
    
    return tabName.toLowerCase().replace(/\s+/g, "-");
  }, [translatedTabPathMapping]);

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
  }, [privilegeMap, isLoading, router, getTabPath]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <InlineLoading message={`${commonT.loading || "Loading"} ${t.weekly_schedule || "weekly schedule"}...`}/>
      </div>
    </div>
  );
}