"use client";
import { useState } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/ui/responsive-modal";
import GroupApplyPunch from "@/src/components/custom/modules/self-services/GroupApplyPunch";

export default function GroupPunchModal({
  open,
  onOpenChange,
  rowData,
  punchType,
  size,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData?: any;
  punchType?: string;
  size?: "small" | "medium" | "large" | "extraLarge"; 
}) {
  const { translations } = useLanguage();

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size={size}>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Apply Missing Punch</ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <GroupApplyPunch
          on_open_change={onOpenChange}
          rowData={rowData}
          punchType={punchType}
        />

      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}