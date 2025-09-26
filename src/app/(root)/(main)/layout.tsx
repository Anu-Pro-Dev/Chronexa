'use client'

import React, { useEffect, useState } from 'react';
import Sidebar from '@/src/components/ui/sidebar';
import Navbar from '@/src/components/ui/navbar';
import { PrivilegeProvider, usePrivileges } from "@/src/providers/PrivilegeProvider";
import ProtectedLayout from "@/src/components/layouts/ProtectedLayout";
import { useRouter } from 'next/navigation';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const { privilegeMap, isLoading } = usePrivileges();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Navbar />
        <section className="flex-1 overflow-y-auto p-4">{children}</section>
      </div>
    </div>
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