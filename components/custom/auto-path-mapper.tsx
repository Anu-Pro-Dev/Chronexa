"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function AutoPathMapper() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment: any) => segment);
  const formatSegment = (segment: string) => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const searchParams = useSearchParams();
  const name: any = searchParams.get("name") || "";
  const router = useRouter();
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
                  <span
                    className="cursor-pointer"
                    onClick={() => {
                      if (index < 2) {
                        router.push(href);
                      }
                    }}
                  >
                    {formatSegment(segment)}
                  </span>
                </BreadcrumbItem>

                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
          {name && <BreadcrumbSeparator />}
          {name && (
            <BreadcrumbItem className="cursor-pointer">{name}</BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
