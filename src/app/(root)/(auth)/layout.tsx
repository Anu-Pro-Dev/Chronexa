// import React from 'react';

// export default function AuthLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="bg-accent">
//       {children}
//     </div>
//   )
// }
'use client';
import React from 'react';
import { AuthProvider } from '@/src/providers/AuthProvider';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="bg-accent min-h-screen flex justify-center items-center">
        {children}
      </div>
    </AuthProvider>
  );
}
