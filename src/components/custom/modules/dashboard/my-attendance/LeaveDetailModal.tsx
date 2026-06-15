"use client";
import * as React from "react";
import {
  ResponsiveModal,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/ui/responsive-modal";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/solid";
import type { KpiCardData } from "./KpiCard";

interface LeaveDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardData: KpiCardData;
  page: "Leaves" | "Permissions";
}

export default function LeaveDetailModal({
  open,
  onOpenChange,
  cardData,
  page,
}: LeaveDetailModalProps) {
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size="extraLarge" className="gap-0 p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-border-accent">
          <ResponsiveModalHeader className="flex-row items-center gap-3 text-left">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${cardData.color}18`, color: cardData.color }}
            >
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <ResponsiveModalTitle className="text-left normal-case text-base">
                {cardData.label}
              </ResponsiveModalTitle>
              <p className="text-xs text-text-secondary mt-0.5 font-normal normal-case">
                {page} &middot;{" "}
                <span className="font-semibold" style={{ color: cardData.color }}>
                  {cardData.value} {typeof cardData.value === "number" ? "records" : ""}
                </span>
              </p>
            </div>
            <ResponsiveModalClose className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-background hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1">
              <XMarkIcon className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </ResponsiveModalClose>
          </ResponsiveModalHeader>
          <div className="relative mt-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Search records…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-full border border-border-grey bg-transparent pl-9 pr-4 text-sm font-normal text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh] scrollbar-hide">
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${cardData.color}18` }}
            >
              <span className="text-xl font-bold" style={{ color: cardData.color }}>
                {typeof cardData.value === "number" ? cardData.value : "—"}
              </span>
            </div>
            <p className="text-sm font-semibold text-text-primary">{cardData.label}</p>
            <p className="text-xs text-text-secondary max-w-xs">{cardData.subLabel}</p>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cardData.color }}
              />
              <span className="text-xs text-text-secondary">
                {cardData.value} {typeof cardData.value === "number" ? "records" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-border-accent bg-background flex items-center justify-between">
          <p className="text-xs text-text-secondary">
            Showing <span className="font-semibold text-text-primary">1</span> record
          </p>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
