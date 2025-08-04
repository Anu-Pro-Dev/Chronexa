"use client";
import React, { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";
import ProgressBarChart from "@/components/ui/ProgressBarChart";

function ScheduleCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-5">
      <div>
        <div className="flex flex-col">
          <div>
            <div className="flex items-center justify-between">
              <h5 className="text-lg text-text-primary font-bold">{t?.schedule}</h5>   
              <Link href="/scheduling/monthly-schedule"  className="text-primary text-sm font-medium"> {translations?.buttons?.show_all}</Link>
            </div>
          </div>
        </div>

      </div>

      <div className="mb-6">
        <ProgressBarChart
          totalHours={206}
          workedHours={140}
          overtimeHours={32}
          pendingHours={12}
          barCount={50}
        />
      </div>
    </div>
  );
}

export default ScheduleCard;
