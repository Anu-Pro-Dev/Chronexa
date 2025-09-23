import React from 'react';
import Link from 'next/link';

export default function NoAccessPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-700">
      <h1 className="text-4xl font-bold mb-4 text-destructive">Access Denied</h1>
      <p className="mb-6 text-center">You do not have permission to access this page.</p>
      <Link href="/" className="px-4 py-2 bg-primary text-white hover:bg-primary-100 transition rounded-full">
        Go to Login
      </Link>
    </div>
  );
}
