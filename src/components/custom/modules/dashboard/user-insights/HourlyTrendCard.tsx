"use client";
import { useMemo } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import {
  CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";

// Stable empty fallback – defined outside component to avoid referential churn
const EMPTY: { hour: number; checkIns: number; checkOuts: number }[] = [];

export default function HourlyTrendCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const data = useUserInsightsStore((s) => s.data);

  // hourlyTrend shape from API: { hour, checkIns, checkOuts }
  // missedIn is a daily scalar (today.missedIn), NOT per-hour — removed from chart
  const raw = data?.hourlyTrend ?? EMPTY;

  const chartData = useMemo(
    () => (dir === "rtl" ? [...raw].reverse() : raw),
    [raw, dir]
  );

  const labels = {
    checkIns:  t?.check_in  || "Check-ins",
    checkOuts: t?.check_out || "Check-outs",
  };

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4 h-full">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h5 className="text-base font-bold text-text-primary">
            {labels.checkIns} / {labels.checkOuts}{" "}
            <span className="font-normal text-text-secondary text-sm">
              {t?.work_hrs_trends || "Hourly trend"} · Today
            </span>
          </h5>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-3 text-xs text-text-secondary">
        {[
          { color: "#378ADD", label: labels.checkIns },
          { color: "#1D9E75", label: labels.checkOuts },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ left: -10, right: 10 }}>
          <defs>
            <linearGradient id="gIn"  x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#378ADD" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1D9E75" stopOpacity={0.10} />
              <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" />
          <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis
            tickLine={false} axisLine={false} tick={{ fontSize: 10 }}
            orientation={dir === "rtl" ? "right" : "left"}
          />
          <Tooltip
            contentStyle={{
              background: "var(--accent)",
              border: "0.5px solid var(--border-accent)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number, key: string) => [
              value,
              labels[key as keyof typeof labels] ?? key,
            ]}
          />
          <Area
            type="monotone" dataKey="checkIns"
            stroke="#378ADD" strokeWidth={2} fill="url(#gIn)"
            dot={false} isAnimationActive={false}
          />
          <Area
            type="monotone" dataKey="checkOuts"
            stroke="#1D9E75" strokeWidth={2} fill="url(#gOut)"
            dot={false} isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
