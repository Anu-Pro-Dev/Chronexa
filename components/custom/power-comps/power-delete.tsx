import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/icons/icons";
import React from "react";

export default function PowerDelete({ props }: { props: any }) {
  return (
    <div>
      <Button
        disabled={
          props?.SelectedKeys?.length === 0 || props?.SelectedKeys === undefined
        }
        variant={"destructive"}
        className="flex items-center space-y-0.5"
      >
        <DeleteIcon />
        <span>Delete</span>
      </Button>
    </div>
  );
}
