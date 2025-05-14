"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  title: string;
  url: string;
  icon?: any;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    path: any;
    isActive?: boolean;
  }[];
};

export function NavMain({ items, title }: { title: string; items: NavItem[] }) {
  const { open, isMobile } = useSidebar();

  const router = useRouter();
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel isMobile={isMobile}>{title}</SidebarGroupLabel>
      <SidebarMenu className={`${open && ""} ${!isMobile && ""}`}>
        {items?.map((item: any) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  router.push(item?.url);
                }}
                tooltip={item.title}
                className={`hover:bg-backdrop hover:text-primary h-10  ${
                  pathname.startsWith(item?.path)
                    ? "bg-backdrop rounded-full hover:bg-backdrop text-primary hover:text-primary"
                    : ""
                } ${!open && "rounded-lg"} ${isMobile && "rounded-lg pl-2 h-8"}`}
              >
                {item.icon && <item.icon className="" />}
                <span className="text-sm font-medium">{item.title}</span>
                {item.items && <ChevronRight className="" />}
              </SidebarMenuButton>

              {item.items && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item?.items?.map((subItem: any) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          href={subItem.url}
                          className={subItem.isActive ? "text-success" : ""}
                        >
                          {subItem.title}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
