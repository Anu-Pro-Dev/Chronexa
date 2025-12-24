// "use client";
// import { useEffect, useState, useCallback, useMemo } from "react";
// import { useSearchParams } from "next/navigation";
// import toast from "react-hot-toast";
// import { Button } from "@/src/components/ui/button";
// import PowerSearch from "@/src/components/custom/power-comps/power-search";
// import PowerTable from "@/src/components/custom/power-comps/power-table";
// import { useLanguage } from "@/src/providers/LanguageProvider";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { apiRequest, addOrUpdateUserRole, editEmployeeRequest } from "@/src/lib/apiHandler";
// import { useRouter } from "next/navigation";
// import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
// import { useDebounce } from "@/src/hooks/useDebounce";
// import { AddIcon, CancelIcon2 } from "@/src/icons/icons";

// export default function AddRoleToUser({
//   on_open_change,
//   selectedRowData,
//   onSave,
//   props,
// }: {
//   on_open_change: any;
//   selectedRowData?: any;
//   onSave: (id: string | null, newData: any) => void;
//   props: any;
// }) {
//   const { modules, language, translations } = useLanguage();
//   const router = useRouter();
//   const [columns, setColumns] = useState<{ field: string; headerName: string }[]>([]);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [sortField, setSortField] = useState<string>("");
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
//   const [searchValue, setSearchValue] = useState<string>("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);
//   const [rowsPerPage, setRowsPerPage] = useState<number>(10);
//   const queryClient = useQueryClient();
//   const debouncedSearchValue = useDebounce(searchValue, 300);

//   const searchParams = useSearchParams();
//   const role = searchParams.get("role");

//   const offset = useMemo(() => {
//     return currentPage;
//   }, [currentPage]);

//   const { data: rolesData, isLoading: isLoadingRoles } = useFetchAllEntity("secRole");

//   const roleId = useMemo(() => {
//     if (!role || !rolesData?.data) return null;
    
//     const foundRole = rolesData.data.find((r: any) => 
//       r.role_name === role || r.name === role || r.roleName === role
//     );
    
//     return foundRole?.id || foundRole?.role_id || null;
//   }, [role, rolesData]);

//   // Check if current role is admin (case-insensitive)
//   const isAdminRole = useMemo(() => {
//     return role?.toUpperCase() === 'ADMIN';
//   }, [role]);

//   const userSearchParams = useMemo(() => {
//     const params: Record<string, string> = {
//       limit: String(rowsPerPage),
//       offset: String(offset),
//     };
    
//     if (debouncedSearchValue) {
//       params.search = debouncedSearchValue;
//     }
    
//     if (sortField) params.sort_by = sortField;
//     if (sortDirection) params.sort_order = sortDirection;
    
//     return params;
//   }, [rowsPerPage, offset, debouncedSearchValue, sortField, sortDirection]);

//   const { data: userData, isLoading: isLoadingUsers, refetch: refetchUsers } = useFetchAllEntity("secUser", {
//     searchParams: userSearchParams,
//   });

//   const { data: allUserRoles, isLoading: isLoadingAllUserRoles } = useQuery({
//     queryKey: ["secUserRole", "all"],
//     queryFn: async () => {
//       try {
//         const response = await apiRequest(`/secUserRole/all`, "GET");
//         return response;
//       } catch (error) {
//         console.error("Error fetching all user roles:", error);
//         return { data: [] };
//       }
//     },
//   });

//   const { data: existingUserRoles, isLoading: isLoadingUserRoles } = useQuery({
//     queryKey: ["secUserRole", "byRole", roleId],
//     queryFn: async () => {
//       if (!roleId) return { data: [] };
      
//       try {
//         const response = await apiRequest(`/secUserRole/all?role_id=${roleId}`, "GET");
//         return response;
//       } catch (error) {
//         console.error("Error fetching existing user roles:", error);
//         return { data: [] };
//       }
//     },
//     enabled: !!roleId,
//   });

//   const assignedUserIds = useMemo(() => {
//     if (!existingUserRoles?.data || !Array.isArray(existingUserRoles.data)) {
//       return new Set<number>();
//     }
//     return new Set(existingUserRoles.data.map((ur: any) => ur.user_id).filter(Boolean));
//   }, [existingUserRoles]);

//   const userRoleMap = useMemo(() => {
//     const map = new Map<number, number>();
//     if (allUserRoles?.data && Array.isArray(allUserRoles.data)) {
//       allUserRoles.data.forEach((ur: any) => {
//         if (ur.user_id && ur.user_role_id) {
//           map.set(ur.user_id, ur.user_role_id);
//         }
//       });
//     }
//     return map;
//   }, [allUserRoles]);

//   const addMutation = useMutation({
//     mutationFn: addOrUpdateUserRole,
//     onSuccess: (data) => {
//       toast.success("User role assigned successfully!");
//       onSave(null, data.data);
//       queryClient.invalidateQueries({ queryKey: ["secUserRole"] });
//     },
//     onError: (error: any) => {
//       toast.error(error?.message || "Failed to assign role to user.");
//     },
//   });

//   // Function to update employee web_punch_flag
//   const updateWebPunchFlag = async (employeeId: number, webPunchFlag: boolean) => {
//     try {
//       // Only send employee_id and web_punch_flag
//       const payload = {
//         web_punch_flag: webPunchFlag,
//       };
      
//       await apiRequest(`/employee/edit/${employeeId}`, "PUT", payload);
//       console.log(`Updated web_punch_flag to ${webPunchFlag} for employee ${employeeId}`);
//     } catch (error) {
//       console.error(`Failed to update web_punch_flag for employee ${employeeId}:`, error);
//       throw error;
//     }
//   };

//   const handleAdd = async () => {
//     if (!roleId) {
//       toast.error("Role not found.");
//       return;
//     }

//     if (selectedRows.length === 0) {
//       toast.error("Please select at least one user.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       for (const row of selectedRows) {
//         const existingUserRoleId = userRoleMap.get(row.user_id);
        
//         // Check if user currently has admin role before updating
//         let hadAdminRole = false;
//         if (existingUserRoleId && row.user_id) {
//           try {
//             const currentUserRoles = await apiRequest(`/secUserRole/all?user_id=${row.user_id}`, "GET");
//             if (currentUserRoles?.data && Array.isArray(currentUserRoles.data)) {
//               hadAdminRole = currentUserRoles.data.some((ur: any) => {
//                 const roleName = ur.role_name || ur.roleName || ur.name || '';
//                 return roleName.toUpperCase() === 'ADMIN';
//               });
//             }
//           } catch (error) {
//             console.error("Error checking current roles:", error);
//           }
//         }
        
//         const payload: {
//           user_role_id?: number;
//           user_id: number[];
//           role_id: number;
//         } = {
//           user_id: [row.user_id],
//           role_id: roleId,
//         };

//         if (existingUserRoleId) {
//           payload.user_role_id = existingUserRoleId;
//         }

//         // Assign the role
//         await addMutation.mutateAsync(payload);

//         // Handle web_punch_flag updates
//         if (row.employee_id) {
//           // If assigning admin role
//           if (isAdminRole) {
//             await updateWebPunchFlag(row.employee_id, true);
//           } 
//           // If user had admin role and now being assigned non-admin role
//           else if (hadAdminRole && !isAdminRole) {
//             // Check if user still has other admin roles after this update
//             try {
//               const updatedUserRoles = await apiRequest(`/secUserRole/all?user_id=${row.user_id}`, "GET");
//               const hasOtherAdminRole = updatedUserRoles?.data?.some((ur: any) => {
//                 const roleName = ur.role_name || ur.roleName || ur.name || '';
//                 return roleName.toUpperCase() === 'ADMIN';
//               });

//               // Only set to false if no other admin roles exist
//               if (!hasOtherAdminRole) {
//                 await updateWebPunchFlag(row.employee_id, false);
//               }
//             } catch (error) {
//               console.error("Error checking updated roles:", error);
//               // If we can't check, set to false to be safe
//               await updateWebPunchFlag(row.employee_id, false);
//             }
//           }
//         }
//       }

//       toast.success("Users assigned to role successfully.");
      
//       // Invalidate employee cache to refresh data
//       queryClient.invalidateQueries({ queryKey: ["employee"] });
      
//       onSave(null, null);
//       on_open_change(false);
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to assign role to some or all users.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handlePageChange = useCallback((newPage: number) => {
//     setCurrentPage(newPage);
//     if (refetchUsers) {
//       setTimeout(() => refetchUsers(), 100);
//     }
//   }, [refetchUsers]);

//   const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
//     setRowsPerPage(newRowsPerPage);
//     setCurrentPage(1);
//     if (refetchUsers) {
//       setTimeout(() => refetchUsers(), 100);
//     }
//   }, [refetchUsers]);

//   const handleSearchChange = useCallback((newSearchValue: string) => {
//     setSearchValue(newSearchValue);
//     setCurrentPage(1);
//   }, []);

//   const handleSortChange = useCallback((field: string, direction: "asc" | "desc") => {
//     setSortField(field);
//     setSortDirection(direction);
//     setCurrentPage(1);
//     if (refetchUsers) {
//       setTimeout(() => refetchUsers(), 100);
//     }
//   }, [refetchUsers]);

//   useEffect(() => {
//     setColumns([
//       { field: "user_id", headerName: "User ID" },
//       { field: "employee_id", headerName: "Employee ID" },
//       {
//         field: "login",
//         headerName: "Username",
//       },
//     ]);
//   }, [language]);

//   const handleRowSelection = useCallback((rows: any[]) => {
//     setSelectedRows(rows);
//   }, []);

//   const availableUsers = useMemo(() => {
//     if (!Array.isArray(userData?.data)) {
//       return [];
//     }

//     return userData.data
//       .filter((user: any) => {
//         const userId = user.user_id;
//         return userId && !assignedUserIds.has(userId);
//       })
//       .map((user: any) => ({
//         ...user,
//         id: user.user_id,
//         email: user.email || user.email_address || "N/A",
//         employee_no: user.employee_no || user.emp_no || "N/A",
//       }));
//   }, [userData, assignedUserIds]);

//   const isLoading = isLoadingRoles || isLoadingUsers || isLoadingUserRoles || isLoadingAllUserRoles;

//   const tableProps = {
//     Data: availableUsers,
//     Columns: columns,
//     open: true,
//     selectedRows,
//     setSelectedRows,
//     isLoading,
//     SortField: sortField,
//     CurrentPage: currentPage,
//     SetCurrentPage: handlePageChange,
//     SetSortField: setSortField,
//     SortDirection: sortDirection,
//     SetSortDirection: setSortDirection,
//     SearchValue: searchValue,
//     SetSearchValue: handleSearchChange,
//     total: userData?.total || 0,
//     hasNext: userData?.hasNext || false,
//     rowsPerPage,
//     setRowsPerPage: handleRowsPerPageChange,
//     onSortChange: handleSortChange,
//   };

//   return (
//     <>
//       <form className="bg-accent rounded-2xl">
//         <div className="flex flex-col gap-3">
//           <div className="flex gap-2 items-center justify-between">
//             <div className="flex">
//               <PowerSearch 
//                 props={{
//                   SearchValue: searchValue,
//                   SetSearchValue: handleSearchChange,
//                 }} 
//               />
//             </div>
//             <div className="flex gap-4">
//               <Button 
//                 type="button" 
//                 variant={"success"} 
//                 size={"sm"}
//                 disabled={isSubmitting || !roleId || selectedRows.length === 0}
//                 onClick={handleAdd}
//                 className="flex items-center space-y-0.5 border border-success"
//               >
//                 <AddIcon/> Assign Role
//               </Button>
//               <Button
//                 variant={"outlineGrey"}
//                 type="button"
//                 size={"sm"}
//                 className="flex items-center gap-1 p-0 pl-1 pr-2 bg-[#F3F3F3] border-[#E7E7E7]"
//                 onClick={() => on_open_change(false)}
//               >
//                 <CancelIcon2 /> {translations.buttons.cancel}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </form>

//       <div className="border border-[#E5E7EB] mt-6">
//         <PowerTable 
//           props={tableProps} 
//           ispageValue5={true} 
//           onRowSelection={handleRowSelection}
//           overrideEditIcon={false}
//         />
//       </div>
//     </> 
//   );
// }
"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/src/components/ui/button";
import PowerSearch from "@/src/components/custom/power-comps/power-search";
import PowerTable from "@/src/components/custom/power-comps/power-table";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, addOrUpdateUserRole, editEmployeeRequest } from "@/src/lib/apiHandler";
import { useRouter } from "next/navigation";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { AddIcon, CancelIcon2 } from "@/src/icons/icons";

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

  // Check if current role is admin (case-insensitive)
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
      toast.success("User role assigned successfully!");
      onSave(null, data.data);
      queryClient.invalidateQueries({ queryKey: ["secUserRole"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to assign role to user.");
    },
  });

  // Function to update employee web_punch_flag
  const updateWebPunchFlag = async (employeeId: number, webPunchFlag: boolean) => {
    try {
      // Only send employee_id and web_punch_flag
      const payload = {
        web_punch_flag: webPunchFlag,
      };
      
      await apiRequest(`/employee/edit/${employeeId}`, "PUT", payload);
      console.log(`Updated web_punch_flag to ${webPunchFlag} for employee ${employeeId}`);
    } catch (error) {
      console.error(`Failed to update web_punch_flag for employee ${employeeId}:`, error);
      throw error;
    }
  };

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
        const existingUserRoleId = userRoleMap.get(row.user_id);
        
        // Step 1: Check user's current roles BEFORE making any changes
        let hadAdminRole = false;
        
        if (row.user_id) {
          try {
            const currentUserRoles = await apiRequest(`/secUserRole/all?user_id=${row.user_id}`, "GET");
            console.log("Current user roles:", currentUserRoles?.data);
            
            if (currentUserRoles?.data && Array.isArray(currentUserRoles.data)) {
              // Check each role to see if any is admin
              for (const ur of currentUserRoles.data) {
                // Get role details to check role name
                const userRoleId = ur.role_id;
                
                // Find the role in rolesData
                if (rolesData?.data && Array.isArray(rolesData.data)) {
                  const roleInfo = rolesData.data.find((r: any) => 
                    (r.id === userRoleId || r.role_id === userRoleId)
                  );
                  
                  if (roleInfo) {
                    const roleName = roleInfo.role_name || roleInfo.name || roleInfo.roleName || '';
                    console.log(`Role ID ${userRoleId} has name: ${roleName}`);
                    
                    if (roleName.toUpperCase() === 'ADMIN') {
                      hadAdminRole = true;
                      break;
                    }
                  }
                }
                
                // Also check if role_name is directly in the user role object
                if (ur.role_name || ur.roleName || ur.name) {
                  const roleName = ur.role_name || ur.roleName || ur.name || '';
                  console.log(`Direct role name: ${roleName}`);
                  
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
        
        console.log(`User ${row.user_id}: hadAdminRole=${hadAdminRole}, isAdminRole=${isAdminRole}`);
        
        // Step 2: Prepare and send the role update
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

        // Assign/update the role
        await addMutation.mutateAsync(payload);
        console.log("Role update completed");

        // Step 3: Handle web_punch_flag updates based on role change
        if (row.employee_id) {
          // Case 1: Assigning TO admin role → Set flag to TRUE
          if (isAdminRole) {
            console.log(`Setting web_punch_flag to TRUE for employee ${row.employee_id}`);
            await updateWebPunchFlag(row.employee_id, true);
          } 
          // Case 2: Had admin role, now assigning NON-admin role → Set flag to FALSE
          else if (hadAdminRole && !isAdminRole) {
            console.log(`Setting web_punch_flag to FALSE for employee ${row.employee_id}`);
            await updateWebPunchFlag(row.employee_id, false);
          }
        }
      }

      toast.success("Users assigned to role successfully.");
      
      // Invalidate caches to refresh data
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      queryClient.invalidateQueries({ queryKey: ["secUserRole"] });
      
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
                <AddIcon/> Assign Role
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