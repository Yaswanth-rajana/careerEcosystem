import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AdminAuthProvider } from '@/lib/adminAuthContext';

export const metadata: Metadata = {
  title: 'PATHWAY.ECO | Admin Portal',
  description: 'Enterprise Administrative Control Plane and Management Portal for PATHWAY.ECO',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#F7F8FC] text-slate-900 antialiased min-h-screen selection:bg-blue-600/20 selection:text-blue-600 font-sans" suppressHydrationWarning>
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
