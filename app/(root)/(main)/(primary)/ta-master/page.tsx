
import { ta_master } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function Page() {
  return redirect(ta_master.items[0].path);
}
