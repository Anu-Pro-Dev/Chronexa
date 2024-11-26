
import { scheduling } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function Page() {
  return redirect(scheduling.items[0].path);
}
