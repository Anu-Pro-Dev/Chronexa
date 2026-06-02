"use client";
import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation } from "@tanstack/react-query";
import { useShowToast } from "@/src/utils/toastHelper";
import { licenseActivateRequest } from "@/src/lib/apiHandler";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/ui/responsive-modal";

export default function ActivateLicenseModal({
  open,
  onOpenChange,
  licenseId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licenseId: number | null;
  onSuccess: () => void;
}) {
  const { translations } = useLanguage();
  const [keyValue, setKeyValue] = useState("");
  const [keyError, setKeyError] = useState("");
  const showToast = useShowToast();
  const btnT = translations?.buttons || {};

  const keyPattern = /^[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}$/;

  const activateMutation = useMutation({
    mutationFn: () => licenseActivateRequest(licenseId!, keyValue),
    onSuccess: () => {
      showToast("success", "License activated successfully");
      setKeyValue("");
      setKeyError("");
      onOpenChange(false);
      onSuccess();
    },
    onError: () => {
      showToast("error", "Failed to activate license");
    },
  });

  const handleActivate = () => {
    if (!licenseId || !keyValue.trim()) return;
    if (!keyPattern.test(keyValue)) {
      setKeyError("Invalid key format. Use XXXX-XXXX-XXXX-XXXX");
      return;
    }
    setKeyError("");
    activateMutation.mutate();
  };

  const handleCancel = () => {
    setKeyValue("");
    setKeyError("");
    onOpenChange(false);
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-fA-F0-9]/g, "").toUpperCase().slice(0, 16);
    let formatted = "";
    for (let i = 0; i < raw.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += "-";
      formatted += raw[i];
    }
    setKeyValue(formatted);
    if (keyError) setKeyError("");
  };

  return (
    <ResponsiveModal open={open} onOpenChange={handleCancel}>
      <ResponsiveModalContent size="medium">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Activate License</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <div className="flex flex-col gap-4 mt-5">
          <div>
            <Label className="capitalize">License Key <Required /></Label>
            <Input
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={keyValue}
              onChange={handleKeyChange}
              className="mt-1 bg-background font-mono tracking-wider uppercase"
            />
            {keyError && (
              <p className="text-xs text-destructive mt-1">{keyError}</p>
            )}
          </div>
          <div className="w-full flex gap-2 items-center pt-4">
            <Button
              variant="outline"
              type="button"
              size="lg"
              className="w-full"
              onClick={handleCancel}
            >
              {btnT?.cancel || "Cancel"}
            </Button>
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={!keyValue.trim() || activateMutation.isPending}
              onClick={handleActivate}
            >
              {activateMutation.isPending ? "Activating..." : "Activate"}
            </Button>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
