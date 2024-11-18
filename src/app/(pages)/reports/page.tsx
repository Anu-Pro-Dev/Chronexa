"use client";

import React, { useState, useEffect } from "react";
import Header from "./header";
import StandardReports from "./StandardReports";
import ReprocessData from "./ReprocessData";

function Reports() {
  const [tab, setTab] = React.useState<string>("");

  return (
    <div className="page-container">
      <Header setTab={setTab} tab={tab} />
      <div className="bg-foreground rounded-[20px] mx-6 p-6">
        {tab === "Standard Reports" ?
          <StandardReports/> :
          <ReprocessData/>
        }
      </div>
    </div>
  );
}

export default Reports;