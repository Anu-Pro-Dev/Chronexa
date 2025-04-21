"use client";

import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: any;
}

export function PowerTablePagination({
  totalPages,
  currentPage,
  onPageChange,
}: DataTablePaginationProps) {
  const [visiblePages, setVisiblePages] = useState<(number | string)[]>([]);

  useEffect(() => {
    updateVisiblePages(currentPage);
  }, [currentPage, totalPages]);

  const updateVisiblePages = (center: number) => {
    const newVisiblePages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        newVisiblePages.push(i);
      }
    } else {
      if (center <= 4) {
        for (let i = 1; i <= 5; i++) {
          newVisiblePages.push(i);
        }
        newVisiblePages.push("right");
        newVisiblePages.push(totalPages);
      } else if (center >= totalPages - 3) {
        newVisiblePages.push(1);
        newVisiblePages.push("left");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          newVisiblePages.push(i);
        }
      } else {
        newVisiblePages.push(1);
        newVisiblePages.push("left");
        for (let i = center - 1; i <= center + 1; i++) {
          newVisiblePages.push(i);
        }
        newVisiblePages.push("right");
        newVisiblePages.push(totalPages);
      }
    }

    setVisiblePages(newVisiblePages);
  };

  const handleEllipsisClick = (direction: "left" | "right") => {
    let newCenter: number;
    if (direction === "left") {
      newCenter = Math.max(4, currentPage - 3);
    } else {
      newCenter = Math.min(totalPages - 3, currentPage + 3);
    }
    updateVisiblePages(newCenter);
    onPageChange(newCenter);
  };
  const { dir } = useLanguage();
  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        className={cn(
          `${dir === "rtl" && "rotate-180"}`,
          "p-2 border-none outline-none rounded-[5px] h-6 w-6 flex justify-center items-center text-sm cursor-pointer bg-backdrop ml-2"
        )}
        variant="ghost"
        size="pagination"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4 text-secondary" />
        <span className="sr-only">Previous page</span>
      </Button>
      <div className="flex space-x-1">
        {visiblePages.map((pageNumber, index) => (
          <Button
            key={index}
            variant={pageNumber === currentPage ? "default" : "ghost"}
            size="pagination"
            onClick={() => {
              if (typeof pageNumber === "number") {
                onPageChange(pageNumber);
              } else if (pageNumber === "left" || pageNumber === "right") {
                handleEllipsisClick(pageNumber);
              }
            }}
            className={
              pageNumber === currentPage ? "text-accent" : "text-secondary"
            }
          >
            {typeof pageNumber === "number" ? (
              pageNumber
            ) : (
              <MoreHorizontal className="h-4 w-4 text-secondary" />
            )}
          </Button>
        ))}
      </div>
      <Button
        className={cn(
          `${dir === "rtl" && "rotate-180"}`,
          "p-2 border-none outline-none rounded-[5px] h-6 w-6 flex justify-center items-center text-sm cursor-pointer bg-backdrop"
        )}
        variant="ghost"
        size="pagination"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4 text-secondary" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
}
