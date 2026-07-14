"use client";
import React, { useMemo, useState } from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import {
  Eye,
  Plus,
  Pencil,
  Trash2,
  Users,
  ShieldCheck,
  Crown,
  UserCog,
  User,
  Briefcase,
  Wallet,
  Building2,
  Clock,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * Read-only role-based privileges view.
 * Lists roles (secRole/all); expanding a role fetches secRolePrivilege?roleId=<id>
 * and shows ONLY the granted privileges. Ungranted permissions are not shown.
 */

// Pick a relevant icon based on the role name (case-insensitive keyword match).
function iconForRole(roleName: string): LucideIcon {
  const n = (roleName || "").toLowerCase();
  if (n.includes("admin")) return Crown;
  if (n.includes("manager")) return UserCog;
  if (n.includes("employee")) return User;
  if (n.includes("hr")) return Briefcase;
  if (n.includes("payroll")) return Wallet;
  if (n.includes("timekeeper") || n.includes("time")) return Clock;
  if (n.includes("cxo") || n.includes("spark") || n.includes("access")) return ShieldCheck;
  if (n.includes("basatin") || n.includes("org") || n.includes("accomodation") || n.includes("accommodation"))
    return Building2;
  return UserCircle;
}

const permissionMeta: Record<
  string,
  { label: string; icon: LucideIcon; className: string }
> = {
  view: { label: "View", icon: Eye, className: "bg-blue-50 text-blue-700" },
  create: { label: "Create", icon: Plus, className: "bg-emerald-50 text-emerald-700" },
  edit: { label: "Edit", icon: Pencil, className: "bg-amber-50 text-amber-700" },
  delete: { label: "Delete", icon: Trash2, className: "bg-rose-50 text-rose-700" },
};

const permissionOrder = ["view", "create", "edit", "delete"] as const;

// Soft corner-tinted gradient themes (screenshot-2 style). One per module,
// assigned deterministically by index so a module's color stays stable.
const cardThemes: { gradient: string }[] = [
  { gradient: "from-blue-100/70 via-white to-white dark:from-blue-950/30 dark:via-card dark:to-card" },
  { gradient: "from-rose-100/70 via-white to-white dark:from-rose-950/30 dark:via-card dark:to-card" },
  { gradient: "from-emerald-100/70 via-white to-white dark:from-emerald-950/30 dark:via-card dark:to-card" },
  { gradient: "from-amber-100/70 via-white to-white dark:from-amber-950/30 dark:via-card dark:to-card" },
  { gradient: "from-violet-100/70 via-white to-white dark:from-violet-950/30 dark:via-card dark:to-card" },
  { gradient: "from-cyan-100/70 via-white to-white dark:from-cyan-950/30 dark:via-card dark:to-card" },
  { gradient: "from-fuchsia-100/70 via-white to-white dark:from-fuchsia-950/30 dark:via-card dark:to-card" },
  { gradient: "from-lime-100/70 via-white to-white dark:from-lime-950/30 dark:via-card dark:to-card" },
  { gradient: "from-orange-100/70 via-white to-white dark:from-orange-950/30 dark:via-card dark:to-card" },
  { gradient: "from-teal-100/70 via-white to-white dark:from-teal-950/30 dark:via-card dark:to-card" },
  { gradient: "from-indigo-100/70 via-white to-white dark:from-indigo-950/30 dark:via-card dark:to-card" },
  { gradient: "from-pink-100/70 via-white to-white dark:from-pink-950/30 dark:via-card dark:to-card" },
];

function PermissionPill({ perm }: { perm: string }) {
  const meta = permissionMeta[perm];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function grantedPerms(privileges: any): string[] {
  if (!privileges) return [];
  return permissionOrder.filter((p) => privileges[p] === true);
}

function RolePrivilegeMatrix({ roleId }: { roleId: number }) {
  const { translations } = useLanguage();
  const t = translations?.modules?.configurations || {};

  const { data, isLoading, isError } = useFetchAllEntity("secRolePrivilege", {
    endpoint: `/secRolePrivilege?roleId=${roleId}`,
  });

  const modules = useMemo(() => {
    const raw = data?.data;
    if (!raw || typeof raw !== "object") return [];
    return Object.entries(raw)
      .map(([moduleName, moduleData]: [string, any]) => {
        const subModules = (Array.isArray(moduleData?.subModules) ? moduleData.subModules : [])
          .map((sub: any) => {
            const subPerms = grantedPerms(sub?.privileges);
            const tabs = (Array.isArray(sub?.tabs) ? sub.tabs : [])
              .map((tab: any) => ({
                name: tab?.tab_name,
                perms: grantedPerms(tab?.privileges),
              }))
              .filter((tab: any) => tab.perms.length > 0);
            return { name: sub?.sub_module_name, perms: subPerms, tabs };
          })
          .filter((sub: any) => sub.perms.length > 0 || sub.tabs.length > 0);
        return { moduleName, subModules };
      })
      .filter((mod) => mod.subModules.length > 0);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive py-4">
        {t.load_privileges_error || "Failed to load privileges for this role."}
      </p>
    );
  }

  if (modules.length === 0) {
    return (
      <p className="text-sm text-secondary py-4">
        {t.no_privileges || "No privileges assigned to this role."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((mod, idx) => {
        const theme = cardThemes[idx % cardThemes.length];
        return (
          <div
            key={mod.moduleName}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} p-5 shadow-[0_2px_14px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)]`}
          >
            <h3 className="mb-4 text-base font-bold capitalize text-text-content">
              {mod.moduleName}
            </h3>

            <div className="flex flex-col gap-2.5">
              {mod.subModules.map((sub: any) => (
                <div
                  key={sub.name}
                  className="rounded-lg bg-white/60 px-3 py-2 backdrop-blur-sm dark:bg-white/5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      {sub.name}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sub.perms.map((p: string) => (
                        <PermissionPill key={p} perm={p} />
                      ))}
                    </div>
                  </div>

                  {sub.tabs.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5 border-t border-black/5 pt-2 dark:border-white/10">
                      {sub.tabs.map((tab: any) => (
                        <div
                          key={tab.name}
                          className="flex flex-wrap items-center justify-between gap-2 pl-3"
                        >
                          <span className="text-xs text-secondary">↳ {tab.name}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {tab.perms.map((p: string) => (
                              <PermissionPill key={p} perm={p} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Page() {
  const { modules, translations } = useLanguage();
  const t = translations?.modules?.configurations || {};

  const [rowsPerPage] = useState<number>(50);

  const { data: rolesData, isLoading } = useFetchAllEntity("secRole", {
    searchParams: { limit: String(rowsPerPage), offset: "1" },
  });

  const roles = useMemo(() => {
    if (Array.isArray(rolesData?.data)) return rolesData.data;
    return [];
  }, [rolesData]);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader disableFeatures items={modules?.configuration?.items} />

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : roles.length === 0 ? (
        <p className="text-sm text-secondary py-6">
          {t.no_roles || "No roles found."}
        </p>
      ) : (
        <Accordion type="multiple" className="flex flex-col gap-3">
          {roles.map((role: any) => {
            const RoleIcon = iconForRole(role.role_name);
            return (
              <AccordionItem
                key={role.role_id}
                value={String(role.role_id)}
                className="overflow-hidden rounded-xl bg-accent shadow-sm"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex w-full items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <RoleIcon className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold capitalize text-text-content">
                        {role.role_name}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-normal text-secondary">
                        <Users className="h-3 w-3" />
                        {role?._count?.sec_user_roles ?? 0} {t.users || "Users"}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-0 border-border-grey bg-fullpage px-4 py-4">
                  <RolePrivilegeMatrix roleId={role.role_id} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}