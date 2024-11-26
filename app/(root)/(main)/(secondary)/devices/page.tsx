import { devices } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function Page() {
  return redirect(devices.items[0].path);
}
