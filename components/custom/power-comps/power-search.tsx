"use client";
import { Input } from "@/components/ui/input";
import React from "react";

export default function PowerSearch({ props }: { props: any }) {
  return (
    <div>
      <Input
        className="w-80"
        type="search"
        placeholder={"Search ..."}
        value={props?.SearchValue}
        onChange={(e: any) => {
          props?.SetSearchValue(e.target.value);
        }}
      />
    </div>
  );
}
