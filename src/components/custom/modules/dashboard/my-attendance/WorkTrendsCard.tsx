"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
} from "@/src/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar1Icon } from "@/src/icons/icons";
import { useDashboardStore } from "@/src/store/useDashboardStore";

const colorMapping = {
  worked: "#0078D4",
  missed: "#C7E7FF",
  expected: "#C7E7FF",
  holiday: "#FFD700",
  dayoff: "#EBEBEB",
};

const formatHoursToHM = (decimalHours: number) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

const CustomTooltip = ({ active, payload }: any) => {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  if (data.dayoff > 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-700">
          {t?.day || "Day"} {data.date}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorMapping.dayoff }}></div>
          <span className="text-sm text-gray-600">{t?.dayoff || "Day Off"}</span>
        </div>
      </div>
    );
  }

  if (data.holiday > 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-700">
          {t?.day || "Day"} {data.date}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorMapping.holiday }}></div>
          <span className="text-sm text-gray-600">{t?.holiday || "Holiday"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="text-sm font-semibold text-gray-700 mb-2">
        {t?.day || "Day"} {data.date}
      </p>
      {data.worked > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorMapping.worked }}></div>
          <span className="text-sm text-gray-600">
            {t?.worked_hrs || "Worked"}: {formatHoursToHM(data.worked)}
          </span>
        </div>
      )}
      {data.missed > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorMapping.missed }}></div>
          <span className="text-sm text-gray-600">
            {t?.missed_hrs || "Missed"}: {formatHoursToHM(data.missed)}
          </span>
        </div>
      )}
    </div>
  );
};

const CustomLegend = ({ payload }: any) => {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const customLabels: { [key in "worked" | "missed" | "expected" | "holiday" | "dayoff"]: string } = {
    worked: t?.worked_hrs,
    missed: t?.missed_hrs,
    expected: t?.expected_hrs,
    holiday: t?.holiday || "Holiday",
    dayoff: t?.dayoff || "Day Off",
  };

  return (
    <div className="flex justify-center mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={`legend-${entry.value}-${index}`} className="flex items-center mx-2">
          <div
            className="w-3 h-3 mr-2 rounded-sm"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-sm text-gray-700 px-1">
            {customLabels[entry.value as "worked" | "missed" | "expected" | "holiday" | "dayoff"] || entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

function WorkTrendsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const workHourTrendsCache = useDashboardStore((state) => state.workHourTrendsCache);
  const loadingWorkHourTrends = useDashboardStore((state) => state.loadingWorkHourTrends);
  const fetchWorkHourTrendsForMonth = useDashboardStore((state) => state.fetchWorkHourTrendsForMonth);

  useEffect(() => {
    fetchWorkHourTrendsForMonth(selectedMonth);
  }, [selectedMonth, fetchWorkHourTrendsForMonth]);

  const workHourTrends = workHourTrendsCache[selectedMonth] || [];

  const monthKeys = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];

  const months = monthKeys.map(
    (key, i) => translations?.[key] || new Date(0, i).toLocaleString("en", { month: "long" })
  );

  const chartDataToRender = useMemo(() => {
    const daysInMonth = new Date(currentYear, selectedMonth, 0).getDate();

    if (!workHourTrends?.length) {
      return Array.from({ length: daysInMonth }, (_, i) => ({
        date: (i + 1).toString(),
        worked: 0,
        missed: 0,
        expected: 0,
        holiday: 0,
        dayoff: 0,
        isRestDay: false,
      }));
    }

    const data = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNumber = i + 1;

      const dayData = workHourTrends.find(item => item.DayofDate === dayNumber);

      if (!dayData) {
        return {
          date: dayNumber.toString(),
          worked: 0,
          missed: 0,
          expected: 0,
          holiday: 0,
          dayoff: 0,
          isRestDay: false,
        };
      }

      if (dayData.restday === 1) {
        return {
          date: dayNumber.toString(),
          worked: 0,
          missed: 0,
          expected: 0,
          holiday: 0,
          dayoff: 8,
          isRestDay: true,
        };
      }

      if (dayData.holiday === 1) {
        return {
          date: dayNumber.toString(),
          worked: 0,
          missed: 0,
          expected: 0,
          holiday: 8,
          dayoff: 0,
          isRestDay: false,
        };
      }

      const expectedMinutes = (dayData.ExpectedWork === null || dayData.ExpectedWork === 0)
        ? 480
        : dayData.ExpectedWork;

      const expectedHours = expectedMinutes / 60;
      const workedHours = (dayData.WorkMinutes || 0) / 60;

      let worked, missed, expected;

      if (workedHours > expectedHours) {
        worked = Number(workedHours.toFixed(2));
        missed = 0;
        expected = 0;
      } else {
        worked = Number(workedHours.toFixed(2));
        missed = Number((expectedHours - workedHours).toFixed(2));
        expected = Number(expectedHours.toFixed(2));
      }

      return {
        date: dayNumber.toString(),
        worked,
        missed,
        expected,
        holiday: 0,
        dayoff: 0,
        isRestDay: false,
      };
    });

    return data;
  }, [workHourTrends, selectedMonth, currentYear]);

  const chartDataFinal = dir === "rtl" ? [...chartDataToRender].reverse() : chartDataToRender;

  const maxExpectedHours = Math.max(
    ...chartDataToRender.map(d => d.expected),
    0
  );

  const maxValue = Math.max(
    ...chartDataToRender.map(d => d.worked + d.missed),
    ...chartDataToRender.map(d => d.holiday),
    ...chartDataToRender.map(d => d.dayoff),
    8
  );

  const yAxisMax = Math.max(Math.ceil(maxValue / 2) * 2, 10);

  const ticks = [];
  for (let i = 0; i <= yAxisMax; i += 2) {
    ticks.push(i);
  }

  const hasAnyData = chartDataToRender.some(d => d.worked > 0 || d.missed > 0 || d.expected > 0 || d.holiday > 0 || d.dayoff > 0);

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4">
      <div className="flex flex-row justify-between p-3">
        <h5 className="text-lg text-text-primary font-bold">
          {t?.work_hrs_trends}
        </h5>

        <Select
          value={selectedMonth.toString()}
          onValueChange={(value) => setSelectedMonth(Number(value))}
        >
          <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
            <Calendar1Icon width="14" height="16" />
            <SelectValue>
              {selectedMonth === currentMonth
                ? translations?.this_month || "هذا الشهر"
                : months[selectedMonth - 1]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-accent rounded-md shadow-dropdown">
            {months.map((month, index) => {
              const monthValue = index + 1;
              return (
                <SelectItem
                  key={`month-${index}`}
                  value={monthValue.toString()}
                  className="text-text-primary bg-accent"
                >
                  {monthValue === currentMonth
                    ? translations?.this_month || "هذا الشهر"
                    : month}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {loadingWorkHourTrends ? (
        <div className="flex justify-center items-center h-[300px]">
          <p className="text-text-secondary">{translations?.buttons?.loading || "جارٍ التحميل"}</p>
        </div>
      ) : (
        <div className="relative">
          <ChartContainer
            dir={dir}
            className={`relative w-full h-[400px] 3xl:h-[450px] flex justify-center ${dir === "rtl" ? "-right-[35px]" : "-left-[25px]"}`}
            config={{
              type: { label: "Bar Chart", icon: undefined, color: "#0078D4" },
              options: {},
            }}
          >
            <BarChart accessibilityLayer data={chartDataFinal}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={2}
                axisLine={false}
                interval={0}
              />
              <YAxis
                type="number"
                tickLine={false}
                tickMargin={3}
                axisLine={false}
                domain={[0, yAxisMax]}
                ticks={ticks}
                orientation={dir === "rtl" ? "right" : "left"}
              />
              {hasAnyData && <ChartTooltip cursor={false} content={<CustomTooltip />} />}
              <ChartLegend content={<CustomLegend />} />

              <Bar
                dataKey="worked"
                stackId="b"
                fill={colorMapping.worked}
                radius={0}
                barSize={5}
              />
              <Bar
                dataKey="missed"
                stackId="b"
                fill={colorMapping.missed}
                radius={0}
                barSize={5}
              />
              <Bar
                dataKey="holiday"
                stackId="b"
                fill={colorMapping.holiday}
                radius={0}
                barSize={5}
              />
              <Bar
                dataKey="dayoff"
                stackId="b"
                fill={colorMapping.dayoff}
                radius={0}
                barSize={5}
              />
            </BarChart>
          </ChartContainer>

          {!hasAnyData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-text-secondary font-medium text-center">
                {translations?.no_data || "لا توجد بيانات متاحة"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkTrendsCard;