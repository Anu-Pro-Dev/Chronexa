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
  const { open } = useSidebar();

  const router = useRouter();
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu className={`${open && "ps-4"}`}>
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
                className={`hover:bg-transparent h-10  ${
                  pathname.startsWith(item?.path)
                    ? "bg-primary-50 rounded-md hover:bg-primary/20  text-primary hover:text-primary  "
                    : ""
                } ${!open && " ps-4"} `}
              >
                {item.icon && <item.icon className="" />}
                <span className="">{item.title}</span>
                {item.items && <ChevronRight className="" />}
              </SidebarMenuButton>

              {item.items && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item?.items?.map((subItem: any) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          href={subItem.url}
                          className={subItem.isActive ? "text-accent" : ""}
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
