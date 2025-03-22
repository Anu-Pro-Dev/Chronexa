"use client"; // Ensure this is a client-side component

import { useSearchParams } from "next/navigation"; // Correct hook to access search params
import { useEffect, useState } from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import AddGroupMembers from "@/forms/employee-master/AddGroupMembers";

export default function MembersTable() {
  const { modules } = useLanguage();
  const searchParams = useSearchParams(); // Get the search params from the URL
  const role = searchParams.get("role"); // Get the 'group' query parameter
  const [Data, SetData] = useState<any>([]); // Full employee data
  const [FilteredData, SetFilteredData] = useState<any>([]); // Filtered employee data based on group
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>(""); 
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [open, on_open_change] = useState<boolean>(false);
  const [DataAdd, SetDataAdd] = useState<any>([]);
  const [CurrentPageAdd, SetCurrentPageAdd] = useState<number>(1)
  const [SortFieldAdd, SetSortFieldAdd] = useState<string>("")
  const [SortDirectionAdd, SetSortDirectionAdd] = useState<string>("asc")

  const [Columns, setColumns] = useState([
    { field: "number", headerName: "Number" },
    { field: "name", headerName: "Name" },
    { field: "designation", headerName: "Designation" },
    { field: "organization", headerName: "Organization" },
    { field: "role"},
  ]);

  const [ColumnsAdd, setColumnsAdd] = useState([
    { field: "number" },
    { field: "name" },
    { field: "designation" },
    { field: "organization" },
  ]);

  const props = {
    Data: FilteredData, // Pass filtered data to PowerTable
    SetData,
    Columns,
    SortField,
    CurrentPage,
    SetCurrentPage,
    SetSortField,
    SortDirection,
    SetSortDirection,
    SearchValue,
    SetSearchValue,
    open,
    on_open_change,
  };

  
  const propsAdd = {
    Data:DataAdd,
    SetData:SetDataAdd,
    Columns: ColumnsAdd,
    SortField: SortFieldAdd,
    CurrentPage: CurrentPageAdd,
    SetCurrentPage: SetCurrentPageAdd,
    SetSortField : SetSortFieldAdd,
    SortDirection: SortDirectionAdd,
    SetSortDirection: SetSortDirectionAdd,
    SearchValue,
    SetSearchValue,
    open,
    on_open_change,
  };

  // Fetch employees once when the component mounts
  useEffect(() => {
    async function fetchEmployees() {
      const res = await fetch("/employee-master/employees");
      const data = await res.json();
      SetData(data); // Set the full data once it's fetched
    }

    fetchEmployees();
  }, []); // This runs only once on mount

  // Filter the data based on the 'group' query parameter when it changes
  useEffect(() => {
    if (role && Data.length > 0) {
      const filteredData = Data.filter((employee: any) => employee.role === role);
      SetFilteredData(filteredData); // Set the filtered data
    } else {
      SetFilteredData(Data); // If no group is provided, show all data
    }
  }, [role, Data]); // This effect depends on 'group' and 'Data'

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        props={props}
        items={modules?.security?.items}
        modal_title="none"
        modal_component={<AddGroupMembers on_open_change={on_open_change} props={propsAdd} />}
        isLarge={true}
      />
      {/* Pass filtered data to PowerTable */}
      <PowerTable props={props} api={"/employee-master/employees"} />
    </div>
  );
}
