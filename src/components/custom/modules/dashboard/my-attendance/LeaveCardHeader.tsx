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
    <div className="flex flex-row justify-between p-4">
      <div className="flex gap-2">
        <h5
          className={`cursor-pointer font-bold text-lg ${
            page === "Leaves"
              ? "border-b-[2px] border-primary text-primary"
              : "text-text-primary"
          }`}
          onClick={() => setPage("Leaves")}
        >
          {t?.leaves}
        </h5>
        <h5 className="cursor-pointer font-bold text-lg text-text-primary">/</h5>
        <h5
          className={`cursor-pointer font-bold text-lg ${
            page === "Permissions"
              ? "border-b-[2px] border-primary text-primary"
              : "text-text-primary"
          }`}
          onClick={() => setPage("Permissions")}
        >
          {t?.permissions}
        </h5>
      </div>
      <Link
        href={getApplyLink()}
        className="text-primary text-sm font-medium flex items-center justify-center gap-1"
      >
        {translations?.buttons?.apply}
      </Link>
    </div>
  );
};
