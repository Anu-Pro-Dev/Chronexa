"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddIcon } from "@/icons/icons";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";

export default function PowerAdd({
  isAddNewPagePath = null,
  modal_title,
  modal_description = "Description",
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
  const modalTitle = modal_title || translations?.buttons.add || "Add";

  return (
    <div>
      <ResponsiveModal
        open={modal_props?.open}
        onOpenChange={modal_props?.on_open_change}
      >
        {isAddNewPagePath && (
          <Button
            variant={"success"}
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
              variant={"success"}
              size={"sm"}
              className="flex items-center space-y-0.5"
            >
              <AddIcon />
              <span>{translations?.buttons.add}</span>
            </Button>
          </ResponsiveModalTrigger>
        )}
        <ResponsiveModalContent className={isLarge && "max-w-4xl"}>
          <ResponsiveModalHeader>
            {/* <div className=""> */}
              {/* <div className=""> */}
                <ResponsiveModalTitle>
                  {modalTitle}
                </ResponsiveModalTitle>
                {/* <span className="text-text-primary font-bold text-xl">
                  {modalTitle}
                </span> */}
                <ResponsiveModalDescription>
                  {modal_description}
                </ResponsiveModalDescription>
              {/* </div> */}
              {/* <span
                className="cursor-pointer hover:scale-125 transition-all"
                onClick={() => {
                  modal_props?.on_open_change(false);
                }}
              >
                <IoMdClose />
              </span> */}
            {/* </div> */}
            {/* <ResponsiveModalTitle></ResponsiveModalTitle> */}
          </ResponsiveModalHeader>
          {<div className="">{modal_component}</div>}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
