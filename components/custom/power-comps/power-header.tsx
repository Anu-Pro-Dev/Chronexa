"use client";
import React from "react";
import AutoPathMapper from "../auto-path-mapper";
import PowerShifter from "./power-shifter";
import PowerAdd from "./power-add";
import PowerDelete from "./power-delete";
import PowerSearch from "./power-search";
import PowerExport from "./power-export";
import { useLanguage } from "@/providers/LanguageProvider";
import PowerFilter from "./power-filter";

export default function PowerHeader({
  items,
  props,
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
  modal_title,
  modal_description,
  filter_modal_title,
  filter_modal_description,
}: {
  items: any;
  props?: any;
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
  modal_title?: string;
  modal_description?: string;
  filter_modal_title?: string;
  filter_modal_description?: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <PowerShifter items={items} />

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
              />
            )}

            {!disableFeatures && !disableDelete && (
              <PowerDelete props={props} />
            )}
            {!disableFeatures && isExport && <PowerExport />}
          </div>
        }
      </div>

      <AutoPathMapper />
    </div>
  );
}
