import { Button } from "@/components/ui/button";
import { AddIcon } from "@/icons/icons";
import React from "react";

export default function PowerAdd() {
  return (
    <div>
      <Button variant={"success"} className="flex items-center space-y-0.5">
        <AddIcon />
        <span>Add</span>
      </Button>
    </div>
  );
}
