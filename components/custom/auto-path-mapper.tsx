"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import React from "react";

export default function AutoPathMapper() {
  const { translations } = useLanguage();
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "";

  // const formatSegment = (segment: string) => {
  //   const formatted = segment
  //     .split("-")
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(" ");

  //   return translations[formatted] || formatted;
  // };

  const formatSegment = (segment: string) => {
    const lowerSegment = segment.toLowerCase();
  
    if (translations.navbar?.primary?.[lowerSegment]) {
      return translations.navbar.primary[lowerSegment];
    }
  
    if (translations.navbar?.secondary?.[lowerSegment]) {
      return translations.navbar.secondary[lowerSegment];
    }
  
    if (translations.modules?.[lowerSegment]) {
      return translations.modules[lowerSegment];
    }
  
    for (const moduleKey in translations.modules) {
      if (translations.modules[moduleKey]?.[lowerSegment]) {
        return translations.modules[moduleKey][lowerSegment];
      }
    }
  
    return lowerSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  return (
    <div className="select-none">
      <Breadcrumb>
        <BreadcrumbList>
          {pathSegments.map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 1).join("/");
            const isLast = index === pathSegments.length - 1;

            return (
              <React.Fragment key={href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href} aria-label={`Navigate to ${formatSegment(segment)}`}>
                        {formatSegment(segment)}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}

          {name && <BreadcrumbSeparator />}
          {name && (
            <BreadcrumbItem>
              <BreadcrumbPage>{translations[name] || name}</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

