import React from "react";
import { Button } from "@/src/components/ui/button";
import { DeleteIcon } from "@/src/icons/icons";
import { useLanguage } from "@/src/providers/LanguageProvider";

export default function PowerDelete({ props, label, onClick }: { props: any, label: string, onClick: () => Promise<void>; }) {
  const { translations } = useLanguage();
  
  return (
    <div>
      <Button
        variant={"destructive"}
        size={"sm"}
        className="flex items-center space-y-0.5"
        onClick={onClick}
      >
        <DeleteIcon />
        <span>{label}</span>
      </Button>
    </div>
  );
}
