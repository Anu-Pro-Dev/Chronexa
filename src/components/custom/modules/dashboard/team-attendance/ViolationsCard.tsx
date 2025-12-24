"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar1Icon } from "@/src/icons/icons";
import { getTeamViolationAnalytics } from '@/src/lib/dashboardApiHandler';

interface ViolationAnalytic {
  ViolationMnth: number;
  LeaveYear: number;
  LateCnt: number;
  EarlyCnt: number;
  MissedIn: number;
  MissedOut: number;
}

function ViolationsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [violationsData, setViolationsData] = useState<ViolationAnalytic[]>([]);

  useEffect(() => {
    const fetchYearData = async () => {
      try {
        const response = await getTeamViolationAnalytics(selectedYear);
        if (response?.success && response.data?.length > 0) {
          setViolationsData(response.data);
        } else {
          setViolationsData([]);
        }
      } catch (error) {
        console.error('Error fetching violations analytics:', error);
        setViolationsData([]);
      }
    };

    fetchYearData();
  }, [selectedYear]);

  const formatValue = (value: any): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseInt(value) || 0 : Number(value) || 0;
  };

  const monthTranslationsMap: Record<string, string> = {
    January: translations.january || "January",
    February: translations.february || "February",
    March: translations.march || "March",
    April: translations.april || "April",
    May: translations.may || "May",
    June: translations.june || "June",
    July: translations.july || "July",
    August: translations.august || "August",
    September: translations.september || "September",
    October: translations.october || "October",
    November: translations.november || "November",
    December: translations.december || "December",
  };

  const chartData = useMemo(() => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthDataMap = new Map();
    
    violationsData.forEach((item: ViolationAnalytic) => {
      monthDataMap.set(item.ViolationMnth, {
        missedin: formatValue(item.MissedIn),
        missedout: formatValue(item.MissedOut),
        latein: formatValue(item.LateCnt),
        earlyout: formatValue(item.EarlyCnt),
      });
    });

    return months.map((month, index) => ({
      month,
      missedin: monthDataMap.get(index + 1)?.missedin || 0,
      missedout: monthDataMap.get(index + 1)?.missedout || 0,
      latein: monthDataMap.get(index + 1)?.latein || 0,
      earlyout: monthDataMap.get(index + 1)?.earlyout || 0,
    }));
  }, [violationsData]);

  const chartConfig = {
    missedin: {
      label: t?.missed_in || "Missed in",
      color: "#0078D4",
    },
    missedout: {
      label: t?.missed_out || "Missed out",
      color: "#1E9090",
    },
    latein: {
      label: t?.late_in || "Late in",
      color: "#FF6347",
    },
    earlyout: {
      label: t?.early_out || "Early out",
      color: "#FFBF00",
    },
  } satisfies ChartConfig;

  const localizedChartData = dir === "rtl" ? [...chartData].reverse() : chartData;

  const years = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, [currentYear]);

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      <div className="flex flex-row justify-between p-4">
        <h5 className="text-lg text-text-primary font-bold">
          {t?.violations}
        </h5>
        <Select 
          value={selectedYear.toString()} 
          onValueChange={(value) => setSelectedYear(Number(value))}
        >
          <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
            <Calendar1Icon width="14" height="16" />
            <SelectValue placeholder={translations?.select_year || "Select Year"}>
              {selectedYear}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-accent rounded-md shadow-dropdown">
            {years.map((year) => (
              <SelectItem
                key={year}
                value={year.toString()}
                className="text-text-primary gap-0 bg-accent hover:bg-primary hover:text-primary"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChartContainer 
        config={chartConfig} 
        className={`relative w-full h-[300px] ${
          dir === "rtl" ? "-right-[45px]" : "-left-[35px]"
        }`}
        dir={dir}
      >
        <LineChart
          accessibilityLayer
          data={localizedChartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              if (dir === "rtl") {
                const translated = monthTranslationsMap[value] || value;
                return translated.slice(0, 3);
              } else {
                return value.slice(0, 3);
              }
            }}
          />
          <YAxis
            type="number"
            tickLine={false}
            tickMargin={2}
            axisLine={false}
            orientation={dir === "rtl" ? "right" : "left"}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={false}
            defaultIndex={1}
          />
          <Line
            dataKey="missedin"
            type="monotone"
            stroke="var(--color-missedin)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="missedout"
            type="monotone"
            stroke="var(--color-missedout)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="latein"
            type="monotone"
            stroke="var(--color-latein)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="earlyout"
            type="monotone"
            stroke="var(--color-earlyout)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export default ViolationsCard;