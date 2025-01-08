import React from "react";
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/icons/icons";
import { useLanguage } from "@/providers/LanguageProvider";

export default function PowerDelete({ props }: { props: any }) {
  const { translations } = useLanguage();
  
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
        <span>{translations?.buttons.delete}</span>
      </Button>
    </div>
  );
}
