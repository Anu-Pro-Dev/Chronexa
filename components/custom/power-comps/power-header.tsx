import React from "react";
import AutoPathMapper from "../auto-path-mapper";
import PowerShifter from "./power-shifter";
import PowerAdd from "./power-add";
import PowerDelete from "./power-delete";
import PowerSearch from "./power-search";

export default function PowerHeader({
  items,
  props,
}: {
  items: any;
  props: any;
}) {
  return (
    <div className="">
      <div className="flex justify-between items-center">
        <PowerShifter items={items} />
        <div className="flex gap-2 items-center">
          <PowerSearch />
          <PowerAdd />
          <PowerDelete />
        </div>
      </div>

      <AutoPathMapper />
    </div>
  );
}
