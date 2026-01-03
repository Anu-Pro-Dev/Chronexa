"use client";
import { Button } from "@/src/components/ui/button";
import { AddIcon } from "@/src/icons/icons";
import React, { useState } from "react";

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
import { Close } from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";
import { ActionIcon } from "@/src/icons/icons";
import { Textarea } from "@/src/components/ui/textarea";

export default function PowerTakeAction({
  isAddNewPagePath = null,
  modal_title = "Add",
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
  const { dir } = useLanguage();
  const router = useRouter();

  return (
    <div>
      <ResponsiveModal
        open={modal_props?.open}
        onOpenChange={modal_props?.on_open_change}
      >
        {isAddNewPagePath && (
          <Button
            variant={"destructive"}
            size={"sm"}
            onClick={() => {
              router.push(isAddNewPagePath);
            }}
            className="flex items-center space-y-0.5"
          >
            <ActionIcon />
            <span>Take Action</span>
          </Button>
        )}

        {isAddNewPagePath === null && (
          <ResponsiveModalTrigger asChild>
            <Button
              variant={"destructive"}
              size={"sm"}
              className="flex items-center space-y-0.5"
            >
              <ActionIcon />
              <span>Take Action</span>
            </Button>
          </ResponsiveModalTrigger>
        )}
        
        <ResponsiveModalContent className={isLarge && "max-w-4xl"}>
          <ResponsiveModalHeader>
            <div className="flex items-start justify-between px-5">
              <div className="flex flex-col text-start">
                <span className="text-primary font-bold text-xl pb-2">{modal_title}</span>
                <ResponsiveModalDescription className="text-secondary">
                  {modal_description}
                </ResponsiveModalDescription>
              </div>
            </div>
            <ResponsiveModalTitle></ResponsiveModalTitle>
          </ResponsiveModalHeader>
          {<div className="px-5">{modal_component}</div>}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
