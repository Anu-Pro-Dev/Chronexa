"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { createTabPathMapper, getTabLabel } from "@/src/utils/tabPathMapper";

export default function PowerTabs() {
  const { privilegeMap } = usePrivileges();
  const { translations } = useLanguage();
  const pathname = usePathname();

  const normalize = (str: string) => str.replace(/\s+/g, "-").toLowerCase();

  const getTabPath = useMemo(
    () => createTabPathMapper(translations),
    [translations]
  );

  const [firstSegment, secondSegment] = pathname.split("/").slice(1, 3);
  
  const activeModuleKey = useMemo(
    () =>
      Object.keys(privilegeMap || {}).find(
        (moduleKey) => normalize(moduleKey) === firstSegment
      ),
    [firstSegment, privilegeMap]
  );

  const activeModule = activeModuleKey ? privilegeMap[activeModuleKey] : null;

  const activeSubmodule = useMemo(
    () =>
      activeModule?.subModules?.find(
        (sm) => normalize(sm.sub_module_name) === secondSegment
      ),
    [activeModule, secondSegment]
  );

  const allowedTabs = useMemo(
    () =>
      activeSubmodule?.tabs
        ?.filter((t) => t.hasView)
        .map((t) => ({
          url: `/${normalize(activeModuleKey!)}/${normalize(
            activeSubmodule.sub_module_name
          )}/${getTabPath(t.tab_name)}`,
          label: getTabLabel(t.tab_name, translations),
        })) ?? [],
    [activeModuleKey, activeSubmodule, getTabPath, translations]
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