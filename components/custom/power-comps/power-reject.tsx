import React from "react";
import { Button } from "@/components/ui/button";import { ExportExcelIcon } from "@/icons/icons";
import { useLanguage } from "@/providers/LanguageProvider";

export default function PowerReject({ props }: { props: any }) {
  const { translations } = useLanguage();

  return (
    <div>
      <Button
        className="flex items-center space-y-0.5"
        size={"sm"}
        variant={"destructive"}
      >
        <span>{translations?.buttons.reject}</span>
      </Button>
    </div>
  );
}
