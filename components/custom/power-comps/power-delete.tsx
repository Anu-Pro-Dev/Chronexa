import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/icons/icons";
import React from "react";

export default function PowerDelete() {
  return (
    <div>
      <Button variant={"destructive"} className="flex items-center space-y-0.5">
        <DeleteIcon />
        <span>Delete</span>
      </Button>
    </div>
  );
}
