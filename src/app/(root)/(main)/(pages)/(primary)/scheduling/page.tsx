"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { InlineLoading } from "@/src/app/loading";

export default function Page() {
  const router = useRouter();
  const { modules, isLoading } = useLanguage();

  useEffect(() => {
    if (isLoading) return;

    if (modules?.scheduling?.items?.[0]?.path) {
      router.replace(modules.scheduling.items[0].path);
    }
  }, [modules, isLoading, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <InlineLoading message="Loading scheduling..." />
      </div>
    </div>
  );
}