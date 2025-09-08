"use client";
import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
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

export default function PowerApprove({
  modal_title,
  modal_description = "Description",
  modal_component,
  modal_props,
}: {
  modal_title?: string;
  modal_description?: string;
  modal_component?: any;
  modal_props?: any;
}) {
  const router = useRouter();
  const { translations } = useLanguage();
  const modalTitle = modal_title || translations?.buttons.approve || "Approve";

  return (
    <div>
      <ResponsiveModal
        open={modal_props?.open}
        onOpenChange={modal_props?.on_open_change}
      >
        <ResponsiveModalTrigger asChild>
          <Button
            className="flex items-center space-y-0.5"
            size={"sm"}
            variant={"success"}
          >
            <span>{translations?.buttons.approve}</span>
          </Button>
        </ResponsiveModalTrigger>
        <ResponsiveModalContent>
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
