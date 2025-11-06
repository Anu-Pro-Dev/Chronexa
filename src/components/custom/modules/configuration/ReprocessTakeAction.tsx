"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { cn } from "@/src/lib/utils";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/ui/responsive-modal";
import { Button } from "@/src/components/ui/button";
import { ReporcessIcon } from "@/src/icons/icons";

export default function ReprocessDataTakeAction({
  modal_props,
}: {
  modal_props: { open: boolean; on_open_change: (open: boolean) => void };
}) {
  const { translations } = useLanguage();
  return (
    <div>
        <ResponsiveModal open={modal_props.open} onOpenChange={modal_props.on_open_change}>
        <ResponsiveModalContent size="medium">
            <ResponsiveModalHeader className="items-center gap-2">
                <div className='w-20 h-20 rounded-full bg-backdrop flex justify-center items-center'><ReporcessIcon /></div>
                <ResponsiveModalTitle>Reprocess</ResponsiveModalTitle>
                <ResponsiveModalDescription>This will reporcess the attendance data, Do you want to conitnue?</ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <>
                <div className="w-full flex gap-2 justify-end items-center py-3">
                    <Button variant="outline" type="button" size="lg" className="w-full" onClick={() => modal_props.on_open_change(false)}>
                        {translations.buttons.cancel}
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
