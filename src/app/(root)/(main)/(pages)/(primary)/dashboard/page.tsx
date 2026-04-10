"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/providers/LanguageProvider";

export default function Page() {
  const router = useRouter();
  const { modules } = useLanguage();

  useEffect(() => {
    const path = modules?.dashboard?.items?.[0]?.path;
    if (path) {
      router.replace(path);
    }
  }, [modules, router]);

  // Show nothing while redirecting — the layout already has the sidebar/navbar
  return null;
}