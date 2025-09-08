"use client";
import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { AddIcon } from "@/src/icons/icons";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/src/components/ui/responsive-modal";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/providers/LanguageProvider";

export default function PowerAdd({
  isAddNewPagePath = null,
  modal_title,
  modal_description,
  modal_component,
  modal_props,
  size = "medium",
}: {
  isAddNewPagePath?: string | null;
  modal_title?: string;
  modal_description?: string;
  modal_component?: any;
  modal_props?: any;
  size?: "small" | "medium" | "large" | "extraLarge";
}) {
  const router = useRouter();
  const { translations } = useLanguage();
  const modalTitle = modal_title;

  return (
    <div>
      <ResponsiveModal
        open={modal_props?.open}
        onOpenChange={modal_props?.on_open_change}
      >
        {isAddNewPagePath && (
          <Button
            size={"sm"}
            onClick={() => {
              router.push(isAddNewPagePath);
            }}
            className="flex items-center space-y-0.5"
          >
            <AddIcon />
            <span>{translations?.buttons.add}</span>
          </Button>
        )}

        {isAddNewPagePath === null && (
          <ResponsiveModalTrigger asChild>
            <Button
              size={"sm"}
              className="flex items-center space-y-0.5"
            >
              <AddIcon />
              <span>{translations?.buttons.add}</span>
            </Button>
          </ResponsiveModalTrigger>
        )}
        <ResponsiveModalContent side="center" size={size}>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>
              {modalTitle}
            </ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {modal_description}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          {<div className="">{modal_component}</div>}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
