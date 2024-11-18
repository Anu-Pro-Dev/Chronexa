"use client";

import React, { useEffect } from "react";
import { TableColumns } from "@/widgets/TableColumns.widget";
import { DataTable } from "@/widgets/DataTable.widget";
import { EmployeeMasterGroupsMembersDataType } from "@/lib/types/types";
import HeaderMemberView from "./header.memberview";
import {
  employee_master_groups_member_columns,
  employee_master_groups_member_data
} from "@/data/em.data";
import AddButtonActionMemberView from "./(MemberviewADD)/AddButtonAction";

function EmployeeGroupsMemberView({ setTab, tab }: { setTab: (newTab: string) => void, tab: string }) {
  const data = employee_master_groups_member_data;

  const col = TableColumns<EmployeeMasterGroupsMembersDataType>(employee_master_groups_member_columns, {} as EmployeeMasterGroupsMembersDataType);

  useEffect(() => {
    console.log("EmployeeGroupsMemberView tab=", tab);
  })


  return (
    <div className="page-container">
      <HeaderMemberView setTab={setTab} tab={tab} />
      <div className="bg-foreground rounded-[20px] mx-6 pb-6 pt-3 px-4">
        {tab === "Employee Groups/MemberView#add" ?
          (<AddButtonActionMemberView  setTab={setTab} tab={tab} />) :
          (<div className="bg-foreground rounded-[20px] mx-6 pb-6 pt-3 px-4">
            <DataTable columns={col} data={data} tab={"Employee Groups"} searchValue={""} customClasses="" />
          </div>)
        }
      </div>
    </div>
  );
}

export default EmployeeGroupsMemberView;
