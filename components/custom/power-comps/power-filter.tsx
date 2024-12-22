import { Button } from "@/components/ui/button";
import { AddIcon } from "@/icons/icons";
import React, { useState } from "react";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { useRouter } from "next/navigation";
import { FiltersIcon } from "@/lib/svg/icons";

export default function PowerFilter({
  isAddNewPagePath = null,
  modal_title = "Filters",
  modal_description = "",
  modal_component,
  modal_props,
  isLarge = false,
}: {
  isAddNewPagePath?: string | null;
  modal_title?: string;
  modal_description?: string;
  modal_component?: any;
  modal_props?: any;
  isLarge?: any;
}) {
  const router = useRouter();

  return (
    <div>
      <ResponsiveModal
        open={modal_props?.open}
        onOpenChange={modal_props?.on_open_change}
      >
        {isAddNewPagePath && (
          <Button
            onClick={() => {
              router.push(isAddNewPagePath);
            }}
            className="flex items-center space-y-0.5"
            size={"sm"}
          >
            <FiltersIcon />
            <span className="text-white"> Filters</span>
          </Button>
        )}

        {isAddNewPagePath === null && (
          <ResponsiveModalTrigger asChild>
            <Button className="flex items-center space-y-0.5" size={"sm"}>
              <FiltersIcon />
              <span className="text-white">Filters</span>
            </Button>
          </ResponsiveModalTrigger>
        )}

        <ResponsiveModalContent className={isLarge && "max-w-4xl"}>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="text-primary font-bold">
              {modal_title}
            </ResponsiveModalTitle>
            <ResponsiveModalDescription className="text-secondary">
              {modal_description}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          {<div className="p-1">{modal_component}</div>}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
