"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function PowerShifter({ items }: { items: any }) {
  const router = useRouter();
  console.log(items);
  const pathname = usePathname();
  return (
    <div>
      <Select
        onValueChange={(value) => {
          router.push(value);
        }}
        value={pathname}
      >
        <SelectTrigger className="min-w-20 w-fit gap-2 ps-0 border-none shadow-none">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          {items?.map((item: any, index: number) => (
            <SelectItem
              onClick={() => {
                router.push(item?.path);
              }}
              key={index}
              value={item?.path}
            >
              {item?.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
