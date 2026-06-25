"use client";
import { useLanguage } from "@/src/providers/LanguageProvider";
import Link from "next/link";

export const LeaveCardHeader = ({ page, setPage }: any) => {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const getApplyLink = () => {
    if (page === "Leaves") return "/self-services/leaves/my-request/add";
    if (page === "Permissions") return "/self-services/permissions/my-request/add";
    return "/dashboard/my-attendance/";
  };

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="flex gap-1.5 items-center bg-background rounded-lg p-1">
        <button
          className={`cursor-pointer font-bold text-sm px-3.5 py-1.5 rounded-md transition-all duration-200 ${
            page === "Leaves"
              ? "bg-gradient-to-r from-[#0078D4] to-[#00BCD4] text-white shadow-md"
              : "text-text-secondary hover:text-text-primary"
          }`}
          onClick={() => setPage("Leaves")}
        >
          {t?.leaves}
        </button>
        <button
          className={`cursor-pointer font-bold text-sm px-3.5 py-1.5 rounded-md transition-all duration-200 ${
            page === "Permissions"
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-md"
              : "text-text-secondary hover:text-text-primary"
          }`}
          onClick={() => setPage("Permissions")}
        >
          {t?.permissions}
        </button>
      </div>
    </div>
  );
};
