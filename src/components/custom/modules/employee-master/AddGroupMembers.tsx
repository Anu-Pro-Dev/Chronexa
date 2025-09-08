"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import PowerSearch from "@/src/components/custom/power-comps/power-search";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addEmployeeGroupMemberRequest } from "@/src/lib/apiHandler";
import { useRouter } from "next/navigation";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { AddIcon, CancelIcon2 } from "@/src/icons/icons";

export default function AddGroupMembers({
  on_open_change,
  selectedRowData,
  onSave,
  props,
}: {
  on_open_change: any;
  selectedRowData?: any;
  onSave: (id: string | null, newData: any) => void;
  props: any;
}) {
  const { modules, language, translations } = useLanguage();
  const router = useRouter();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const queryClient = useQueryClient();
  const t = translations?.modules?.employeeMaster || {};

  const searchParams = useSearchParams();
  const groupCode = searchParams.get("group");

  const { data: groupListData } = useFetchAllEntity("employeeGroup");
  // const group = groupListData?.data?.find(g => g.group_code === groupCode);
  const group = groupListData?.data?.find((g: EmployeeGroup) => g.group_code === groupCode);
  const employee_group_id = group?.employee_group_id ?? null;
  const { data: employeeData, isLoading } = useFetchAllEntity("employee");

  const addMutation = useMutation({
    mutationFn: addEmployeeGroupMemberRequest,
    onSuccess: (data) => {
      toast.success("Employee group member added successfully!");
      onSave(null, data.data);
      on_open_change(false);
      queryClient.invalidateQueries({ queryKey: ["employeeGroupMemebr"] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Duplicate data detected. Please use different values.");
      } else {
        toast.error("Form submission error.");
      }
    },
  });

  type EmployeeGroup = {
    employee_group_id: number;
    group_code: string;
  };

  const handleAdd = async () => {
    const group = groupListData?.data?.find((g: EmployeeGroup) => g.group_code === groupCode);
    const employee_group_id = group?.employee_group_id;

    if (!employee_group_id) {
      toast.error("Group not found.");
      return;
    }

    if (selectedRows.length === 0) {
      toast.error("Please select at least one employee.");
      return;
    }

    setIsSubmitting(true);

    const today = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(today.getFullYear() + 1);

    const effective_from_date = today.toISOString();
    const effective_to_date = oneYearLater.toISOString();

    try {
      for (const row of selectedRows) {
        const payload = {
          employee_group_id,
          employee_id: row.employee_id,
          effective_from_date,
          effective_to_date,
          active_flag: true,
        };

        await addMutation.mutateAsync(payload);
      }

      toast.success("Employees added to the group successfully.");
      onSave(null, null);
      on_open_change(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add some or all employees.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
      setColumns([
        { field: "emp_no", headerName: "Emp No" },
        {
          field: language === "ar" ? "firstname_arb" : "firstname_eng",
          headerName: language === "ar" ? "اسم الموظف" : "Employee Name",
        },
        {
          field: "join_date",
          headerName: t.join_date,
        },
        // { field: "manager_flag", headerName: "Manager" },
        // { field: "designation_id", headerName: language === "ar" ? "المسمى الوظيفي" : "Designation" },
      ]);
    }, [language]);

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const handleSearchChange = (searchValue: string) => {
    setSearchTerm(searchValue);
  };

  const data = useMemo(() => {
      if (Array.isArray(employeeData?.data)) {
        return employeeData.data.map((emp: any) => ({
          ...emp,
          id: emp.employee_id,
          join_date: emp.join_date ? new Date(emp.join_date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : "-",
        }));
      }
      return [];
    }, [employeeData]);

  const tableProps = {
    Data: data,
    Columns: columns,
    open,
    selectedRows,
    setSelectedRows,
    isLoading,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: setCurrentPage,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: setSearchValue,
  };

  return (
    <>
      {/* <Form> */}
          <form className="bg-accent rounded-2xl">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center justify-between">
                <div className="flex">
                  {/* <h1 className="font-bold text-xl text-primary">Employees</h1> */}
                  <PowerSearch 
                    props={{
                      ...props,
                      onSearchChange: handleSearchChange,
                      placeholder: "Search employees..."
                    }} 
                  />
                </div>
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    variant={"success"} 
                    size={"sm"}
                    disabled={isSubmitting}
                    onClick={handleAdd}
                    className="flex items-center space-y-0.5 border border-success"
                  >
                    <AddIcon/> Add
                  </Button>
                  <Button
                      variant={"outlineGrey"}
                      type="button"
                      size={"sm"}
                      className="flex items-center gap-1 p-0 pl-1 pr-2 bg-[#F3F3F3] border-[#E7E7E7]"
                      onClick={() => on_open_change(false)}
                  >
                    <CancelIcon2  />  Cancel
                  </Button>
                </div>
              </div>
            </div>
          </form>
      {/* </Form> */}
      <div className="border border-[#E5E7EB] mt-6">
        <PowerTable props={tableProps} ispageValue5={true} />
      </div>
    </> 
  );
}