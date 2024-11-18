"use client";

import React, { useState, useEffect } from "react";
import { TableColumns, MonthlyRoasterColumns } from '@/widgets/TableColumns.widget';
import { WeeklyScheduleDataType } from "@/lib/types/types";
import { monthlyRoaster_data, weeklyschedule_columns } from "@/data/scheduling.data";
import WeeklySchedulePage from "./(Weekly Schedule)/WSPage";
import MonthlyRoasterPage from "./(Monthly Roster)/MSPage";


function Scheduling() {
  const [tab, setTab] = React.useState<string>("Weekly Schedule");
  const [data, setData] = React.useState([]);
  const [col, setCol] = React.useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/scheduling/api?tab=" + tab);
        const result = await response.json();
        console.log(result);
        setData(result.data);
        setCol(
          TableColumns<WeeklyScheduleDataType>(weeklyschedule_columns, {} as WeeklyScheduleDataType)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (tab !== "") fetchData();
  }, [tab]);

  useEffect(() => {
    console.log("tab: ", tab)
  })

  return (
    <>
      {tab === "Weekly Schedule" ?
        (
          <WeeklySchedulePage
            setTab={setTab}
            tab={tab}
            col={col}
            data={data} />)
        : tab === "Monthly Roster" ? (
          <MonthlyRoasterPage
            setTab={setTab}
            tab={tab}
            col={MonthlyRoasterColumns}
            data={monthlyRoaster_data}
          />
          
        ) : (<></>)}
    </>
  );
}

export default Scheduling;