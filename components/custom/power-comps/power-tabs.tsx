"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function PowerTabs({ items }: { items: any }) {
  const pathname = usePathname();
  console.log(pathname)
  return (
    <div>
      <div className="flex gap-10 items-center border-b pb-2">
        {items?.map((item: any, index: number) => (
          <Link
            key={index}
            href={item?.url || ""}
            className={
              item?.url?.startsWith(pathname)
                ? "text-primary text-base underline underline-offset-[14px] font-bold"
                : "text-text-secondary font-medium"
            }
          >
            {item?.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
