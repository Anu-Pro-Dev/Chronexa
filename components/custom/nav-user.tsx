"use client";
import { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import { DropDownIcon, LogoutIcon, UserPasswordIcon } from "@/icons/icons";
import { useLanguage } from "@/providers/LanguageProvider";
import { logoutRequest } from "@/lib/apiHandler";

export function NavUser() {
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    employeeId?: string;
    role?: string;
  } | null>(null);
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { translations, dir } = useLanguage();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  async function logout() {
    try {
      await logoutRequest(); // Call the logoutRequest function to log out the user
      router.push("/"); // Redirect to login(/) page after logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex gap-3 items-center outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <Avatar className="w-12 h-12 rounded-lg bg-backdrop flex justify-center items-center">
              {/* <AvatarImage alt={user.name} /> */}
              <AvatarImage alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-primary font-semibold text-xl uppercase">
                {user.firstName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight capitalize">
              <span className="truncate text-base font-bold text-text-primary">{user.firstName}</span>
              <span className="truncate text-sm font-semibold text-secondary">{user.role || "Employee"}</span>
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

