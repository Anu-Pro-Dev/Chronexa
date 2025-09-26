// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React from "react";

// export default function PowerTabs({ items }: { items: any }) {
//   const pathname = usePathname();
  
//   return (
//     <div>
//       <div className="flex gap-20 items-center border-b pb-2">
//         {items?.map((item: any, index: number) => {
//           // Better active tab detection
//           const isActiveTab = pathname === item?.url || 
//                             (pathname + '/').startsWith(item?.url + '/') ||
//                             pathname.startsWith(item?.url.replace(/\/$/, ''));

//           return (
//             <Link
//               key={index}
//               href={item?.url || ""}
//               className={
//                 isActiveTab
//                   ? "text-primary text-base underline underline-offset-[14px] font-bold"
//                   : "text-text-secondary font-medium hover:text-primary transition-colors duration-200"
//               }
//             >
//               {item?.label}
//             </Link>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";

export default function PowerTabs() {
  const { privilegeMap } = usePrivileges();
  const pathname = usePathname();

  // --- 🔑 RBAC helpers ---
  const normalize = (str: string) => str.replace(/\s+/g, "-").toLowerCase();

  // Extract path segments
  const [firstSegment, secondSegment] = pathname.split("/").slice(1, 3); // [module, submodule]

  // Find active module key in privilegeMap
  const activeModuleKey = useMemo(
    () =>
      Object.keys(privilegeMap || {}).find(
        (moduleKey) => normalize(moduleKey) === firstSegment
      ),
    [firstSegment, privilegeMap]
  );

  const activeModule = activeModuleKey ? privilegeMap[activeModuleKey] : null;

  // Find active submodule
  const activeSubmodule = useMemo(
    () =>
      activeModule?.subModules?.find(
        (sm) => normalize(sm.sub_module_name) === secondSegment
      ),
    [activeModule, secondSegment]
  );

  // Only keep allowed tabs and build URLs
  const allowedTabs = useMemo(
    () =>
      activeSubmodule?.tabs
        ?.filter((t) => t.allowed)
        .map((t) => ({
          url: `/${normalize(activeModuleKey!)}/${normalize(
            activeSubmodule.sub_module_name
          )}/${normalize(t.tab_name)}`,
          label: t.tab_name,
        })) ?? [],
    [activeModuleKey, activeSubmodule]
  );

  return (
    <div>
      <div className="flex gap-20 items-center border-b pb-2">
        {allowedTabs.map((tab, index) => {
          const isActiveTab =
            pathname === tab.url ||
            (pathname + "/").startsWith(tab.url + "/") ||
            pathname.startsWith(tab.url.replace(/\/$/, ""));

          return (
            <Link
              key={index}
              href={tab.url}
              className={
                isActiveTab
                  ? "text-primary text-base underline underline-offset-[14px] font-bold"
                  : "text-text-secondary font-medium hover:text-primary transition-colors duration-200"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}