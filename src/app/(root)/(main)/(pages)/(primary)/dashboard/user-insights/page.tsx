"use client";
import UserInsightsPage from "@/src/components/custom/modules/dashboard/user-insights/UIPage";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { PunchButton } from "@/src/components/custom/common/punch-button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useEffect, useRef } from "react";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import CurrentDate from "@/src/components/ui/currentdate";
import { InlineLoading } from "@/src/app/loading";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

export default function Dashboard() {
  const { modules } = useLanguage();
  const { userInfo } = useAuthGuard();

  const shouldShowPunchButton = userInfo?.isWebPunch === true;

  // ── Dashboard store init ─────────────────────────────────────────────────
  const setRole            = useDashboardStore((s) => s.setRole);
  const fetchDashboardData = useDashboardStore((s) => s.fetchDashboardData);
  const loadingDashboard   = useDashboardStore((s) => s.loadingDashboard);

  const didInitDashboard = useRef(false);
  useEffect(() => {
    if (!userInfo?.roleId || didInitDashboard.current) return;
    didInitDashboard.current = true;
    setRole(userInfo.roleId);
    fetchDashboardData();
  }, [userInfo?.roleId, setRole, fetchDashboardData]);

  // ── User Insights — fetch against organizationId 27 ─────────────────────
  const fetchData       = useUserInsightsStore((s) => s.fetchData);
  const loadingInsights = useUserInsightsStore((s) => s.loading);
  const insightsError   = useUserInsightsStore((s) => s.error);
  const clearData       = useUserInsightsStore((s) => s.clearData);

  const didInitInsights = useRef(false);
  useEffect(() => {
    if (didInitInsights.current) return;
    didInitInsights.current = true;
    fetchData();
    return () => {
      clearData();
      didInitInsights.current = false;
    };
  }, [fetchData, clearData]);

  const isLoading = loadingDashboard || loadingInsights;

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

      {isLoading ? (
        <InlineLoading message="Loading user insights..." />
      ) : insightsError ? (
        <div className="rounded-[10px] bg-accent border border-red-200 p-6 text-center text-sm text-red-500">
          Failed to load analytics: {insightsError}
        </div>
      ) : (
        <UserInsightsPage />
      )}
    </div>
  );
}
