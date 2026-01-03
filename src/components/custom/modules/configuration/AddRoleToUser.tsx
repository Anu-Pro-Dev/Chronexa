"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import PowerSearch from "@/src/components/custom/power-comps/power-search";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, addOrUpdateUserRole } from "@/src/lib/apiHandler";
import { useRouter } from "next/navigation";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { AddIcon, CancelIcon2 } from "@/src/icons/icons";
import { useShowToast } from "@/src/utils/toastHelper";

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
  const showToast = useShowToast();
  const t = translations?.modules?.configurations || {};
  
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

  const isAdminRole = useMemo(() => {
    return role?.toUpperCase() === 'ADMIN';
  }, [role]);

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

  const { data: allUserRoles, isLoading: isLoadingAllUserRoles } = useQuery({
    queryKey: ["secUserRole", "all"],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/secUserRole/all`, "GET");
        return response;
      } catch (error) {
        console.error("Error fetching all user roles:", error);
        return { data: [] };
      }
    },
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

  const userRoleMap = useMemo(() => {
    const map = new Map<number, number>();
    if (allUserRoles?.data && Array.isArray(allUserRoles.data)) {
      allUserRoles.data.forEach((ur: any) => {
        if (ur.user_id && ur.user_role_id) {
          map.set(ur.user_id, ur.user_role_id);
        }
      });
    }
    return map;
  }, [allUserRoles]);

  const addMutation = useMutation({
    mutationFn: addOrUpdateUserRole,
    onSuccess: (data) => {
      showToast("success", "assign_role_success");
      onSave(null, data.data);
      queryClient.invalidateQueries({ queryKey: ["secUserRole"] });
    },
    onError: (error: any) => {
      showToast("error", "assign_role_error");
    },
  });

  const updateWebPunchFlag = async (employeeId: number, webPunchFlag: boolean) => {
    try {
      const payload = {
        web_punch_flag: webPunchFlag,
      };
      
      await apiRequest(`/employee/edit/${employeeId}`, "PUT", payload);
    } catch (error) {
      console.error(`Failed to update web_punch_flag for employee ${employeeId}:`, error);
      throw error;
    }
  };

  const handleAdd = async () => {
    if (!roleId) {
      showToast("error", "role_not_found");
      return;
    }

    if (selectedRows.length === 0) {
      showToast("error", "select_at_least_one_user");
      return;
    }

    setIsSubmitting(true);

    try {
      for (const row of selectedRows) {
        const existingUserRoleId = userRoleMap.get(row.user_id);
        
        let hadAdminRole = false;
        
        if (row.user_id) {
          try {
            const currentUserRoles = await apiRequest(`/secUserRole/all?user_id=${row.user_id}`, "GET");            
            if (currentUserRoles?.data && Array.isArray(currentUserRoles.data)) {
              for (const ur of currentUserRoles.data) {
                const userRoleId = ur.role_id;
                
                if (rolesData?.data && Array.isArray(rolesData.data)) {
                  const roleInfo = rolesData.data.find((r: any) => 
                    (r.id === userRoleId || r.role_id === userRoleId)
                  );
                  
                  if (roleInfo) {
                    const roleName = roleInfo.role_name || roleInfo.name || roleInfo.roleName || '';                    
                    if (roleName.toUpperCase() === 'ADMIN') {
                      hadAdminRole = true;
                      break;
                    }
                  }
                }
                
                if (ur.role_name || ur.roleName || ur.name) {
                  const roleName = ur.role_name || ur.roleName || ur.name || '';
                  
                  if (roleName.toUpperCase() === 'ADMIN') {
                    hadAdminRole = true;
                    break;
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error checking current roles:", error);
          }
        }
                
        const payload: {
          user_role_id?: number;
          user_id: number[];
          role_id: number;
        } = {
          user_id: [row.user_id],
          role_id: roleId,
        };

        if (existingUserRoleId) {
          payload.user_role_id = existingUserRoleId;
        }

        await addMutation.mutateAsync(payload);

        if (row.employee_id) {
          if (isAdminRole) {
            await updateWebPunchFlag(row.employee_id, true);
          } 
          else if (hadAdminRole && !isAdminRole) {
            await updateWebPunchFlag(row.employee_id, false);
          }
        }
      }

      showToast("success", "assign_users_to_role_success");
      
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      queryClient.invalidateQueries({ queryKey: ["secUserRole"] });
      
      onSave(null, null);
      on_open_change(false);
    } catch (error) {
      console.error(error);
      showToast("error", "assign_role_partial_error");
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
      { field: "user_id", headerName: t.user_id || "User ID" },
      { field: "employee_id", headerName: t.employee_id || "Employee ID" },
      { field: "login", headerName: t.username || "Username" },
    ]);
  }, [language, t]);

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

  const isLoading = isLoadingRoles || isLoadingUsers || isLoadingUserRoles || isLoadingAllUserRoles;

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
                <AddIcon/> {t.assign_role || "Assign Role"}
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