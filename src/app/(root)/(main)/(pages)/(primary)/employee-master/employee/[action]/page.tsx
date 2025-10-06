"use client";
import { useParams, useSearchParams } from "next/navigation";
import ScheduleFormPage from "../EmployeeOnboardingPage";

export default function ScheduleActionPage() {
  const { action } = useParams<{ action: string }>();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const mode = action === "edit" ? "edit" : "add";

  return <ScheduleFormPage mode={mode} id={id} />;
}