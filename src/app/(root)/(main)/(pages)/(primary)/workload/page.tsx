"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { InlineLoading } from "@/src/app/loading";

export default function Page() {
  const router = useRouter();
  const { privilegeMap, isLoading } = usePrivileges();

  useEffect(() => {
    if (isLoading) return;

    const workloadKey = Object.keys(privilegeMap || {}).find(
      (k) => k.toLowerCase() === "workload"
    );
    const workloadModule = workloadKey ? privilegeMap[workloadKey] : null;

    if (!workloadModule || workloadModule.allowed === false) {
      router.replace("/no-access");
      return;
    }

    const subModules = workloadModule.subModules || [];

    const isSubAllowed = (sm: any) =>
      sm.allowed !== false && sm.privileges?.view !== false && sm.hasView !== false;

    const projLocSub = subModules.find(
      (sm: any) => sm.path === "project-location" || sm.sub_module_name?.toLowerCase().includes("project location")
    );
    const userMapSub = subModules.find(
      (sm: any) => sm.path === "user-mapping" || sm.sub_module_name?.toLowerCase().includes("user mapping")
    );
    const costCenterSub = subModules.find(
      (sm: any) =>
        sm.path === "cost-center-location" ||
        sm.path === "cost-code-master" ||
        sm.sub_module_name?.toLowerCase().includes("cost center") ||
        sm.sub_module_name?.toLowerCase().includes("cost code")
    );

    if (projLocSub && isSubAllowed(projLocSub)) {
      router.replace("/workload/project-location/");
    } else if (userMapSub && isSubAllowed(userMapSub)) {
      router.replace("/workload/user-mapping/");
    } else if (costCenterSub && isSubAllowed(costCenterSub)) {
      router.replace("/workload/cost-center-location/");
    } else {
      const firstAllowed = subModules.find(isSubAllowed);
      if (firstAllowed) {
        router.replace(`/workload/${firstAllowed.path}/`);
      } else {
        router.replace("/no-access");
      }
    }
  }, [privilegeMap, isLoading, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <InlineLoading message="Loading..." />
      </div>
    </div>
  );
}
