import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/icons/icons";
import React from "react";

export default function PowerClear({ props }: { props: any }) {
  return (
    <div>
      <Button
        disabled={
          props?.SelectedKeys?.length === 0 || props?.SelectedKeys === undefined
        }
        variant={"destructive"}
        size={"sm"}
        className="flex items-center space-y-0.5"
      >
        <DeleteIcon />
        <span>Clear</span>
      </Button>
    </div>
  );
}
