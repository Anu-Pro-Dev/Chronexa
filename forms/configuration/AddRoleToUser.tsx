"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import PowerSearch from "@/components/custom/power-comps/power-search";
import PowerTable from "@/components/custom/power-comps/power-table";
import { useLanguage } from "@/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiHandler";
import { useRouter } from "next/navigation";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";
import { AddIcon, CancelIcon2 } from "@/icons/icons";

// API function to add role to user
const addRoletoUser = async (data: {
  user_id: number;
  role_id: number;
}) => {
  return apiRequest("/secUserRole/add", "POST", data);
};

export default function AddRoleToUser({
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
  const { modules, language } = useLanguage();
  const router = useRouter();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();
  const role = searchParams.get("role"); // Get role name from URL (e.g., "ADMIN")

  // Fetch all roles to get role_id from role name
  const { data: rolesData, isLoading: isLoadingRoles } = useFetchAllEntity("secRole");

  // Find the role_id for the given role name
  const roleId = useMemo(() => {
    if (!role || !rolesData?.data) return null;
    
    const foundRole = rolesData.data.find((r: any) => 
      r.role_name === role || r.name === role || r.roleName === role
    );
    
    return foundRole?.id || foundRole?.role_id || null;
  }, [role, rolesData]);

  // Fetch all employees
  const { data: employeeData, isLoading: isLoadingEmployees } = useFetchAllEntity("employee");

  // Fetch existing user roles for this specific role to exclude already assigned users
  const { data: existingUserRoles, isLoading: isLoadingUserRoles } = useQuery({
    queryKey: ["secUserRole", "byRole", roleId],
    queryFn: async () => {
      if (!roleId) return { data: [] };
      
      try {
        const response = await apiRequest(`/secUserRole/all?role_id=${roleId}`, "GET");
        return response;
      } catch (error) {
        console.error("Error fetching existing user roles:", error);
        return { data: [] };
      }
    },
    enabled: !!roleId,
  });

  // Get user IDs that already have this role assigned
  const assignedUserIds = useMemo(() => {
    if (!existingUserRoles?.data || !Array.isArray(existingUserRoles.data)) {
      return [];
    }
    return existingUserRoles.data.map((ur: any) => ur.user_id).filter(Boolean);
  }, [existingUserRoles]);

  // Mutation for adding role to user
  const addMutation = useMutation({
    mutationFn: addRoletoUser,
    onSuccess: (data) => {
      toast.success("User role assigned successfully!");
      onSave(null, data.data);
      queryClient.invalidateQueries({ queryKey: ["secUserRole"] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("User already has this role assigned.");
      } else {
        toast.error("Failed to assign role to user.");
      }
    },
  });

  const handleAdd = async () => {
    if (!roleId) {
      toast.error("Role not found.");
      return;
    }

    if (selectedRows.length === 0) {
      toast.error("Please select at least one user.");
      return;
    }

    setIsSubmitting(true);

    try {
      for (const row of selectedRows) {
        const payload = {
          user_id: row.employee_id, // employee_id acts as user_id
          role_id: roleId,
        };

        await addMutation.mutateAsync(payload);
      }

      toast.success("Users assigned to role successfully.");
      onSave(null, null);
      on_open_change(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign role to some or all users.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setColumns([
        { field: "employee_id", headerName: "Emp ID" },
        { field: "emp_no", headerName: "Emp No" },
        {
        field: language === "ar" ? "firstname_arb" : "firstname_eng",
        headerName: language === "ar" ? "اسم الموظف" : "Employee Name",
        },
        { field: "manager_flag", headerName: "Manager" },   
    ]);
  }, [language]);

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const handleSearchChange = (searchValue: string) => {
    setSearchTerm(searchValue);
  };

  // Filter employees to show only those who don't have this role assigned
  const availableEmployees = useMemo(() => {
    if (!Array.isArray(employeeData?.data)) {
      return [];
    }

    // Filter out employees who already have this role assigned
    return employeeData.data
      .filter((emp: any) => {
        const empId = emp.employee_id;
        return empId && !assignedUserIds.includes(empId);
      })
      .map((emp: any) => ({
        ...emp,
        id: emp.employee_id,
      }));
  }, [employeeData, assignedUserIds]);

  const isLoading = isLoadingRoles || isLoadingEmployees || isLoadingUserRoles;

  const tableProps = {
    Data: availableEmployees,
    Columns: columns,
    open: true,
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
      <form className="bg-accent rounded-2xl">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex">
              <h1 className="font-bold text-xl text-primary">
                Available Users
              </h1>
            </div>
            <div className="flex gap-4">
              <PowerSearch 
                props={{
                  ...props,
                  onSearchChange: handleSearchChange,
                  placeholder: "Search employees..."
                }} 
              />
              <Button 
                type="button" 
                variant={"success"} 
                size={"sm"}
                disabled={isSubmitting || !roleId}
                onClick={handleAdd}
                className="flex items-center space-y-0.5 border border-success"
              >
                <AddIcon/> Add to Role
              </Button>
              <Button
                variant={"outlineGrey"}
                type="button"
                size={"sm"}
                className="flex items-center gap-1 p-0 pl-1 pr-2 bg-[#F3F3F3] border-[#E7E7E7]"
                onClick={() => on_open_change(false)}
              >
                <CancelIcon2 /> Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>

      <div className="border border-[#E5E7EB] mt-6">
        <PowerTable props={tableProps} ispageValue5={true} onRowSelection={handleRowSelection} />
      </div>
    </> 
  );
}