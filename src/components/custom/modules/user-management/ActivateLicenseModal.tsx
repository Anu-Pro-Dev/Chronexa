"use client";
import { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import Required from "@/src/components/ui/required";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useMutation } from "@tanstack/react-query";
import { useShowToast } from "@/src/utils/toastHelper";
import { licenseActivateRequest, getLicenseByUserId } from "@/src/lib/apiHandler";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/ui/responsive-modal";

export default function ActivateLicenseModal({
  open,
  onOpenChange,
  userId,
  onSuccess,
  isAdLicense = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
  onSuccess: () => void;
  isAdLicense?: boolean;
}) {
  const { translations } = useLanguage();
  const [keyValue, setKeyValue] = useState("");
  const [keyError, setKeyError] = useState("");
  const [licenseId, setLicenseId] = useState<number | null>(null);
  const [resolving, setResolving] = useState(false);
  const showToast = useShowToast();
  const btnT = translations?.buttons || {};

  const keyPattern = /^[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}$/;

  // Resolve the license record fresh every time the modal opens for a user,
  // instead of relying on a possibly-paginated/stale client-side list.
  useEffect(() => {
    if (!open || !userId) {
      setLicenseId(null);
      return;
    }

    let cancelled = false;
    setResolving(true);

    getLicenseByUserId(userId, isAdLicense)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        // Prefer the license currently marked in_use; fall back to the first one.
        const target = list.find((lic: any) => lic.in_use) ?? list[0] ?? null;
        setLicenseId(target?.id ?? null);
        if (!target?.id) {
          showToast("error", "No license record found for this user");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setLicenseId(null);
        showToast("error", "Failed to load license for this user");
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, userId, isAdLicense, showToast]);

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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleActivate();
                }
              }}
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
              disabled={!keyValue.trim() || !licenseId || resolving || activateMutation.isPending}
              onClick={handleActivate}
            >
              {resolving ? "Loading..." : activateMutation.isPending ? "Activating..." : "Activate"}
            </Button>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}