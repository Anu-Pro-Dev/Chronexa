"use client";
// import { ChevronsUpDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { USER_TOKEN } from "@/lib/Instance";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/utils";
import { DropDownIcon, LogoutIcon, UserPasswordIcon } from "@/icons/icons";

export function NavUser({}: {}) {
  const { isMobile } = useSidebar();
  const user = {
    name: "Musfiq",
    email: "Admin",
  };
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex gap-3 items-center outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          // className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent focus:bg-transparent"
        >
          <Avatar className="w-12 h-12 rounded-lg bg-backdrop flex justify-center items-center">
            <AvatarImage alt={user.name} />
            <AvatarFallback className="text-primary font-semibold text-xl">
              {user.name?.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-base font-bold text-text-primary">{user.name}</span>
            <span className="truncate text-sm font-semibold text-secondary">{user.email}</span>
          </div>
          <span className="text-text-primary w-6"><DropDownIcon/></span>
          {/* <ChevronsUpDown className="ml-auto size-4" /> */}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-52"
        // side={isMobile ? "bottom" : "right"}
        side={"bottom"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              router.push("/change-password");
            }}
          >
            {UserPasswordIcon()}
            Change Password
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          {LogoutIcon()}
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
