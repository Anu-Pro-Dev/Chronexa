"use client";
import React, { useMemo } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

const allManuals = [
  { fileName: "Chronexa_TimePro_Admin_Guide.pdf", label: "admin_label", defaultLabel: "Admin Manual", role: "admin" },
  { fileName: "Chronexa_TimePro_Manager_Guide.pdf", label: "manager_label", defaultLabel: "Manager Manual", role: "manager" },
  { fileName: "Chronexa_TimePro_Employee_Guide.pdf", label: "employee_label", defaultLabel: "Employee Manual", role: "employee" },
  { fileName: "Chronexa_TimePro_Timekeeper_Guide.pdf", label: "timekeeper_label", defaultLabel: "Timekeeper Manual", role: "timekeeper" },
  // { fileName: "Chronexa_TimePro_User_Admin_Guide.pdf", label: "user_admin_label", defaultLabel: "User Admin Manual", role: "user_admin" },
];

export default function Page() {
  const { modules, translations } = useLanguage();
  const { userRole } = useAuthGuard();
  const t = translations?.modules?.manuals || {};

  const manuals = useMemo(() => {
    const role = userRole?.toLowerCase();

    if (role === "admin") return allManuals;

    if (role === "manager")
      return allManuals.filter(
        (m) => m.role === "manager" || m.role === "employee"
      );

    if (role === "timekeeper")
      return allManuals.filter((m) => m.role === "timekeeper");

    if (role === "user_admin")
      return allManuals.filter((m) => m.role === "user_admin");

    return allManuals.filter((m) => m.role === "employee");
  }, [userRole]);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader disableFeatures items={modules?.manuals?.items} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        {manuals.map((doc) => (
          <a
            key={doc.fileName}
            href={`/manuals/${doc.fileName}`}
            download
            className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer"
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="9 9 12 12 15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span className="text-base font-medium text-center text-foreground">
              {t[doc.label] || doc.defaultLabel}
            </span>
            <span className="flex items-center gap-2 text-sm text-primary font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
