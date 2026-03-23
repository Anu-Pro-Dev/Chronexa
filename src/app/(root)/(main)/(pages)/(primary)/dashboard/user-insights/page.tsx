"use client";
import UserInsightsPage from "@/src/components/custom/modules/dashboard/user-insights/UserInsightsPage";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { PunchButton } from "@/src/components/custom/common/punch-button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import CurrentDate from "@/src/components/ui/currentdate";


export default function Dashboard() {
  const { modules } = useLanguage();
  const { userInfo } = useAuthGuard();

  const shouldShowPunchButton = userInfo?.isWebPunch === true;

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
          {/* interactive=true enables the date picker; changes propagate via useSelectedDate */}
          <CurrentDate interactive />
          <div className="h-9">
            {shouldShowPunchButton && <PunchButton />}
          </div>
        </div>
      </div>

      <UserInsightsPage />
    </div>
  );
}