"use client";
import React from "react";
import AutoPathMapper from "../auto-path-mapper";
import PowerShifterTab from "./power-shifter-tab";
import PowerAdd from "./power-add";
import PowerDelete from "./power-delete";
import PowerSearch from "./power-search";
import PowerExport from "./power-export";
import { useLanguage } from "@/providers/LanguageProvider";
import PowerFilter from "./power-filter";
import PowerTakeAction from "./power-take-action";
import PowerClear from "./power-clear";
import ApprovalModal from "./power-approval-modal";
import { deleteEntityRequest } from "@/lib/apiHandler";
import toast from "react-hot-toast";

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
}: {
  items: any;
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
  isLargeAction?:any;
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
}) {

  const handleDelete = async () => {
    try {
      const selectedRowIds = selectedRows?.map(row => row.entity_id || row.location_id) || [];

      if (selectedRowIds.length === 0) return;

      for (const id of selectedRowIds) {
        await deleteEntityRequest(entityName, id);
      }

      toast.success(`${entityName} deleted successfully!`);

      props.SetData?.((prevData: any[]) =>
        prevData.filter((row: any) =>
          !selectedRowIds.includes(row.entity_id || row.location_id)
        )
      );

      props.setSelectedRows?.([]);
    } catch (error) {
      toast.error(`Failed to delete ${entityName}`);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <PowerShifterTab items={items} />
        {
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
                  open: props.filter_open,
                  on_open_change: props.filter_on_open_change,
                }}
                isLarge={isLarge}
              />
            )}
            {!disableFeatures && !disableAdd && (
              <PowerAdd
                modal_title={modal_title}
                modal_description={modal_description}
                isAddNewPagePath={isAddNewPagePath ?? null}
                modal_component={modal_component}
                modal_props={{
                  open: props.open,
                  on_open_change: props.on_open_change,
                }}
                isLarge={isLarge}
                isLarge2={isLarge2}
              />
            )}
            {!disableFeatures && !disableDelete && (selectedRows ?? []).length > 0 && (
              <PowerDelete props={props} label={selectedRows?.length === props?.Data?.length ? "Delete All" : "Delete"} onClick={handleDelete}/>
            )}
            {enableTakeAction && (
              <PowerTakeAction
                modal_title={modal_title}
                modal_description={modal_description}
                isAddNewPagePath={isAddNewPagePath ?? null}
                modal_component={modal_component}
                modal_props={{
                  open: props.open,
                  on_open_change: props.on_open_change,
                }}
                isLarge={isLargeAction}
              />
            )}
            {/* {!disableFeatures && isExport && <PowerExport />} */}
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
            {/* {enableApprove && 
              <PowerApprove
                modal_title={approve_modal_title}
                modal_description={approve_modal_description}
                modal_component={modal_component}
                modal_props={{
                  open: props.approve_open,
                  on_open_change: props.approve_on_open_change,
                }}
              />
            }
            {enableReject && 
              <PowerReject
                modal_title={reject_modal_title}
                modal_description={reject_modal_description}
                modal_component={modal_component}
                modal_props={{
                  open: props.reject_open,
                  on_open_change: props.reject_on_open_change,
                }}
              />
            } */}

            {enableApprove && (
              <ApprovalModal
                type="approve"
                modal_title={approve_modal_title}
                modal_description={approve_modal_description}
                modal_component={modal_component}
                modal_props={{
                  open: props?.approve_open || false,
                  on_open_change: props?.approve_on_open_change,
                  on_confirm: props?.onApprove || (() => {}),
                }}
              />
          )}

          {enableReject && (
            <ApprovalModal
              type="reject"
              modal_title={reject_modal_title}
              modal_description={reject_modal_description}
              modal_component={modal_component}
              modal_props={{
                open: props?.reject_open || false,
                on_open_change: props?.reject_on_open_change,
                on_confirm: props?.onReject || (() => {}),
              }}
            />
          )}
          </div>
        }
      </div>

      <AutoPathMapper />
    </div>
  );
}
