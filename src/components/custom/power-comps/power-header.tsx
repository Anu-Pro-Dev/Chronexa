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
import { useDeleteEntityMutation } from "@/src/hooks/useDeleteEntityMutation";
import { camelToSnake } from "@/src/utils/caseConverters";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { usePathname } from "next/navigation";
import { useRBAC } from "@/src/hooks/useRBAC";
import { useShowToast } from "@/src/utils/toastHelper";

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
  customDeleteHandler,
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
  customDeleteHandler?: any;
}) {
  const { privilegeMap } = usePrivileges();
  const pathname = usePathname();
  const { allowedModules, allowedSubModules, allowedTabs } = useRBAC();
  const showToast = useShowToast();

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
    if (customDeleteHandler) {
      customDeleteHandler();
      return;
    }
    
    if (!entityName) {
      showToast("error", "form_error");
      return;
    }
    
    const entityIdField = getEntityIdField(entityName);
    const selectedRowIds = selectedRows?.map(row => row[entityIdField]) || [];
    
    if (selectedRowIds.length === 0) {
      showToast("error", "delete_error");
      return;
    }
    
    const validIds = selectedRowIds.filter(id => id !== undefined && id !== null);
    
    if (validIds.length === 0) {
      showToast("error", "delete_invalidid_error");
      return;
    }
    
    try {
      deleteMutation.mutate({ entityName, ids: validIds });
    } catch (error) {
      console.error('Delete operation failed:', error);
      showToast("error", "delete_error");
    }
  };

  const hasSelectedRows = (selectedRows ?? []).length > 0;

  const normalizeModulePath = (moduleName: string) =>
    moduleName.replace(/\s+/g, "-").toLowerCase();

  const pathSegments = pathname.split("/").filter(Boolean);
  const currentModulePath = pathSegments[0] || "";
  const currentSubmodulePath = pathSegments[1] || "";
  
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const currentTabFromQuery = searchParams.get('tab') || "";

  const activeModuleKey = Object.keys(privilegeMap || {}).find(
    (moduleKey) => normalizeModulePath(moduleKey) === currentModulePath
  );

  const isAtSubmoduleLevel = pathSegments.length === 2 && !currentTabFromQuery;
  const isAtTabLevel = pathSegments.length === 2 && currentTabFromQuery;

  const tabItems = React.useMemo(() => {
    if (!activeModuleKey) return [];

    if (isAtTabLevel) {
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
      return allowedSubModules
        .filter((sub: any) => sub.module_name === activeModuleKey)
        .map((sub: any) => ({
          path: `/${currentModulePath}/${sub.path}`,
          label: sub.sub_module_name,
        }));
    }

    return [];
  }, [activeModuleKey, allowedSubModules, allowedTabs, currentModulePath, currentSubmodulePath, isAtTabLevel]);

  const getCurrentPrivileges = () => {
    if (!activeModuleKey || !privilegeMap[activeModuleKey]) {
      return null;
    }

    if (isAtTabLevel) {
      const currentTab = allowedTabs.find(
        (tab: any) => 
          tab.module_name === activeModuleKey && 
          tab.sub_module_path === currentSubmodulePath &&
          tab.tab_name.toLowerCase().replace(/\s+/g, "-") === currentTabFromQuery
      );
      return currentTab?.privileges || null;
    } else {
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