"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/src/components/ui/button";
import PowerSearch from "@/src/components/custom/power-comps/power-search";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/src/lib/apiHandler";
import { useRouter } from "next/navigation";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { AddIcon, CancelIcon2 } from "@/src/icons/icons";

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
  const { modules, language, translations } = useLanguage();
  const router = useRouter();
  const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const queryClient = useQueryClient();
  const debouncedSearchValue = useDebounce(searchValue, 300);

  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const offset = useMemo(() => {
    return currentPage;
  }, [currentPage]);

  const { data: rolesData, isLoading: isLoadingRoles } = useFetchAllEntity("secRole");

  const roleId = useMemo(() => {
    if (!role || !rolesData?.data) return null;
    
    const foundRole = rolesData.data.find((r: any) => 
      r.role_name === role || r.name === role || r.roleName === role
    );
    
    return foundRole?.id || foundRole?.role_id || null;
  }, [role, rolesData]);

  const userSearchParams = useMemo(() => {
    const params: Record<string, string> = {
      limit: String(rowsPerPage),
      offset: String(offset),
    };
    
    if (debouncedSearchValue) {
      params.search = debouncedSearchValue;
    }
    
    if (sortField) params.sort_by = sortField;
    if (sortDirection) params.sort_order = sortDirection;
    
    return params;
  }, [rowsPerPage, offset, debouncedSearchValue, sortField, sortDirection]);

  const { data: userData, isLoading: isLoadingUsers, refetch: refetchUsers } = useFetchAllEntity("secUser", {
    searchParams: userSearchParams,
  });

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

  const assignedUserIds = useMemo(() => {
    if (!existingUserRoles?.data || !Array.isArray(existingUserRoles.data)) {
      return new Set<number>();
    }
    return new Set(existingUserRoles.data.map((ur: any) => ur.user_id).filter(Boolean));
  }, [existingUserRoles]);

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
          user_id: row.user_id, 
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

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    if (refetchUsers) {
      setTimeout(() => refetchUsers(), 100);
    }
  }, [refetchUsers]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    if (refetchUsers) {
      setTimeout(() => refetchUsers(), 100);
    }
  }, [refetchUsers]);

  const handleSearchChange = useCallback((newSearchValue: string) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
    if (refetchUsers) {
      setTimeout(() => refetchUsers(), 100);
    }
  }, [refetchUsers]);

  useEffect(() => {
    setColumns([
      { field: "user_id", headerName: "User ID" },
      { field: "employee_id", headerName: "Employee ID" },
      {
        field: "login",
        headerName: "Username",
      },
    ]);
  }, [language]);

  const handleRowSelection = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  const availableUsers = useMemo(() => {
    if (!Array.isArray(userData?.data)) {
      return [];
    }

    return userData.data
      .filter((user: any) => {
        const userId = user.user_id;
        return userId && !assignedUserIds.has(userId);
      })
      .map((user: any) => ({
        ...user,
        id: user.user_id,
        email: user.email || user.email_address || "N/A",
        employee_no: user.employee_no || user.emp_no || "N/A",
      }));
  }, [userData, assignedUserIds]);

  const isLoading = isLoadingRoles || isLoadingUsers || isLoadingUserRoles;

  const tableProps = {
    Data: availableUsers,
    Columns: columns,
    open: true,
    selectedRows,
    setSelectedRows,
    isLoading,
    SortField: sortField,
    CurrentPage: currentPage,
    SetCurrentPage: handlePageChange,
    SetSortField: setSortField,
    SortDirection: sortDirection,
    SetSortDirection: setSortDirection,
    SearchValue: searchValue,
    SetSearchValue: handleSearchChange,
    total: userData?.total || 0,
    hasNext: userData?.hasNext || false,
    rowsPerPage,
    setRowsPerPage: handleRowsPerPageChange,
    onSortChange: handleSortChange,
  };

  return (
    <>
      <form className="bg-accent rounded-2xl">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex">
              <PowerSearch 
                props={{
                  SearchValue: searchValue,
                  SetSearchValue: handleSearchChange,
                }} 
              />
            </div>
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant={"success"} 
                size={"sm"}
                disabled={isSubmitting || !roleId || selectedRows.length === 0}
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
                <CancelIcon2 /> {translations.buttons.cancel}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <div className="border border-[#E5E7EB] mt-6">
        <PowerTable 
          props={tableProps} 
          ispageValue5={true} 
          onRowSelection={handleRowSelection}
          overrideEditIcon={false}
        />
      </div>
    </> 
  );
}