import React from "react";
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/icons/icons";
import { useLanguage } from "@/providers/LanguageProvider";

export default function PowerDelete({ props, label }: { props: any, label: string }) {
  const { translations } = useLanguage();
  
  return (
    <div>
      <Button
        disabled={
          props?.selectedRows?.length === 0 || props?.selectedRows === undefined
        }
        variant={"destructive"}
        size={"sm"}
        className="flex items-center space-y-0.5"
      >
        <DeleteIcon />
        <span>{label}</span>
      </Button>
    </div>
  );
}
