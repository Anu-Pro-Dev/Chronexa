// "use client";
// import { redirect } from "next/navigation";
// import { useLanguage } from "@/src/providers/LanguageProvider";

// export default function Page() {
//   const { modules } = useLanguage();
//   return redirect("/self-services/permissions/manage/")
// }
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import Lottie from "lottie-react";
import loadingAnimation from "@/src/animations/hourglass-blue.json";

export default function PermissionsRedirectPage() {
  const router = useRouter();
  const { privilegeMap, isLoading } = usePrivileges();

  // Special mapping for tab names to actual file paths
  const tabPathMapping: Record<string, string> = {
    'My Request': 'my-request',
    'Team Request': 'team-request', 
    'Manage': 'manage',
  };

  useEffect(() => {
    if (isLoading) return;

    // Find Self Services module
    const selfServicesModule = privilegeMap?.['Self Services'];
    if (!selfServicesModule?.allowed) {
      // If no access to Self Services, redirect to dashboard
      router.replace('/dashboard/my-attendance');
      return;
    }

    // Find permissions submodule
    const permissionsSubmodule = selfServicesModule.subModules?.find(
      (sm: any) => sm.path === 'permissions'
    );

    if (!permissionsSubmodule?.allowed) {
      // If no access to permissions, redirect to first allowed submodule in Self Services
      const firstAllowedSubmodule = selfServicesModule.subModules?.find(
        (sm: any) => sm.allowed
      );
      if (firstAllowedSubmodule) {
        router.replace(`/self-services/${firstAllowedSubmodule.path}`);
      } else {
        router.replace('/dashboard/my-attendance');
      }
      return;
    }

    // Find first allowed tab in permissions
    const firstAllowedTab = permissionsSubmodule.tabs?.find((tab: any) => tab.allowed);
    
    if (firstAllowedTab) {
      // Redirect to first allowed tab
      const actualPath = tabPathMapping[firstAllowedTab.tab_name] || 
                         firstAllowedTab.tab_name.toLowerCase().replace(/\s+/g, "-");
      
      console.log("Permissions - Redirecting to tab:", firstAllowedTab.tab_name, "->", actualPath);
      router.replace(`/self-services/permissions/${actualPath}`);
    } else {
      // No tabs allowed, redirect to another allowed submodule
      const firstAllowedSubmodule = selfServicesModule.subModules?.find(
        (sm: any) => sm.allowed && sm.path !== 'permissions'
      );
      if (firstAllowedSubmodule) {
        router.replace(`/self-services/${firstAllowedSubmodule.path}`);
      } else {
        router.replace('/dashboard/my-attendance');
      }
    }
  }, [privilegeMap, isLoading, router]);

  // Show loading while determining redirect
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div style={{ width: 50 }} className="mx-auto mb-4">
          <Lottie animationData={loadingAnimation} loop={true} />
        </div>
        <p className="text-text-secondary">Loading permissions...</p>
      </div>
    </div>
  );
}