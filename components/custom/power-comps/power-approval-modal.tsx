"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { useLanguage } from "@/providers/LanguageProvider";

interface ApprovalModalProps {
  type: "approve" | "reject";
  modal_title?: string;
  modal_description?: string;
  modal_component?: React.ReactNode;
  modal_props?: {
    open: boolean;
    on_open_change: (open: boolean) => void;
    on_confirm: () => void;
  };
}

export default function ApprovalModal({
  type,
  modal_title,
  modal_description,
  modal_component,
  modal_props,
}: ApprovalModalProps) {
  const { translations } = useLanguage();

  const isApprove = type === "approve";
  const modalTitle =
    modal_title ||
    (isApprove ? translations?.buttons.approve : translations?.buttons.reject) ||
    (isApprove ? "Approve" : "Reject");
  const description =
    modal_description ||
    (isApprove
      ? "Are you sure you want to approve this request?"
      : "Are you sure you want to reject this record?");
  const buttonVariant = isApprove ? "success" : "destructive";

  return (
    <ResponsiveModal open={modal_props?.open} onOpenChange={modal_props?.on_open_change}>
      <ResponsiveModalTrigger asChild>
        <Button size="sm" variant={buttonVariant}>
          {isApprove ? translations?.buttons.approve : translations?.buttons.reject}
        </Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{modalTitle}</ResponsiveModalTitle>
          <ResponsiveModalDescription>{description}</ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div>{modal_component}</div>
        <div className="flex justify-end gap-2 pb-4">
            <Button 
                variant={"outline"}
                type="button"
                size={"lg"}
                className="w-full" 
                onClick={() => modal_props?.on_open_change(false)}
            >
                No
            </Button>
          <Button
            variant={buttonVariant}
            type="button"
            size={"lg"} 
            className="w-full"
            onClick={() => {
              modal_props?.on_confirm();
              modal_props?.on_open_change(false);
            }}
          >
            Yes
          </Button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
