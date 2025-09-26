// // "use client";
// // import React from "react";
// // import AutoPathMapper from "../common/auto-path-mapper";
// // import PowerShifterTab from "../power-comps/power-shifter-tab";
// // import PowerAdd from "../power-comps/power-add";
// // import PowerDelete from "../power-comps/power-delete";
// // import PowerSearch from "../power-comps/power-search";
// // import PowerExport from "../power-comps/power-export";
// // import PowerFilter from "../power-comps/power-filter";
// // import PowerTakeAction from "../power-comps/power-take-action";
// // import PowerClear from "../power-comps/power-clear";
// // import ApprovalModal from "../power-comps/power-approval-modal";
// // import toast from "react-hot-toast";
// // import { useDeleteEntityMutation } from "@/src/hooks/useDeleteEntityMutation";
// // import { camelToSnake } from "@/src/utils/caseConverters";
// // import { usePrivileges } from "@/src/providers/PrivilegeProvider";
// // import { usePathname } from "next/navigation";
// // import { useRBAC } from "@/src/hooks/useRBAC";

// // type SubModule = {
// //   sub_module_id: number;
// //   sub_module_name: string;
// //   module_id: number;
// // };

// // export default function PowerHeader({
// //   items,
// //   props,
// //   selectedRows,
// //   isExport = false,
// //   disableSearch = false,
// //   disableAdd = false,
// //   disableDelete = false,
// //   isAddNewPagePath,
// //   disableFeatures = false,
// //   enableFilters = false,
// //   modal_component,
// //   filter_modal_component,
// //   isLarge,
// //   isLarge2,
// //   isLargeAction,
// //   modal_title,
// //   modal_description,
// //   filter_modal_title,
// //   filter_modal_description,
// //   approve_modal_title,
// //   approve_modal_description,
// //   reject_modal_title,
// //   reject_modal_description,
// //   enableTakeAction = false,
// //   enableClear = false,
// //   enableApprove = false,
// //   enableReject = false,
// //   entityName,
// //   enableExcel = false,
// //   enablePdf = false,
// //   enableWord = false,
// //   size = "medium",
// // }: {
// //   items: any;
// //   props?: any;
// //   selectedRows?: any[];
// //   isExport?: boolean;
// //   disableSearch?: boolean;
// //   disableAdd?: boolean;
// //   disableDelete?: boolean;
// //   isAddNewPagePath?: string;
// //   disableFeatures?: boolean;
// //   enableFilters?: boolean;
// //   modal_component?: any;
// //   filter_modal_component?: any;
// //   isLarge?: any;
// //   isLarge2?: any;
// //   isLargeAction?:any;
// //   modal_title?: string;
// //   modal_description?: string;
// //   filter_modal_title?: string;
// //   filter_modal_description?: string;
// //   approve_modal_title?: string;
// //   approve_modal_description?: string;
// //   reject_modal_title?: string;
// //   reject_modal_description?: string;
// //   enableTakeAction?: boolean;
// //   enableClear?: boolean;
// //   enableApprove?: boolean;
// //   enableReject?: boolean;
// //   entityName?: string;
// //   enableExcel?: boolean;
// //   enablePdf?: boolean;
// //   enableWord?: boolean;
// //   size?: "small" | "medium" | "large" | "extraLarge";
// // }) {

// //   const { privilegeMap } = usePrivileges();
// //   const pathname = usePathname();
// //   const deleteMutation = useDeleteEntityMutation({
// //     onSelectionClear: () => props.setSelectedRows?.([]),
// //   });

// //   const getEntityIdField = (entityName: string) => {
// //     // Handle special cases where the ID field doesn't follow the standard pattern
// //     const specialMappings: Record<string, string> = {
// //       'workflowType': 'workflow_id',
// //       'employeeShortPermission': 'single_permissions_id',
// //     };
    
// //     if (specialMappings[entityName]) {
// //       return specialMappings[entityName];
// //     }
    
    
// //     // Default pattern - convert camelCase to snake_case and append _id
// //     return `${camelToSnake(entityName)}_id`;
// //   };

// //   const handleDelete = async () => {
// //     if (!entityName) {
// //       toast.error("Entity name is not defined");
// //       return;
// //     }
    
// //     const entityIdField = getEntityIdField(entityName);
// //     const selectedRowIds = selectedRows?.map(row => row[entityIdField]) || [];
    
// //     // Check if we found any valid IDs
// //     if (selectedRowIds.length === 0) {
// //       toast.error("No valid items selected for deletion");
// //       return;
// //     }
    
// //     // Filter out any undefined values that might have slipped through
// //     const validIds = selectedRowIds.filter(id => id !== undefined && id !== null);
    
// //     if (validIds.length === 0) {
// //       toast.error("Selected items do not have valid IDs");
// //       return;
// //     }
    
// //     try {
// //       deleteMutation.mutate({ entityName, ids: validIds });
// //     } catch (error) {
// //       console.error('Delete operation failed:', error);
// //       toast.error("Delete operation failed");
// //     }
// //   };

// //   // Check if any rows are selected for approve/reject buttons
// //   const hasSelectedRows = (selectedRows ?? []).length > 0;

// //   console.log("privilegeMap:", privilegeMap);
// //   console.log("pathname:", pathname);

// //   const normalizeModulePath = (moduleName: string) =>
// //     moduleName.replace(/\s+/g, "-").toLowerCase();

// //   const firstPathSegment = pathname.split("/")[1];

// //   const activeModuleKey = Object.keys(privilegeMap || {}).find(
// //     (moduleKey) => normalizeModulePath(moduleKey) === firstPathSegment
// //   );

// //   const { allowedModules, allowedSubModules } = useRBAC();

// //   const activeSubmodules =
// //     activeModuleKey && allowedSubModules.length
// //       ? allowedSubModules
// //           .filter((sub: SubModule) => {
// //             return allowedModules.find(
// //               (mod: any) =>
// //                 mod.module_id === sub.module_id &&
// //                 mod.module_name === activeModuleKey
// //             );
// //           })
// //           .map((sub: SubModule) => ({
// //             path: `/${normalizeModulePath(
// //               activeModuleKey
// //             )}/${sub.sub_module_name.replace(/\s+/g, "-").toLowerCase()}`,
// //             label: sub.sub_module_name,
// //           }))
// //       : [];

// //   const canAdd = activeModuleKey
// //     ? privilegeMap[activeModuleKey]?.subModules?.some(
// //         (sm) =>
// //           pathname.endsWith(`/${sm.path}`) && // exact match for current submodule
// //           sm.privileges?.create
// //       )
// //     : false;

// //   const canDelete = activeModuleKey
// //     ? privilegeMap[activeModuleKey]?.subModules?.some(
// //         (sm) =>
// //           pathname.endsWith(`/${sm.path}`) &&
// //           sm.privileges?.delete
// //       )
// //     : false;

// //   return (
// //     <div className="flex flex-col">
// //       <div className="flex justify-between items-center">
// //         {/* <PowerShifterTab items={items} /> */}
// //         <PowerShifterTab items={activeSubmodules} />
// //         {
// //           <div className="flex gap-2 items-center">
// //             {!disableFeatures && !disableSearch && (
// //               <PowerSearch props={props} />
// //             )}
// //             {enableFilters && (
// //               <PowerFilter
// //                 modal_title={filter_modal_title}
// //                 modal_description={filter_modal_description}
// //                 modal_component={filter_modal_component}
// //                 modal_props={{
// //                   open: props.filter_open,
// //                   on_open_change: props.filter_on_open_change,
// //                 }}
// //                 isLarge={isLarge}
// //               />
// //             )}
// //             {!disableFeatures && !disableAdd && canAdd && (
// //               <PowerAdd
// //                 modal_title={modal_title}
// //                 modal_description={modal_description}
// //                 isAddNewPagePath={isAddNewPagePath ?? null}
// //                 modal_component={modal_component}
// //                 modal_props={{
// //                   open: props.open,
// //                   on_open_change: props.on_open_change,
// //                 }}
// //                 size={size}
// //               />
// //             )}
// //             {!disableFeatures && !disableDelete && canDelete && (selectedRows ?? []).length > 0 && (
// //               <PowerDelete props={props} label={selectedRows?.length === props?.Data?.length ? "Delete All" : "Delete"} onClick={handleDelete}/>
// //             )}
// //             {enableTakeAction && (
// //               <PowerTakeAction
// //                 modal_title={modal_title}
// //                 modal_description={modal_description}
// //                 isAddNewPagePath={isAddNewPagePath ?? null}
// //                 modal_component={modal_component}
// //                 modal_props={{
// //                   open: props.open,
// //                   on_open_change: props.on_open_change,
// //                 }}
// //                 isLarge={isLargeAction}
// //               />
// //             )}
// //             {!disableFeatures && isExport && (
// //               <PowerExport
// //                 data={(selectedRows && selectedRows.length > 0) ? selectedRows : (props?.Data || [])}
// //                 fileName={entityName || "report"}
// //                 enableExcel={enableExcel}
// //                 enablePdf={enablePdf}
// //                 enableWord={enableWord}
// //               />
// //             )}
// //             {enableClear && <PowerClear props={props} />}

// //             {/* Approve and Reject Modals - Only show when rows are selected */}
// //             {enableApprove && hasSelectedRows && (
// //               <ApprovalModal
// //                 type="approve"
// //                 modal_title={approve_modal_title || "Approve Request"}
// //                 modal_description={approve_modal_description || "Are you sure you want to approve the selected request(s)?"}
// //                 modal_component={modal_component}
// //                 modal_props={{
// //                   open: props?.approve_open || false,
// //                   on_open_change: props?.approve_on_open_change || (() => {}),
// //                   on_confirm: props?.onApprove || (() => {}),
// //                 }}
// //                 selectedCount={selectedRows?.length || 0}
// //               />
// //             )}

// //             {enableReject && hasSelectedRows && (
// //               <ApprovalModal
// //                 type="reject"
// //                 modal_title={reject_modal_title || "Reject Request"}
// //                 modal_description={reject_modal_description || "Are you sure you want to reject the selected request(s)?"}
// //                 modal_component={modal_component}
// //                 modal_props={{
// //                   open: props?.reject_open || false,
// //                   on_open_change: props?.reject_on_open_change || (() => {}),
// //                   on_confirm: props?.onReject || (() => {}),
// //                 }}
// //                 selectedCount={selectedRows?.length || 0}
// //               />
// //             )}
// //           </div>
// //         }
// //       </div>

// //       <AutoPathMapper />
// //     </div>
// //   );
// // }
// "use client";
// import React from "react";
// import AutoPathMapper from "../common/auto-path-mapper";
// import PowerShifterTab from "../power-comps/power-shifter-tab";
// import PowerAdd from "../power-comps/power-add";
// import PowerDelete from "../power-comps/power-delete";
// import PowerSearch from "../power-comps/power-search";
// import PowerExport from "../power-comps/power-export";
// import PowerFilter from "../power-comps/power-filter";
// import PowerTakeAction from "../power-comps/power-take-action";
// import PowerClear from "../power-comps/power-clear";
// import ApprovalModal from "../power-comps/power-approval-modal";
// import toast from "react-hot-toast";
// import { useDeleteEntityMutation } from "@/src/hooks/useDeleteEntityMutation";
// import { camelToSnake } from "@/src/utils/caseConverters";
// import { usePrivileges } from "@/src/providers/PrivilegeProvider";
// import { usePathname } from "next/navigation";
// import { useRBAC } from "@/src/hooks/useRBAC";

// export default function PowerHeader({
//   items,
//   props,
//   selectedRows,
//   isExport = false,
//   disableSearch = false,
//   disableAdd = false,
//   disableDelete = false,
//   isAddNewPagePath,
//   disableFeatures = false,
//   enableFilters = false,
//   modal_component,
//   filter_modal_component,
//   isLarge,
//   isLarge2,
//   isLargeAction,
//   modal_title,
//   modal_description,
//   filter_modal_title,
//   filter_modal_description,
//   approve_modal_title,
//   approve_modal_description,
//   reject_modal_title,
//   reject_modal_description,
//   enableTakeAction = false,
//   enableClear = false,
//   enableApprove = false,
//   enableReject = false,
//   entityName,
//   enableExcel = false,
//   enablePdf = false,
//   enableWord = false,
//   size = "medium",
// }: {
//   items?: any;
//   props?: any;
//   selectedRows?: any[];
//   isExport?: boolean;
//   disableSearch?: boolean;
//   disableAdd?: boolean;
//   disableDelete?: boolean;
//   isAddNewPagePath?: string;
//   disableFeatures?: boolean;
//   enableFilters?: boolean;
//   modal_component?: any;
//   filter_modal_component?: any;
//   isLarge?: any;
//   isLarge2?: any;
//   isLargeAction?: any;
//   modal_title?: string;
//   modal_description?: string;
//   filter_modal_title?: string;
//   filter_modal_description?: string;
//   approve_modal_title?: string;
//   approve_modal_description?: string;
//   reject_modal_title?: string;
//   reject_modal_description?: string;
//   enableTakeAction?: boolean;
//   enableClear?: boolean;
//   enableApprove?: boolean;
//   enableReject?: boolean;
//   entityName?: string;
//   enableExcel?: boolean;
//   enablePdf?: boolean;
//   enableWord?: boolean;
//   size?: "small" | "medium" | "large" | "extraLarge";
// }) {
//   const { privilegeMap } = usePrivileges();
//   const pathname = usePathname();
//   const { allowedModules, allowedSubModules, allowedTabs } = useRBAC();

//   const deleteMutation = useDeleteEntityMutation({
//     onSelectionClear: () => props.setSelectedRows?.([]),
//   });

//   const getEntityIdField = (entityName: string) => {
//     const specialMappings: Record<string, string> = {
//       'workflowType': 'workflow_id',
//       'employeeShortPermission': 'single_permissions_id',
//     };
    
//     if (specialMappings[entityName]) {
//       return specialMappings[entityName];
//     }
    
//     return `${camelToSnake(entityName)}_id`;
//   };

//   const handleDelete = async () => {
//     if (!entityName) {
//       toast.error("Entity name is not defined");
//       return;
//     }
    
//     const entityIdField = getEntityIdField(entityName);
//     const selectedRowIds = selectedRows?.map(row => row[entityIdField]) || [];
    
//     if (selectedRowIds.length === 0) {
//       toast.error("No valid items selected for deletion");
//       return;
//     }
    
//     const validIds = selectedRowIds.filter(id => id !== undefined && id !== null);
    
//     if (validIds.length === 0) {
//       toast.error("Selected items do not have valid IDs");
//       return;
//     }
    
//     try {
//       deleteMutation.mutate({ entityName, ids: validIds });
//     } catch (error) {
//       console.error('Delete operation failed:', error);
//       toast.error("Delete operation failed");
//     }
//   };

//   const hasSelectedRows = (selectedRows ?? []).length > 0;

//   const normalizeModulePath = (moduleName: string) =>
//     moduleName.replace(/\s+/g, "-").toLowerCase();

//   // Parse current path
//   const pathSegments = pathname.split("/").filter(Boolean);
//   const currentModulePath = pathSegments[0] || "";
//   const currentSubmodulePath = pathSegments[1] || "";
//   const currentTabPath = pathSegments[2] || "";

//   // Find current module
//   const activeModuleKey = Object.keys(privilegeMap || {}).find(
//     (moduleKey) => normalizeModulePath(moduleKey) === currentModulePath
//   );

//   // Determine what to show based on current path level
//   const isAtSubmoduleLevel = pathSegments.length === 2;
//   const isAtTabLevel = pathSegments.length >= 3;

//   // Get items to display in PowerShifterTab based on current level
//   const tabItems = React.useMemo(() => {
//     if (!activeModuleKey) return [];

//     if (isAtTabLevel) {
//       // Show tabs for current submodule
//       const currentSubmodule = allowedSubModules.find(
//         (sub: any) => sub.module_name === activeModuleKey && sub.path === currentSubmodulePath
//       );
      
//       if (currentSubmodule) {
//         return allowedTabs
//           .filter((tab: any) => 
//             tab.module_name === activeModuleKey && 
//             tab.sub_module_path === currentSubmodulePath
//           )
//           .map((tab: any) => ({
//             path: `/${currentModulePath}/${currentSubmodulePath}/${tab.tab_name.toLowerCase().replace(/\s+/g, "-")}`,
//             label: tab.tab_name,
//           }));
//       }
//     } else {
//       // Show submodules for current module
//       return allowedSubModules
//         .filter((sub: any) => sub.module_name === activeModuleKey)
//         .map((sub: any) => ({
//           path: `/${currentModulePath}/${sub.path}`,
//           label: sub.sub_module_name,
//         }));
//     }

//     return [];
//   }, [activeModuleKey, allowedSubModules, allowedTabs, currentModulePath, currentSubmodulePath, isAtTabLevel]);

//   // Get current permissions based on path level
//   const getCurrentPrivileges = () => {
//     if (!activeModuleKey || !privilegeMap[activeModuleKey]) {
//       return null;
//     }

//     if (isAtTabLevel) {
//       // Check tab permissions
//       const currentTab = allowedTabs.find(
//         (tab: any) => 
//           tab.module_name === activeModuleKey && 
//           tab.sub_module_path === currentSubmodulePath &&
//           normalizeModulePath(tab.tab_name) === pathSegments[2]
//       );
//       return currentTab?.privileges || null;
//     } else {
//       // Check submodule permissions
//       const currentSubmodule = allowedSubModules.find(
//         (sub: any) => 
//           sub.module_name === activeModuleKey && 
//           sub.path === currentSubmodulePath
//       );
//       return currentSubmodule?.privileges || null;
//     }
//   };

//   const currentPrivileges = getCurrentPrivileges();
//   const canAdd = currentPrivileges?.create && currentPrivileges?.access;
//   const canDelete = currentPrivileges?.delete && currentPrivileges?.access;

//   return (
//     <div className="flex flex-col">
//       <div className="flex justify-between items-center">
//         <PowerShifterTab items={tabItems} />
//         <div className="flex gap-2 items-center">
//           {!disableFeatures && !disableSearch && (
//             <PowerSearch props={props} />
//           )}
//           {enableFilters && (
//             <PowerFilter
//               modal_title={filter_modal_title}
//               modal_description={filter_modal_description}
//               modal_component={filter_modal_component}
//               modal_props={{
//                 open: props?.filter_open,
//                 on_open_change: props?.filter_on_open_change,
//               }}
//               isLarge={isLarge}
//             />
//           )}
//           {!disableFeatures && !disableAdd && canAdd && (
//             <PowerAdd
//               modal_title={modal_title}
//               modal_description={modal_description}
//               isAddNewPagePath={isAddNewPagePath ?? null}
//               modal_component={modal_component}
//               modal_props={{
//                 open: props?.open,
//                 on_open_change: props?.on_open_change,
//               }}
//               size={size}
//             />
//           )}
//           {!disableFeatures && !disableDelete && canDelete && (selectedRows ?? []).length > 0 && (
//             <PowerDelete 
//               props={props} 
//               label={selectedRows?.length === props?.Data?.length ? "Delete All" : "Delete"} 
//               onClick={handleDelete}
//             />
//           )}
//           {enableTakeAction && (
//             <PowerTakeAction
//               modal_title={modal_title}
//               modal_description={modal_description}
//               isAddNewPagePath={isAddNewPagePath ?? null}
//               modal_component={modal_component}
//               modal_props={{
//                 open: props?.open,
//                 on_open_change: props?.on_open_change,
//               }}
//               isLarge={isLargeAction}
//             />
//           )}
//           {!disableFeatures && isExport && (
//             <PowerExport
//               data={(selectedRows && selectedRows.length > 0) ? selectedRows : (props?.Data || [])}
//               fileName={entityName || "report"}
//               enableExcel={enableExcel}
//               enablePdf={enablePdf}
//               enableWord={enableWord}
//             />
//           )}
//           {enableClear && <PowerClear props={props} />}

//           {enableApprove && hasSelectedRows && (
//             <ApprovalModal
//               type="approve"
//               modal_title={approve_modal_title || "Approve Request"}
//               modal_description={approve_modal_description || "Are you sure you want to approve the selected request(s)?"}
//               modal_component={modal_component}
//               modal_props={{
//                 open: props?.approve_open || false,
//                 on_open_change: props?.approve_on_open_change || (() => {}),
//                 on_confirm: props?.onApprove || (() => {}),
//               }}
//               selectedCount={selectedRows?.length || 0}
//             />
//           )}

//           {enableReject && hasSelectedRows && (
//             <ApprovalModal
//               type="reject"
//               modal_title={reject_modal_title || "Reject Request"}
//               modal_description={reject_modal_description || "Are you sure you want to reject the selected request(s)?"}
//               modal_component={modal_component}
//               modal_props={{
//                 open: props?.reject_open || false,
//                 on_open_change: props?.reject_on_open_change || (() => {}),
//                 on_confirm: props?.onReject || (() => {}),
//               }}
//               selectedCount={selectedRows?.length || 0}
//             />
//           )}
//         </div>
//       </div>

//       <AutoPathMapper />
//     </div>
//   );
// }
"use client";
import React from "react";
import AutoPathMapper from "../common/auto-path-mapper";
import PowerShifterTab from "../power-comps/power-shifter-tab";
import PowerAdd from "../power-comps/power-add";
import PowerDelete from "../power-comps/power-delete";
import PowerSearch from "../power-comps/power-search";
import PowerExport from "../power-comps/power-export";
import PowerFilter from "../power-comps/power-filter";
import PowerTakeAction from "../power-comps/power-take-action";
import PowerClear from "../power-comps/power-clear";
import ApprovalModal from "../power-comps/power-approval-modal";
import toast from "react-hot-toast";
import { useDeleteEntityMutation } from "@/src/hooks/useDeleteEntityMutation";
import { camelToSnake } from "@/src/utils/caseConverters";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { usePathname } from "next/navigation";
import { useRBAC } from "@/src/hooks/useRBAC";

export default function PowerHeader({
  items,
  props,
  selectedRows,
  isExport = false,
  disableSearch = false,
  disableAdd = false,
  disableDelete = false,
  isAddNewPagePath,
  disableFeatures = false,
  enableFilters = false,
  modal_component,
  filter_modal_component,
  isLarge,
  isLarge2,
  isLargeAction,
  modal_title,
  modal_description,
  filter_modal_title,
  filter_modal_description,
  approve_modal_title,
  approve_modal_description,
  reject_modal_title,
  reject_modal_description,
  enableTakeAction = false,
  enableClear = false,
  enableApprove = false,
  enableReject = false,
  entityName,
  enableExcel = false,
  enablePdf = false,
  enableWord = false,
  size = "medium",
}: {
  items?: any;
  props?: any;
  selectedRows?: any[];
  isExport?: boolean;
  disableSearch?: boolean;
  disableAdd?: boolean;
  disableDelete?: boolean;
  isAddNewPagePath?: string;
  disableFeatures?: boolean;
  enableFilters?: boolean;
  modal_component?: any;
  filter_modal_component?: any;
  isLarge?: any;
  isLarge2?: any;
  isLargeAction?: any;
  modal_title?: string;
  modal_description?: string;
  filter_modal_title?: string;
  filter_modal_description?: string;
  approve_modal_title?: string;
  approve_modal_description?: string;
  reject_modal_title?: string;
  reject_modal_description?: string;
  enableTakeAction?: boolean;
  enableClear?: boolean;
  enableApprove?: boolean;
  enableReject?: boolean;
  entityName?: string;
  enableExcel?: boolean;
  enablePdf?: boolean;
  enableWord?: boolean;
  size?: "small" | "medium" | "large" | "extraLarge";
}) {
  const { privilegeMap } = usePrivileges();
  const pathname = usePathname();
  const { allowedModules, allowedSubModules, allowedTabs } = useRBAC();

  const deleteMutation = useDeleteEntityMutation({
    onSelectionClear: () => props.setSelectedRows?.([]),
  });

  const getEntityIdField = (entityName: string) => {
    const specialMappings: Record<string, string> = {
      'workflowType': 'workflow_id',
      'employeeShortPermission': 'single_permissions_id',
    };
    
    if (specialMappings[entityName]) {
      return specialMappings[entityName];
    }
    
    return `${camelToSnake(entityName)}_id`;
  };

  const handleDelete = async () => {
    if (!entityName) {
      toast.error("Entity name is not defined");
      return;
    }
    
    const entityIdField = getEntityIdField(entityName);
    const selectedRowIds = selectedRows?.map(row => row[entityIdField]) || [];
    
    if (selectedRowIds.length === 0) {
      toast.error("No valid items selected for deletion");
      return;
    }
    
    const validIds = selectedRowIds.filter(id => id !== undefined && id !== null);
    
    if (validIds.length === 0) {
      toast.error("Selected items do not have valid IDs");
      return;
    }
    
    try {
      deleteMutation.mutate({ entityName, ids: validIds });
    } catch (error) {
      console.error('Delete operation failed:', error);
      toast.error("Delete operation failed");
    }
  };

  const hasSelectedRows = (selectedRows ?? []).length > 0;

  const normalizeModulePath = (moduleName: string) =>
    moduleName.replace(/\s+/g, "-").toLowerCase();

  // Parse current path
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentModulePath = pathSegments[0] || "";
  const currentSubmodulePath = pathSegments[1] || "";
  
  // Get current tab from query params
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const currentTabFromQuery = searchParams.get('tab') || "";

  // Find current module
  const activeModuleKey = Object.keys(privilegeMap || {}).find(
    (moduleKey) => normalizeModulePath(moduleKey) === currentModulePath
  );

  // Determine what to show based on current path level and query params
  const isAtSubmoduleLevel = pathSegments.length === 2 && !currentTabFromQuery;
  const isAtTabLevel = pathSegments.length === 2 && currentTabFromQuery;

  // Get items to display in PowerShifterTab based on current level
  const tabItems = React.useMemo(() => {
    if (!activeModuleKey) return [];

    if (isAtTabLevel) {
      // Show tabs for current submodule using query parameters
      const currentSubmodule = allowedSubModules.find(
        (sub: any) => sub.module_name === activeModuleKey && sub.path === currentSubmodulePath
      );
      
      if (currentSubmodule) {
        return allowedTabs
          .filter((tab: any) => 
            tab.module_name === activeModuleKey && 
            tab.sub_module_path === currentSubmodulePath
          )
          .map((tab: any) => ({
            path: `/${currentModulePath}/${currentSubmodulePath}?tab=${tab.tab_name.toLowerCase().replace(/\s+/g, "-")}`,
            label: tab.tab_name,
          }));
      }
    } else {
      // Show submodules for current module
      return allowedSubModules
        .filter((sub: any) => sub.module_name === activeModuleKey)
        .map((sub: any) => ({
          path: `/${currentModulePath}/${sub.path}`,
          label: sub.sub_module_name,
        }));
    }

    return [];
  }, [activeModuleKey, allowedSubModules, allowedTabs, currentModulePath, currentSubmodulePath, isAtTabLevel]);

  // Get current permissions based on path level
  const getCurrentPrivileges = () => {
    if (!activeModuleKey || !privilegeMap[activeModuleKey]) {
      return null;
    }

    if (isAtTabLevel) {
      // Check tab permissions using query parameter
      const currentTab = allowedTabs.find(
        (tab: any) => 
          tab.module_name === activeModuleKey && 
          tab.sub_module_path === currentSubmodulePath &&
          tab.tab_name.toLowerCase().replace(/\s+/g, "-") === currentTabFromQuery
      );
      return currentTab?.privileges || null;
    } else {
      // Check submodule permissions
      const currentSubmodule = allowedSubModules.find(
        (sub: any) => 
          sub.module_name === activeModuleKey && 
          sub.path === currentSubmodulePath
      );
      return currentSubmodule?.privileges || null;
    }
  };

  const currentPrivileges = getCurrentPrivileges();
  const canAdd = currentPrivileges?.create && currentPrivileges?.access;
  const canDelete = currentPrivileges?.delete && currentPrivileges?.access;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <PowerShifterTab items={tabItems} />
        <div className="flex gap-2 items-center">
          {!disableFeatures && !disableSearch && (
            <PowerSearch props={props} />
          )}
          {enableFilters && (
            <PowerFilter
              modal_title={filter_modal_title}
              modal_description={filter_modal_description}
              modal_component={filter_modal_component}
              modal_props={{
                open: props?.filter_open,
                on_open_change: props?.filter_on_open_change,
              }}
              isLarge={isLarge}
            />
          )}
          {!disableFeatures && !disableAdd && canAdd && (
            <PowerAdd
              modal_title={modal_title}
              modal_description={modal_description}
              isAddNewPagePath={isAddNewPagePath ?? null}
              modal_component={modal_component}
              modal_props={{
                open: props?.open,
                on_open_change: props?.on_open_change,
              }}
              size={size}
            />
          )}
          {!disableFeatures && !disableDelete && canDelete && (selectedRows ?? []).length > 0 && (
            <PowerDelete 
              props={props} 
              label={selectedRows?.length === props?.Data?.length ? "Delete All" : "Delete"} 
              onClick={handleDelete}
            />
          )}
          {enableTakeAction && (
            <PowerTakeAction
              modal_title={modal_title}
              modal_description={modal_description}
              isAddNewPagePath={isAddNewPagePath ?? null}
              modal_component={modal_component}
              modal_props={{
                open: props?.open,
                on_open_change: props?.on_open_change,
              }}
              isLarge={isLargeAction}
            />
          )}
          {!disableFeatures && isExport && (
            <PowerExport
              data={(selectedRows && selectedRows.length > 0) ? selectedRows : (props?.Data || [])}
              fileName={entityName || "report"}
              enableExcel={enableExcel}
              enablePdf={enablePdf}
              enableWord={enableWord}
            />
          )}
          {enableClear && <PowerClear props={props} />}

          {enableApprove && hasSelectedRows && (
            <ApprovalModal
              type="approve"
              modal_title={approve_modal_title || "Approve Request"}
              modal_description={approve_modal_description || "Are you sure you want to approve the selected request(s)?"}
              modal_component={modal_component}
              modal_props={{
                open: props?.approve_open || false,
                on_open_change: props?.approve_on_open_change || (() => {}),
                on_confirm: props?.onApprove || (() => {}),
              }}
              selectedCount={selectedRows?.length || 0}
            />
          )}

          {enableReject && hasSelectedRows && (
            <ApprovalModal
              type="reject"
              modal_title={reject_modal_title || "Reject Request"}
              modal_description={reject_modal_description || "Are you sure you want to reject the selected request(s)?"}
              modal_component={modal_component}
              modal_props={{
                open: props?.reject_open || false,
                on_open_change: props?.reject_on_open_change || (() => {}),
                on_confirm: props?.onReject || (() => {}),
              }}
              selectedCount={selectedRows?.length || 0}
            />
          )}
        </div>
      </div>

      <AutoPathMapper />
    </div>
  );
}