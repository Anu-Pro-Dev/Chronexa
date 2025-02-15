"use client";
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
import { useLanguage } from "@/providers/LanguageProvider";


export function NavUser() {
  const { isMobile } = useSidebar();
  const user = {
    name: "Musfiq",
    email: "Admin",
  };
  const router = useRouter();
  const { translations, dir } = useLanguage();
  
  return (
    <div className="flex items-center gap-4">
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex gap-3 items-center outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
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
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-52"
          dir={undefined}
          side="bottom"
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
              {translations?.changePassword}
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
            {translations?.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
