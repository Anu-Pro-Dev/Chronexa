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
}: {
  items: any;
  props?: any;
  isExport?: boolean;
  disableSearch?: boolean;
  disableAdd?: boolean;
  disableDelete?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <PowerShifter items={items} />

        <div className="flex gap-2 items-center">
          {!disableSearch && <PowerSearch />}

          {!disableAdd && <PowerAdd />}
          {!disableDelete && <PowerDelete />}

          {isExport && <PowerExport />}
        </div>
      </div>

      <AutoPathMapper />
    </div>
  );
}
