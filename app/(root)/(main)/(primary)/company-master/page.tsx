import { company_master } from "@/lib/routes";
import { redirect } from "next/navigation";
import React from "react";

export default function CompanyMaster() {
  return redirect(company_master.items[0].path);
}
