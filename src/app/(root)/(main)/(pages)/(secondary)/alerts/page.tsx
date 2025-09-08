"use client";

import { useLanguage } from "@/src/providers/LanguageProvider";
import { redirect } from "next/navigation";

export default function Page() {
  const { modules } = useLanguage();
  return redirect(modules?.alerts.items[0].path);
}