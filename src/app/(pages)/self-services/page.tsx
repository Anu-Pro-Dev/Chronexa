"use client";

import React, { useState, useEffect } from "react";
import Header from "./header";
import { TableColumns } from "@/widgets/TableColumns.widget";
import { DataTable } from "@/widgets/DataTable.widget";
import TabActionPermissions from "./(ManagePermissions)/TabAction";
import TabActionLeaves from "./(ManageLeaves)/TabAction";
import TabActionMovements from "./(ManageMovements)/TabAction";
import TabActionApproval from "./(Approvals)/(TableTabs)/TabAction";
import { WorkflowsDataType } from "@/lib/types/types";
import { workflows_columns } from "@/data/selfservices.data";
import WorkflowsPage from "./(Workflows)/workflows.page";
import ApprovalsPage from "./(Approvals)/Approvals.page";

function SelfServices() {
  const [tab, setTab] = React.useState<string>("Workflows");
  const [data, setData] = React.useState([]);
  const [col, setCol] = React.useState<any[]>([]);
  const [searchValue, setSearchValue] = React.useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/self-services/api?tab=" + tab);
        const result = await response.json();
        console.log(result);
        setData(result.data);
        setCol(
          tab === "Workflows"
            ? TableColumns<WorkflowsDataType>(workflows_columns, {} as WorkflowsDataType)
            : TableColumns<WorkflowsDataType>(workflows_columns, {} as WorkflowsDataType)
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
    <div className="page-container">
      {
        tab === "Workflows" ? (
          <WorkflowsPage col={col} data={data} tab={tab} setTab={(newTab: string) => setTab(newTab)} />
        ) :
          tab === "Approvals" ? (
            <ApprovalsPage col={col} data={data} tab={tab} setTab={(newTab: string) => setTab(newTab)} />
          ) : 
          tab === "Manage Leaves" ? (
            <ApprovalsPage col={col} data={data} tab={tab} setTab={(newTab: string) => setTab(newTab)} />
          ) : 
          tab === "Manage Permissions" ? (
            <ApprovalsPage col={col} data={data} tab={tab} setTab={(newTab: string) => setTab(newTab)} />
          ) : (<></>)
      }
      {/* <Header setTab={setTab} tab={tab} />
      {tab === "Manage Permissions" ?
        <TabActionPermissions setTab={setTab} tab={tab} />:
        tab === "Manage Leaves" ?
        <TabActionLeaves setTab={setTab} tab={tab} />:
        tab === "Manage Movements" ?
        <TabActionMovements setTab={setTab} tab={tab} />:
        tab === "Approvals" ?
        <TabActionApproval setTab={setTab} tab={tab} />:
        tab === "Workflows#add" ?
          (<WorkflowAddAction setTab={setTab} tab={tab} />) :
          (<div className="bg-foreground rounded-[20px] mx-6 pb-6 pt-3 px-4">
            <DataTable columns={col} data={data} tab={tab} searchValue={searchValue} customClasses="" />
          </div>)
        } */}
      {/* <div className="bg-foreground rounded-[20px] mx-6 pb-6 pt-3 px-4">
          <DataTable columns={col} data={data} tab={tab} searchValue={searchValue} customClasses=""/>
        </div> */}
    </div>
  );
}
export default SelfServices;