"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "@/lib/utils";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { ReporcessIcon } from "@/icons/icons";

export default function ReprocessDataTakeAction({
  modal_props,
}: {
  modal_props: { open: boolean; on_open_change: (open: boolean) => void };
}) {

  return (
    <div>
        <ResponsiveModal open={modal_props.open} onOpenChange={modal_props.on_open_change}>
        <ResponsiveModalContent size="medium">
            <ResponsiveModalHeader className="items-center gap-2">
                <div className='w-20 h-20 rounded-full bg-backdrop flex justify-center items-center'><ReporcessIcon /></div>
                <ResponsiveModalTitle>Reprocess data</ResponsiveModalTitle>
                <ResponsiveModalDescription>This will reporcess the attendance data, Do you want to conitnue?</ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <>
                <div className="w-full flex gap-2 justify-end items-center py-3">
                    <Button variant="outline" type="button" size="lg" className="w-full" onClick={() => modal_props.on_open_change(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" size="lg" className="w-full">
                        Save
                    </Button>
                </div>
            </>
        </ResponsiveModalContent>
        </ResponsiveModal>
    </div>
  );
}
