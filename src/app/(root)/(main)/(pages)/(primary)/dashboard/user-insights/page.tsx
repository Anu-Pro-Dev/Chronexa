"use client";
import UserInsightsPage from "@/src/components/custom/modules/dashboard/user-insights/UserInsightsPage";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { PunchButton } from "@/src/components/custom/common/punch-button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useEffect, useRef } from "react";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import CurrentDate from "@/src/components/ui/currentdate";
import { useDashboardStore } from "@/src/store/useDashboardStore";

export default function Dashboard() {
  const { modules } = useLanguage();
  const { userInfo } = useAuthGuard();

  const shouldShowPunchButton = userInfo?.isWebPunch === true;

  const setRole            = useDashboardStore((s) => s.setRole);
  const fetchDashboardData = useDashboardStore((s) => s.fetchDashboardData);

  const didInit = useRef(false);
  useEffect(() => {
    if (!userInfo?.roleId || didInit.current) return;
    didInit.current = true;
    setRole(userInfo.roleId);
    fetchDashboardData();
  }, [userInfo?.roleId, setRole, fetchDashboardData]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <PowerHeader
          disableAdd
          disableDelete
          disableSearch
          items={modules?.dashboard.items}
        />
        <div className="flex gap-4">
          <CurrentDate />
          <div className="h-9">
            {shouldShowPunchButton && <PunchButton />}
          </div>
        </div>
      </div>

      <UserInsightsPage />
    </div>
  );
}
