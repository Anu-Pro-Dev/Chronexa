import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { AddIcon } from "@/src/icons/icons";
import { useLanguage } from "@/src/providers/LanguageProvider";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/src/components/ui/responsive-modal";
import { useRouter } from "next/navigation";
import { FiltersIcon } from "@/src/icons/icons";

export default function PowerFilter({
  isAddNewPagePath = null,
  modal_title,
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
  const { translations } = useLanguage();
  const modalTitle = modal_title === "none" ? null : translations?.buttons.filters || "Filters";
  

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
            <span className="text-accent">{translations?.buttons.filters}</span>
          </Button>
        )}

        {isAddNewPagePath === null && (
          <ResponsiveModalTrigger asChild>
            <Button className="flex items-center space-y-0.5" size={"sm"}>
              <FiltersIcon />
              <span className="text-accent">{translations?.buttons.filters}</span>
            </Button>
          </ResponsiveModalTrigger>
        )}

        <ResponsiveModalContent className={isLarge && "max-w-4xl"}>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="text-text-primary font-bold text-xl">
              {modalTitle}
            </ResponsiveModalTitle>
            <ResponsiveModalDescription className="text-text-secondary text-sm font-semibold">
              {modal_description}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          {<div className="p-1">{modal_component}</div>}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
