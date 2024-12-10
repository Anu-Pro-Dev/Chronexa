import React, { useState } from "react";
import WorkHoursCalendar from "./WorkHoursCalendar";

export default function WorkTrends() {
  const sampleData = [
    { date: "2024-01-01", hours: 8 },
    { date: "2024-01-02", hours: 6 },
    { date: "2024-02-05", hours: 6 },
    { date: "2024-03-03", hours: 6 },
  ];

  const [selectedYear, setSelectedYear] = useState(2024);

  return (
    <div className="bg-primary-100 p-4">
    
      <div>
        <WorkHoursCalendar data={sampleData} year={selectedYear} />
      </div>
    </div>
  );
}
