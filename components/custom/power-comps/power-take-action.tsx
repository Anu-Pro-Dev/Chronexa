"use client";
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
import { useLanguage } from "@/providers/LanguageProvider";
import { Close } from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";
import { ForwardIcon } from "lucide-react";

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
            <ForwardIcon />
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
              <ForwardIcon />
              <span>Take Action</span>
            </Button>
          </ResponsiveModalTrigger>
        )}
        
        <ResponsiveModalContent className={isLarge && "max-w-4xl"}>
          <ResponsiveModalHeader>
            <div className="flex items-start justify-between">
              <div className="flex flex-col text-start">
                <span className="text-primary font-bold">{modal_title}</span>
                <ResponsiveModalDescription className="text-secondary">
                  {modal_description}
                </ResponsiveModalDescription>
              </div>
              <span
                className="cursor-pointer hover:scale-125 transition-all"
                onClick={() => {
                  modal_props?.on_open_change(false);
                }}
              >
                <IoMdClose />
              </span>
            </div>
            <ResponsiveModalTitle></ResponsiveModalTitle>
          </ResponsiveModalHeader>
          {<div className="p-1">{modal_component}</div>}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
