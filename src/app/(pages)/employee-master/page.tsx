"use client";

import React, { useState, useEffect } from "react";
import Header from "./header";
import { TableColumns } from "@/widgets/TableColumns.widget";
import { DataTable } from "@/widgets/DataTable.widget";
import { EmployeeMasterEmployeesDataType, EmployeeMasterGroupsDataType, EmployeeMasterTypesDataType } from "@/lib/types/types";
import { employee_master_employees_columns, employee_master_groups_columns, employee_master_types_columns } from '../../../data/em.data';
import AddButtonAction from "./(EmployeesADD)/AddButtonAction";
import EmployeeGroupsMemberView from "./(EmployeeGroupsMemberView)/page.memberview";
import AddButtonActionMemberView from "./(EmployeeGroupsMemberView)/(MemberviewADD)/AddButtonAction";

function EmployeeMaster() {
  const [tab, setTab] = React.useState<string>("");
  const [data, setData] = React.useState([]);
  const [col, setCol] = React.useState<any[]>([]);
  const [searchValue, setSearchValue] = React.useState<any>(null);

  const [openMemberView, setOpenMemberView] = useState(false);

  const handleMemberClick = (memberData: any) => {
    setOpenMemberView(true);
    setTab("Employee Groups");
  };

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    if (newTab !== "Employee Groups" && newTab !== "Employee Groups/MemberView#add") {
      setOpenMemberView(false); // Close the member view when switching to other tabs
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/employee-master/api?tab=" + tab);
        const result = await response.json();
        console.log(result);
        setData(result.data);
        setCol(
          tab === "Employees"
            ? TableColumns<EmployeeMasterEmployeesDataType>(employee_master_employees_columns, {} as EmployeeMasterEmployeesDataType)
            : tab === "Employee Groups"
              ? TableColumns<EmployeeMasterGroupsDataType>(employee_master_groups_columns, {} as EmployeeMasterGroupsDataType, handleMemberClick)
              : TableColumns<EmployeeMasterTypesDataType>(employee_master_types_columns, {} as EmployeeMasterTypesDataType)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (tab !== "") fetchData();
  }, [tab]);


  const handleSearchValue = (e: any) => {
    setSearchValue(e.target.value)
  }

  useEffect(() => {
    console.log("EmployeeGroupsView tab=", tab);
  })


  return (
    <>
      {!openMemberView ?
        (
          <div className="page-container">
            <Header setTab={setTab} tab={tab} />
            {tab === "Employees#add" ?
              (<AddButtonAction setTab={setTab} tab={tab} />) :

              (<div className="bg-foreground rounded-[20px] mx-6 pb-6 pt-3 px-4">
                <DataTable columns={col} data={data} tab={tab} searchValue={searchValue} customClasses="" />
              </div>)
            }
          </div>
        ) :
        (<EmployeeGroupsMemberView setTab={handleTabChange} tab={tab} />)
      }
    </>
  );
}

export default EmployeeMaster;