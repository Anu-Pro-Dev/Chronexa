"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { DropDownIcon, LogoutIcon, UserPasswordIcon } from "@/src/icons/icons";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { logoutRequest } from "@/src/lib/apiHandler";
import ChangePasswordModal from "@/src/components/custom/modules/auth/ChangePasswordModal";

export function UserDropdown() {
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    employeeId?: string;
    role?: string;
  } | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const router = useRouter();
  const { translations, language } = useLanguage();

  useEffect(() => {
    let storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        const mappedUser = {
          firstName:
            language === "en"
              ? parsedUser.employeename?.firsteng?.trim()
              : parsedUser.employeename?.firstarb?.trim(),
          lastName:
            language === "en"
              ? parsedUser.employeename?.lasteng?.trim()
              : parsedUser.employeename?.lastarb?.trim(),
          email: parsedUser.email,
          employeeId: parsedUser.employeenumber?.toString() || undefined,
          role: parsedUser.role || "Admin",
        };

        setUser(mappedUser);
      } catch (error) {
        console.error("Failed to parse user from storage:", error);
      }
    }
  }, [language]);

  async function logout() {
    try {
      await logoutRequest();
      
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      router.push("/");
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex gap-3 items-center outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
              <Avatar className="w-10 h-10 rounded-full bg-primary flex justify-center items-center">
                <AvatarImage alt={`${user?.firstName} ${user?.lastName}`} />
                <AvatarFallback className="text-white font-bold text-xl uppercase">
                  {user?.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight capitalize">
                <span className="truncate text-sm font-bold text-text-primary">
                  {user?.firstName}
                </span>
                <span className="truncate text-xs font-semibold text-secondary capitalize">
                  {user?.role}
                </span>
              </div>
              <span className="text-text-primary w-6"><DropDownIcon /></span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-52 max-w-52 font-semibold"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setIsChangePasswordOpen(true)}
              >
                {UserPasswordIcon()}
                {translations?.change_password}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer text-destructive"
              onClick={logout}
            >
              {LogoutIcon()}
              {translations?.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ChangePasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </>
  );
}