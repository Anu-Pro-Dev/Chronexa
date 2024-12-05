import { redirect } from "next/navigation";
import React from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  return redirect(modules?.security.items[0].path);
}
