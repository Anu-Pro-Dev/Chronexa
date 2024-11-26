import { reports } from "@/lib/routes";
import { redirect } from "next/navigation";


export default function Page() {
  return redirect(reports.items[0].path);
}
