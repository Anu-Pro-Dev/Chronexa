"use client";
import { redirect } from "next/navigation";
import { useLanguage } from "@/src/providers/LanguageProvider";

export default function Page() {
  const { modules } = useLanguage();
  const firstPath = modules?.workload?.items?.[0]?.path || "/workload/project-location/";
  return redirect(firstPath);
}
