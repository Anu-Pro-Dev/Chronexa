import { dashboard } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function CompanyMaster() {
  return redirect(dashboard.items[0].path);
}
