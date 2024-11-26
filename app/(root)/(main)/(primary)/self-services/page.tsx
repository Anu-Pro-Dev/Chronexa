import { self_services } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function Page() {
  return redirect(self_services.items[0].path);
}
