'use client'

import React, { useEffect, useState } from 'react';
import Sidebar from '@/src/components/ui/sidebar';
import Navbar from '@/src/components/ui/navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsOpen(false)
      else setIsOpen(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar/>
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
