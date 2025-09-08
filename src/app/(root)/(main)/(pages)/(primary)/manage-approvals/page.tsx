"use client"

import { redirect } from "next/navigation";

import { useLanguage } from "@/src/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  return redirect(modules?.manageApprovals.items[0].path);
}
