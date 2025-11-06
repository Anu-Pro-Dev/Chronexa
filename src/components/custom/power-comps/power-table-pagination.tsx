"use client";

import { Button } from "@/src/components/ui/button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { cn } from "@/src/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PowerTablePaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function PowerTablePagination({
  totalPages,
  currentPage,
  onPageChange,
}: PowerTablePaginationProps) {
  const { dir, language } = useLanguage();

  if (totalPages <= 1) return null;

  const isRTL = dir === "rtl";

  return (
    <div className="flex items-center justify-center gap-3 cursor-default">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn("h-6 w-6 p-0 text-secondary bg-backdrop", isRTL && "rotate-180")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm text-secondary min-w-0 whitespace-nowrap">
        {language === "ar" 
          ? `${currentPage} من ${totalPages}`
          : `${currentPage} / ${totalPages}`
        }
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn("h-6 w-6 p-0 text-secondary bg-backdrop", isRTL && "rotate-180")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}