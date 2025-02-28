"use client";
import React from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";

export default function DepartmentAdmins({
  modal_props,
  rowData,
}: {
  modal_props: { open: boolean; on_open_change: (open: boolean) => void };
  rowData: any;
}) {
  const { dir } = useLanguage();

  return (
    <div>
      <ResponsiveModal open={modal_props.open} onOpenChange={modal_props.on_open_change}>
        <ResponsiveModalContent size="large">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Department Admins</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="flex flex-col gap-4">
                {/* <p><strong>ID:</strong> {rowData?.number || "N/A"}</p>
                <p><strong>Organization:</strong> {rowData?.organization || "N/A"}</p>
                <p><strong>From Date:</strong> {rowData?.from_date || "N/A"}</p>
                <p><strong>To Date:</strong> {rowData?.to_date || "N/A"}</p>
                <p><strong>Active:</strong> {rowData?.active ? "Yes" : "No"}</p> */}
                <p>01 - Chairman</p>
                <p>02 - Vice Chairman</p>
                <p>03 - Secretary</p>
                <p>04 - Treasurer</p>
                <p>05 - Member</p>
                <div className="w-full flex gap-2 justify-center items-center py-3">
                    <Button
                    variant={"outline"}
                    type="button"
                    size={"lg"}
                    onClick={() => modal_props?.on_open_change(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
