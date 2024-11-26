
import { alerts } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function Page() {
  return redirect(alerts.items[0].path);
}
