// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/src/components/ui/button";
// import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
// import { useLanguage } from "@/src/providers/LanguageProvider";
// import { cn } from "@/src/utils/utils";

// interface DataTablePaginationProps {
//   totalPages: number;
//   currentPage: number;
//   onPageChange: (page: number) => void;
// }

// export function PowerTablePagination({
//   totalPages,
//   currentPage,
//   onPageChange,
// }: DataTablePaginationProps) {
//   const [visiblePages, setVisiblePages] = useState<(number | string)[]>([]);
//   const { dir, language } = useLanguage();

//   useEffect(() => {
//     updateVisiblePages(currentPage);
//   }, [currentPage, totalPages]);

//   const updateVisiblePages = (center: number) => {
//     const newVisiblePages: (number | string)[] = [];
//     const maxVisiblePages = 7;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         newVisiblePages.push(i);
//       }
//     } else {
//       if (center <= 4) {
//         for (let i = 1; i <= 5; i++) {
//           newVisiblePages.push(i);
//         }
//         newVisiblePages.push("right");
//         newVisiblePages.push(totalPages);
//       } else if (center >= totalPages - 3) {
//         newVisiblePages.push(1);
//         newVisiblePages.push("left");
//         for (let i = totalPages - 4; i <= totalPages; i++) {
//           newVisiblePages.push(i);
//         }
//       } else {
//         newVisiblePages.push(1);
//         newVisiblePages.push("left");
//         for (let i = center - 1; i <= center + 1; i++) {
//           newVisiblePages.push(i);
//         }
//         newVisiblePages.push("right");
//         newVisiblePages.push(totalPages);
//       }
//     }

//     setVisiblePages(newVisiblePages);
//   };

//   const handleEllipsisClick = (direction: "left" | "right") => {
//     let newCenter: number;
//     if (direction === "left") {
//       newCenter = Math.max(4, currentPage - 3);
//     } else {
//       newCenter = Math.min(totalPages - 3, currentPage + 3);
//     }
//     updateVisiblePages(newCenter);
//     onPageChange(newCenter);
//   };

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       onPageChange(currentPage - 1);
//     }
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       onPageChange(currentPage + 1);
//     }
//   };

//   // Don't render pagination if there are no pages or only one page
//   if (totalPages <= 1) {
//     return null;
//   }

//   return (
//     <div className="flex items-center justify-center space-x-2">
//       <Button
//         className={cn(
//           `${dir === "rtl" && "rotate-180"}`,
//           "p-2 border-none outline-none rounded-[5px] h-6 w-6 flex justify-center items-center text-sm cursor-pointer bg-backdrop ml-2"
//         )}
//         variant="ghost"
//         size="pagination"
//         onClick={handlePreviousPage}
//         disabled={currentPage === 1}
//       >
//         <ChevronLeft className="h-4 w-4 text-secondary" />
//         <span className="sr-only">
//           {language === "ar" ? "الصفحة السابقة" : "Previous page"}
//         </span>
//       </Button>
      
//       <div className="flex space-x-1">
//         {visiblePages.map((pageNumber, index) => (
//           <Button
//             key={index}
//             variant={pageNumber === currentPage ? "default" : "ghost"}
//             size="pagination"
//             onClick={() => {
//               if (typeof pageNumber === "number") {
//                 onPageChange(pageNumber);
//               } else if (pageNumber === "left" || pageNumber === "right") {
//                 handleEllipsisClick(pageNumber);
//               }
//             }}
//             className={
//               pageNumber === currentPage ? "text-accent" : "text-secondary"
//             }
//           >
//             {typeof pageNumber === "number" ? (
//               pageNumber
//             ) : (
//               <MoreHorizontal className="h-4 w-4 text-secondary" />
//             )}
//           </Button>
//         ))}
//       </div>
      
//       <Button
//         className={cn(
//           `${dir === "rtl" && "rotate-180"}`,
//           "p-2 border-none outline-none rounded-[5px] h-6 w-6 flex justify-center items-center text-sm cursor-pointer bg-backdrop"
//         )}
//         variant="ghost"
//         size="pagination"
//         onClick={handleNextPage}
//         disabled={currentPage === totalPages}
//       >
//         <ChevronRight className="h-4 w-4 text-secondary" />
//         <span className="sr-only">
//           {language === "ar" ? "الصفحة التالية" : "Next page"}
//         </span>
//       </Button>
//     </div>
//   );
// }

"use client";

import { Button } from "@/src/components/ui/button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { cn } from "@/src/utils/utils";
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