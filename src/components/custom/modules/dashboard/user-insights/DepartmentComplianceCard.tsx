"use client";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { useLanguage } from "@/src/providers/LanguageProvider";

const barColor = (pct: number) => {
  if (pct >= 90) return "#1D9E75";
  if (pct >= 75) return "#378ADD";
  if (pct >= 60) return "#EF9F27";
  return "#D85A30";
};

export default function DepartmentComplianceCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const data = useUserInsightsStore((s) => s.data);
  const rows = data?.departmentAttendance ?? [];

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4">
      <h5 className="text-base font-bold text-text-primary mb-4">
        Attendance by department
      </h5>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {["Department", "Present", "Rate"].map((h) => (
              <th
                key={h}
                className="text-left text-[11px] font-semibold text-text-secondary pb-2 border-b border-border-accent"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-text-secondary text-xs py-4">
                {t?.no_records || "No records"}
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border-accent last:border-0">
              <td className="py-2 text-text-primary">{r.department}</td>
              <td className="py-2 text-text-secondary">{r.present}/{r.total}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <div className="h-[5px] w-16 rounded-full bg-border-accent overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${r.rate}%`, background: barColor(r.rate) }}
                    />
                  </div>
                  <span className="text-[11px] text-text-secondary">{r.rate}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
