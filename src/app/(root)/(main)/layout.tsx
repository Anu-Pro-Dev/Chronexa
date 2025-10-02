'use client'

import React, { useEffect } from 'react';
import Sidebar from '@/src/components/custom/common/app-sidebar';
import Navbar from '@/src/components/ui/navbar';
import { ScrollArea, ScrollBar } from "@/src/components/ui/scroll-area";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import { TooltipProvider } from "@/src/components/ui/tooltip";
import { PrivilegeProvider, usePrivileges } from "@/src/providers/PrivilegeProvider";
import ProtectedLayout from "@/src/components/layouts/ProtectedLayout";
import { useRouter } from 'next/navigation';
import { useLanguage } from "@/src/providers/LanguageProvider";
import Lottie from "lottie-react";
import loadingAnimation from "@/src/animations/hourglass-blue.json";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { privilegeMap, isLoading } = usePrivileges();
  const router = useRouter();
  const { dir } = useLanguage();
  
  useEffect(() => {
    if (!isLoading) {
      const hasAccess = Object.values(privilegeMap).some(
        mod => mod.allowed && mod.subModules.some(sub => sub.allowed)
      );

      if (!hasAccess) {
        router.replace("/no-access");
      }
    }
  }, [privilegeMap, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></span> */}
        <div className="text-center">
          <div style={{ width: 50 }} className="mx-auto mb-4">
            <Lottie animationData={loadingAnimation} loop={true} />
          </div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 h-full transition-[padding] duration-200 ease-linear">
            <div className="flex-shrink-0">
              <Navbar />
            </div>
            <ScrollArea className="flex-1 h-full scrollbar-hide pb-16" dir={dir as "ltr" | "rtl"}>
              <div className="p-4 md:p-6">
                {children}
              </div>
              <ScrollBar orientation="vertical" className="hidden bg-[#84c0ed] hover:bg-[#767676] w-[5px]"/>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivilegeProvider>
      <ProtectedLayout>
        <DashboardContent>{children}</DashboardContent>
      </ProtectedLayout>
    </PrivilegeProvider>
  );
}