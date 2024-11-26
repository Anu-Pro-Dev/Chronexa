import { Button } from "@/components/ui/button";
import { ExportIcon } from "@/icons/icons";
import { DownloadCloudIcon } from "lucide-react";
import React from "react";

export default function PowerExport() {
  return (
    <div>
      <Button className="flex items-center space-y-0.5">
        <DownloadCloudIcon />
        <span>Export</span>
      </Button>
    </div>
  );
}
