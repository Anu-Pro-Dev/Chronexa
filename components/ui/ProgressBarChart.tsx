"use client"

import * as React from "react"

type ProgressBarChartProps = {
    totalHours: number; 
    workedHours: number; 
    overtimeHours: number; 
    pendingHours: number; 
    barCount?: number; 
    colors?: { worked: string; overtime: string; pending: string }; 
  };
  
  const ProgressBarChart: React.FC<ProgressBarChartProps> = ({
    totalHours,
    workedHours,
    overtimeHours,
    pendingHours,
    barCount = 30,
    colors = { worked: "#0078D4", overtime: "#80BBE9", pending: "#D9EBF9" },
  }) => {
    const workedBars = Math.round((workedHours / totalHours) * barCount);
    const overtimeBars = Math.round((overtimeHours / totalHours) * barCount);
    const pendingBars = Math.round((pendingHours / totalHours) * barCount);
  
    const bars = Array.from({ length: barCount }, (_, i) => {
      if (i < workedBars) return colors.worked; 
      if (i < workedBars + overtimeBars) return colors.overtime; 
      if (i < workedBars + overtimeBars + pendingBars) return colors.pending; 
      return "#EBEBEB"; 
    });
  
    return (
      <div>
        <div className="flex items-center mt-5 mb-2 font-bold text-3xl">
          {totalHours}
          <span className="pl-2 font-medium text-sm text-text-secondary">Expected working hours</span>
        </div>
        <div className="flex justify-between">
          {bars.map((barColor, index) => (
            <div
              key={index}
              className="w-[3px] h-[40px] rounded-[3px]"
              style={{
                backgroundColor: barColor,
              }}
            ></div>
          ))}
        </div>
        <div className="flex justify-between mt-3">
            <div className="font-semibold text-xs text-text-secondary">
                Worked
                <p className="font-bold text-xl text-text-primary pl-2 border-l-2 border-[#0078D4] mt-1">
                    {workedHours}
                </p>
            </div>
            <div className="font-semibold text-xs text-text-secondary">
                Overtime
                <p className="font-bold text-xl text-text-primary pl-2 border-l-2 border-[#80BBE9] mt-1">
                    {overtimeHours}
                </p>
            </div>
            <div className="font-semibold text-xs text-text-secondary">
                Pending
                <p className="font-bold text-xl text-text-primary pl-2 border-l-2 border-[#D9EBF9] mt-1">
                    {pendingHours}
                </p>
            </div>
            
        </div>
      </div>
    );
  };
  
  export default ProgressBarChart;