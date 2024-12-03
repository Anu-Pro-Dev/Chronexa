import React from "react";
import AutoPathMapper from "../auto-path-mapper";
import PowerShifter from "./power-shifter";
import PowerAdd from "./power-add";
import PowerDelete from "./power-delete";
import PowerSearch from "./power-search";
import PowerExport from "./power-export";

export default function PowerHeader({
  items,
  props,
  isExport = false,
  disableSearch = false,
  disableAdd = false,
  disableDelete = false,
  isAddNewPagePath,
  disableFeatures = false,
  modal_component,
  isLarge,
}: {
  items: any;
  props?: any;
  isExport?: boolean;
  disableSearch?: boolean;
  disableAdd?: boolean;
  disableDelete?: boolean;
  isAddNewPagePath?: string;
  disableFeatures?: boolean;
  modal_component?: any;
  isLarge?: any;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <PowerShifter items={items} />

        {!disableFeatures && (
          <div className="flex gap-2 items-center">
            {!disableSearch && <PowerSearch />}
            {!disableAdd && (
              <PowerAdd
                isAddNewPagePath={isAddNewPagePath ?? null}
                modal_component={modal_component}
                modal_props={{
                  open: props.open,
                  on_open_change: props.on_open_change,
                }}
                isLarge={isLarge}
              />
            )}
            {!disableDelete && <PowerDelete props={props} />}
            {isExport && <PowerExport />}
          </div>
        )}
      </div>

      <AutoPathMapper />
    </div>
  );
}
