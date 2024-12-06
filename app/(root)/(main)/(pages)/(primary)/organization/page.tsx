
import { redirect } from "next/navigation";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  return redirect(modules?.organization.items[0].path);
}
