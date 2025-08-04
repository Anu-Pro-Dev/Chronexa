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
  selectedCount?: number;
}

export default function ApprovalModal({
  type,
  modal_title,
  modal_description,
  modal_component,
  modal_props,
  selectedCount = 0,
}: ApprovalModalProps) {
  const { translations } = useLanguage();

  const isApprove = type === "approve";
  const modalTitle =
    modal_title ||
    (isApprove ? translations?.buttons?.approve : translations?.buttons?.reject) ||
    (isApprove ? "Approve Request" : "Reject Request");
  
  // Enhanced description that includes selected count
  const description =
    modal_description ||
    (isApprove
      ? `Are you sure you want to approve ${selectedCount > 1 ? `these ${selectedCount} requests` : 'this request'}?`
      : `Are you sure you want to reject ${selectedCount > 1 ? `these ${selectedCount} requests` : 'this request'}?`);
  
  const buttonVariant = isApprove ? "success" : "destructive";
  const triggerButtonText = isApprove 
    ? (translations?.buttons?.approve || "Approve")
    : (translations?.buttons?.reject || "Reject");

  const handleConfirm = () => {
    modal_props?.on_confirm();
    // Don't close modal here - let the parent handle closing after API success/failure
  };

  return (
    <ResponsiveModal 
      open={modal_props?.open || false} 
      onOpenChange={modal_props?.on_open_change || (() => {})}
    >
      <ResponsiveModalTrigger asChild>
        <Button 
          size="sm" 
          variant={buttonVariant}
          disabled={selectedCount === 0}
        >
          {triggerButtonText}
        </Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{modalTitle}</ResponsiveModalTitle>
          <ResponsiveModalDescription>{description}</ResponsiveModalDescription>
        </ResponsiveModalHeader>
        
        {/* Custom modal component if provided */}
        {modal_component && (
          <div className="py-4">
            {modal_component}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline"
            type="button"
            size="lg"
            className="flex-1" 
            onClick={() => modal_props?.on_open_change?.(false)}
          >
            {translations?.buttons?.cancel || "Cancel"}
          </Button>
          <Button
            variant={buttonVariant}
            type="button"
            size="lg" 
            className="flex-1"
            onClick={handleConfirm}
          >
            {isApprove 
              ? (translations?.buttons?.approve || "Approve")
              : (translations?.buttons?.reject || "Reject")
            }
          </Button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}