import { settings } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function Page() {
  return redirect(settings.items[0].path);
}
