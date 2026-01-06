'use client';
import React, { useEffect } from 'react';
import Sidebar from '@/src/components/custom/common/app-sidebar';
import Navbar from '@/src/components/ui/navbar';
import { ScrollArea, ScrollBar } from "@/src/components/ui/scroll-area";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import { TooltipProvider } from "@/src/components/ui/tooltip";
import { usePrivileges } from "@/src/providers/PrivilegeProvider";
import ProtectedLayout from "@/src/components/layouts/ProtectedLayout";
import { useRouter } from 'next/navigation';
import { useLanguage } from "@/src/providers/LanguageProvider";
import Loading from "@/src/app/loading";
import { Toaster } from "react-hot-toast";
import AuthenticatedProviders from '@/src/providers/AuthenticatedProviders'; 

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { privilegeMap, isLoading } = usePrivileges();
  const router = useRouter();
  const { dir, language } = useLanguage();
  
  const toasterPosition = language === 'ar' ? 'top-left' : 'top-right';
  
  useEffect(() => {
    if (!isLoading) {
      const hasAccess = Object.values(privilegeMap).some(
        mod => mod.hasView && mod.subModules.some(sub => sub.hasView)
      );

      if (!hasAccess) {
        router.replace("/no-access");
      }
    }
  }, [privilegeMap, isLoading, router]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Toaster 
        position={toasterPosition}
        toastOptions={{
          style: {
            background: '#23272E',
            color: '#fff',
            fontSize: '14px',
            padding: '8px 10px',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#34c759',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ff3b30',
              color: '#fff',
            },
          },
        }}
      />
      
      <TooltipProvider delayDuration={0}>
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen w-full overflow-hidden bg-background">
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
    </>
  );
}
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedProviders>
      <ProtectedLayout>
        <DashboardContent>{children}</DashboardContent>
      </ProtectedLayout>
    </AuthenticatedProviders>
  );
}