"use client";
import * as React from "react";
import UserInsightsPage from "@/src/components/custom/modules/dashboard/user-insights/UserInsightsPage";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { PunchButton } from "@/src/components/custom/common/punch-button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import CurrentDate from "@/src/components/ui/currentdate";
import { fetchOrganizationList, OrganizationListItem } from "@/src/lib/userInsightsApiHandler";
import { useSelectedOrganization } from "@/src/store/useSelectedOrganization";
import { useUserInsightsOrganization } from "@/src/hooks/useUserInsightsOrganization";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

function OrganizationDropdown() {
  const [organizations, setOrganizations] = React.useState<OrganizationListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const { selectedOrganizationId, setSelectedOrganizationId } = useSelectedOrganization();
  const { defaultOrganizationId } = useUserInsightsOrganization();
  const clearData = useUserInsightsStore((s) => s.clearData);

  const initialized = React.useRef(false);

  React.useEffect(() => {
    fetchOrganizationList()
      .then((orgs) => {
        setOrganizations(orgs);
        if (!initialized.current && defaultOrganizationId) {
          setSelectedOrganizationId(defaultOrganizationId);
          initialized.current = true;
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (value: string) => {
    clearData();
    setSelectedOrganizationId(Number(value));
  };

  const currentValue = String(selectedOrganizationId ?? defaultOrganizationId ?? "");

  if (loading || organizations.length === 0) {
    return <div className="h-9 w-52 bg-accent animate-pulse rounded-md" />;
  }

  return (
    <Select value={currentValue} onValueChange={handleChange}>
      <SelectTrigger
        iconSize={16}
        className="h-9 w-52 rounded-md border-0 bg-accent px-2 shadow-none ring-0 focus:ring-0 gap-2 [&>span]:truncate [&>span]:max-w-[130px] [&>span]:text-sm [&>span]:font-semibold [&>span]:text-text-primary"
      >
        {/* Icon bubble — identical to CurrentDate: w-7 h-7 bg-backdrop rounded-full */}
        <div className="w-7 h-7 bg-backdrop rounded-full flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7l9-4 9 4M4 21V7m16 14V7M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4" />
          </svg>
        </div>
        <SelectValue />
      </SelectTrigger>
      {/* min-w-[280px] gives enough room so org names don't get clipped */}
      <SelectContent className="max-h-60 min-w-[280px]">
        {organizations.map((org) => (
          <SelectItem key={org.id} value={String(org.id)} className="whitespace-normal">
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

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
        <div className="flex gap-4 items-center">
          <OrganizationDropdown />
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