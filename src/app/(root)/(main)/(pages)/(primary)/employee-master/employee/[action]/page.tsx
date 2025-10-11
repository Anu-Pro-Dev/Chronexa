"use client";

import { useParams, useSearchParams } from "next/navigation";
import EmployeeOnboardingPage from "../EmployeeOnboardingPage";

export default function EmployeeActionPage() {
  const params = useParams();
  const action = (params as { action?: string })?.action ?? "add";

  const searchParams = useSearchParams();
  const id = searchParams?.get("id") ?? null;

  const mode = action === "edit" ? "edit" : "add";

  return <EmployeeOnboardingPage mode={mode} id={id} />;
}
