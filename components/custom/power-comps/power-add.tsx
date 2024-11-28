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

export default function PowerAdd({
  isAddNewPagePath = null,
  modal_title = "Add",
  modal_description = "",
  modal_component,
  modal_props,
}: {
  isAddNewPagePath?: string | null;
  modal_title?: string;
  modal_description?: string;
  modal_component?: any;
  modal_props?: any;
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
            variant={"success"}
            onClick={() => {
              router.push(isAddNewPagePath);
            }}
            className="flex items-center space-y-0.5"
          >
            <AddIcon />
            <span>Add</span>
          </Button>
        )}

        {isAddNewPagePath === null && (
          <ResponsiveModalTrigger asChild>
            <Button
              variant={"success"}
              className="flex items-center space-y-0.5"
            >
              <AddIcon />
              <span>Add</span>
            </Button>
          </ResponsiveModalTrigger>
        )}
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>{modal_title}</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {modal_description}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          {<div className="p-1">{modal_component}</div>}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
