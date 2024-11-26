import { organization } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function Page() {
  return redirect(organization.items[0].path);
}
