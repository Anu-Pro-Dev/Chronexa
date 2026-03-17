"use client";
import { useEffect, useState } from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { useLanguage } from "@/src/providers/LanguageProvider";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/solid";

interface KpiCardProps {
  label: string;
  value: number;
  sub: string;
  color: string;
  barColor: string;
  barWidth: number;
  Icon: React.ComponentType<{ className?: string }>;
}

function KpiCard({ label, value, sub, color, barColor, barWidth, Icon }: KpiCardProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (value === 0) { setAnimated(0); return; }
    let start = 0;
    const step = value / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { start = value; clearInterval(timer); }
      setAnimated(Math.floor(start));
    }, 18);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4 flex flex-col gap-2 relative overflow-hidden">
      <div className="absolute right-3 top-3 opacity-10">
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold leading-none ${color}`}>{animated}</p>
      <p className={`text-[11px] font-medium opacity-80 ${color}`}>{sub}</p>
      <div className="h-[3px] rounded-full bg-border-accent mt-1">
        <div
          className="h-[3px] rounded-full transition-all duration-700"
          style={{ width: `${Math.min(barWidth, 100)}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

export default function KpiGrid() {
  const data = useUserInsightsStore((s) => s.data);
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const sparkToday  = data?.today  ?? { checkIns: 0, checkOuts: 0, missedIn: 0, missedOut: 0, onLeave: 0 };
  const sparkTotals = data?.totals ?? { totalEmployees: 1, noAppLogin: 0, employeesInUse: 0 };
  const wf = sparkTotals.totalEmployees || 1;

  const pct = (n: number) => Math.round((n / wf) * 100);

  const cards: KpiCardProps[] = [
    {
      label: t?.check_in || "Check-ins",
      value: sparkToday.checkIns,
      sub: `${sparkToday.checkIns} of ${wf} workforce`,
      color: "text-[#0078D4]", barColor: "#0078D4", barWidth: pct(sparkToday.checkIns),
      Icon: CheckCircleIcon,
    },
    {
      label: t?.check_out || "Check-outs",
      value: sparkToday.checkOuts,
      sub: "Shift ends at 17:00",
      color: "text-[#0F6E56]", barColor: "#1D9E75", barWidth: pct(sparkToday.checkOuts),
      Icon: XCircleIcon,
    },
    {
      label: t?.missed_check_in || "Missed in",
      value: sparkToday.missedIn,
      sub: "No check-in recorded",
      color: "text-[#C0392B]", barColor: "#D85A30", barWidth: pct(sparkToday.missedIn),
      Icon: ExclamationCircleIcon,
    },
    {
      label: t?.missed_check_out || "Missed out",
      value: sparkToday.missedOut,
      sub: "No checkout recorded",
      color: "text-[#854F0B]", barColor: "#EF9F27", barWidth: pct(sparkToday.missedOut),
      Icon: ExclamationCircleIcon,
    },
    {
      label: t?.approved_leaves || "On leave",
      value: sparkToday.onLeave,
      sub: "Approved",
      color: "text-[#534AB7]", barColor: "#7F77DD", barWidth: pct(sparkToday.onLeave),
      Icon: CalendarDaysIcon,
    },
    {
      label: "No app login",
      value: sparkTotals.noAppLogin,
      sub: "Not opened today",
      color: "text-[#5F5E5A]", barColor: "#888780", barWidth: pct(sparkTotals.noAppLogin),
      Icon: DevicePhoneMobileIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c) => <KpiCard key={c.label} {...c} />)}
    </div>
  );
}
