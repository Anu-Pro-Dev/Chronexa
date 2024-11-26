import { employee_master } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function Page() {
  return redirect(employee_master.items[0].path);
}
